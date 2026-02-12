import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import { Parser, Store, NamedNode, Quad } from 'n3';
import { NAMESPACES, PATHS, resolveProjectPath, camelCaseToSnakeCase } from './config.js';

export class OntologyModel {
  constructor({ ontologyPath = PATHS.ontology, rulesPath = PATHS.rules, shapesPath = PATHS.shapes } = {}) {
    this.ontologyPath = ontologyPath;
    this.rulesPath = rulesPath;
    this.shapesPath = shapesPath;
    this.store = new Store();
    this.shapesStore = new Store();
    this.classes = new Map();
    // Houd bij welke klassen en predicaten "relevant" zijn omdat ze
    // effectief voorkomen in de ontologie, data-voorbeelden of
    // business-concepten. Deze worden later gebruikt om het ER-/class-
    // diagram te filteren zodat het niet overspoeld wordt door volledig
    // generieke PROV/SOSA/GeoSPARQL-klassen.
    this.usedClassIris = new Set();
    this.usedPropertyIris = new Set();
    // Klassen die effectief instantiaties hebben (rdf:type in
    // ontologie- of data-voorbeelden). Dit gebruiken we om
    // "technische" abstracte superklassen te onderscheiden van
    // echt gebruikte domeinklassen.
    this.instantiatedClassIris = new Set();
  }

  async load() {
    await this.loadOntology();
    await this.loadShapes();
  }

  async fetchRemoteTurtle(url) {
    // Provide simple on-disk caching to avoid re-downloading large remote
    // ontologies on every run. Cache lives in <project>/.cache/ontologies and
    // is keyed by SHA1(URL). Set MODEL_GENERATOR_CACHE_REFRESH=1 to force
    // re-download.
    return new Promise((resolve, reject) => {
      try {
        if (!url) return resolve(null);
        const doRefresh = process && process.env && process.env.MODEL_GENERATOR_CACHE_REFRESH === '1';
        // Determine cache directory (prefer resolveProjectPath if available)
        let cacheBase = null;
        try { cacheBase = resolveProjectPath ? resolveProjectPath('.cache/ontologies') : null; } catch (e) { cacheBase = null; }
        if (!cacheBase) cacheBase = path.join(process.cwd(), '.cache', 'ontologies');
        if (!fs.existsSync(cacheBase)) fs.mkdirSync(cacheBase, { recursive: true });

        const hash = crypto.createHash('sha1').update(String(url)).digest('hex');
        const ext = String(url).endsWith('.nt') ? '.nt' : '.ttl';
        const cacheFile = path.join(cacheBase, `${hash}${ext}`);

        if (!doRefresh && fs.existsSync(cacheFile)) {
          try {
            const cached = fs.readFileSync(cacheFile, 'utf8');
            // eslint-disable-next-line no-console
            console.log(`Using cached ontology for ${url} -> ${cacheFile}`);
            return resolve(cached);
          } catch (e) {
            // If reading cache fails, continue to download
          }
        }

        // eslint-disable-next-line no-console
        console.log(`Downloading remote ontology: ${url}`);
        const client = String(url || '').startsWith('https') ? https : http;
        const req = client.get(url, {
          headers: {
            Accept: 'text/turtle, application/x-turtle, application/n-triples, */*;q=0.1'
          }
        }, res => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }

          let data = '';
          res.setEncoding('utf8');
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            const trimmed = (data || '').trim();
            if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
              reject(new Error('Geen Turtle/NT-antwoord (HTML ontvangen)'));
              return;
            }
            try {
              fs.writeFileSync(cacheFile, data, 'utf8');
              // eslint-disable-next-line no-console
              console.log(`Saved ontology to cache: ${cacheFile}`);
            } catch (e) {
              // Ignore cache write errors but still resolve with data
            }
            resolve(data);
          });
        });

        req.on('error', err => reject(err));
        req.end();
      } catch (e) {
        reject(e);
      }
    });
  }

  async loadOntology() {
    const parser = new Parser();

    // Bestanden die de schema/ontologie-informatie leveren
    // (inclusief externe vocabularia), plus business-concepten.
    // We laden ze allemaal in dezelfde store voor reasoning, maar
    // markeren enkel termen uit de RIE-ontologie en concepten als
    // "gebruikt" voor filtering van het ER-/classmodel.
    const ontologyFiles = [
      { path: this.ontologyPath, kind: 'core' },
      // SHACL-shapes voor extra restricties (alleen voor shapesStore,
      // niet om relevantie te bepalen)
      { path: resolveProjectPath('src/main/resources/generated-shapes.ttl'), kind: 'shapes' },
      // Gecombineerde SSN/SOSA/PROV/P-PLAN/GeoSPARQL/DBO ontologie
      { path: resolveProjectPath('src/main/resources/ssn-sosa-fullprov-o-p-plan-geosparql-dbo.ttl'), kind: 'external' },
      // Local DBpedia ontology (provide xsd:range info like dbo:diameter -> xsd:double)
      { path: resolveProjectPath('src/main/resources/org/dbpedia/ontology/dbo.ttl'), kind: 'external' },
      // Volledige GeoSPARQL vocabulaire (incl. hasGeometry, Feature, Geometry)
      { path: resolveProjectPath('src/main/resources/net/opengis/www/ont/geosparql/geosparql_vocab_all.ttl'), kind: 'external' },
      // Business concept alignments (NL aliassen voor predicaten)
      { path: resolveProjectPath('src/main/resources/be/vlaanderen/omgeving/riepr/data/id/concept/riepr/riepr.ttl'), kind: 'concepts' },
      // Bestaande externe vocabularia
      { path: resolveProjectPath('src/main/resources/org/w3/www/ns/ssn-sosa_2023.ttl'), kind: 'external' },
      { path: resolveProjectPath('src/main/resources/org/w3/www/ns/prov/prov-o.ttl'), kind: 'external' }
    ];

    for (const { path: filePath, kind } of ontologyFiles) {
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

      // Bepaal relevantie enkel op basis van de eigen RIE-ontologie
      // (core) en business-concepten (concepts). Externe vocabularia
      // en SHACL-shapes mag je wel gebruiken voor reasoning, maar
      // ze bepalen niet of een klasse/predicaat in het ER-model komt.
      if (kind === 'core' || kind === 'concepts') {
        await this.trackUsageFromTurtle(ttl, kind);
      }
      /* eslint-enable no-await-in-loop */
    }

    // Laad daarnaast automatisch een aantal externe ontologieën
    const remoteOntologies = [
      { url: 'https://www.w3.org/ns/legacy_locn.ttl', kind: 'external' },
      { url: 'https://www.w3.org/ns/legacy_adms.ttl', kind: 'external' },
      { url: 'https://downloads.dbpedia.org/2016-10/dbpedia_2016-10.nt', kind: 'external' }
    ];

    for (const { url, kind } of remoteOntologies) {
      try {
        const ttl = await this.fetchRemoteTurtle(url);
        if (!ttl) continue;

        /* eslint-disable no-await-in-loop */
        await new Promise((resolve, reject) => {
          parser.parse(ttl, (error, quad) => {
            if (error) reject(error);
            else if (quad) this.store.addQuad(quad);
            else resolve();
          });
        });
        /* eslint-enable no-await-in-loop */

        // Externe vocabularia bepalen geen relevantie; ze worden
        // enkel gebruikt voor domain/range/subClassOf-informatie.
        if (kind === 'core' || kind === 'concepts') {
          await this.trackUsageFromTurtle(ttl, kind);
        }
      } catch (e) {
        // Als de externe vocab niet bereikbaar is, gaan we gewoon
        // verder met de reeds geladen lokale bestanden.
        // eslint-disable-next-line no-console
        console.warn(`Kon externe ontologie niet laden van ${url}:`, e.message || e);
      }
    }

    await this.applyReasoning();
  }

  /**
   * Zoek een Nederlandstalig business-label voor een eigenschap (predicaat-IRI)
   * op basis van SKOS-concepten met skos:exactMatch.
   */
  getBusinessLabelForProperty(propertyIri, className = null) {
    if (!propertyIri) return null;

    const concept = this.findBusinessConcept(propertyIri);
    if (!concept) return null;
    return this.getBusinessLabelForConcept(concept);
  }

  /**
   * Geef de lokale naam van het businessconcept dat aan een eigenschap is
   * uitgelijnd (bijv. https://.../id/concept/eenheid -> "eenheid").
   * Dit is handig om attribuutnamen/FK-namen in ER/class-diagrammen te bepalen.
   */
  getBusinessNameForProperty(propertyIri, className = null) {
    if (!propertyIri) return null;
    const concept = this.findBusinessConcept(propertyIri);
    if (!concept) return null;
    return this.extractLocalName(concept.value);
  }

  /**
   * Get per-class override for property label or name
   */
  getPropertyOverride(overrideMap, className, propertyIri) {
    if (!className || !propertyIri) return null;
    const classMap = overrideMap.get(className);
    if (!classMap) return null;
    return classMap.get(propertyIri) || null;
  }

  /**
   * Geef de lokale naam van het businessconcept dat aan een klasse is
   * uitgelijnd (bijv. https://.../id/concept/MyBusinessConcept).
   */
  getBusinessNameForClass(classIri) {
    if (!classIri) return null;
    const concept = this.findBusinessConcept(classIri);
    if (!concept) return null;
    return this.extractLocalName(concept.value);
  }

  /**
   * Zoek het business concept (skos:Concept) dat exactMatch / equivalentProperty
   * wijst naar de gegeven term-IRI. Geeft een NamedNode of null terug.
   */
  findBusinessConcept(termIri) {
    if (!termIri) return null;
    const skosExactMatch = new NamedNode(NAMESPACES.skos + 'exactMatch');
    const owlEquivalentProperty = new NamedNode(NAMESPACES.owl + 'equivalentProperty');
    const owlEquivalentClass = new NamedNode(NAMESPACES.owl + 'equivalentClass');
    const node = new NamedNode(termIri);
    let conceptQuads = this.store.getQuads(null, skosExactMatch, node);
    if (conceptQuads.length === 0) {
      conceptQuads = this.store.getQuads(null, owlEquivalentProperty, node);
    }
    if (conceptQuads.length === 0) {
      conceptQuads = this.store.getQuads(null, owlEquivalentClass, node);
    }
    if (conceptQuads.length === 0) return null;
    return conceptQuads[0].subject;
  }

  /**
   * Haal de best beschikbare labeltekst op voor een gevonden business concept.
   */
  getBusinessLabelForConcept(concept) {
    if (!concept) return null;
    const skosPrefLabel = new NamedNode(NAMESPACES.skos + 'prefLabel');
    const rdfsLabel = new NamedNode(NAMESPACES.rdfs + 'label');

    const prefLabels = this.store.getQuads(concept, skosPrefLabel, null);
    if (prefLabels.length > 0) {
      const nlLabelQuad = prefLabels.find(q => q.object.language === 'nl');
      if (nlLabelQuad) return nlLabelQuad.object.value;
      return prefLabels[0].object.value;
    }

    const rdfsLabels = this.store.getQuads(concept, rdfsLabel, null);
    if (rdfsLabels.length > 0) {
      const nlLabelQuad = rdfsLabels.find(q => q.object.language === 'nl');
      if (nlLabelQuad) return nlLabelQuad.object.value;
      return rdfsLabels[0].object.value;
    }

    return null;
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

  /**
   * Retrieve an IRI template (hydra:IriTemplate) for a given class.
   * Accepts either a full class IRI or a local class name. Returns an
   * object { template, mappings, templateNode } or null when none found.
   */
  getIriTemplateForClass(classRef) {
    if (!classRef) return null;
    let classIri = String(classRef);
    // If a local name was provided, try to resolve via known classes
    if (!classIri.includes('://')) {
      const info = this.classes.get(classIri);
      if (info && info.iri) classIri = info.iri;
      else classIri = NAMESPACES.riepr + classIri;
    }

    const searchQuads = this.store.getQuads(new NamedNode(classIri), new NamedNode(NAMESPACES.hydra + 'search'), null);
    if (!searchQuads || searchQuads.length === 0) return null;

    const templateNode = searchQuads[0].object;
    const templateQuads = this.store.getQuads(templateNode, new NamedNode(NAMESPACES.hydra + 'template'), null);
    const template = (templateQuads && templateQuads.length > 0) ? templateQuads[0].object.value : null;

    const mappingQuads = this.store.getQuads(templateNode, new NamedNode(NAMESPACES.hydra + 'mapping'), null);
    const mappings = [];
    if (mappingQuads && mappingQuads.length > 0) {
      mappingQuads.forEach(mq => {
        const mnode = mq.object;
        const varQ = this.store.getQuads(mnode, new NamedNode(NAMESPACES.hydra + 'variable'), null);
        const propQ = this.store.getQuads(mnode, new NamedNode(NAMESPACES.hydra + 'property'), null);
        const reqQ = this.store.getQuads(mnode, new NamedNode(NAMESPACES.hydra + 'required'), null);
        const variable = varQ && varQ.length > 0 ? varQ[0].object.value : null;
        const propertyIri = propQ && propQ.length > 0 && propQ[0].object.termType === 'NamedNode' ? propQ[0].object.value : (propQ && propQ.length > 0 ? propQ[0].object.value : null);
        const required = reqQ && reqQ.length > 0 ? String(reqQ[0].object.value).toLowerCase() === 'true' : false;
        mappings.push({ variable, propertyIri, required });
      });
    }

    return { template, mappings, templateNode: templateNode && templateNode.termType === 'NamedNode' ? templateNode.value : null };
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

    // Note: Inverse properties are NOT automatically generated.
    // Only explicitly defined inverse properties in the ontology are used.
    // This prevents implicit inverses like isVariableOfPlan, isInputVarOf, etc.
    // from being added to the schema.
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

    // Verzamel alle lokale namen van doelen van business-concepten
    // (skos:exactMatch). Dit gebruiken we om voor synthetisch
    // toegevoegde externe klassen (die enkel via localName bekend
    // zijn, zoals "Address") te markeren dat ze aan een business-
    // concept zijn uitgelijnd.
    const skosExactMatch = new NamedNode(NAMESPACES.skos + 'exactMatch');
    const owlEquivalentProperty = new NamedNode(NAMESPACES.owl + 'equivalentProperty');
    const owlEquivalentClass = new NamedNode(NAMESPACES.owl + 'equivalentClass');
    const exactMatchQuads = [
      ...this.store.getQuads(null, skosExactMatch, null),
      ...this.store.getQuads(null, owlEquivalentProperty, null),
      ...this.store.getQuads(null, owlEquivalentClass, null)
    ];
    const businessTargetLocalNames = new Set();
    const businessTargetFullIris = new Map(); // Map from localName to fullIri
    exactMatchQuads.forEach(q => {
      if (q.object.termType === 'NamedNode') {
        const local = this.extractLocalName(q.object.value);
        const fullIri = q.object.value;
        if (local) {
          businessTargetLocalNames.add(local);
          businessTargetFullIris.set(local, fullIri);
        }
      }
    });

    this.classes.forEach(classInfo => {
      classInfo.restrictions.forEach(restriction => {
        restriction.rangeTypes.forEach(rangeType => {
          if (this.classes.has(rangeType) || additions.has(rangeType)) return;

          // For business concept targets, use the full IRI from the mapping
          let fullIri = rangeType;
          if (businessTargetFullIris.has(rangeType)) {
            fullIri = businessTargetFullIris.get(rangeType);
          }

          additions.set(rangeType, {
            iri: fullIri,  // Store the full IRI if known, otherwise just the local name
            localName: rangeType,
            label: rangeType,
            comment: '',
            superClasses: [],
            restrictions: [],
            external: true,
            isConceptScheme: false,
            isBusinessConceptTarget: businessTargetLocalNames.has(rangeType)
          });
        });
      });
    });

    additions.forEach((info, name) => {
      this.classes.set(name, info);
    });
  }

  /**
   * Leid extra "restricties" af op basis van rdfs:domain en rdfs:range,
   * zodat ook eigenschappen zonder expliciete OWL/SHACL-restricties (zoals
   * geo:hasGeometry op geo:Feature) als relaties in het model verschijnen.
   *
   * Voor elke property P met domain D en range R wordt voor elke klasse C
   * die (transitief) een subklasse is van D een synthetische restrictie
   * toegevoegd op C:
   *   C --P--> R  (minCard = 0, maxCard = -1)
   */
  addDomainRangeRestrictions() {
    const domainQuads = this.store.getQuads(null, new NamedNode(NAMESPACES.rdfs + 'domain'), null);

    domainQuads.forEach(domainQuad => {
      const property = domainQuad.subject;
      const domainClass = domainQuad.object;

      if (domainClass.termType !== 'NamedNode') return;

      const propertyIri = property.value;
      const propertyLocal = this.extractLocalName(propertyIri);

      const domainLocal = this.extractLocalName(domainClass.value);
      const domainInfo = this.classes.get(domainLocal);
      if (!domainInfo) return;
      if (domainInfo.external && !domainInfo.isBusinessConceptTarget) return;

      // Bepaal de ranges voor deze property
      const rangeQuads = this.store.getQuads(property, new NamedNode(NAMESPACES.rdfs + 'range'), null);
      if (rangeQuads.length === 0) return;

      const rangeTypes = rangeQuads
        .filter(q => q.object.termType === 'NamedNode')
        .map(q => this.extractLocalName(q.object.value))
        .filter(t => !!t);
      if (rangeTypes.length === 0) return;

      // Voeg restrictie toe aan alle (core) klassen die subklasse zijn van domainClass
      this.classes.forEach((classInfo, className) => {
        const classIri = classInfo.iri;

        // Only propagate to core (non-external) classes
        if (classInfo.external) return;

        // Alleen klassen die (transitief) subClassOf domainLocal zijn
        if (!this.isSubClassOf(classIri, domainLocal) && this.extractLocalName(classIri) !== domainLocal) {
          return;
        }

        // Vermijd duplicaten als er al een restrictie voor dezelfde property bestaat
        const hasExisting = (classInfo.restrictions || []).some(r => r.propertyIri === propertyIri);
        if (hasExisting) return;

        const restriction = {
          fromClass: className,
          property: propertyLocal,
          propertyIri,
          minCardinality: 0,
          maxCardinality: -1,
          minInclusive: null,
          maxInclusive: null,
          rangeTypes: [...new Set(rangeTypes)],
          rangeValue: null,
          restrictionType: 'domain-range'
        };

        classInfo.restrictions.push(restriction);
      });
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

    // Alles buiten de eigen RIEPR-namespace beschouwen we als
    // "extern" (PROV, P-PLAN, SSN, GeoSPARQL, DBO, ...).
    const external = !String(classIri).startsWith(NAMESPACES.riepr);

    // Bepaal of deze klasse ook een SKOS ConceptScheme is (zoals
    // de procedureklassen TransportProcedure, VerbruiksProcedure,
    // EmissieProcedure, ...). Zulke conceptenschema's willen we in
    // de ER- en klassendiagrammen doorgaans niet als aparte tabel
    // tonen.
    const isConceptScheme = this.store.getQuads(
      new NamedNode(classIri),
      new NamedNode(NAMESPACES.rdf + 'type'),
      new NamedNode(NAMESPACES.skos + 'ConceptScheme')
    ).length > 0;

    // Bepaal of deze (mogelijk externe) klasse expliciet het doel is
    // van een business-concept via skos:exactMatch. Zulke klassen
    // willen we als volwaardige domeinklassen behandelen, zelfs als
    // ze zelf weinig of geen attributen hebben (bv. locn:Address als
    // doel van het concept "Verzendadres").
    const isBusinessConceptTarget = this.store.getQuads(
      null,
      new NamedNode(NAMESPACES.skos + 'exactMatch'),
      new NamedNode(classIri)
    ).length > 0;

    return {
      iri: classIri,
      localName,
      label: label || localName,
      comment: comment || '',
      superClasses,
      restrictions,
      isEnum,
      external,
      isConceptScheme,
      isBusinessConceptTarget
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

    // Generic mapping: include any local class whose IRI is a subclass
    // of the external rangeType. Avoid project-specific special-cases
    // here so generators remain driven by configuration.
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

  /**
   * Compute which classes are enums (no meaningful attributes)
   * Centralized version so other utilities can reuse the same logic.
   */
  computeEnumClasses() {
    const enumClasses = new Set();

    this.classes.forEach((classInfo, className) => {
      if (classInfo.isConceptScheme) {
        enumClasses.add(className);
        return;
      }

      if (classInfo.superClasses) {
        const isConceptSubclass = classInfo.superClasses.some(sc =>
          String(sc).includes('skos:Concept') ||
          (String(sc).includes('Concept') && String(sc).includes('skos'))
        );
        if (isConceptSubclass) {
          enumClasses.add(className);
          return;
        }
      }

      if (classInfo.restrictions) {
        const hasInScheme = classInfo.restrictions.some(r =>
          r.property === 'inScheme' || String(r.property).includes('inScheme')
        );
        if (hasInScheme) {
          enumClasses.add(className);
        }
      }
    });

    return enumClasses;
  }

  /**
   * Derive enum members for an enum class (e.g. SKOS concept schemes)
   * Returns an array of identifier strings (prefer rdfs:label when available,
   * otherwise the local name of the individual IRI).
   */
  deriveEnumMembers(className) {
    const classInfo = this.classes.get(className);
    if (!classInfo || !classInfo.iri) return [];
    const classIri = classInfo.iri;
    const members = new Set();
    const quads = this.store.getQuads(null, new NamedNode(NAMESPACES.rdf + 'type'), new NamedNode(classIri));
    for (const q of quads) {
      const subject = q.subject;
      if (!subject) continue;
      // try rdfs:label first
      const labels = this.store.getQuads(subject, new NamedNode(NAMESPACES.rdfs + 'label'), null);
      if (labels && labels.length > 0) {
        for (const lq of labels) {
          if (lq.object && lq.object.value) members.add(String(lq.object.value));
        }
        continue;
      }
      // fallback to local name of the IRI
      if (subject.termType === 'NamedNode') {
        const local = this.extractLocalName(subject.value);
        if (local) members.add(local);
      }
    }
    return Array.from(members);
  }

  /**
   * Return local super-class names for a classInfo object, filtering
   * out technical/external supers unless they are flagged as business
   * concept targets.
   */
  getSuperClassNames(classInfo) {
    if (!classInfo) return [];
    const names = [];
    (classInfo.superClasses || []).forEach(superIri => {
      const local = this.extractLocalName(superIri);
      if (local && this.classes.has(local)) {
        const info = this.classes.get(local);
        if (!info?.external || info.isBusinessConceptTarget) {
          names.push(local);
        }
      }
    });
    return names;
  }

  /**
   * Controleer of een klasse (via local name) in de data of ontologie
   * effectief als rdf:type voor individuen gebruikt werd.
   */
  isInstantiatedClassName(className) {
    const info = this.classes.get(className);
    if (!info || !info.iri) return false;
    return this.instantiatedClassIris.has(info.iri);
  }

  /**
   * Bepaal of een klasse (via local name) relevant is voor het
   * datamodel: enkel tonen als de IRI in de RIE-ontologie, in de
   * data-voorbeelden of in de business-concepten voorkomt.
   */
  isRelevantClassName(className) {
    const info = this.classes.get(className);
    if (!info || !info.iri) return false;
    return this.usedClassIris.has(info.iri);
  }

  /**
   * Bepaal of een predicaat (volledige IRI) relevant is.
   */
  isRelevantPropertyIri(propertyIri) {
    if (!propertyIri) return false;
    return this.usedPropertyIris.has(propertyIri);
  }

  /**
   * Registreer gebruik van klassen/predicaten in een TTL-bestand.
   * Voor de RIE-ontologie (core) en data-voorbeelden (data) gebruiken
   * we RDF/OWL-patronen (rdf:type, rdfs:subClassOf, domain/range,
   * owl:onProperty, ...). Voor business-concepten (concepts) volgen
   * we vooral skos:exactMatch.
   */
  async trackUsageFromTurtle(ttl, kind) {
    const parser = new Parser();

    await new Promise((resolve, reject) => {
      parser.parse(ttl, (error, quad) => {
        if (error) reject(error);
        else if (quad) this.registerUsageFromQuad(quad, kind);
        else resolve();
      });
    });
  }

  registerUsageFromQuad(quad, kind) {
    const { subject, predicate, object } = quad;

    const pIri = predicate.value;
    const rdfType = NAMESPACES.rdf + 'type';
    const rdfsClass = NAMESPACES.rdfs + 'Class';
    const owlClass = NAMESPACES.owl + 'Class';
    const rdfsSubClassOf = NAMESPACES.rdfs + 'subClassOf';
    const rdfsDomain = NAMESPACES.rdfs + 'domain';
    const rdfsRange = NAMESPACES.rdfs + 'range';
    const owlOnProperty = NAMESPACES.owl + 'onProperty';
    const skosExactMatch = NAMESPACES.skos + 'exactMatch';
    const owlEquivalentProperty = NAMESPACES.owl + 'equivalentProperty';
    const owlEquivalentClass = NAMESPACES.owl + 'equivalentClass';

    // Business-concepten: map concept links (skos:exactMatch, owl:equivalentProperty,
    // owl:equivalentClass) to "used" properties/classes so external terms
    // such as locn:Address (equivalentClass to :Adres) are considered relevant
    // for the ER/class model rendering.
    if (kind === 'concepts' && object.termType === 'NamedNode') {
      const iri = object.value;
      if (pIri === skosExactMatch || pIri === owlEquivalentProperty || pIri === owlEquivalentClass || pIri === (NAMESPACES.owl + 'equivalentProperty')) {
        // If the concept maps to a property IRI, register it as usedProperty
        // otherwise also register usedClass for classes.
        this.usedPropertyIris.add(iri);
        this.usedClassIris.add(iri);
        const local = this.extractLocalName(iri);
        if (local) this.usedClassIris.add(local);
      }
      return;
    }

    if (kind === 'core' || kind === 'data') {
      // rdf:type
      if (pIri === rdfType && object.termType === 'NamedNode') {
        const oIri = object.value;
        if (oIri === owlClass || oIri === rdfsClass) {
          if (subject.termType === 'NamedNode') {
            this.usedClassIris.add(subject.value);
          }
        } else {
          // Een instantie met een bepaald type -> type is relevante klasse
          this.usedClassIris.add(oIri);
          // En wordt beschouwd als effectief geïnstantieerd.
          this.instantiatedClassIris.add(oIri);
        }
      }

      // rdfs:subClassOf
      if (pIri === rdfsSubClassOf) {
        if (subject.termType === 'NamedNode') this.usedClassIris.add(subject.value);
        if (object.termType === 'NamedNode') this.usedClassIris.add(object.value);
      }

      // rdfs:domain / rdfs:range
      if (pIri === rdfsDomain || pIri === rdfsRange) {
        if (subject.termType === 'NamedNode') this.usedPropertyIris.add(subject.value);
        if (object.termType === 'NamedNode') this.usedClassIris.add(object.value);
      }

      // owl:onProperty in OWL-restricties
      if (pIri === owlOnProperty && object.termType === 'NamedNode') {
        this.usedPropertyIris.add(object.value);
      }

      // Als generieke fallback: elk predicaat dat in deze bestanden
      // voorkomt, telt als "gebruikt". Dit heeft alleen effect als
      // er elders ook restricties/shapes voor bestaan.
      if (predicate.termType === 'NamedNode') {
        this.usedPropertyIris.add(predicate.value);
      }
    }
  }

  /**
   * Zoek alle Turtle-bestanden die als data-voorbeelden dienen
   * (input en gegenereerde output).
   */
  getDataExampleFiles() {
    const dirs = [
      'src/main/input',
    ];
    // Except voorbeelden Geert
    const exceptions = [
      'src/main/input/bedrijf',
      'src/main/input/recepten',
    ];

    const files = [];

    const collect = dir => {
      const absDir = resolveProjectPath(dir);
      if (!fs.existsSync(absDir)) return;

      const entries = fs.readdirSync(absDir, { withFileTypes: true });
      entries.forEach(entry => {
        const fullPath = `${absDir}/${entry.name}`;
        if (entry.isDirectory() && !exceptions.includes(`${dir}/${entry.name}`)) {
          collect(`${dir}/${entry.name}`);
        } else if (entry.isFile() && entry.name.endsWith('.ttl')) {
          files.push(fullPath);
        }
      });
    };

    dirs.forEach(dir => collect(dir));
    return files;
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

  /**
   * Derive foreign key column name using business name of the property
   */
  deriveFkName(restriction) {
    const businessName = this.getBusinessNameForProperty(restriction.propertyIri, restriction.fromClass);
    const base = businessName || restriction.property;
    const snake = camelCaseToSnakeCase(base || 'property');
    return `${snake}_id`;
  }

  /**
   * Derive attribute name from restriction using business name overrides
   */
  deriveAttributeName(restriction) {
    const propLower = String(restriction.property || '').toLowerCase();

    if (propLower === 'identifier' || propLower === 'identifiers') {
      // Use a generic plural name for identifier collections rather
      // than prefixing with the class name (e.g. use `identifiers`)
      return 'identifiers';
    }

    const businessName = this.getBusinessNameForProperty(restriction.propertyIri, restriction.fromClass);
    const base = businessName || restriction.property;
    return camelCaseToSnakeCase(base || 'property');
  }
}
