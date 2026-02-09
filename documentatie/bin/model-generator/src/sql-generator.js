/**
 * PostgreSQL DDL Generator
 * Generates CREATE TABLE statements from OWL/SHACL ontology
 */
import fs from 'fs';
import { PATHS } from './config.js';
import * as Config from './config.js';
import { SchemaGenerator } from './generators/schema-generator.js';

export class SqlGenerator extends SchemaGenerator {
  constructor(ontology, { outputPath = PATHS.dataModels.sql } = {}) {
    super(ontology, { outputPath });
    this.outputPath = outputPath;
  }

  generate() {
    this.prepareOntology();
    this.buildRelationships(true);
    const sql = this.generateSql();
    fs.writeFileSync(this.outputPath, sql, 'utf-8');
  }

  generateSql() {
    let sql = `-- Auto-generated from OWL/SHACL ontology\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n\n`;
    sql += `-- PostgreSQL DDL\n\n`;

    const classNames = this.computeVisibleClasses();

    // Only compute join tables for relationships that originate from visible classes
    // (prevents creating junction tables for external/technical classes).
    const relsForJoin = Array.from(this.relationships.values()).filter(rel => classNames.includes(rel.from) || classNames.includes(rel.to));
    const { joinTables, enumDefinitions } = this.computeJoinTablesFor(relsForJoin, Config, new Set(classNames));
    const allTableNames = [...classNames, ...joinTables.map(t => t.name)];

    // Generate CREATE TABLE statements
    // Emit enum type definitions first
    if (enumDefinitions && enumDefinitions.size > 0) {
      sql += `-- Enum types\n`;
      enumDefinitions.forEach((values, enumName) => {
        const quoted = values.map(v => `'${this.escapeComment(v)}'`).join(', ');
        sql += `CREATE TYPE ${enumName} AS ENUM (${quoted});\n`;
      });
      sql += `\n`;
    }
    const tableAttributes = new Map();
    classNames.forEach((className, idx) => {
      if (idx > 0) sql += '\n';
      const { sql: tableSql, attributes } = this.generateTableSql(className);
      sql += tableSql;
      tableAttributes.set(className, attributes);
    });

    joinTables.forEach(joinTable => {
      sql += '\n';
      const { sql: tableSql, attributes } = this.generateJoinTableSql(joinTable);
      sql += tableSql;
      tableAttributes.set(joinTable.name, attributes);
    });

    // Generate foreign key constraints
    sql += '\n-- Foreign Key Constraints\n';
    allTableNames.forEach(className => {
      const attributes = tableAttributes.get(className);
      if (!attributes) return;
      
      attributes.filter(attr => attr.isForeignKey).forEach(attr => {
        sql += this.generateForeignKeyForAttribute(className, attr);
      });
    });

    // Generate indexes
    sql += '\n-- Indexes\n';
    classNames.forEach(className => {
      sql += this.generateIndexesSql(className);
    });

    joinTables.forEach(joinTable => {
      sql += this.generateIndexesForAttributes(joinTable.name, joinTable.attributes);
    });

    return sql;
  }

  generateTableSql(className) {
    const classInfo = this.ontology.classes.get(className);
    const tableName = this.utils.deriveTableName(className);
    let attributes;

    // Compute attributes using centralized helper (handles identifiers and superclass filtering)
    attributes = this.computeAttributesForClass(className, this.computeVisibleClasses(), null);

    // Filter out enum attributes (only needed for ER diagrams, not SQL)
    attributes = attributes.filter(attr => attr.type !== 'enum');

    // Remove virtual identifier attributes from main (non-Identifier) tables; identifiers
    // are represented in separate Identifier tables (e.g. exploitatie_locatie_identifier)
    if (!className.endsWith('Identifier')) {
      attributes = attributes.filter(attr => {
        if (!attr.propertyIri) return true;
        return !String(attr.propertyIri).includes('adms#identifier');
      });
    }

    // Filter out attributes for many-to-many properties (handled via junction tables)
    attributes = attributes.filter(attr => !Config.isManyToManyProperty(attr.propertyIri, attr.name));

    // Filter out FK attributes to purely technical classes
    attributes = attributes.filter(attr => {
      if (!attr.isForeignKey || !attr.comment) return true;
      const targets = String(attr.comment)
        .split(',')
        .map(s => s.trim())
        .filter(s => !!s);
      if (targets.length === 0) return true;
      const allTechnical = targets.every(t => {
        const info = this.ontology.classes.get(t);
        return this.utils.isTechnicalClass(t, info);
      });
      return !allTechnical;
    });

    // Sort attributes: PK fields first, then geldig_tot, then others
    const pkFieldOrder = ['uri', 'geldig_van', 'aangemaakt_op'];
    attributes.sort((a, b) => {
      // PK fields first (in defined order)
      const aIndex = pkFieldOrder.indexOf(a.name);
      const bIndex = pkFieldOrder.indexOf(b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // geldig_tot comes after PK fields
      if (a.name === 'geldig_tot') return -1;
      if (b.name === 'geldig_tot') return 1;
      
      // All other fields in original order
      return 0;
    });

    let sql = `CREATE TABLE ${tableName} (\n`;
    // Column definitions
    const columnLines = attributes.map(attr => this.generateColumnSql(attr, className));
    const pkColumns = attributes.filter(a => a.isPrimaryKey).map(a => a.name);

    if (pkColumns.length > 0) {
      // join with commas between lines, and add a comma before the PK clause
      sql += columnLines.map(l => l).join(',\n') + ',\n';
      sql += `    CONSTRAINT pk_${tableName} PRIMARY KEY (${pkColumns.join(', ')})`;
    } else {
      sql += columnLines.map(l => l).join(',\n') + '\n';
    }

    sql += '\n);\n';

    // Column comments
    attributes.forEach(attr => {
      if (attr.propertyIri) {
        const escapedComment = this.escapeComment(attr.propertyIri);
        const escapedColumnName = Config.escapeReservedKeyword(attr.name);
        sql += `COMMENT ON COLUMN ${tableName}.${escapedColumnName} IS '${escapedComment}';\n`;
      }
    });

    // Table comment - always use IRI if available
    if (classInfo?.iri) {
      const escapedComment = this.escapeComment(classInfo.iri);
      sql += `COMMENT ON TABLE ${tableName} IS '${escapedComment}';\n`;
    } else if (classInfo?.comment) {
      const escapedComment = this.escapeComment(classInfo.comment);
      sql += `COMMENT ON TABLE ${tableName} IS '${escapedComment}';\n`;
    }

    return { sql, attributes };
  }

  // buildJoinTables moved to generator-utils.computeJoinTables

  generateJoinTableSql(joinTable) {
    const tableName = joinTable.name;
    const attributes = joinTable.attributes;

    let sql = `CREATE TABLE ${tableName} (\n`;

    const columnLines = attributes.map(attr => this.generateColumnSql(attr, tableName));
    const pkColumns = attributes.filter(a => a.isPrimaryKey).map(a => a.name);

    if (pkColumns.length > 0) {
      sql += columnLines.map(l => l).join(',\n') + ',\n';
      sql += `    CONSTRAINT pk_${tableName} PRIMARY KEY (${pkColumns.join(', ')})`;
    } else {
      sql += columnLines.map(l => l).join(',\n') + '\n';
    }

    sql += '\n);\n';

    return { sql, attributes };
  }

  generateColumnSql(attr, className) {
    const nullable = attr.isPrimaryKey || (attr.minCardinality && attr.minCardinality > 0) ? 'NOT NULL' : 'NULL';
    const escapedColName = Config.escapeReservedKeyword(attr.name);
    
    let sql = `    ${escapedColName} ${attr.sqlType} ${nullable}`;
    
    return sql;
  }

  generateForeignKeySql(rel) {
    const fromTable = this.utils.deriveTableName(rel.from);
    const toTable = this.utils.deriveTableName(rel.to);
    const fkColumn = this.utils.deriveFkName({ 
      property: rel.property, 
      propertyIri: rel.propertyIri 
    });
    
    const constraintName = `fk_${fromTable}_${rel.property}`;
    
    return `ALTER TABLE ${fromTable} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${fkColumn}) REFERENCES ${toTable}(uri);\n`;
  }

  generateForeignKeyForAttribute(className, attr) {
    const tableName = this.utils.deriveTableName(className);
    
    // Extract target class names from comment
    const targetClasses = String(attr.comment || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => !!s);
    
    if (targetClasses.length === 0) return '';
    
    // For now, use the first target class for the FK constraint
    // In a real schema you might need junction tables for multi-target FKs
    const targetClassName = targetClasses[0];
    const targetTable = this.utils.deriveTableName(targetClassName);
    
    const escapedColName = Config.escapeReservedKeyword(attr.name);
    const constraintName = `fk_${tableName}_${attr.name}`.substring(0, 63); // PostgreSQL name limit
    
    return `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${escapedColName}) REFERENCES ${targetTable}(uri);\n`;
  }

  generateIndexesSql(className) {
    const classInfo = this.ontology.classes.get(className);
    if (!classInfo) return '';

    const tableName = this.utils.deriveTableName(className);
    const attributes = this.computeAttributesForClass(className, this.computeVisibleClasses(), null)
      .filter(attr => !Config.isManyToManyProperty(attr.propertyIri, attr.name));

    return this.generateIndexesForAttributes(tableName, attributes);
  }

  generateIndexesForAttributes(tableName, attributes) {
    let sql = '';
    attributes.forEach(attr => {
      if (attr.isForeignKey) {
        const escapedColName = Config.escapeReservedKeyword(attr.name);
        sql += `CREATE INDEX idx_${tableName}_${attr.name} ON ${tableName}(${escapedColName});\n`;
      }
    });
    return sql;
  }

  escapeComment(comment) {
    if (!comment) return '';
    return String(comment)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "''")
      .replace(/\n/g, ' ')
      .replace(/\r/g, '');
  }

  
}
