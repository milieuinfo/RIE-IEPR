import fs from 'fs';
import { PATHS } from './config.js';

export class ClassDiagramGenerator {
  constructor(ontology, { outputPath = PATHS.dataModels.class } = {}) {
    this.ontology = ontology;
    this.outputPath = outputPath;
    this.relationships = new Map();
    this.inheritance = new Map();
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
    this.inheritance.clear();

    this.ontology.classes.forEach((classInfo, classLocalName) => {
      const superClassNames = this.getSuperClassNames(classInfo);
      superClassNames
        .filter(name => !this.enumClasses.has(name))
        .forEach(name => {
          const info = this.ontology.classes.get(name);
          if (info?.external) return;
          const key = `${name}|${classLocalName}`;
          if (!this.inheritance.has(key)) {
            this.inheritance.set(key, {
              from: name,
              to: classLocalName
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
              label: restriction.property
            });
          }
        });
      });
    });
  }

  generateMermaidDiagram() {
    let mermaid = `%% Auto-generated from OWL/SHACL\nclassDiagram\n`;

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
      const attributes = this.deriveAttributes(classInfo, this.enumClasses);
      mermaid += `    class ${className} {\n`;
      attributes.forEach(attr => {
        mermaid += `        ${attr.type} ${attr.name}\n`;
      });
      mermaid += `    }\n`;
    });

    if (this.inheritance.size > 0 || this.relationships.size > 0) {
      mermaid += `\n`;
    }

    this.inheritance.forEach(rel => {
      mermaid += `    ${rel.from} <|-- ${rel.to}\n`;
    });

    this.relationships.forEach(rel => {
      mermaid += `    ${rel.from} --> ${rel.to} : ${rel.label}\n`;
    });

    return mermaid;
  }

  deriveAttributes(classInfo, enumClasses) {
    const attributes = new Map();

    classInfo.restrictions.forEach(restriction => {
      if (this.excludedProperties.has(restriction.property)) return;
      if (restriction.rangeTypes.length > 0 && restriction.restrictionType !== 'datatype') {
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction);
        const enumTypes = resolvedRangeTypes.filter(type => enumClasses.has(type));
        const nonEnumTypes = resolvedRangeTypes
          .filter(type => !enumClasses.has(type))
          .filter(type => !this.ontology.classes.get(type)?.external);

        if (enumTypes.length > 0 && nonEnumTypes.length === 0) {
          const attrName = this.deriveAttributeName(restriction);
          if (attributes.has(attrName)) return;
          attributes.set(attrName, {
            name: attrName,
            type: 'enum'
          });
        }
        return;
      }

      const attrName = this.deriveAttributeName(restriction);
      if (attributes.has(attrName)) return;

      attributes.set(attrName, {
        name: attrName,
        type: this.inferDataType(attrName)
      });
    });

    return Array.from(attributes.values());
  }

  deriveAttributeName(restriction) {
    const propLower = restriction.property.toLowerCase();

    if (propLower === 'identifier' || propLower === 'identifiers') {
      const base = this.camelCaseToSnakeCase(restriction.fromClass || 'entity');
      return `${base}_identifiers`;
    }

    return this.camelCaseToSnakeCase(restriction.property);
  }

  inferDataType(attrName) {
    const lower = attrName.toLowerCase();

    if (lower.includes('date') || lower.includes('time')) return 'date';
    if (lower.includes('count') || lower.includes('number')) return 'integer';
    if (lower.includes('diameter') || lower.includes('height') || lower.includes('depth')) return 'float';

    return 'string';
  }

  camelCaseToSnakeCase(str) {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
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
}
