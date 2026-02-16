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
    this.buildRelationships(true, true);
    const sql = this.generateSql();
    fs.writeFileSync(this.outputPath, sql, 'utf-8');
  }

  generateSql() {
    let sql = `-- Auto-generated from OWL/SHACL ontology\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n\n`;
    sql += `-- PostgreSQL DDL\n\n`;

    const includeInterfaceClasses =
      Config.USE_INTERFACE_CLASSES_AS_SUPER_ENTITIES && Config.USE_SUPER_ENTITY_FOR_MULTI_RELATIONS;
    const classNames = this.computeVisibleClasses(includeInterfaceClasses);

    // Only compute join tables for relationships that originate from visible classes
    // (prevents creating junction tables for external/technical classes).
    const relsForJoin = Array.from(this.relationships.values()).filter(
      (rel) => classNames.includes(rel.from) || classNames.includes(rel.to)
    );
    const { joinTables, enumDefinitions } = this.computeJoinTablesFor(
      relsForJoin,
      Config,
      new Set(classNames)
    );
    // join-table property/attribute sets are available on `this` for debugging
    const tableNames = classNames.map((cn) => this.utils.deriveTableName(cn));
    const allTableNames = [...tableNames, ...joinTables.map((t) => t.name)];
    const allTableNameSet = new Set(allTableNames);

    // Generate CREATE TABLE statements
    // Emit enum type definitions first
    if (enumDefinitions && enumDefinitions.size > 0) {
      sql += `-- Enum types\n`;
      enumDefinitions.forEach((values, enumName) => {
        const quoted = values.map((v) => `'${this.escapeComment(v)}'`).join(', ');
        sql += `CREATE TYPE ${enumName} AS ENUM (${quoted});\n`;
      });
      sql += `\n`;
    }
    const tableAttributes = new Map();
    classNames.forEach((className, idx) => {
      if (idx > 0) sql += '\n';
      const { sql: tableSql, attributes } = this.generateTableSql(className, classNames);
      sql += tableSql;
      tableAttributes.set(className, attributes);
    });

    joinTables.forEach((joinTable) => {
      sql += '\n';
      const { sql: tableSql, attributes } = this.generateJoinTableSql(joinTable);
      sql += tableSql;
      tableAttributes.set(joinTable.name, attributes);
    });

    // Generate foreign key constraints
    sql += '\n-- Foreign Key Constraints\n';
    // Generate foreign keys only for attributes whose target table actually exists.
    allTableNames.forEach((tableOrClass) => {
      const attributes = tableAttributes.get(tableOrClass);
      if (!attributes) return;
      attributes
        .filter((attr) => attr.isForeignKey)
        .forEach((attr) => {
          // Try to generate FK; generator will return empty string when it cannot resolve target table
          const fkSql = this.generateForeignKeyForAttribute(tableOrClass, attr, allTableNameSet);
          sql += fkSql;
        });
    });

    // Generate indexes
    sql += '\n-- Indexes\n';
    classNames.forEach((className) => {
      sql += this.generateIndexesSql(className, classNames);
    });

    joinTables.forEach((joinTable) => {
      sql += this.generateIndexesForAttributes(joinTable.name, joinTable.attributes);
    });

    return sql;
  }

  generateTableSql(className, visibleClassNames) {
    const classInfo = this.ontology.classes.get(className);
    // Use centralized schema helper to derive the output table name
    const tableName = this.deriveSchemaTableName(className);
    let attributes;

    // Compute attributes using centralized helper (handles identifiers and superclass filtering)
    const visible = visibleClassNames || this.computeVisibleClasses();
    attributes = this.computeAttributesForClass(className, visible, null, true);
    // Filter out enum attributes (only needed for ER diagrams, not SQL)
    attributes = attributes.filter((attr) => attr.type !== 'enum');
    // Reuse shared filtering and sorting
    attributes = this.filterAndSortAttributes(attributes, className, visible);

    let sql = `CREATE TABLE ${tableName} (\n`;
    // Column definitions
    const columnLines = attributes.map((attr) => this.generateColumnSql(attr, className));
    const pkColumns = attributes.filter((a) => a.isPrimaryKey).map((a) => a.name);

    if (pkColumns.length > 0) {
      // join with commas between lines, and add a comma before the PK clause
      sql += columnLines.map((l) => l).join(',\n') + ',\n';
      sql += `    CONSTRAINT pk_${tableName} PRIMARY KEY (${pkColumns.join(', ')})`;
    } else {
      sql += columnLines.map((l) => l).join(',\n') + '\n';
    }

    sql += '\n);\n';

    // Column comments
    attributes.forEach((attr) => {
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

    const columnLines = attributes.map((attr) => this.generateColumnSql(attr, tableName));
    const pkColumns = attributes.filter((a) => a.isPrimaryKey).map((a) => a.name);

    if (pkColumns.length > 0) {
      sql += columnLines.map((l) => l).join(',\n') + ',\n';
      sql += `    CONSTRAINT pk_${tableName} PRIMARY KEY (${pkColumns.join(', ')})`;
    } else {
      sql += columnLines.map((l) => l).join(',\n') + '\n';
    }

    sql += '\n);\n';

    return { sql, attributes };
  }

  generateColumnSql(attr, className) {
    const nullable =
      attr.isPrimaryKey || (attr.minCardinality && attr.minCardinality > 0) ? 'NOT NULL' : 'NULL';
    const escapedColName = Config.escapeReservedKeyword(attr.name);

    let sql = `    ${escapedColName} ${attr.sqlType} ${nullable}`;

    return sql;
  }

  generateForeignKeySql(rel) {
    const fromTable = this.deriveSchemaTableName(rel.from);
    const toTable = this.deriveSchemaTableName(rel.to);
    const fkColumn = this.utils.deriveFkName({
      property: rel.property,
      propertyIri: rel.propertyIri,
    });

    const constraintName = `fk_${fromTable}_${rel.property}`;

    return `ALTER TABLE ${fromTable} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${fkColumn}) REFERENCES ${toTable}(uri);\n`;
  }

  generateForeignKeyForAttribute(className, attr, allTableNameSet = new Set()) {
    // Table that contains the attribute
    let tableName = this.deriveSchemaTableName(className);
    // Prefer explicit targetClasses on the attribute (set during deriveAttributes)
    const targets = Array.isArray(attr.targetClasses) ? attr.targetClasses.filter(Boolean) : [];
    if (targets.length === 0) return '';

    // Use the first target class for the FK constraint (multi-targets would need junction tables)
    const targetClassName = targets[0];
    // Resolve target table using centralized resolver which checks interface
    // overrides, stripped `I` variants and ontology business names.
    const targetTable = this.resolveTargetTableName(targetClassName, allTableNameSet);
    if (!targetTable) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(
          `Skipping FK for ${tableName}.${attr.name}: target table for ${targetClassName} not present`
        );
      }
      return '';
    }

    const escapedColName = Config.escapeReservedKeyword(attr.name);
    const constraintName = `fk_${tableName}_${attr.name}`.substring(0, 63); // PostgreSQL name limit

    return `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${escapedColName}) REFERENCES ${targetTable}(uri);\n`;
  }

  generateIndexesSql(className) {
    const classInfo = this.ontology.classes.get(className);
    if (!classInfo) return '';
    const tableName = this.deriveSchemaTableName(className);
    const visible =
      arguments.length > 1 && Array.isArray(arguments[1])
        ? arguments[1]
        : this.computeVisibleClasses(true);
    const attributes = this.computeAttributesForClass(className, visible, null, true);

    return this.generateIndexesForAttributes(tableName, attributes);
  }

  generateIndexesForAttributes(tableName, attributes) {
    let sql = '';
    attributes.forEach((attr) => {
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
