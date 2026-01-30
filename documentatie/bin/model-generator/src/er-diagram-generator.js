import fs from 'fs';
import { PATHS } from './config.js';

export class ERDiagramGenerator {
  constructor(ontology, { outputPath = PATHS.dataModels.er } = {}) {
    this.ontology = ontology;
    this.outputPath = outputPath;
    this.relationships = new Map();
    this.excludedProperties = new Set(['hadPrimarySource']);
    this.enumClasses = new Set();
  }

  generate() {
    this.ontology.extractClasses();
    this.ontology.addExternalClassesFromRestrictions();
    this.enumClasses = this.computeEnumClasses();
    this.buildRelationships();
    const diagram = this.generateMermaidDiagram();
    fs.writeFileSync(this.outputPath, diagram, 'utf-8');
  }

  buildRelationships() {
    this.relationships.clear();

    this.ontology.classes.forEach((classInfo, classLocalName) => {
      const superClassNames = this.getSuperClassNames(classInfo);
      superClassNames
        .filter(name => !this.enumClasses.has(name))
        .forEach(name => {
          const info = this.ontology.classes.get(name);
          if (info?.external) return;
          const key = `${classLocalName}|${name}|subClassOf`;
          if (!this.relationships.has(key)) {
            this.relationships.set(key, {
              from: classLocalName,
              to: name,
              property: 'subClassOf',
              label: 'subClassOf',
              minCard: 0,
              maxCard: 1
            });
          }
        });

      classInfo.restrictions.forEach(restriction => {
        if (restriction.rangeTypes.length === 0) return;
        if (this.excludedProperties.has(restriction.property)) return;

        const resolvedRangeTypes = this.ontology
          .resolveRangeTypes(restriction.rangeTypes, restriction)
          .filter(type => !this.enumClasses.has(type))
          .filter(type => !this.ontology.classes.get(type)?.external);
        resolvedRangeTypes.forEach(rangeType => {
          const key = `${classLocalName}|${rangeType}|${restriction.property}`;
          if (!this.relationships.has(key)) {
            this.relationships.set(key, {
              from: classLocalName,
              to: rangeType,
              property: restriction.property,
              label: this.humanizePropertyName(restriction.property),
              minCard: restriction.minCardinality,
              maxCard: restriction.maxCardinality
            });
          }
        });
      });
    });
  }

  generateMermaidDiagram() {
    let mermaid = `%% Auto-generated from OWL/SHACL\nerDiagram\n`;

    const usedClasses = new Set();
    this.relationships.forEach(rel => {
      usedClasses.add(rel.from);
      usedClasses.add(rel.to);
    });

    const classNames = Array.from(this.ontology.classes.keys())
      .filter(name => {
        const info = this.ontology.classes.get(name);
        if (this.enumClasses.has(name)) return false;
        return info?.external ? usedClasses.has(name) : true;
      })
      .sort((a, b) => a.localeCompare(b));

    classNames.forEach(className => {
      const classInfo = this.ontology.classes.get(className);
      const tableName = this.deriveTableName(className);
      const attributes = this.deriveAttributes(classInfo, this.enumClasses, className);

      mermaid += `    ${className}["${tableName}"] {\n`;
      attributes.forEach(attr => {
        const markers = [];
        if (attr.isPrimaryKey) markers.push('PK');
        if (attr.isForeignKey) markers.push('FK');
        const markerText = markers.length > 0 ? `[${markers.join(',')}]` : '';
        const commentParts = [];
        if (attr.comment) commentParts.push(attr.comment);
        if (markerText) commentParts.push(markerText);
        const suffix = commentParts.length > 0 ? ` "${commentParts.join(' ')}"` : '';
        mermaid += `        ${attr.type} ${attr.name}${suffix}\n`;
      });
      mermaid += `    }\n`;
    });

    if (this.relationships.size > 0) {
      mermaid += `\n    %% Relationships\n`;
      this.relationships.forEach(rel => {
        const cardTo = rel.maxCard === 1 ? 'one' : 'many';
        mermaid += `    ${rel.from} many to ${cardTo} ${rel.to} : "${rel.label}"\n`;
      });
    }

    return mermaid;
  }

  deriveAttributes(classInfo, enumClasses, className) {
    const attributes = new Map();

    const superClassNames = this.getSuperClassNames(classInfo);
    superClassNames
      .filter(name => !enumClasses.has(name))
      .forEach(name => {
        const fkName = `${this.camelCaseToSnakeCase(name)}_id`;
        if (!attributes.has(fkName)) {
          attributes.set(fkName, {
            name: fkName,
            type: 'string',
            comment: name,
            isForeignKey: true
          });
        }
      });

    classInfo.restrictions.forEach(restriction => {
      if (this.excludedProperties.has(restriction.property)) return;
      const isDatatype = this.isDatatypeRange(restriction.rangeTypes);

      if (restriction.rangeTypes.length > 0 && !isDatatype) {
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction);
        const enumTypes = resolvedRangeTypes.filter(type => enumClasses.has(type));
        const nonEnumTypes = resolvedRangeTypes
          .filter(type => !enumClasses.has(type))
          .filter(type => !this.ontology.classes.get(type)?.external);

        if (enumTypes.length > 0 && nonEnumTypes.length === 0) {
          const attrName = this.deriveAttributeName(restriction);
          attributes.set(attrName, {
            name: attrName,
            type: 'enum',
            comment: enumTypes.join(', ')
          });
          return;
        }

        if (nonEnumTypes.length === 0) return;

        const fkName = this.deriveFkName(restriction.property);
        attributes.set(fkName, {
          name: fkName,
          type: 'string',
          comment: nonEnumTypes.join(', '),
          isForeignKey: true
        });
      } else {
        const attrName = this.deriveAttributeName(restriction);
        if (attributes.has(attrName)) return;

        attributes.set(attrName, {
          name: attrName,
          type: this.inferDataTypeFromRange(restriction.rangeTypes, attrName),
          comment: restriction.rangeTypes.join(', ')
        });
      }
    });

    // Ensure every entity has a URI column (every individual has a URI)
    const uriAttrName = 'uri';
    if (!attributes.has(uriAttrName)) {
      attributes.set(uriAttrName, {
        name: uriAttrName,
        type: 'string',
        comment: 'URI'
      });
    }

    const attrsArray = Array.from(attributes.values());
    this.applyPrimaryKeyRule(attrsArray, classInfo, className);
    return attrsArray;
  }

  getSuperClassNames(classInfo) {
    const names = [];
    (classInfo.superClasses || []).forEach(superIri => {
      const local = this.ontology.extractLocalName(superIri);
      if (local && this.ontology.classes.has(local)) {
        const info = this.ontology.classes.get(local);
        if (!info?.external) {
          names.push(local);
        }
      }
    });
    return names;
  }

  computeEnumClasses() {
    const enumClasses = new Set();

    this.ontology.classes.forEach((classInfo, className) => {
      if (classInfo.isEnum) enumClasses.add(className);
    });

    const attributesMap = new Map();
    this.ontology.classes.forEach((classInfo, className) => {
      const attributes = this.deriveAttributes(classInfo, enumClasses);
      attributesMap.set(className, attributes);
    });

    attributesMap.forEach((attributes, className) => {
      if (attributes.length === 0) {
        enumClasses.add(className);
      }
    });

    return enumClasses;
  }

  deriveTableName(className) {
    return this.camelCaseToSnakeCase(className);
  }

  deriveFkName(property) {
    return `${this.camelCaseToSnakeCase(property)}_id`;
  }

  deriveAttributeName(restriction) {
    const propLower = restriction.property.toLowerCase();

    if (propLower === 'identifier' || propLower === 'identifiers') {
      const base = this.camelCaseToSnakeCase(restriction.fromClass || 'entity');
      return `${base}_identifiers`;
    }

    return this.camelCaseToSnakeCase(restriction.property);
  }

  isDatatypeRange(rangeTypes) {
    if (!Array.isArray(rangeTypes) || rangeTypes.length === 0) return false;
    const known = new Set([
      'string', 'normalizedString', 'token', 'language', 'Name', 'NCName',
      'date', 'dateTime', 'time', 'gYear', 'gMonth', 'gDay',
      'boolean',
      'decimal', 'float', 'double',
      'integer', 'nonNegativeInteger', 'positiveInteger', 'nonPositiveInteger', 'negativeInteger',
      'long', 'int', 'short', 'byte'
    ]);

    return rangeTypes.every(t => known.has(t));
  }

  inferDataTypeFromRange(rangeTypes, attrName) {
    if (Array.isArray(rangeTypes) && rangeTypes.length > 0) {
      const type = rangeTypes[0];
      const lower = String(type).toLowerCase();

      if (lower.includes('datetime') || lower === 'time') return 'datetime';
      if (lower === 'date' || lower.endsWith('date')) return 'date';
      if (lower === 'boolean') return 'boolean';
      if (lower === 'decimal' || lower === 'float' || lower === 'double') return 'float';
      if (lower.includes('int') || lower === 'integer' || lower === 'nonnegativeinteger' || lower === 'positiveinteger') {
        return 'integer';
      }
      if (lower === 'string' || lower === 'normalizedstring' || lower === 'token' || lower === 'literal') {
        return 'string';
      }
    }

    // Fallback to name-based heuristic
    return this.inferDataType(attrName);
  }

  inferDataType(attrName) {
    const lower = attrName.toLowerCase();

    if (lower === 'issued' || lower === 'valid') return 'date';
    if (lower.includes('date') || lower.includes('time')) return 'date';
    if (lower.includes('count') || lower.includes('number')) return 'integer';
    if (lower.includes('diameter') || lower.includes('height') || lower.includes('depth')) return 'float';

    return 'string';
  }

  applyPrimaryKeyRule(attributes, classInfo, className) {
    if (!Array.isArray(attributes)) return;

    const baseName = this.camelCaseToSnakeCase(classInfo?.localName || className || 'entity');
    const identifierAttr = `${baseName}_identifiers`;

    const pkNames = new Set([identifierAttr]);
    // Business rule (easily adjustable): also include issued/valid when present
    pkNames.add('uri');
    pkNames.add('issued');
    pkNames.add('valid');

    attributes.forEach(attr => {
      attr.isPrimaryKey = pkNames.has(attr.name);
    });
  }

  humanizePropertyName(prop) {
    return prop;
  }

  camelCaseToSnakeCase(str) {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }
}
