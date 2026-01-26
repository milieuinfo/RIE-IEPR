import N3 from 'n3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { namedNode } = N3.DataFactory;


const rdf = {
    type: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
};
const rdfs = {
    label: namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    member: namedNode('http://www.w3.org/2000/01/rdf-schema#member'),
};
const skos = {
    broader: namedNode('http://www.w3.org/2004/02/skos/core#broader'),
};
const prov = {
    type: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    used: namedNode('http://www.w3.org/ns/prov#used'),
};
const pplan = {
    isPrecededBy: namedNode('http://purl.org/net/p-plan#isPrecededBy'),
};
const ssn = {
    implements: namedNode('http://www.w3.org/ns/ssn/implements'),
};
const riepr = {
    ActiviteitStap: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ActiviteitStap'),
    Emissiepunt: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt'),
    Installatie: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie'),
    TransportProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#TransportProcedure'),
    EmissieProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#EmissieProcedure'),
    VerwerkingsProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#VerwerkingsProcedure'),
    apparaatVerwerkingsProces: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#apparaatVerwerkingsProces'),
};

async function parseTTL(filePath) {
    const parser = new N3.Parser({ format: 'Turtle' });
    const store = new N3.Store();
    const ttlContent = fs.readFileSync(filePath, 'utf8');

    return new Promise((resolve, reject) => {
        parser.parse(ttlContent, (error, quad, prefixes) => {
            if (error) reject(error);
            else if (quad) store.addQuad(quad);
            else resolve({ store, prefixes });
        });
    });
}

function getLabel(store, uri) {
    const quads = store.getQuads(namedNode(uri), rdfs.label, null);
    return quads.length > 0 ? quads[0].object.value : uri.split(/[/#]/).pop();
}

function getProcedureType(store, procedureUri) {
    const quads = store.getQuads(namedNode(procedureUri), skos.broader, null);
    return quads.map(q => q.object.value);
}

function isTransportProcedure(store, procedureUri) {
    return getProcedureType(store, procedureUri).some(typeUri => typeUri === riepr.TransportProcedure.value);
}

function isUitstootProcedure(store, procedureUri) {
    return getProcedureType(store, procedureUri).some(typeUri => typeUri === riepr.EmissieProcedure.value);
}

function isVerwerkingsProcedure(store, procedureUri) {
    return getProcedureType(store, procedureUri).some(typeUri => typeUri === riepr.VerwerkingsProcedure.value);
}

function isApparaatVerwerkingsProcedure(store, procedureUri) {
    return isVerwerkingsProcedure(store, procedureUri) &&
        procedureUri === riepr.apparaatVerwerkingsProces.value;
}

async function generateMermaidFlowchart(ontologyPath, examplePath, outputPath) {
    console.log('Parsing ontology and example...');
    const { store: ontologyStore } = await parseTTL(ontologyPath);
    const { store: exampleStore } = await parseTTL(examplePath);
    
    const combinedStore = new N3.Store([...ontologyStore, ...exampleStore]);
    
    // Collect all activity steps of type riepr:ActiviteitStap
    const steps = exampleStore.getQuads(null, rdf.type, riepr.ActiviteitStap);
    let mermaid = 'flowchart TD\n';
    const nodeMap = new Map();

    for (const [index, stepQuad] of steps.entries()) {
        const stepUri = stepQuad.subject.value;
        const nodeId = `step${index}`;
        nodeMap.set(stepUri, nodeId);
        // If non-transport, add as normal node to flowchart
        const implementsQuads = exampleStore.getQuads(namedNode(stepUri), ssn.implements, null);
        const procedureUri = implementsQuads.length > 0 ? implementsQuads[0].object.value : null;
        if (procedureUri && (
            isTransportProcedure(combinedStore, procedureUri) ||
            isUitstootProcedure(combinedStore, procedureUri)
        )) {
            continue; // Skip transport/uitstoot procedures for now
        }
        const label = getLabel(combinedStore, stepUri);
        let nodeLabel = implementsQuads.length > 0 ? `${label}[${getLabel(combinedStore, implementsQuads[0].object.value)}]` : label;
        if (isApparaatVerwerkingsProcedure(combinedStore, procedureUri)) {
            // Get label of apparaat used
            const gebruikteApparaten = exampleStore.getQuads(namedNode(stepUri), prov.used, null);
            if (gebruikteApparaten.length > 0) {
                const apparaatUri = gebruikteApparaten[0].object.value;
                const apparaatLabel = getLabel(combinedStore, apparaatUri);
                nodeLabel = `(Apparaat: ${apparaatLabel})`;
            }
        }
        mermaid += `    ${nodeId}["${nodeLabel}"]\n`;
    }
    // Add emissiepunt nodes
    const emissiePunten = exampleStore.getQuads(null, rdf.type, riepr.Emissiepunt);
    const puntId = 'emissiepunt';
    for (const [index, puntQuad] of emissiePunten.entries()) {
        const puntUri = puntQuad.subject.value;
        const label = getLabel(combinedStore, puntUri);
        mermaid += `    ${puntId}${index}(["${label}"])\n`;
    }

    // Add installation subgraphs
    const installaties = exampleStore.getQuads(null, rdf.type, riepr.Installatie);
    for (const installatieQuad of installaties) {
        const installatieUri = installatieQuad.subject.value;
        const installatieLabel = getLabel(combinedStore, installatieUri);
        mermaid += `    subgraph ${installatieLabel}\n`;
        // Find all apparatus associated with this installation (rdfs:member)
        // Assign the correct node (emissipunt id and step ids)
        const apparatusQuads = exampleStore.getQuads(namedNode(installatieUri), rdfs.member, null);
        for (const apparaatQuad of apparatusQuads) {
            const apparaatUri = apparaatQuad.object.value;
            // Find steps that use this apparatus
            const gebruikteInStappen = exampleStore.getQuads(null, prov.used, namedNode(apparaatUri));
            for (const gebruikteStapQuad of gebruikteInStappen) {
                const stepUri = gebruikteStapQuad.subject.value;
                const nodeId = nodeMap.get(stepUri);
                const emissiepuntId = emissiePunten.findIndex(eq => eq.subject.value === apparaatUri);
                if (emissiepuntId !== -1) {
                    mermaid += `        ${puntId}${emissiepuntId}\n`;
                } else if (nodeId) {
                    mermaid += `        ${nodeId}\n`;
                }
            }
        }
        mermaid += '    end\n';
    }

    mermaid += '\n';

    // Loop through all steps and create edges based on isPrecededBy relationships
    for (const stepQuad of steps) {
        const stepUri = stepQuad.subject.value;
        const nextStepUri = steps.find(sq => {
            const precededByQuads = exampleStore.getQuads(namedNode(sq.subject.value), pplan.isPrecededBy, namedNode(stepUri));
            return precededByQuads.length > 0;
        })?.subject.value || null;
        const previousStepUri = exampleStore.getQuads(namedNode(stepUri), pplan.isPrecededBy, null)
            .map(q => q.object.value);
        // Skip if the previous step was a transport procedure (edge)
        if (previousStepUri.some(uri => {
            const implementsQuads = exampleStore.getQuads(namedNode(uri), ssn.implements, null);
            return implementsQuads.length > 0 && isTransportProcedure(combinedStore, implementsQuads[0].object.value);
        })) {
            continue;
        }
        const currentNodeId = nodeMap.get(stepUri);
        const nextNodeId = nodeMap.get(nextStepUri);
        const precededByQuads = exampleStore.getQuads(namedNode(stepUri), pplan.isPrecededBy, null);
        
        for (const precededQuad of precededByQuads) {
            const previousNodeId = nodeMap.get(precededQuad.object.value);
            if (!previousNodeId) continue;
            
            const implementsQuads = exampleStore.getQuads(namedNode(stepUri), ssn.implements, null);
            
            const label = getLabel(combinedStore, stepUri);
            if (implementsQuads.length > 0 && isTransportProcedure(combinedStore, implementsQuads[0].object.value)) {
                mermaid += `    ${previousNodeId} ==>|${label}| ${nextNodeId}\n`;
            } else if (implementsQuads.length > 0 && isUitstootProcedure(combinedStore, implementsQuads[0].object.value)) {
                const uitgaandeEmissiepunten = exampleStore.getQuads(namedNode(stepUri), prov.used, null);
                for (const punt of uitgaandeEmissiepunten) {
                    const puntUri = punt.object.value;
                    const puntId = `emissiepunt${emissiePunten.findIndex(eq => eq.subject.value === puntUri)}`;
                    mermaid += `    ${previousNodeId} -.->|${label}| ${puntId}\n`;
                }
            } else if (currentNodeId) {
                mermaid += `    ${previousNodeId} --> ${currentNodeId}\n`;
            }
        }
    }

    fs.writeFileSync(outputPath, mermaid);
    console.log(`Flowchart generated: ${outputPath}`);
}

const basePath = path.join(__dirname, '../../../src');

generateMermaidFlowchart(
    path.join(basePath, 'main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl'),
    path.join(basePath, 'main/input/activiteit/03-staalfabriek.ttl'),
    path.join(__dirname, 'staalfabriek.mmd')
).catch(err => console.error('Error:', err));
