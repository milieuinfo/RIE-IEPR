import fs from 'fs';
import { PATHS, NAMESPACES } from './config.js';

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
    this.ontology.addDomainRangeRestrictions();
    this.enumClasses = this.computeEnumClasses();
    this.buildRelationships();
    const diagram = this.generateMermaidDiagram();
    fs.writeFileSync(this.outputPath, diagram, 'utf-8');
  }

  buildRelationships() {
    this.relationships.clear();

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
              property: restriction.property,
              label: businessLabel || this.humanizePropertyName(restriction.property),
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
      const tableName = this.deriveTableName(className);
      let attributes = this.deriveAttributes(classInfo, this.enumClasses, className);

      // Verwijder FK-attributen die enkel verwijzen naar puur
      // technische/abstracte klassen.
      attributes = attributes.filter(attr => {
        if (!attr.isForeignKey || !attr.comment) return true;
        const targets = String(attr.comment)
          .split(',')
          .map(s => s.trim())
          .filter(s => !!s);
        if (targets.length === 0) return true;
        const allTechnical = targets.every(t => {
          const info = this.ontology.classes.get(t);
          return this.isTechnicalClass(t, info);
        });
        return !allTechnical;
      });

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

  deriveAttributes(classInfo, enumClasses, className, skipTechnicalFilters = false) {
    const attributes = new Map();

    const superClassNames = this.getSuperClassNames(classInfo);
    superClassNames
      .filter(name => !enumClasses.has(name))
      .filter(name => {
        if (skipTechnicalFilters) return true;
        const info = this.ontology.classes.get(name);
        return !this.isTechnicalClass(name, info);
      })
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
      if (!this.ontology.isRelevantPropertyIri(restriction.propertyIri)) return;
      const isDatatype = this.isDatatypeRange(restriction.rangeTypes);

      if (restriction.rangeTypes.length > 0 && !isDatatype) {
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction);
        const enumTypes = resolvedRangeTypes.filter(type => enumClasses.has(type));
        const nonEnumTypes = resolvedRangeTypes
          .filter(type => !enumClasses.has(type))
          .filter(type => this.ontology.isRelevantClassName(type))
          .filter(type => {
            if (skipTechnicalFilters) return true;
            const info = this.ontology.classes.get(type);
            return !this.isTechnicalClass(type, info);
          });

        // Als er één of meer enum-doeltypes zijn, voeg een enum-attribuut toe
        // (met alle enum types in de comment), maar ga verder zodat er voor
        // elke niet-enum range ook een aparte FK-kolom kan komen.
        if (enumTypes.length > 0) {
          const attrName = this.deriveAttributeName(restriction);
          if (!attributes.has(attrName)) {
            attributes.set(attrName, {
              name: attrName,
              type: 'enum',
              comment: enumTypes.join(', ')
            });
          }
        }

        if (nonEnumTypes.length === 0) return;

        const isUnionLike = restriction.restrictionType === 'union' || restriction.restrictionType === 'list';

        if (!isUnionLike) {
          // Geen union/list maar één logisch doeltype (of sterk verwante
          // types): gebruik één FK-kolom zoals voordien.
          const fkName = this.deriveFkName(restriction);
          if (!attributes.has(fkName)) {
            attributes.set(fkName, {
              name: fkName,
              type: 'string',
              comment: nonEnumTypes.join(', '),
              isForeignKey: true
            });
          }
        } else {
          // Voor een unionOf / RDF-lijst met meerdere types voorzien we
          // een aparte FK-kolom per doeltype.
          nonEnumTypes.forEach(targetType => {
            const fkBase = this.deriveFkName(restriction);
            const typeSuffix = this.camelCaseToSnakeCase(targetType);
            const fkName = `${fkBase}_${typeSuffix}`;

            if (!attributes.has(fkName)) {
              attributes.set(fkName, {
                name: fkName,
                type: 'string',
                comment: targetType,
                isForeignKey: true
              });
            }
          });
        }
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

    // Zorg dat 'uri' als eerste attribuut komt
    const attrsArray = Array.from(attributes.values()).sort((a, b) => {
      if (a.name === uriAttrName && b.name !== uriAttrName) return -1;
      if (b.name === uriAttrName && a.name !== uriAttrName) return 1;
      return 0;
    });
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
      const attributes = this.deriveAttributes(classInfo, enumClasses, className, true);
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
    // beschouwen we als puur modelleerconstructies en tonen we
    // niet als aparte tabellen in het ER-diagram.
    if (classInfo.iri && String(classInfo.iri).startsWith(NAMESPACES.pplan)) {
      return true;
    }

    // De abstracte basis-klasse "Procedure" (sosa:Procedure)
    // is een puur modelleerconstruct (superklasse voor de
    // concrete Activiteit-/MeetProcedure) en willen we niet
    // als aparte tabel in het ER-diagram tonen.
    if (className === 'Procedure') {
      return true;
    }

    // SKOS conceptenschema-klassen (zoals de verschillende
    // *Procedure-varianten die ook ConceptScheme zijn) beschouwen
    // we altijd als technisch: ze modelleren codelijsten, geen
    // eigen entiteitentabellen in het ER-diagram.
    if (classInfo.isConceptScheme) return true;

    // Als een (meestal externe) klasse expliciet het doel is van
    // een business-concept via skos:exactMatch, dan beschouwen we
    // die als een volwaardige domeinklasse, ook als ze zelf geen
    // eigen attributen heeft (bv. locn:Address voor "Verzendadres").
    if (classInfo.external && classInfo.isBusinessConceptTarget) {
      return false;
    }

    // Kijk naar de afgeleide attributen en tel enkel die die geen
    // FK zijn en niet de generieke URI-kolom.
    const attrs = this.deriveAttributes(classInfo, this.enumClasses, className, true);
    const meaningful = attrs.filter(attr => !attr.isForeignKey && attr.name !== 'uri');

    // Eender of de klasse extern (PROV, P-PLAN, ...) of intern (RIE)
    // is: als ze geen eigen betekenisvolle attributen heeft, dan zien
    // we ze als puur technische/structurele superklasse en tonen we
    // ze niet in het ER-diagram.
    return meaningful.length === 0;
  }

  deriveTableName(className) {
    return this.camelCaseToSnakeCase(className);
  }

  deriveFkName(restriction) {
    // Indien er een business-alias bestaat voor dit predicaat, gebruik die
    // als basis voor de FK-kolomnaam.
    const businessName = this.ontology.getBusinessNameForProperty(restriction.propertyIri);
    const base = this.camelCaseToSnakeCase(businessName || restriction.property);
    return `${base}_id`;
  }

  deriveAttributeName(restriction) {
    const propLower = restriction.property.toLowerCase();

    if (propLower === 'identifier' || propLower === 'identifiers') {
      const base = this.camelCaseToSnakeCase(restriction.fromClass || 'entity');
      return `${base}_identifiers`;
    }

    // Indien er een business-alias bestaat voor dit predicaat, gebruik die
    // naam (bijv. "geldigVan", "status", "eenheid") als basis voor de
    // attribuutnaam.
    const businessName = this.ontology.getBusinessNameForProperty(restriction.propertyIri);
    const base = businessName || restriction.property;
    return this.camelCaseToSnakeCase(base);
  }

  isDatatypeRange(rangeTypes) {
    if (!Array.isArray(rangeTypes) || rangeTypes.length === 0) return false;
    const known = new Set([
      'string', 'normalizedString', 'token', 'language', 'Name', 'NCName',
      'date', 'dateTime', 'time', 'gYear', 'gMonth', 'gDay',
      'boolean',
      'decimal', 'float', 'double',
      'integer', 'nonNegativeInteger', 'positiveInteger', 'nonPositiveInteger', 'negativeInteger',
      'long', 'int', 'short', 'byte',
      // rdfs:Literal als generieke tekstuele waarde
      'Literal'
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
    return 'string';
  }

  applyPrimaryKeyRule(attributes, classInfo, className) {
    if (!Array.isArray(attributes)) return;

    const baseName = this.camelCaseToSnakeCase(classInfo?.localName || className || 'entity');
    const identifierAttr = `${baseName}_identifiers`;

    const pkNames = new Set([identifierAttr]);
    // Business rule (easily adjustable): also include issued/valid when present
    pkNames.add('uri');
    pkNames.add('geldig_van');
    pkNames.add('geldig_tot');

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
