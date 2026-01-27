#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { Parser, Store, DataFactory } from "n3";

const { namedNode } = DataFactory;

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

const dctTitle = namedNode("http://purl.org/dc/terms/title");
const dctDescription = namedNode("http://purl.org/dc/terms/description");
const dctCreator = namedNode("http://purl.org/dc/terms/creator");

const vannPreferredNamespacePrefix = namedNode("http://purl.org/vocab/vann/preferredNamespacePrefix");
const vannPreferredNamespaceUri = namedNode("http://purl.org/vocab/vann/preferredNamespaceUri");
const owlImports = namedNode("http://www.w3.org/2002/07/owl#imports");

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
        .filter(sc => !sc.startsWith('_:'));

      return {
        id: uri,
        localName: localName(uri),
        label: labelFor(store, uri),
        comment: literalFor(store, uri, rdfsComment),
        superClasses,
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

  // Generate class sections
  classes.forEach(cls => {
    const anchorId = cls.localName;
    output += `## ${cls.label} ## {#${anchorId}}\n\n`;
    output += `**IRI:** \`${prefixUri(cls.id)}\`\n\n`;
    
    if (cls.comment) {
      output += `**Definitie:** ${cls.comment}\n\n`;
    }
    
    if (cls.superClasses.length > 0) {
      output += `**Subklasse van:** ${cls.superClasses.map(sc => `\`${prefixUri(sc)}\``).join(', ')}\n\n`;
    }
    
    output += '\n';
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

<div class="note">
Deze specificatie is automatisch gegenereerd uit de RIE-IEPR ontologie. Voor feedback en suggesties, zie de GitHub repository.
</div>
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
