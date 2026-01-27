#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Parser, Store, DataFactory } from "n3";

const { namedNode, blankNode } = DataFactory;

// RDF predicates
const rdfType = namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
const rdfsLabel = namedNode("http://www.w3.org/2000/01/rdf-schema#label");
const rdfsComment = namedNode("http://www.w3.org/2000/01/rdf-schema#comment");
const rdfsSubClassOf = namedNode("http://www.w3.org/2000/01/rdf-schema#subClassOf");
const rdfsSubPropertyOf = namedNode("http://www.w3.org/2000/01/rdf-schema#subPropertyOf");
const rdfsDomain = namedNode("http://www.w3.org/2000/01/rdf-schema#domain");
const rdfsRange = namedNode("http://www.w3.org/2000/01/rdf-schema#range");

const owlClass = namedNode("http://www.w3.org/2002/07/owl#Class");
const owlOntology = namedNode("http://www.w3.org/2002/07/owl#Ontology");
const owlObjectProperty = namedNode("http://www.w3.org/2002/07/owl#ObjectProperty");
const owlDatatypeProperty = namedNode("http://www.w3.org/2002/07/owl#DatatypeProperty");
const owlVersionInfo = namedNode("http://www.w3.org/2002/07/owl#versionInfo");
const owlRestriction = namedNode("http://www.w3.org/2002/07/owl#Restriction");
const owlOnProperty = namedNode("http://www.w3.org/2002/07/owl#onProperty");
const owlSomeValuesFrom = namedNode("http://www.w3.org/2002/07/owl#someValuesFrom");
const owlMinCardinality = namedNode("http://www.w3.org/2002/07/owl#minCardinality");
const owlMaxCardinality = namedNode("http://www.w3.org/2002/07/owl#maxCardinality");

const skosConceptScheme = namedNode("http://www.w3.org/2004/02/skos/core#ConceptScheme");
const skosConcept = namedNode("http://www.w3.org/2004/02/skos/core#Concept");
const skosBroader = namedNode("http://www.w3.org/2004/02/skos/core#broader");
const skosPrefLabel = namedNode("http://www.w3.org/2004/02/skos/core#prefLabel");
const skosExample = namedNode("http://www.w3.org/2004/02/skos/core#example");

const dctTitle = namedNode("http://purl.org/dc/terms/title");
const dctDescription = namedNode("http://purl.org/dc/terms/description");
const dctCreator = namedNode("http://purl.org/dc/terms/creator");

const vannPreferredNamespacePrefix = namedNode("http://purl.org/vocab/vann/preferredNamespacePrefix");
const vannPreferredNamespaceUri = namedNode("http://purl.org/vocab/vann/preferredNamespaceUri");
const owlImports = namedNode("http://www.w3.org/2002/07/owl#imports");
const owlAllValuesFrom = namedNode("http://www.w3.org/2002/07/owl#allValuesFrom");
const owlCardinality = namedNode("http://www.w3.org/2002/07/owl#cardinality");
const owlHasValue = namedNode("http://www.w3.org/2002/07/owl#hasValue");

const ontologyPath = resolve(
  process.cwd(),
  "../../../src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl"
);

function loadStore(path) {
  const ttl = readFileSync(path, "utf8");
  const parser = new Parser();
  return new Store(parser.parse(ttl));
}

function extractPrefixes(path) {
  const ttl = readFileSync(path, "utf8");
  const prefixes = {};
  const prefixRegex = /@prefix\s+(\w+):\s+<([^>]+)>\s*\./g;
  let match;
  while ((match = prefixRegex.exec(ttl)) !== null) {
    prefixes[match[1]] = match[2];
  }
  return prefixes;
}

function asTerm(subject) {
  return typeof subject === "string" ? namedNode(subject) : subject;
}

function literalFor(store, subject, predicate) {
  const quads = store.getQuads(asTerm(subject), predicate, null, null);
  const nl = quads.find((q) => q.object.language === "nl");
  if (nl) return nl.object.value;
  const en = quads.find((q) => q.object.language === "en");
  if (en) return en.object.value;
  const any = quads.find((q) => q.object.termType === "Literal");
  return any ? any.object.value : null;
}

function urisFor(store, subject, predicate) {
  return store
    .getQuads(asTerm(subject), predicate, null, null)
    .filter((q) => q.object.termType === "NamedNode")
    .map((q) => q.object.value);
}

function quadToTurtle(quad, prefixes) {
  const subjectStr = quad.subject.termType === "NamedNode" 
    ? prefixUri(quad.subject.value)
    : quad.subject.value;
  
  const predicateStr = prefixUri(quad.predicate.value);
  
  let objectStr;
  if (quad.object.termType === "NamedNode") {
    objectStr = prefixUri(quad.object.value);
  } else if (quad.object.termType === "Literal") {
    const escaped = quad.object.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    if (quad.object.language) {
      objectStr = `"${escaped}"@${quad.object.language}`;
    } else if (quad.object.datatype && quad.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string") {
      objectStr = `"${escaped}"^^${prefixUri(quad.object.datatype.value)}`;
    } else {
      objectStr = `"${escaped}"`;
    }
  } else {
    objectStr = quad.object.value;
  }
  
  return `${subjectStr} ${predicateStr} ${objectStr}`;
}

function serializeBlankNodeToTurtle(store, blankNodeId) {
  const blankNodeTerm = blankNode(blankNodeId);
  const quads = store.getQuads(blankNodeTerm, null, null, null);
  if (quads.length === 0) return blankNodeId;
  
  const visited = new Set();
  
  function serializeNode(nodeId, isRoot = true) {
    if (visited.has(nodeId)) return `[ ]`;
    visited.add(nodeId);
    
    const nodeTerm = blankNode(nodeId);
    const nodeQuads = store.getQuads(nodeTerm, null, null, null);
    if (nodeQuads.length === 0) return `[ ]`;
    
    const lines = nodeQuads.map(q => {
      let objectStr;
      if (q.object.termType === "NamedNode") {
        objectStr = prefixUri(q.object.value);
      } else if (q.object.termType === "BlankNode") {
        // Recursively serialize nested blank nodes
        objectStr = serializeNode(q.object.value, false);
      } else if (q.object.termType === "Literal") {
        const escaped = q.object.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        if (q.object.language) {
          objectStr = `"${escaped}"@${q.object.language}`;
        } else if (q.object.datatype && q.object.datatype.value !== "http://www.w3.org/2001/XMLSchema#string") {
          objectStr = `"${escaped}"^^${prefixUri(q.object.datatype.value)}`;
        } else {
          objectStr = `"${escaped}"`;
        }
      } else {
        objectStr = q.object.value;
      }
      return `${prefixUri(q.predicate.value)} ${objectStr}`;
    }).join(' ;\n  ');
    
    return isRoot ? `[\n  ${lines}\n]` : `[ ${lines} ]`;
  }
  
  return serializeNode(blankNodeId);
}

function labelFor(store, subject) {
  return literalFor(store, subject, rdfsLabel) || 
         literalFor(store, subject, skosPrefLabel) ||
         localName(subject);
}

function localName(uri) {
  const hashIndex = uri.lastIndexOf("#");
  if (hashIndex !== -1) return uri.slice(hashIndex + 1);
  const slashIndex = uri.lastIndexOf("/");
  return slashIndex !== -1 ? uri.slice(slashIndex + 1) : uri;
}

function prefixUri(uri) {
  const prefixes = {
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf:',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs:',
    'http://www.w3.org/2002/07/owl#': 'owl:',
    'http://www.w3.org/ns/prov#': 'prov:',
    'http://purl.org/net/p-plan#': 'pplan:',
    'http://www.w3.org/ns/sosa/': 'sosa:',
    'http://www.w3.org/ns/ssn/': 'ssn:',
    'http://www.opengis.net/ont/geosparql#': 'ogc:',
    'http://schema.org/': 'schema:',
    'http://www.w3.org/2004/02/skos/core#': 'skos:',
    'http://xmlns.com/foaf/0.1/': 'foaf:',
    'http://www.w3.org/ns/org#': 'org:',
    'http://dbpedia.org/ontology/': 'dbo:',
    'http://www.w3.org/2001/XMLSchema#': 'xsd:',
    'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#': 'riepr:',
    'https://data.riepr.omgeving.vlaanderen.be/id/concept/': 'concept:',
  };

  for (const [ns, prefix] of Object.entries(prefixes)) {
    if (uri.startsWith(ns)) {
      return prefix + uri.slice(ns.length);
    }
  }
  return `<${uri}>`;
}

function collectOntologyMetadata(store) {
  const ontos = store.getQuads(null, rdfType, owlOntology, null);
  if (!ontos.length) return null;

  const subject = ontos[0].subject;
  return {
    id: subject.value || "",
    title: literalFor(store, subject, dctTitle) || literalFor(store, subject, rdfsLabel),
    description: literalFor(store, subject, dctDescription) || literalFor(store, subject, rdfsComment),
    creator: literalFor(store, subject, dctCreator),
    version: literalFor(store, subject, owlVersionInfo),
    preferredNamespacePrefix: literalFor(store, subject, vannPreferredNamespacePrefix),
    preferredNamespaceUri: literalFor(store, subject, vannPreferredNamespaceUri),
    imports: urisFor(store, subject, owlImports),
  };
}

function collectClasses(store) {
  const classUris = new Set([
    ...store.getQuads(null, rdfType, owlClass, null).map((q) => q.subject.value),
  ]);

  // Filter out blank nodes and restriction classes
  return [...classUris]
    .filter(uri => !uri.startsWith('_:'))
    .filter(uri => uri.includes('riepr'))
    .map((uri) => {
      const superClasses = urisFor(store, uri, rdfsSubClassOf)
        .filter(sc => !sc.startsWith('_:'))
        .filter(sc => !sc.startsWith('http://www.w3.org/2002/07/owl#Restriction'));
      
      const exampleQuads = store.getQuads(namedNode(uri), skosExample, null, null);
      const examples = exampleQuads.map(q => {
        if (q.object.termType === "BlankNode") {
          return serializeBlankNodeToTurtle(store, q.object.value);
        } else {
          return q.object.value;
        }
      });

      // Extract restrictions from rdfs:subClassOf
      const restrictionQuads = store.getQuads(namedNode(uri), rdfsSubClassOf, null, null)
        .filter(q => q.object.termType === "BlankNode");
      
      const restrictions = restrictionQuads.map(q => {
        const restrictionNode = q.object.value;
        const restrictionBlankNode = blankNode(restrictionNode);
        
        const onProperty = store
          .getQuads(restrictionBlankNode, owlOnProperty, null, null)
          .map(qr => qr.object.value)[0];
        
        const someValues = store
          .getQuads(restrictionBlankNode, owlSomeValuesFrom, null, null)
          .map(qr => qr.object.value)[0];
        
        const allValues = store
          .getQuads(restrictionBlankNode, owlAllValuesFrom, null, null)
          .map(qr => qr.object.value)[0];
        
        const minCard = store
          .getQuads(restrictionBlankNode, owlMinCardinality, null, null)
          .map(qr => qr.object.value)[0];
        
        const maxCard = store
          .getQuads(restrictionBlankNode, owlMaxCardinality, null, null)
          .map(qr => qr.object.value)[0];
        
        const cardinality = store
          .getQuads(restrictionBlankNode, owlCardinality, null, null)
          .map(qr => qr.object.value)[0];
        
        return {
          property: onProperty,
          someValuesFrom: someValues,
          allValuesFrom: allValues,
          minCardinality: minCard,
          maxCardinality: maxCard,
          cardinality: cardinality,
        };
      }).filter(r => r.property);

      return {
        id: uri,
        localName: localName(uri),
        label: labelFor(store, uri),
        comment: literalFor(store, uri, rdfsComment),
        superClasses,
        examples,
        restrictions,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function collectProperties(store) {
  const propertyUris = new Set([
    ...store.getQuads(null, rdfType, owlObjectProperty, null).map((q) => q.subject.value),
    ...store.getQuads(null, rdfType, owlDatatypeProperty, null).map((q) => q.subject.value),
  ]);

  return [...propertyUris]
    .filter(uri => !uri.startsWith('_:'))
    .filter(uri => uri.includes('riepr'))
    .map((uri) => {
      const types = store
        .getQuads(namedNode(uri), rdfType, null, null)
        .map((q) => q.object.value);
      
      let kind = "Property";
      if (types.includes(owlObjectProperty.value)) kind = "ObjectProperty";
      if (types.includes(owlDatatypeProperty.value)) kind = "DatatypeProperty";

      return {
        id: uri,
        localName: localName(uri),
        label: labelFor(store, uri),
        comment: literalFor(store, uri, rdfsComment),
        domains: urisFor(store, uri, rdfsDomain).filter(d => !d.startsWith('_:')),
        ranges: urisFor(store, uri, rdfsRange).filter(r => !r.startsWith('_:')),
        kind,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function collectConcepts(store) {
  const conceptUris = new Set([
    ...store.getQuads(null, rdfType, skosConcept, null).map((q) => q.subject.value),
  ]);

  return [...conceptUris]
    .filter(uri => !uri.startsWith('_:'))
    .filter(uri => uri.includes('riepr'))
    .map((uri) => ({
      id: uri,
      localName: localName(uri),
      label: labelFor(store, uri),
      comment: literalFor(store, uri, rdfsComment),
      broader: urisFor(store, uri, skosBroader),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildClassHierarchy(classes) {
  // Create a map of class URI to class object for quick lookup
  const classMap = new Map(classes.map(c => [c.id, c]));
  
  // Group classes by their superclass
  const childrenMap = new Map();
  const rootClasses = [];
  
  classes.forEach(cls => {
    // A class is a root if it has no superClasses, or if its superClasses are not in the ontology
    const hasInternalSuperClass = cls.superClasses.some(sc => classMap.has(sc));
    
    if (!hasInternalSuperClass) {
      // Either no superClasses or all superClasses are external
      rootClasses.push(cls);
    } else {
      // Has at least one internal superClass
      cls.superClasses.forEach(superClass => {
        if (classMap.has(superClass)) {
          // Only add if superClass is internal
          if (!childrenMap.has(superClass)) {
            childrenMap.set(superClass, []);
          }
          childrenMap.get(superClass).push(cls);
        }
      });
    }
  });
  
  // Sort children at each level
  childrenMap.forEach(children => {
    children.sort((a, b) => a.label.localeCompare(b.label));
  });
  rootClasses.sort((a, b) => a.label.localeCompare(b.label));
  
  return { rootClasses, childrenMap, classMap };
}

function formatRestriction(restriction) {
  const propLabel = localName(restriction.property);
  
  if (restriction.cardinality) {
    return `exactly ${restriction.cardinality} ${propLabel}`;
  }
  
  const parts = [];
  if (restriction.minCardinality) {
    parts.push(`min ${restriction.minCardinality}`);
  }
  if (restriction.maxCardinality) {
    parts.push(`max ${restriction.maxCardinality}`);
  }
  
  let constraint = parts.length > 0 ? parts.join(', ') : '';
  
  if (restriction.someValuesFrom) {
    const valueType = localName(restriction.someValuesFrom);
    constraint = constraint ? `${constraint} of ${valueType}` : `at least one ${valueType}`;
  } else if (restriction.allValuesFrom) {
    const valueType = localName(restriction.allValuesFrom);
    constraint = constraint ? `${constraint} all ${valueType}` : `all ${valueType}`;
  }
  
  return constraint ? `${propLabel}: ${constraint}` : propLabel;
}

function generateBikeshed(ontologyMeta, classes, properties, concepts, prefixes) {
  const shortname = ontologyMeta.preferredNamespacePrefix;
  const ontologyUrl = ontologyMeta.preferredNamespaceUri;
  // Remove trailing # from URL if present
  const cleanUrl = ontologyUrl.replace(/#$/, '');
  
  let output = `<pre class='metadata'>
Title: ${ontologyMeta.title}
Shortname: ${shortname}
Level: 1
Status: LD
URL: ${cleanUrl}
Markup Shorthands: markdown yes
Editor: ${ontologyMeta.creator}, https://omgeving.vlaanderen.be
Repository: https://github.com/milieuinfo/RIE-IEPR
Abstract: ${ontologyMeta.description}
</pre>

# Inleiding # {#introduction}

Het RIE-IEPR systeem is ontwikkeld om gegevens over industriële emissies te modelleren binnen de Vlaamse context.

Deze ontologie sluit aan bij internationale standaarden zoals:

* **PROV-O**: voor herkomst en relaties tussen entiteiten
* **SOSA/SSN**: voor observaties, sensoren en procedures  
* **P-Plan**: voor plannen en uitvoeringsstappen
* **GeoSPARQL**: voor geospatiale objecten en relaties
* **Schema.org**: voor algemene eigenschappen zoals datums

De basis-namespace van de ontologie is \`${ontologyMeta.preferredNamespaceUri}\` met als voorkeursprefix \`${ontologyMeta.preferredNamespacePrefix}\`.

${ontologyMeta.imports && ontologyMeta.imports.length > 0 ? `
## Geïmporteerde Ontologieën ## {#imports}

Deze ontologie importeert de volgende externe ontologieën:

${ontologyMeta.imports.map(imp => `* ${prefixUri(imp)}`).join('\n')}
` : ''}

# Conformiteit # {#conformance}

Deze specificatie beschrijft een RDF vocabulaire. Conformante toepassingen MOETEN RDF-data produceren en/of consumeren volgens de definities in dit document.

# Namespaces # {#namespaces}

Deze specificatie gebruikt de volgende namespace prefixes:

\`\`\`turtle
${Object.entries(prefixes)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([prefix, uri]) => {
    const maxPrefixLen = Math.max(...Object.keys(prefixes).map(p => p.length));
    const padding = ' '.repeat(maxPrefixLen - prefix.length + 1);
    return `@prefix ${prefix}:${padding}<${uri}> .`;
  })
  .join('\n')}
\`\`\`

# Overzicht # {#overview}

Deze ontologie definieert ${classes.length} klassen${properties.length > 0 ? `, ${properties.length} eigenschappen` : ''}${concepts.length > 0 ? ` en ${concepts.length} concept instanties` : ''}.

# Klassen # {#classes}

`;

  // Build hierarchy
  const hierarchy = buildClassHierarchy(classes);
  
  // Generate hierarchical TOC
  function generateClassToc(cls, level = 1) {
    let toc = '';
    const indent = '  '.repeat(level - 1);
    const anchorId = cls.localName;
    toc += `${indent}* [${cls.label}](#${anchorId})`;
    
    const children = hierarchy.childrenMap.get(cls.id) || [];
    if (children.length > 0) {
      toc += '\n';
      children.forEach(child => {
        toc += generateClassToc(child, level + 1);
      });
    } else {
      toc += '\n';
    }
    return toc;
  }
  
  output += `## Klassenhiërarchie ## {#class-hierarchy}\n\n`;
  hierarchy.rootClasses.forEach(rootClass => {
    output += generateClassToc(rootClass);
  });
  output += '\n';
  
  // Generate class sections recursively
  function generateClassSection(cls, level = 2) {
    let section = '';
    const anchorId = cls.localName;
    const headingMarks = '#'.repeat(level);
    section += `${headingMarks} ${cls.label} ${headingMarks} {#${anchorId}}\n\n`;
    section += `**IRI:** \`${prefixUri(cls.id)}\`\n\n`;
    
    if (cls.comment) {
      section += `**Definitie:** ${cls.comment}\n\n`;
    }
    
    if (cls.superClasses.length > 0) {
      section += `**Subklasse van:** ${cls.superClasses.map(sc => `\`${prefixUri(sc)}\``).join(', ')}\n\n`;
    }
    
    if (cls.restrictions && cls.restrictions.length > 0) {
      section += `**Constraints:** ${cls.restrictions.map(r => formatRestriction(r)).join('; ')}\n\n`;
    }
    
    if (cls.examples && cls.examples.length > 0) {
      section += `**Voorbeelden:**\n\n`;
      cls.examples.forEach(example => {
        section += `\`\`\`turtle\n${example}\n\`\`\`\n\n`;
      });
    }
    
    section += '\n';
    
    // Add child classes
    const children = hierarchy.childrenMap.get(cls.id) || [];
    children.forEach(child => {
      section += generateClassSection(child, level + 1);
    });
    
    return section;
  }
  
  hierarchy.rootClasses.forEach(rootClass => {
    output += generateClassSection(rootClass);
  });

  // Generate properties section if any
  if (properties.length > 0) {
    output += `# Eigenschappen # {#properties}\n\n`;
    
    properties.forEach(prop => {
      const anchorId = prop.localName;
      output += `## ${prop.label} ## {#${anchorId}}\n\n`;
      output += `**IRI:** \`${prefixUri(prop.id)}\`\n\n`;
      output += `**Type:** ${prop.kind}\n\n`;
      
      if (prop.comment) {
        output += `**Definitie:** ${prop.comment}\n\n`;
      }
      
      if (prop.domains.length > 0) {
        output += `**Domein:** ${prop.domains.map(d => `\`${prefixUri(d)}\``).join(', ')}\n\n`;
      }
      
      if (prop.ranges.length > 0) {
        output += `**Bereik:** ${prop.ranges.map(r => `\`${prefixUri(r)}\``).join(', ')}\n\n`;
      }
      
      output += '\n';
    });
  }

  // Generate concepts section if any
  if (concepts.length > 0) {
    output += `# Concept instanties # {#concepts}\n\n`;
    output += `Deze sectie beschrijft de voorgedefinieerde concept instanties in de ontologie.\n\n`;
    
    concepts.forEach(concept => {
      const anchorId = concept.localName;
      output += `## ${concept.label} ## {#concept-${anchorId}}\n\n`;
      output += `**IRI:** \`${prefixUri(concept.id)}\`\n\n`;
      
      if (concept.comment) {
        output += `**Definitie:** ${concept.comment}\n\n`;
      }
      
      if (concept.broader.length > 0) {
        output += `**Breder concept:** ${concept.broader.map(b => `\`${prefixUri(b)}\``).join(', ')}\n\n`;
      }
      
      output += '\n';
    });
  }

  // Add downloads section
  output += `# Downloads # {#downloads}

* [Turtle formaat](https://data.riepr.omgeving.vlaanderen.be/ns/riepr.ttl)
* [RDF/XML formaat](https://data.riepr.omgeving.vlaanderen.be/ns/riepr.rdf)
* [JSON-LD formaat](https://data.riepr.omgeving.vlaanderen.be/ns/riepr.jsonld)
`;

  return output;
}

function build() {
  console.log("Laden van ontologie...");
  const store = loadStore(ontologyPath);
  
  console.log("Extractie van metadata...");
  const ontologyMeta = collectOntologyMetadata(store);
  
  console.log("Extractie van prefixes...");
  const prefixes = extractPrefixes(ontologyPath);
  
  console.log("Verzamelen van klassen...");
  const classes = collectClasses(store);
  
  console.log("Verzamelen van eigenschappen...");
  const properties = collectProperties(store);
  
  console.log("Verzamelen van concepten...");
  const concepts = collectConcepts(store);
  
  console.log(`Gevonden: ${classes.length} klassen, ${properties.length} eigenschappen, ${concepts.length} concepten`);
  
  console.log("Genereren van Bikeshed specificatie...");
  const bikeshed = generateBikeshed(ontologyMeta, classes, properties, concepts, prefixes);
  
  const outPath = resolve(process.cwd(), "ontologie.bs");
  writeFileSync(outPath, bikeshed, "utf8");
  
  console.log(`✓ Bikeshed specificatie gegenereerd: ${outPath}`);
  console.log(`\nBouw de HTML met: bikeshed spec ontologie.bs`);
}

build();
