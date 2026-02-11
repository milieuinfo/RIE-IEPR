import { BaseGenerator } from './base-generator.js';
import * as Config from '../config.js';

export class SchemaGenerator extends BaseGenerator {
  constructor(ontology, options = {}) {
    super(ontology, options);
  }

  computeJoinTablesFor(relationships, config = Config, visibleClasses) {
    // Delegate to BaseGenerator implementation and default visibleClasses
    return super.computeJoinTablesFor(relationships, config, visibleClasses || new Set(this.computeVisibleClasses()));
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
