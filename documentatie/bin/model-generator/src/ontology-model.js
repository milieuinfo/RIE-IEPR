import fs from 'fs';
import { Parser, Store, NamedNode, Quad } from 'n3';
import { NAMESPACES, PATHS, resolveProjectPath } from './config.js';

export class OntologyModel {
  constructor({ ontologyPath = PATHS.ontology, rulesPath = PATHS.rules, shapesPath = PATHS.shapes } = {}) {
    this.ontologyPath = ontologyPath;
    this.rulesPath = rulesPath;
    this.shapesPath = shapesPath;
    this.store = new Store();
    this.shapesStore = new Store();
    this.classes = new Map();
  }

  async load() {
    await this.loadOntology();
    await this.loadShapes();
  }

  async loadOntology() {
    const parser = new Parser();

    const ontologyFiles = [
      this.ontologyPath,
      // Include additional domain/range and subclass information
      resolveProjectPath('src/main/resources/domain.ttl'),
      resolveProjectPath('src/main/resources/range.ttl'),
      resolveProjectPath('src/main/resources/subClassOf.ttl')
    ];

    for (const filePath of ontologyFiles) {
      if (!filePath || !fs.existsSync(filePath)) continue;

      const ttl = fs.readFileSync(filePath, 'utf-8');

      // Parse each TTL file into the same store
      // so reasoning can see all domain/range/subClassOf info.
      /* eslint-disable no-await-in-loop */
      await new Promise((resolve, reject) => {
        parser.parse(ttl, (error, quad) => {
          if (error) reject(error);
          else if (quad) this.store.addQuad(quad);
          else resolve();
        });
      });
      /* eslint-enable no-await-in-loop */
    }

    await this.applyReasoning();
  }

  async loadShapes() {
    if (!fs.existsSync(this.shapesPath)) return;

    const ttl = fs.readFileSync(this.shapesPath, 'utf-8');
    const parser = new Parser();

    await new Promise((resolve, reject) => {
      parser.parse(ttl, (error, quad) => {
        if (error) reject(error);
        else if (quad) this.shapesStore.addQuad(quad);
        else resolve();
      });
    });
  }

  async applyReasoning() {
    const rulesContent = fs.readFileSync(this.rulesPath, 'utf-8');
    const rulesParser = new Parser({ format: 'text/n3' });
    const rulesStore = new Store();

    await new Promise((resolve, reject) => {
      rulesParser.parse(rulesContent, (error, quad) => {
        if (error) reject(error);
        else if (quad) rulesStore.addQuad(quad);
        else resolve();
      });
    });

    // Subclass inference
    const subClassQuads = this.store.getQuads(null, new NamedNode(NAMESPACES.rdfs + 'subClassOf'), null);
    subClassQuads.forEach(subClassQuad => {
      const subClass = subClassQuad.subject;
      const superClass = subClassQuad.object;
      const instanceQuads = this.store.getQuads(null, new NamedNode(NAMESPACES.rdf + 'type'), subClass);
      instanceQuads.forEach(instanceQuad => {
        const instance = instanceQuad.subject;
        this.store.addQuad(new Quad(instance, new NamedNode(NAMESPACES.rdf + 'type'), superClass));
      });
    });

    // Domain inference
    const domainQuads = this.store.getQuads(null, new NamedNode(NAMESPACES.rdfs + 'domain'), null);
    domainQuads.forEach(domainQuad => {
      const property = domainQuad.subject;
      const domainClass = domainQuad.object;
      const usageQuads = this.store.getQuads(null, property, null);
      usageQuads.forEach(usageQuad => {
        const subject = usageQuad.subject;
        this.store.addQuad(new Quad(subject, new NamedNode(NAMESPACES.rdf + 'type'), domainClass));
      });
    });

    // Range inference
    const rangeQuads = this.store.getQuads(null, new NamedNode(NAMESPACES.rdfs + 'range'), null);
    rangeQuads.forEach(rangeQuad => {
      const property = rangeQuad.subject;
      const rangeClass = rangeQuad.object;
      const usageQuads = this.store.getQuads(null, property, null);
      usageQuads.forEach(usageQuad => {
        const object = usageQuad.object;
        if (object.termType === 'NamedNode') {
          this.store.addQuad(new Quad(object, new NamedNode(NAMESPACES.rdf + 'type'), rangeClass));
        }
      });
    });

    // Inverse property inference
    const inverseQuads = this.store.getQuads(null, new NamedNode(NAMESPACES.owl + 'inverseOf'), null);
    inverseQuads.forEach(inverseQuad => {
      const property = inverseQuad.subject;
      const inverseProperty = inverseQuad.object;
      const usageQuads = this.store.getQuads(null, property, null);
      usageQuads.forEach(usageQuad => {
        const subject = usageQuad.subject;
        const object = usageQuad.object;
        if (object.termType === 'NamedNode') {
          this.store.addQuad(new Quad(object, inverseProperty, subject));
        }
      });
    });
  }

  extractClasses() {
    const typeIri = NAMESPACES.rdf + 'type';
    const classIri = NAMESPACES.owl + 'Class';
    const classQuads = this.store.getQuads(null, new NamedNode(typeIri), new NamedNode(classIri));

    classQuads.forEach(quad => {
      const classIriValue = quad.subject.value;
      const classLocalName = this.extractLocalName(classIriValue);

      if (!classLocalName.match(/^[A-Z]/)) return;

      const classInfo = this.extractClassInfo(classIriValue);
      this.classes.set(classLocalName, classInfo);
    });
  }

  addExternalClassesFromRestrictions() {
    const additions = new Map();

    this.classes.forEach(classInfo => {
      classInfo.restrictions.forEach(restriction => {
        restriction.rangeTypes.forEach(rangeType => {
          if (this.classes.has(rangeType) || additions.has(rangeType)) return;

          additions.set(rangeType, {
            iri: rangeType,
            localName: rangeType,
            label: rangeType,
            comment: '',
            superClasses: [],
            restrictions: [],
            external: true
          });
        });
      });
    });

    additions.forEach((info, name) => {
      this.classes.set(name, info);
    });
  }

  extractClassInfo(classIri) {
    const localName = this.extractLocalName(classIri);
    const label = this.getValueByProperty(classIri, NAMESPACES.rdfs, 'label');
    const comment = this.getValueByProperty(classIri, NAMESPACES.rdfs, 'comment');
    const superClasses = this.getIrisByProperty(classIri, NAMESPACES.rdfs, 'subClassOf');
    const isEnum = this.isEnumClassIri(classIri);

    const restrictions = [
      ...this.extractRestrictions(classIri),
      ...this.extractShaclRestrictions(classIri)
    ];

    return {
      iri: classIri,
      localName,
      label: label || localName,
      comment: comment || '',
      superClasses,
      restrictions,
      isEnum
    };
  }

  extractRestrictions(classIri) {
    const restrictions = [];
    const subClassOfQuads = this.store.getQuads(new NamedNode(classIri), new NamedNode(NAMESPACES.rdfs + 'subClassOf'), null);

    subClassOfQuads.forEach(quad => {
      const restrictionNode = quad.object;
      const isRestriction = this.store.getQuads(
        restrictionNode,
        new NamedNode(NAMESPACES.rdf + 'type'),
        new NamedNode(NAMESPACES.owl + 'Restriction')
      ).length > 0;

      if (isRestriction) {
        const restriction = this.parseRestriction(restrictionNode, classIri);
        if (restriction) restrictions.push(restriction);
      }
    });

    return restrictions;
  }

  parseRestriction(restrictionNode, fromClassIri) {
    const restriction = {
      fromClass: this.extractLocalName(fromClassIri),
      property: null,
      propertyIri: null,
      minCardinality: 0,
      maxCardinality: -1,
      minInclusive: null,
      maxInclusive: null,
      rangeTypes: [],
      rangeValue: null,
      restrictionType: null
    };

    const onPropertyQuads = this.store.getQuads(
      restrictionNode,
      new NamedNode(NAMESPACES.owl + 'onProperty'),
      null
    );
    if (onPropertyQuads.length === 0) return null;

    restriction.propertyIri = onPropertyQuads[0].object.value;
    restriction.property = this.extractLocalName(restriction.propertyIri);

    const minCardQuads = this.store.getQuads(restrictionNode, new NamedNode(NAMESPACES.owl + 'minCardinality'), null);
    if (minCardQuads.length > 0) {
      restriction.minCardinality = parseInt(minCardQuads[0].object.value, 10);
    }

    const maxCardQuads = this.store.getQuads(restrictionNode, new NamedNode(NAMESPACES.owl + 'maxCardinality'), null);
    if (maxCardQuads.length > 0) {
      restriction.maxCardinality = parseInt(maxCardQuads[0].object.value, 10);
    }

    const someValuesFromQuads = this.store.getQuads(restrictionNode, new NamedNode(NAMESPACES.owl + 'someValuesFrom'), null);
    someValuesFromQuads.forEach(quad => {
      const targetValue = quad.object;
      const isRdfList = this.store.getQuads(targetValue, new NamedNode(NAMESPACES.rdf + 'first'), null).length > 0;
      const isUnionOf = this.store.getQuads(targetValue, new NamedNode(NAMESPACES.owl + 'unionOf'), null).length > 0;

      if (isRdfList || isUnionOf) {
        const listTypes = this.parseRdfList(targetValue, this.store);
        restriction.rangeTypes.push(...listTypes);
        restriction.restrictionType = isUnionOf ? 'union' : 'list';
      } else if (targetValue.termType === 'NamedNode') {
        const typeName = this.extractLocalName(targetValue.value);
        restriction.rangeTypes.push(typeName);
        restriction.restrictionType = 'single';
      }
    });

    const allValuesFromQuads = this.store.getQuads(restrictionNode, new NamedNode(NAMESPACES.owl + 'allValuesFrom'), null);
    allValuesFromQuads.forEach(quad => {
      const typeName = this.extractLocalName(quad.object.value);
      if (!restriction.rangeTypes.includes(typeName)) {
        restriction.rangeTypes.push(typeName);
        restriction.restrictionType = 'all';
      }
    });

    const hasValueQuads = this.store.getQuads(restrictionNode, new NamedNode(NAMESPACES.owl + 'hasValue'), null);
    if (hasValueQuads.length > 0) {
      restriction.rangeValue = hasValueQuads[0].object.value;
      restriction.restrictionType = 'value';
    }

    const onDataRangeQuads = this.store.getQuads(restrictionNode, new NamedNode(NAMESPACES.owl + 'onDataRange'), null);
    if (onDataRangeQuads.length > 0) {
      const datatype = this.extractLocalName(onDataRangeQuads[0].object.value);
      restriction.restrictionType = 'datatype';
      if (!restriction.rangeTypes.includes(datatype)) {
        restriction.rangeTypes.push(datatype);
      }
    }

    // Fallback: if no explicit range was found on the restriction itself,
    // derive it from rdfs:range of the property in the ontology.
    if (restriction.rangeTypes.length === 0 && restriction.propertyIri) {
      const rangeIris = this.getIrisByProperty(
        restriction.propertyIri,
        NAMESPACES.rdfs,
        'range'
      );

      rangeIris.forEach(rangeIri => {
        const typeName = this.extractLocalName(rangeIri);
        if (typeName && !restriction.rangeTypes.includes(typeName)) {
          restriction.rangeTypes.push(typeName);
        }
      });

      if (restriction.rangeTypes.length > 0 && !restriction.restrictionType) {
        restriction.restrictionType = 'range';
      }
    }

    return restriction;
  }

  extractShaclRestrictions(classIri) {
    const restrictions = [];
    const shapeQuads = this.shapesStore.getQuads(null, new NamedNode(NAMESPACES.sh + 'targetClass'), new NamedNode(classIri));

    shapeQuads.forEach(shapeQuad => {
      const shapeNode = shapeQuad.subject;
      const propertyQuads = this.shapesStore.getQuads(shapeNode, new NamedNode(NAMESPACES.sh + 'property'), null);

      propertyQuads.forEach(propertyQuad => {
        const propertyNode = propertyQuad.object;
        const pathQuads = this.shapesStore.getQuads(propertyNode, new NamedNode(NAMESPACES.sh + 'path'), null);
        if (pathQuads.length === 0) return;

        let propertyIri = null;
        const pathNode = pathQuads[0].object;
        if (pathNode.termType === 'NamedNode') {
          propertyIri = pathNode.value;
        } else {
          const inverseQuads = this.shapesStore.getQuads(pathNode, new NamedNode(NAMESPACES.sh + 'inversePath'), null);
          if (inverseQuads.length > 0 && inverseQuads[0].object.termType === 'NamedNode') {
            propertyIri = inverseQuads[0].object.value;
          }
        }

        if (!propertyIri) return;

        const restriction = {
          fromClass: this.extractLocalName(classIri),
          property: this.extractLocalName(propertyIri),
          propertyIri,
          minCardinality: 0,
          maxCardinality: -1,
          minInclusive: null,
          maxInclusive: null,
          rangeTypes: [],
          rangeValue: null,
          restrictionType: 'shacl'
        };

        const minCountQuads = this.shapesStore.getQuads(propertyNode, new NamedNode(NAMESPACES.sh + 'minCount'), null);
        if (minCountQuads.length > 0) {
          restriction.minCardinality = parseInt(minCountQuads[0].object.value, 10);
        }

        const maxCountQuads = this.shapesStore.getQuads(propertyNode, new NamedNode(NAMESPACES.sh + 'maxCount'), null);
        if (maxCountQuads.length > 0) {
          restriction.maxCardinality = parseInt(maxCountQuads[0].object.value, 10);
        }

        const classQuads = this.shapesStore.getQuads(propertyNode, new NamedNode(NAMESPACES.sh + 'class'), null);
        classQuads.forEach(classQuad => {
          const typeName = this.extractLocalName(classQuad.object.value);
          restriction.rangeTypes.push(typeName);
        });

        const datatypeQuads = this.shapesStore.getQuads(propertyNode, new NamedNode(NAMESPACES.sh + 'datatype'), null);
        datatypeQuads.forEach(datatypeQuad => {
          const typeName = this.extractLocalName(datatypeQuad.object.value);
          if (typeName && !restriction.rangeTypes.includes(typeName)) {
            restriction.rangeTypes.push(typeName);
          }
          restriction.restrictionType = 'datatype';
        });

        const orQuads = this.shapesStore.getQuads(propertyNode, new NamedNode(NAMESPACES.sh + 'or'), null);
        orQuads.forEach(orQuad => {
          const listTypes = this.parseShaclOrList(orQuad.object);
          restriction.rangeTypes.push(...listTypes);
        });

        if (restriction.rangeTypes.length === 0 && restriction.propertyIri) {
          const rangeIris = this.getIrisByProperty(
            restriction.propertyIri,
            NAMESPACES.rdfs,
            'range'
          );

          rangeIris.forEach(rangeIri => {
            const typeName = this.extractLocalName(rangeIri);
            if (typeName && !restriction.rangeTypes.includes(typeName)) {
              restriction.rangeTypes.push(typeName);
            }
          });

          if (restriction.rangeTypes.length > 0 && !restriction.restrictionType) {
            restriction.restrictionType = 'range';
          }
        }

        if (restriction.rangeTypes.length > 0) {
          restrictions.push(restriction);
        }
      });
    });

    return restrictions;
  }

  parseRdfList(listNode, store) {
    const items = [];
    let current = listNode;
    const nilValue = NAMESPACES.rdf + 'nil';

    while (current && current.value !== nilValue) {
      const firstQuads = store.getQuads(current, new NamedNode(NAMESPACES.rdf + 'first'), null);
      if (firstQuads.length > 0) {
        const element = firstQuads[0].object;
        if (element.termType === 'NamedNode') {
          const typeName = this.extractLocalName(element.value);
          if (typeName) items.push(typeName);
        }
      }

      const restQuads = store.getQuads(current, new NamedNode(NAMESPACES.rdf + 'rest'), null);
      current = restQuads.length > 0 ? restQuads[0].object : null;
    }

    return items;
  }

  parseShaclOrList(listNode) {
    const items = [];
    let current = listNode;
    const nilValue = NAMESPACES.rdf + 'nil';

    while (current && current.value !== nilValue) {
      const firstQuads = this.shapesStore.getQuads(current, new NamedNode(NAMESPACES.rdf + 'first'), null);
      if (firstQuads.length > 0) {
        const element = firstQuads[0].object;
        if (element.termType === 'NamedNode') {
          items.push(this.extractLocalName(element.value));
        } else {
          const classQuads = this.shapesStore.getQuads(element, new NamedNode(NAMESPACES.sh + 'class'), null);
          classQuads.forEach(classQuad => {
            items.push(this.extractLocalName(classQuad.object.value));
          });
        }
      }

      const restQuads = this.shapesStore.getQuads(current, new NamedNode(NAMESPACES.rdf + 'rest'), null);
      current = restQuads.length > 0 ? restQuads[0].object : null;
    }

    return items;
  }

  resolveRangeTypes(rangeTypes, restriction) {
    const resolved = new Set();

    rangeTypes.forEach(rangeType => {
      const classInfo = this.classes.get(rangeType);
      const isExternal = classInfo?.external === true;

      if (isExternal) {
        const mapped = this.mapExternalTypeToLocal(rangeType, restriction);
        if (mapped.length > 0) {
          mapped.forEach(type => resolved.add(type));
          return;
        }
      }

      if (this.classes.has(rangeType)) {
        resolved.add(rangeType);
        return;
      }

      const mapped = this.mapExternalTypeToLocal(rangeType, restriction);
      mapped.forEach(type => resolved.add(type));
    });

    return Array.from(resolved);
  }

  mapExternalTypeToLocal(rangeType, restriction) {
    const mapped = new Set();

    if (restriction?.property === 'implements' && restriction?.fromClass) {
      const baseName = restriction.fromClass.replace(/Stap$/i, '');
      const candidate = `${baseName}Procedure`;
      if (this.classes.has(candidate)) {
        mapped.add(candidate);
      } else if (this.classes.has('ActiviteitProcedure')) {
        mapped.add('ActiviteitProcedure');
      }
    }

    this.classes.forEach((classInfo, className) => {
      if (this.isSubClassOf(classInfo.iri, rangeType)) {
        mapped.add(className);
      }
    });

    return Array.from(mapped);
  }

  isSubClassOf(classIri, targetLocalName, visited = new Set()) {
    if (!classIri || visited.has(classIri)) return false;
    visited.add(classIri);

    const subClassQuads = this.store.getQuads(
      new NamedNode(classIri),
      new NamedNode(NAMESPACES.rdfs + 'subClassOf'),
      null
    );

    for (const quad of subClassQuads) {
      if (quad.object.termType === 'NamedNode') {
        const localName = this.extractLocalName(quad.object.value);
        if (localName === targetLocalName) return true;
        if (this.isSubClassOf(quad.object.value, targetLocalName, visited)) return true;
      }
    }

    return false;
  }

  isEnumClassName(className) {
    const classInfo = this.classes.get(className);
    return Boolean(classInfo?.isEnum);
  }

  isEnumClassIri(classIri) {
    if (!classIri) return false;

    const typeQuads = this.store.getQuads(
      new NamedNode(classIri),
      new NamedNode(NAMESPACES.rdf + 'type'),
      null
    );

    for (const quad of typeQuads) {
      if (quad.object.termType === 'NamedNode') {
        const localName = this.extractLocalName(quad.object.value);
        if (localName === 'Concept' || localName === 'ConceptScheme') return true;
      }
    }

    return this.isSubClassOf(classIri, 'Concept');
  }

  extractLocalName(iri) {
    if (!iri || typeof iri !== 'string') return '';

    const lastSlash = iri.lastIndexOf('/');
    const lastHash = iri.lastIndexOf('#');
    const separator = Math.max(lastSlash, lastHash);

    if (separator > 0) {
      return iri.substring(separator + 1);
    }
    return iri;
  }

  getValueByProperty(subject, namespace, property) {
    const quads = this.store.getQuads(
      new NamedNode(subject),
      new NamedNode(namespace + property),
      null
    );

    if (quads.length > 0) {
      return quads[0].object.value;
    }
    return null;
  }

  getIrisByProperty(subject, namespace, property) {
    const iris = [];
    const quads = this.store.getQuads(
      new NamedNode(subject),
      new NamedNode(namespace + property),
      null
    );

    quads.forEach(quad => {
      if (quad.object.termType === 'NamedNode') {
        iris.push(quad.object.value);
      }
    });

    return iris;
  }
}
