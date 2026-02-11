import { BaseGenerator } from './base-generator.js';
import * as Config from '../config.js';

export class SchemaGenerator extends BaseGenerator {
  constructor(ontology, options = {}) {
    super(ontology, options);
  }

  computeJoinTablesFor(relationships, config = Config, visibleClasses = new Set(this.computeVisibleClasses())) {
    const joinTables = [];
    const junctionTableInfo = new Map();
    const seen = new Set();

    const variableRelationships = new Map();
    const enumDefinitions = new Map();

    const groups = new Map();
    const visibleSet = visibleClasses ? new Set(visibleClasses) : null;
    relationships.forEach(rel => {
      if (visibleSet && !visibleSet.has(rel.from)) return;
      if (rel.property === 'hasInputVar' || rel.property === 'hasOutputVar') {
        const key = `${rel.from}_variabele_relatie`;
        if (!variableRelationships.has(key)) {
          variableRelationships.set(key, { fromTable: this.utils.deriveTableName(rel.from), toTable: this.utils.deriveTableName(rel.to), fromClass: rel.from, toClass: rel.to, relationships: [] });
        }
        variableRelationships.get(key).relationships.push(rel.property);
        return;
      }

      const groupKey = `${rel.from}|${rel.propertyIri || rel.property}`;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(rel);
    });

    function makePropBase(propSource) {
      if (/[A-Z]/.test(String(propSource))) {
        return Config.camelCaseToSnakeCase(String(propSource));
      }
      return String(propSource)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^0-9A-Za-z]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
    }

    groups.forEach((rels) => {
      const rel0 = rels[0];
      const fromTable = this.utils.deriveTableName(rel0.from);
      const businessName = this.ontology.getBusinessNameForProperty(rel0.propertyIri, rel0.from);
      const businessLabel = this.ontology.getBusinessLabelForProperty(rel0.propertyIri, rel0.from);
      const propSource = rel0.label || businessLabel || businessName || rel0.property;
      const propBase = makePropBase(propSource);

      if (rels.length > 1) {
        const joinTableName = `${fromTable}_${propBase}`;
        if (seen.has(joinTableName)) return;
        seen.add(joinTableName);

        const targetTypes = rels.map(r => r.to);
        if (visibleSet) {
          const hasVisibleTarget = targetTypes.some(t => visibleSet.has(t));
          if (!hasVisibleTarget) return;
        }
        const enumName = `${joinTableName}_target_type_enum`;
        const enumValues = targetTypes
          .map(t => String(t).toUpperCase().replace(/[^A-Z0-9_]/g, '_'))
          .filter((v, i, a) => v && a.indexOf(v) === i);
        if (enumValues.length > 0) {
          enumDefinitions.set(enumName, enumValues);
        }

        // Check for a configured override that maps this property to an
        // interface type (collapse multiple concrete targets into one
        // interface-backed join table). We support lookup both by full
        // property IRI and by short property name.
        let override = null;
        const attributes = [
          { name: `${fromTable}_uri`, type: 'string', sqlType: 'TEXT', comment: rel0.from, isForeignKey: true, isPrimaryKey: true },
          { name: `target_uri`, type: 'string', sqlType: 'TEXT', comment: targetTypes.join(', '), isForeignKey: false, isPrimaryKey: true },
          { name: `target_type`, type: 'enum', sqlType: enumValues.length > 0 ? enumName : 'TEXT', comment: targetTypes.join(', '), isForeignKey: false, isPrimaryKey: false }
        ];

        if (override && override.interface && config.INTERFACE_CLASSES && config.INTERFACE_CLASSES.has(override.interface)) {
          // Collapse to the configured interface and remember concrete targets
          // so calling generators can avoid emitting concrete per-type relations
          joinTables.push({ name: joinTableName, attributes });
          junctionTableInfo.set(joinTableName, { from: rel0.from, to: override.interface, concreteTargets: targetTypes, addsTemporal: true, label: businessLabel || rel0.label || '' });
          // Add temporal fields to the join table (not primary keys)
          attributes.push({ name: 'geldig_van', type: 'date', sqlType: 'DATE', isForeignKey: false, isPrimaryKey: false });
          attributes.push({ name: 'aangemaakt_op', type: 'datetime', sqlType: 'TIMESTAMP', isForeignKey: false, isPrimaryKey: false });
          attributes.push({ name: 'geldig_tot', type: 'date', sqlType: 'DATE', isForeignKey: false, isPrimaryKey: false });
        } else {
          joinTables.push({ name: joinTableName, attributes });
          junctionTableInfo.set(joinTableName, { from: rel0.from, to: targetTypes, label: businessLabel || rel0.label || '' });
        }
      } else {
        const rel = rels[0];
        const toTable = this.utils.deriveTableName(rel.to);
        const joinTableName = `${fromTable}_${propBase}_${toTable}`;
        if (seen.has(joinTableName)) return;
        if (visibleSet && (!visibleSet.has(rel.from) || !visibleSet.has(rel.to))) return;
        seen.add(joinTableName);

        let fromColumn = `${fromTable}_uri`;
        let toColumn = `${toTable}_uri`;
        if (fromColumn === toColumn) {
          fromColumn = `${fromTable}_uri_from`;
          toColumn = `${toTable}_uri_to`;
        }

        const attributes = [
          { name: fromColumn, type: 'string', sqlType: 'TEXT', comment: rel.from, isForeignKey: true, isPrimaryKey: true },
          { name: toColumn, type: 'string', sqlType: 'TEXT', comment: rel.to, isForeignKey: true, isPrimaryKey: true }
        ];

        joinTables.push({ name: joinTableName, attributes });
        junctionTableInfo.set(joinTableName, { from: rel.from, to: rel.to, label: businessLabel || rel.label || '' });
      }
    });

    variableRelationships.forEach((config, key) => {
      const fromTable = config.fromTable;
      const toTable = config.toTable;
      const joinTableName = `${fromTable}_variabele_relatie`;
      if (seen.has(joinTableName)) return;
      seen.add(joinTableName);

      const relEnumName = `${joinTableName}_relationship_type_enum`;
      const relEnumValues = ['INPUT_VAR', 'OUTPUT_VAR'];
      enumDefinitions.set(relEnumName, relEnumValues);

      const attributes = [
        { name: `${fromTable}_uri`, type: 'string', sqlType: 'TEXT', comment: config.fromClass, isForeignKey: true, isPrimaryKey: true },
        { name: `${toTable}_uri`, type: 'string', sqlType: 'TEXT', comment: config.toClass, isForeignKey: true, isPrimaryKey: true },
        { name: 'relationship_type', type: 'enum', sqlType: relEnumName, comment: relEnumValues.join(', '), isForeignKey: false, isPrimaryKey: true }
      ];

      joinTables.push({ name: joinTableName, attributes });
      junctionTableInfo.set(joinTableName, { from: config.fromClass, to: config.toClass, label: 'hasInputVar/hasOutputVar' });
    });

    return { joinTables, junctionTableInfo, enumDefinitions };
  }

  generateIdentifierAttributesForClass(parentClass) {
    // Delegate to BaseGenerator implementation
    return [
      {
        name: `${Config.camelCaseToSnakeCase(parentClass)}_uid`,
        type: 'string',
        sqlType: 'TEXT',
        comment: parentClass,
        isForeignKey: true,
        isPrimaryKey: true,
        propertyIri: 'http://www.w3.org/ns/adms#identifier'
      },
      ...super.generateIdentifierAttributesForClass(parentClass)
    ];
  }

  // Compute which classes are actually used (have attributes or are referenced
  // by relationships or join tables). Returns a Set of class names.
  computeUsedClassSet(classNames, joinTables = []) {
    const usedClassSet = new Set();
    classNames.forEach(className => {
      const classInfo = this.ontology.classes.get(className);
      if (!classInfo) {
        if (String(className).endsWith('Identifier') && this.utils.isIdentifierTable(className)) {
          usedClassSet.add(className);
        }
        return;
      }
      const attrs = this.utils.deriveAttributes(classInfo, this.enumClasses, className);
      if (attrs && attrs.length > 0) usedClassSet.add(className);
    });

    // Add relationship endpoints
    this.relationships.forEach(rel => {
      usedClassSet.add(rel.from);
      usedClassSet.add(rel.to);
    });

    // Include join tables when provided
    if (Array.isArray(joinTables)) {
      joinTables.forEach(jt => {
        if (jt && jt.name) usedClassSet.add(jt.name);
        else if (typeof jt === 'string') usedClassSet.add(jt);
      });
    }

    return usedClassSet;
  }

  // Common attribute filtering and sorting used by SQL and ER generators.
  // - Removes virtual identifier properties from non-Identifier tables
  // - Filters out FK attributes that only target purely technical classes
  // - Sorts attributes so PK fields come first, then `geldig_tot`, then others
  filterAndSortAttributes(attributes, className, visibleClassNames = []) {
    if (!Array.isArray(attributes)) return attributes || [];

    let attrs = attributes.slice();

    // Remove virtual identifier attribute from main entity rendering; identifiers
    // are displayed as separate identifier tables instead.
    if (!String(className).endsWith('Identifier')) {
      attrs = attrs.filter(attr => {
        if (!attr.propertyIri) return true;
        return !String(attr.propertyIri).includes('adms#identifier');
      });
    }

    // Remove FK attributes that only reference technical/abstract classes
    attrs = attrs.filter(attr => {
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
    attrs.sort((a, b) => {
      const aIndex = pkFieldOrder.indexOf(a.name);
      const bIndex = pkFieldOrder.indexOf(b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      if (a.name === 'geldig_tot') return -1;
      if (b.name === 'geldig_tot') return 1;

      return 0;
    });

    return attrs;
  }
}

export default SchemaGenerator;
