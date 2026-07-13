#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from 'url';
import { PATHS, NAMESPACES, PROJECT_ROOT } from '../common/src/config.js';
import { Parser, Store, DataFactory } from "n3";

const { namedNode, blankNode } = DataFactory;

// Predicates will be referenced directly via NAMESPACES (e.g. namedNode(NAMESPACES.rdf + 'type')).
const vannPreferredNamespacePrefix = namedNode('http://purl.org/vocab/vann/preferredNamespacePrefix');
const vannPreferredNamespaceUri = namedNode('http://purl.org/vocab/vann/preferredNamespaceUri');

// Resolve ontology path relative to this script file, not the current working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hydraSearch = namedNode("http://www.w3.org/ns/hydra/core#search");
const rdfType = namedNode(NAMESPACES.rdf + 'type');
const rdfsDomain = namedNode(NAMESPACES.rdfs + 'domain');
const rdfsRange = namedNode(NAMESPACES.rdfs + 'range');

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
  // store file prefixes globally so prefixUri can use them
  filePrefixes = prefixes;
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
    return literalFor(store, subject, namedNode(NAMESPACES.rdfs + 'label')) || 
      literalFor(store, subject, namedNode(NAMESPACES.skos + 'prefLabel')) ||
         localName(subject);
}

function localName(uri) {
  const hashIndex = uri.lastIndexOf("#");
  if (hashIndex !== -1) return uri.slice(hashIndex + 1);
  const slashIndex = uri.lastIndexOf("/");
  return slashIndex !== -1 ? uri.slice(slashIndex + 1) : uri;
}

function prefixUri(uri) {
  // Use only prefixes discovered from the file or provided via NAMESPACES
  for (const [pfx, ns] of Object.entries(filePrefixes || {})) {
    if (uri.startsWith(ns)) return `${pfx}:` + uri.slice(ns.length);
  }

  return `<${uri}>`;
}

// Populated by extractPrefixes(path). Start with shared NAMESPACES as sensible defaults.
let filePrefixes = Object.assign({}, NAMESPACES || {});

function collectIriTemplates(store) {
  // Find subjects that have a hydra:template (subjects may be NamedNode or BlankNode)
  const templateQuads = store.getQuads(null, namedNode(NAMESPACES.hydra + 'template'), null, null);
  // Keep unique subject terms (preserve termType)
  const subjects = [...new Map(templateQuads.map(q => [q.subject.value, q.subject])).values()];

  return subjects.map(subjectTerm => {
    const templateLiteral = store.getQuads(subjectTerm, namedNode(NAMESPACES.hydra + 'template'), null, null)[0]?.object?.value || '';

    // Collect mapping blank nodes
    const mappingQuads = store.getQuads(subjectTerm, namedNode(NAMESPACES.hydra + 'mapping'), null, null);
    const mappings = mappingQuads.map(mq => {
      const bn = mq.object;
      const variable = store.getQuads(bn, namedNode(NAMESPACES.hydra + 'variable'), null, null)[0]?.object?.value || null;
      const propertyNode = store.getQuads(bn, namedNode(NAMESPACES.hydra + 'property'), null, null)[0]?.object || null;
      const requiredLit = store.getQuads(bn, namedNode(NAMESPACES.hydra + 'required'), null, null)[0]?.object || null;

      return {
        variable,
        property: propertyNode ? propertyNode.value : null,
        required: requiredLit ? (requiredLit.termType === 'Literal' ? requiredLit.value : null) : null,
        raw: bn.value,
        termType: bn.termType
      };
    });

    return {
      // Keep the term value as id. For blank nodes this is the blank id (e.g. 'b0')
      id: subjectTerm.value,
      termType: subjectTerm.termType,
      template: templateLiteral,
      mappings,
    };
  });
}

function collectOntologyMetadata(store) {
  const ontos = store.getQuads(null, rdfType, namedNode(NAMESPACES.owl + 'Ontology'), null);
  if (!ontos.length) return null;

  const subject = ontos[0].subject;
  return {
    id: subject.value || "",
    title: literalFor(store, subject, namedNode(NAMESPACES.dct + 'title')) || literalFor(store, subject, namedNode(NAMESPACES.rdfs + 'label')),
    description: literalFor(store, subject, namedNode(NAMESPACES.dct + 'description')) || literalFor(store, subject, namedNode(NAMESPACES.rdfs + 'comment')),
    creator: literalFor(store, subject, namedNode(NAMESPACES.dct + 'creator')),
    version: literalFor(store, subject, namedNode(NAMESPACES.owl + 'versionInfo')),
    preferredNamespacePrefix: literalFor(store, subject, vannPreferredNamespacePrefix),
    preferredNamespaceUri: literalFor(store, subject, vannPreferredNamespaceUri),
    imports: urisFor(store, subject, namedNode(NAMESPACES.owl + 'imports')),
  };
}

function collectSubjectsByTypes(store, typeUris) {
  const subjects = new Set();
  typeUris.forEach((typeUri) => {
    store.getQuads(null, rdfType, namedNode(typeUri), null).forEach((q) => {
      subjects.add(q.subject.value);
    });
  });
  return [...subjects];
}

function createInternalResourceFilter(ontologyMeta, prefixes) {
  const namespaceCandidates = [
    ontologyMeta?.preferredNamespaceUri,
    prefixes?.riepr,
    filePrefixes?.riepr,
  ].filter(Boolean);

  if (namespaceCandidates.length === 0) {
    return (uri) => !uri.startsWith('_:');
  }

  const namespaces = new Set();
  namespaceCandidates.forEach((ns) => {
    namespaces.add(ns);
    if (ns.endsWith('#') || ns.endsWith('/')) {
      namespaces.add(ns.slice(0, -1));
    }
  });

  return (uri) => {
    if (!uri || uri.startsWith('_:')) return false;
    return [...namespaces].some((ns) => uri.startsWith(ns));
  };
}

function collectClasses(store, isInternalResource) {
  const classUris = collectSubjectsByTypes(store, [NAMESPACES.owl + 'Class']);

  // Filter out blank nodes and restriction classes
  const allClassIds = new Set(
    classUris.filter(isInternalResource).map(uri => localName(uri))
  );

  return classUris
    .filter(isInternalResource)
    .map((uri) => {
      const superClasses = urisFor(store, uri, namedNode(NAMESPACES.rdfs + 'subClassOf'))
        .filter(sc => !sc.startsWith('_:'))
        .filter(sc => !sc.startsWith('http://www.w3.org/2002/07/owl#Restriction'))
        // Only include superClasses that are actually defined as classes in the ontology
        .filter(sc => allClassIds.has(localName(sc)));
      
      const exampleQuads = store.getQuads(namedNode(uri), namedNode(NAMESPACES.skos + 'example'), null, null);
      const examples = exampleQuads.map(q => {
        if (q.object.termType === "BlankNode") {
          return serializeBlankNodeToTurtle(store, q.object.value);
        } else {
          return q.object.value;
        }
      });

      // Extract restrictions from rdfs:subClassOf
      const restrictionQuads = store.getQuads(namedNode(uri), namedNode(NAMESPACES.rdfs + 'subClassOf'), null, null)
        .filter(q => q.object.termType === "BlankNode");
      
      const restrictions = restrictionQuads.map(q => {
        const restrictionNode = q.object.value;
        const restrictionBlankNode = blankNode(restrictionNode);
        
        const onProperty = store
          .getQuads(restrictionBlankNode, namedNode(NAMESPACES.owl + 'onProperty'), null, null)
          .map(qr => qr.object.value)[0];
        
        const someValues = store
          .getQuads(restrictionBlankNode, namedNode(NAMESPACES.owl + 'someValuesFrom'), null, null)
          .map(qr => qr.object.value)[0];
        
        const allValues = store
          .getQuads(restrictionBlankNode, namedNode(NAMESPACES.owl + 'allValuesFrom'), null, null)
          .map(qr => qr.object.value)[0];
        
        const minCard = store
          .getQuads(restrictionBlankNode, namedNode(NAMESPACES.owl + 'minCardinality'), null, null)
          .map(qr => qr.object.value)[0];
        
        const maxCard = store
          .getQuads(restrictionBlankNode, namedNode(NAMESPACES.owl + 'maxCardinality'), null, null)
          .map(qr => qr.object.value)[0];
        
        const cardinality = store
          .getQuads(restrictionBlankNode, namedNode(NAMESPACES.owl + 'cardinality'), null, null)
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

      // Collect hydra:search targets; keep BlankNode references as well
      const searchQuads = store.getQuads(namedNode(uri), hydraSearch, null, null);
      const searches = searchQuads.map(q => q.object && q.object.value).filter(Boolean);

      return {
        id: uri,
        localName: localName(uri),
        label: labelFor(store, uri),
        comment: literalFor(store, uri, namedNode(NAMESPACES.rdfs + 'comment')),
        superClasses,
        examples,
        restrictions,
        templates: searches,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function collectProperties(store, isInternalResource) {
  const propertyUris = collectSubjectsByTypes(store, [
    NAMESPACES.owl + 'ObjectProperty',
    NAMESPACES.owl + 'DatatypeProperty',
  ]);

  return propertyUris
    .filter(isInternalResource)
    .map((uri) => {
      const types = store
        .getQuads(namedNode(uri), rdfType, null, null)
        .map((q) => q.object.value);
      
      let kind = "Property";
      if (types.includes(NAMESPACES.owl + 'ObjectProperty')) kind = "ObjectProperty";
      if (types.includes(NAMESPACES.owl + 'DatatypeProperty')) kind = "DatatypeProperty";

      return {
        id: uri,
        localName: localName(uri),
        label: labelFor(store, uri),
        comment: literalFor(store, uri, namedNode(NAMESPACES.rdfs + 'comment')),
        domains: urisFor(store, uri, rdfsDomain).filter(d => !d.startsWith('_:')),
        ranges: urisFor(store, uri, rdfsRange).filter(r => !r.startsWith('_:')),
        kind,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function collectConcepts(store, isInternalResource) {
  const conceptUris = collectSubjectsByTypes(store, [NAMESPACES.skos + 'Concept']);

  return conceptUris
    .filter(isInternalResource)
    .map((uri) => ({
      id: uri,
      localName: localName(uri),
      label: labelFor(store, uri),
      comment: literalFor(store, uri, namedNode(NAMESPACES.rdfs + 'comment')),
      broader: urisFor(store, uri, namedNode(NAMESPACES.skos + 'broader')),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function collectDatatypes(store, isInternalResource) {
  const datatypeUris = collectSubjectsByTypes(store, [NAMESPACES.rdfs + 'Datatype']);

  return datatypeUris
    .filter(isInternalResource)
    .map((uri) => ({
      id: uri,
      localName: localName(uri),
      label: labelFor(store, uri),
      comment: literalFor(store, uri, namedNode(NAMESPACES.rdfs + 'comment')),
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

function generateMermaidForClass(cls, allClasses, properties, maxNodes = 12) {
  if (!cls) return '';

  const nodes = new Map();
  const edges = [];

  function addNode(id, label) {
    if (!nodes.has(id) && nodes.size < maxNodes) nodes.set(id, label);
  }

  addNode(cls.id, cls.label || localName(cls.id));

  // Add internal superclasses
  (cls.superClasses || []).forEach(sc => {
    const target = allClasses.find(c => c.id === sc);
    if (target) {
      addNode(target.id, target.label || localName(target.id));
      edges.push({ from: cls.id, to: target.id, label: 'subClassOf' });
    }
  });

  // Properties where this class is in the domain
  properties.forEach(prop => {
    if ((prop.domains || []).includes(cls.id)) {
      (prop.ranges || []).forEach(range => {
        const target = allClasses.find(c => c.id === range);
        const targetId = target ? target.id : range;
        addNode(targetId, target ? target.label : localName(range));
        edges.push({ from: cls.id, to: targetId, label: prop.localName });
      });
    }
  });

  // Restrictions expressed on this class
  (cls.restrictions || []).forEach(r => {
    const targetUri = r.someValuesFrom || r.allValuesFrom;
    if (targetUri) {
      const target = allClasses.find(c => c.id === targetUri);
      const targetId = target ? target.id : targetUri;
      addNode(targetId, target ? target.label : localName(targetUri));
      const label = r.cardinality ? `${localName(r.property)} (${r.cardinality})` : localName(r.property);
      edges.push({ from: cls.id, to: targetId, label });
    }
  });

  if (edges.length === 0) return '';

  // Build mermaid text and return it base64-encoded in a data attribute to avoid any Bikeshed
  const nodeIdFor = id => 'n' + localName(id).replace(/[^a-zA-Z0-9]/g, '_');
  const lines = [];
  lines.push('graph LR');

  for (const [id, label] of nodes) {
    const safeLabel = String(label || localName(id)).replace(/<[^>]*>/g, '').replace(/`/g, '').replace(/"/g, '');
    lines.push(`${nodeIdFor(id)}["${safeLabel}"]`);
  }

  edges.forEach(e => {
    const from = nodeIdFor(e.from);
    const to = nodeIdFor(e.to);
    const rawLabel = e.label || '';
    const safeEdgeLabel = String(rawLabel).replace(/<[^>]*>/g, '').replace(/`/g, '').replace(/"/g, '');
    lines.push(`${from} -->|${safeEdgeLabel}| ${to}`);
  });

  const mermaidText = lines.join('\n');
  const b64 = Buffer.from(mermaidText, 'utf8').toString('base64');
  return `<div class="riepr-mermaid" data-mermaid="${b64}"></div>`;
}

function generateBikeshed(ontologyMeta, classes, properties, concepts, datatypes, prefixes, templates = [], afnameContent = "") {
  // Ensure prefixUri uses the provided prefixes
  filePrefixes = Object.assign({}, filePrefixes || {}, prefixes || {});

  const ontologyBase = (ontologyMeta && (ontologyMeta.preferredNamespaceUri || prefixes.riepr)) || (filePrefixes.riepr || '');

  function linkify(uri) {
    if (!uri) return '';
    try {
      const u = String(uri);
      const baseNoHash = ontologyBase.replace(/#$/, '');
      const isInternal = ontologyBase && (u.startsWith(ontologyBase) || u.startsWith(baseNoHash));
      // For internal ontology IRIs prefer a relational/prefixed label (or local name)
      let text;
      if (isInternal) {
        const local = localName(u);
        // try to find a prefix for this namespace
        const entry = Object.entries(filePrefixes || {}).find(([, ns]) => u.startsWith(ns));
        if (entry) {
          const pfx = entry[0];
          text = `${pfx}:${local}`;
        } else {
          text = local;
        }
        return `[${text}](#${local})`;
      }
      // External link: show prefixed form if available and link to the full URI
      text = prefixUri(u);
      if (!text || text === 'undefined') {
        const local = localName(u);
        const entry = Object.entries(filePrefixes || {}).find(([, ns]) => u.startsWith(ns));
        text = entry ? `${entry[0]}:${local}` : local;
      }
      if (typeof text === 'string' && text.startsWith('<') && text.endsWith('>')) {
        text = text.slice(1, -1);
      }
      return `[${text}](${u})`;
    } catch (e) {
      return `
${uri}`;
    }
  }

  // Render the full IRI as link text. For internal ontology IRIs link to the local anchor.
  function fullIriLink(uri) {
    if (!uri) return '';
    const u = String(uri);
    const baseNoHash = ontologyBase.replace(/#$/, '');
    const isInternal = ontologyBase && (u.startsWith(ontologyBase) || u.startsWith(baseNoHash));
    if (isInternal) {
      return `[${u}](#${localName(u)})`;
    }
    return `[${u}](${u})`;
  }
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

# Conformiteit # {#conformance-ontology}

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

Deze ontologie definieert ${classes.length} klassen${properties.length > 0 ? `, ${properties.length} eigenschappen` : ''}${concepts.length > 0 ? `, ${concepts.length} concept instanties` : ''}${datatypes.length > 0 ? ` en ${datatypes.length} datatypes` : ''}.

# Klassen # {#classes}

`;
    // Include mermaid loader so embedded mermaid blocks render in the generated HTML
    output += `
  <script src="https://unpkg.com/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({startOnLoad:false});</script>

  <script>
  // Decode base64 mermaid blocks generated by the spec generator and inject into the DOM
  document.addEventListener('DOMContentLoaded', function () {
    const blocks = document.querySelectorAll('.riepr-mermaid[data-mermaid]');
    blocks.forEach(b => {
      try {
        const b64 = b.getAttribute('data-mermaid');
        const raw = atob(b64);
        const cont = document.createElement('div');
        cont.className = 'mermaid';
        cont.textContent = raw;
        b.appendChild(cont);
      } catch (e) {
        console.error('Failed to decode mermaid block', e);
      }
    });
    // Now render all mermaid diagrams that were injected
    if (window.mermaid) mermaid.init(undefined, document.querySelectorAll('.mermaid'));
  });
  </script>

  `;

  // Build hierarchy
  const hierarchy = buildClassHierarchy(classes);
  
  // Generate hierarchical TOC as nested HTML <ul> to preserve nesting in Bikeshed HTML
  function generateClassTocHtml(classesList) {
    if (!classesList || classesList.length === 0) return '';
    let html = '<ul>';
    classesList.forEach(cls => {
      const anchorId = cls.localName;
      html += `<li><a href="#${anchorId}">${cls.label}</a>`;
      const children = hierarchy.childrenMap.get(cls.id) || [];
      if (children.length > 0) {
        html += generateClassTocHtml(children);
      }
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }
  
  output += `## Klassenhiërarchie ## {#class-hierarchy}\n\n`;
  output += generateClassTocHtml(hierarchy.rootClasses);
  output += '\n';
  
  // Generate class sections recursively
  function generateClassSection(cls, level = 2) {
    let section = '';
    const anchorId = cls.localName;
    const headingMarks = '#'.repeat(level);
    section += `${headingMarks} ${cls.label} ${headingMarks} {#${anchorId}}\n\n`;
    section += `**IRI:** ${fullIriLink(cls.id)}\n\n`;
    
    if (cls.comment) {
      section += `**Definitie:** ${cls.comment}\n\n`;
    }
    
    if (cls.superClasses.length > 0) {
      section += `**Subklasse van:** ${cls.superClasses.map(sc => linkify(sc)).join(', ')}\n\n`;
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
    
    // Add a small mermaid diagram illustrating relations for this class (if any)
    const mermaidBlock = generateMermaidForClass(cls, classes, properties);
    if (mermaidBlock) {
      section += `**Relaties:**\n\n`;
      section += mermaidBlock + '\n';
    }

    // Inline any hydra templates associated with this class (via hydra:search)
    if (cls.templates && cls.templates.length > 0) {
      cls.templates.forEach(turi => {
        const found = templates.find(tt => tt.id === turi);
        const templ = found ? found.template : '';
        // If the template is a blank node, show the template string instead of an internal id
        if (found && found.termType === 'BlankNode') {
          section += `**IRI template:**\n\n`;
          if (templ) {
            section += `\`\`\`text\n${templ}\n\`\`\`\n\n`;
          }
        } else {
          const title = found ? localName(found.id) : localName(turi);
          section += `**IRI template:** ${title}\n\n`;
          if (templ) {
            section += `\`\`\`text\n${templ}\n\`\`\`\n\n`;
          }
        }

        if (found && found.mappings && found.mappings.length > 0) {
          section += `**Mappings:**\n\n`;
          found.mappings.forEach(m => {
            const prop = m.property ? linkify(m.property) : m.raw;
            section += `- **${m.variable}** -> ${prop}${m.required ? ` (required: ${m.required})` : ''}\n`;
          });
          section += `\n`;
        }
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
      output += `**IRI:** ${fullIriLink(prop.id)}\n\n`;
      output += `**Type:** ${prop.kind}\n\n`;
      
      if (prop.comment) {
        output += `**Definitie:** ${prop.comment}\n\n`;
      }
      
      if (prop.domains.length > 0) {
        output += `**Domein:** ${prop.domains.map(d => linkify(d)).join(', ')}\n\n`;
      }
      
      if (prop.ranges.length > 0) {
        output += `**Bereik:** ${prop.ranges.map(r => linkify(r)).join(', ')}\n\n`;
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
      output += `## ${concept.label} ## {#${anchorId}}\n\n`;
      output += `**IRI:** ${fullIriLink(concept.id)}\n\n`;

      if (concept.comment) {
        output += `**Definitie:** ${concept.comment}\n\n`;
      }

      if (concept.broader.length > 0) {
        output += `**Breder concept:** ${concept.broader.map(b => linkify(b)).join(', ')}\n\n`;
      }

      output += '\n';
    });
  }

  if (datatypes.length > 0) {
    output += `# Datatypes # {#datatypes}

Deze sectie beschrijft de voorgedefinieerde datatypes in de ontologie.

`;

    datatypes.forEach(datatype => {
      const anchorId = datatype.localName;
      output += `## ${datatype.label} ## {#${anchorId}}\n\n`;
      output += `**IRI:** ${fullIriLink(datatype.id)}\n\n`;

      if (datatype.comment) {
        output += `**Definitie:** ${datatype.comment}\n\n`;
      }

      output += `\n`;
    });
  }

  // Add downloads section
  output += `# Downloads # {#downloads}

* [Turtle formaat](https://data.riepr.omgeving.vlaanderen.be/ns/riepr.ttl)
* [RDF/XML formaat](https://data.riepr.omgeving.vlaanderen.be/ns/riepr.rdf)
* [JSON-LD formaat](https://data.riepr.omgeving.vlaanderen.be/ns/riepr.jsonld)
`;

  // Append afname markdown content if present
  if (afnameContent) {
    output += `\n${afnameContent}`;
  }

  return output;
}

function includeAfnameContent() {
  // Resolve afname directory relative to project root
  const afnameDir = resolve(PROJECT_ROOT, "documentatie", "datamodel", "afname");
  
  try {
    const files = readdirSync(afnameDir);
    const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md');
    
    if (mdFiles.length === 0) {
      console.log("Geen afname-markdown bestanden gevonden.");
      return "";
    }
    
    let content = "# Afname Documentatie # {#afname}\n\n";
    content += "Deze sectie bevat de afnamedocumentatie voor het RIE-IEPR-datamodel, gericht op Linked Open Data (LOD)-afnemers.\n\n";
    
    // Helper: generate a Bikeshed-safe slug from a string
    function toSlug(str) {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // remove non-alphanumeric except spaces and hyphens
        .replace(/\s+/g, '-')           // spaces to hyphens
        .replace(/-+/g, '-')            // collapse multiple hyphens
        .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
    }
    
    // Add navigation index
    content += "## Navigatie ##\n\n";
    mdFiles.forEach(file => {
      const slug = toSlug(file.replace('.md', ''));
      content += `- [${file.replace('.md', '')}](#${slug})\n`;
    });
    content += "\n";
    
    // Add each markdown file's content
    mdFiles.forEach(file => {
      const filePath = resolve(afnameDir, file);
      try {
        const mdContent = readFileSync(filePath, "utf8");
        // Extract title from first line and use as section heading
        const lines = mdContent.split('\n');
        const titleLine = lines.find(l => l.startsWith('# '));
        const sectionTitle = titleLine ? titleLine.replace('# ', '') : file.replace('.md', '');
        const slug = toSlug(file.replace('.md', ''));
        
        content += `## ${sectionTitle} ## {#${slug}}\n\n`;
        
        // Skip the first line (title) and include rest of content
        const contentLines = lines.slice(1);
        content += contentLines.join('\n');
        content += "\n\n";
      } catch (e) {
        console.warn(`Waarschuwing: kon ${file} niet inlezen: ${e.message}`);
      }
    });
    
    return content;
  } catch (e) {
    console.warn(`Waarschuwing: kon afname directory niet lezen: ${e.message}`);
    return "";
  }
}

function build() {
  console.log("Laden van ontologie...");
  const store = loadStore(PATHS.ontology);
  
  console.log("Extractie van metadata...");
  const ontologyMeta = collectOntologyMetadata(store);
  
  console.log("Extractie van prefixes...");
  const prefixes = extractPrefixes(PATHS.ontology);

  const isInternalResource = createInternalResourceFilter(ontologyMeta, prefixes);
  
  console.log("Verzamelen van klassen...");
  const classes = collectClasses(store, isInternalResource);
  
  console.log("Verzamelen van eigenschappen...");
  const properties = collectProperties(store, isInternalResource);
  
  console.log("Verzamelen van concepten...");
  let concepts = collectConcepts(store, isInternalResource);

  console.log("Verzamelen van datatypes...");
  const datatypes = collectDatatypes(store, isInternalResource);

  const renderedIds = new Set([
    ...classes.map((c) => c.id),
    ...properties.map((p) => p.id),
    ...datatypes.map((d) => d.id),
  ]);
  concepts = concepts.filter((concept) => !renderedIds.has(concept.id));
  
  console.log("Verzamelen van IRI templates (Hydra)...");
  const templates = collectIriTemplates(store);
  
  console.log(`Gevonden: ${classes.length} klassen, ${properties.length} eigenschappen, ${concepts.length} concepten, ${datatypes.length} datatypes`);
  
  // Include afname markdown content
  const afnameContent = includeAfnameContent();
  
  console.log("Genereren van Bikeshed specificatie...");
  const bikeshed = generateBikeshed(ontologyMeta, classes, properties, concepts, datatypes, prefixes, templates, afnameContent);
  
  // Write the generated Bikeshed spec into this package directory so Docker builds include it
  const outPath = resolve(__dirname, "ontologie.bs");
  writeFileSync(outPath, bikeshed, "utf8");
  
  console.log(`✓ Bikeshed specificatie gegenereerd: ${outPath}`);
}

build();