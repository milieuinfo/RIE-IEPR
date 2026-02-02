import fs from 'fs';
import { PATHS, NAMESPACES } from './config.js';

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
    this.ontology.addDomainRangeRestrictions();
    this.enumClasses = this.computeEnumClasses();
    this.buildRelationships();
    const diagram = this.generateMermaidDiagram();
    fs.writeFileSync(this.outputPath, diagram, 'utf-8');
  }

  buildRelationships() {
    this.relationships.clear();
    this.inheritance.clear();

    this.ontology.classes.forEach((classInfo, classLocalName) => {
      // Sla volledig generieke klassen (en hun relaties) over
      // als ze niet relevant zijn of puur technisch/abstract.
      if (!this.ontology.isRelevantClassName(classLocalName)) return;
      if (this.isTechnicalClass(classLocalName, classInfo)) return;

      const superClassNames = this.getSuperClassNames(classInfo);
      superClassNames
        .filter(name => !this.enumClasses.has(name))
        .filter(name => {
          const info = this.ontology.classes.get(name);
          return !this.isTechnicalClass(name, info);
        })
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

        // Toon enkel relaties voor predicaten die effectief
        // voorkomen in ontologie/data/concepten.
        if (!this.ontology.isRelevantPropertyIri(restriction.propertyIri)) return;

        const resolvedRangeTypes = this.ontology
          .resolveRangeTypes(restriction.rangeTypes, restriction)
          .filter(type => !this.enumClasses.has(type))
          .filter(type => this.ontology.isRelevantClassName(type))
          .filter(type => {
            const info = this.ontology.classes.get(type);
            return !this.isTechnicalClass(type, info);
          });
        resolvedRangeTypes.forEach(rangeType => {
          const key = `${classLocalName}|${rangeType}|${restriction.property}`;
          if (!this.relationships.has(key)) {
            const businessLabel = this.ontology.getBusinessLabelForProperty(restriction.propertyIri);
            this.relationships.set(key, {
              from: classLocalName,
              to: rangeType,
              label: businessLabel || restriction.property
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
        if (this.enumClasses.has(name)) return false;
        // Toon enkel klassen die effectief voorkomen in
        // ontologie/data/concepten.
        if (!this.ontology.isRelevantClassName(name)) return false;
        const info = this.ontology.classes.get(name);
        if (this.isTechnicalClass(name, info)) return false;
        return true;
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
      if (!this.ontology.isRelevantPropertyIri(restriction.propertyIri)) return;
      if (restriction.rangeTypes.length > 0 && restriction.restrictionType !== 'datatype') {
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction);
        const enumTypes = resolvedRangeTypes.filter(type => enumClasses.has(type));
        const nonEnumTypes = resolvedRangeTypes
          .filter(type => !enumClasses.has(type))
          .filter(type => this.ontology.isRelevantClassName(type))
          .filter(type => {
            const info = this.ontology.classes.get(type);
            return !this.isTechnicalClass(type, info);
          });

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

    // Gebruik indien mogelijk de business-naam uit het concepten-URI als
    // basis voor de attribuutnaam (bijv. "geldigVan", "status").
    const businessName = this.ontology.getBusinessNameForProperty(restriction.propertyIri);
    const base = businessName || restriction.property;
    return this.camelCaseToSnakeCase(base);
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

  /**
   * Bepaal of een klasse in essentie een technische/abstracte
   * superklasse is: geen eigen betekenisvolle attributen en geen
   * directe instantiaties in de data of ontologie.
   */
  isTechnicalClass(className, classInfo) {
    if (!className || !classInfo) return false;

    // Alle P-PLAN-klassen (zoals pplan:Step, pplan:Plan, ...)
    // zijn puur modelleerconstructies en willen we niet als
    // afzonderlijke klassen in het klassendiagram tonen.
    if (classInfo.iri && String(classInfo.iri).startsWith(NAMESPACES.pplan)) {
      return true;
    }

    // De generieke basis-klasse "Procedure" (sosa:Procedure)
    // is een puur modelleerconstruct (superklasse voor de
    // concrete Activiteit-/MeetProcedure) en tonen we niet als
    // afzonderlijke klasse in het klassendiagram.
    if (className === 'Procedure') {
      return true;
    }

    // SKOS conceptenschema-klassen (zoals de verschillende
    // *Procedure-varianten die ook ConceptScheme zijn) beschouwen
    // we altijd als technisch: ze modelleren codelijsten en worden
    // niet als volwaardige klassen in het klassendiagram getoond.
    if (classInfo.isConceptScheme) return true;

    // Als een (meestal externe) klasse expliciet het doel is van
    // een business-concept via skos:exactMatch, dan beschouwen we
    // die als volwaardige domeinklasse, ook als ze zelf geen eigen
    // attributen heeft (bv. locn:Address voor "Verzendadres").
    if (classInfo.external && classInfo.isBusinessConceptTarget) {
      return false;
    }

    // Kijk naar de afgeleide attributen en tel enkel die die geen
    // generieke URI-kolom zijn (class diagram kent geen FK-vlag,
    // dus we kunnen enkel op naam heuristiek doen).
    const attrs = this.deriveAttributes(classInfo, this.enumClasses);
    const meaningful = attrs.filter(attr => attr.name !== 'uri');

    // Net zoals in het ER-diagram: elke klasse (extern of intern)
    // zonder eigen betekenisvolle attributen wordt als puur
    // technische/structurele superklasse beschouwd en niet getoond.
    return meaningful.length === 0;
  }
}
