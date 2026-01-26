import N3 from 'n3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    const { namedNode } = N3.DataFactory;
    const rdfsLabel = namedNode('http://www.w3.org/2000/01/rdf-schema#label');
    const quads = store.getQuads(namedNode(uri), rdfsLabel, null);
    return quads.length > 0 ? quads[0].object.value : uri.split(/[/#]/).pop();
}

function getProcedureType(store, procedureUri) {
    const { namedNode } = N3.DataFactory;
    const skosBroader = namedNode('http://www.w3.org/2004/02/skos/core#broader');
    const quads = store.getQuads(namedNode(procedureUri), skosBroader, null);
    return quads.map(q => q.object.value);
}

function isTransportProcedure(store, procedureUri) {
    return getProcedureType(store, procedureUri).some(typeUri => typeUri === 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#TransportProcedure');
}

function isUitstootProcedure(store, procedureUri) {
    return getProcedureType(store, procedureUri).some(typeUri => typeUri === 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#UitstootProcedure');
}

function isApparaatVerwerkingsProcedure(store, procedureUri) {
    return getProcedureType(store, procedureUri).some(typeUri => typeUri === 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ApparaatVerwerkingsProcedure');
}

async function generateMermaidFlowchart(ontologyPath, examplePath, outputPath) {
    console.log('Parsing ontology and example...');
    const { store: ontologyStore } = await parseTTL(ontologyPath);
    const { store: exampleStore } = await parseTTL(examplePath);
    
    const combinedStore = new N3.Store([...ontologyStore, ...exampleStore]);
    const { namedNode } = N3.DataFactory;
    
    // Collect all activity steps of type riepr:ActiviteitStap
    const steps = exampleStore.getQuads(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ActiviteitStap'));
    let mermaid = 'flowchart TD\n';
    const nodeMap = new Map();

    for (const [index, stepQuad] of steps.entries()) {
        const stepUri = stepQuad.subject.value;
        const nodeId = `step${index}`;
        nodeMap.set(stepUri, nodeId);
        // If non-transport, add as normal node to flowchart
        const implementsQuads = exampleStore.getQuads(namedNode(stepUri), namedNode('http://www.w3.org/ns/ssn/implements'), null);
        const procedureUri = implementsQuads.length > 0 ? implementsQuads[0].object.value : null;
        if (procedureUri && (
            isTransportProcedure(combinedStore, procedureUri) ||
            isUitstootProcedure(combinedStore, procedureUri) ||
            isApparaatVerwerkingsProcedure(combinedStore, procedureUri)
        )) {
            continue; // Skip transport/uitstoot procedures for now
        }
        const label = getLabel(combinedStore, stepUri);
        const nodeLabel = implementsQuads.length > 0 ? `${label}[${getLabel(combinedStore, implementsQuads[0].object.value)}]` : label;
        
        mermaid += `    ${nodeId}["${nodeLabel}"]\n`;
    }
    // Add emissiepunt nodes
    const emissiePunten = exampleStore.getQuads(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt'));
    const puntId = 'emissiepunt';
    for (const [index, puntQuad] of emissiePunten.entries()) {
        const puntUri = puntQuad.subject.value;
        const label = getLabel(combinedStore, puntUri);
        mermaid += `    ${puntId}${index}(["${label}"])\n`;
    }
    // Add apparaat nodes
    const apparaten = exampleStore.getQuads(null, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Apparaat'));
    const apparaatId = 'apparaat';
    for (const [index, apparaatQuad] of apparaten.entries()) {
        const apparaatUri = apparaatQuad.subject.value;
        const label = getLabel(combinedStore, apparaatUri);
        mermaid += `    ${apparaatId}${index}(["${label}"])\n`;
    }

    mermaid += '\n';

    // Loop through all steps and create edges based on isPrecededBy relationships
    for (const stepQuad of steps) {
        const stepUri = stepQuad.subject.value;
        const nextStepUri = steps.find(sq => {
            const precededByQuads = exampleStore.getQuads(namedNode(sq.subject.value), namedNode('http://purl.org/net/p-plan#isPrecededBy'), namedNode(stepUri));
            return precededByQuads.length > 0;
        })?.subject.value || null;
        const previousStepUri = exampleStore.getQuads(namedNode(stepUri), namedNode('http://purl.org/net/p-plan#isPrecededBy'), null)
            .map(q => q.object.value);
        // Skip if the previous step was a transport procedure
        if (previousStepUri.some(uri => {
            const implementsQuads = exampleStore.getQuads(namedNode(uri), namedNode('http://www.w3.org/ns/ssn/implements'), null);
            return implementsQuads.length > 0 && isTransportProcedure(combinedStore, implementsQuads[0].object.value);
        })) {
            continue;
        }
        const currentNodeId = nodeMap.get(stepUri);
        const nextNodeId = nodeMap.get(nextStepUri);
        const precededByQuads = exampleStore.getQuads(namedNode(stepUri), namedNode('http://purl.org/net/p-plan#isPrecededBy'), null);
        
        for (const precededQuad of precededByQuads) {
            const previousNodeId = nodeMap.get(precededQuad.object.value);
            if (!previousNodeId) continue;
            
            const implementsQuads = exampleStore.getQuads(namedNode(stepUri), namedNode('http://www.w3.org/ns/ssn/implements'), null);
            
            const label = getLabel(combinedStore, stepUri);
            if (implementsQuads.length > 0 && isTransportProcedure(combinedStore, implementsQuads[0].object.value)) {
                mermaid += `    ${previousNodeId} ==>|${label}| ${nextNodeId}\n`;
            } else if (implementsQuads.length > 0 && isUitstootProcedure(combinedStore, implementsQuads[0].object.value)) {
                const uitgaandeEmissiepunten = exampleStore.getQuads(namedNode(stepUri), namedNode('http://www.w3.org/ns/prov#used'), null);
                for (const punt of uitgaandeEmissiepunten) {
                    const puntUri = punt.object.value;
                    const puntId = `emissiepunt${emissiePunten.findIndex(eq => eq.subject.value === puntUri)}`;
                    mermaid += `    ${previousNodeId} -.->|${label}| ${puntId}\n`;
                }
            } else if (implementsQuads.length > 0 && isApparaatVerwerkingsProcedure(combinedStore, implementsQuads[0].object.value)) {
                const gebruikteApparaten = exampleStore.getQuads(namedNode(stepUri), namedNode('http://www.w3.org/ns/prov#used'), null);
                for (const apparaat of gebruikteApparaten) {
                    const apparaatUri = apparaat.object.value;
                    const appId = `apparaat${apparaten.findIndex(aq => aq.subject.value === apparaatUri)}`;
                    const apparaatLabel = getLabel(combinedStore, apparaatUri);
                    mermaid += `    ${previousNodeId} -->|${apparaatLabel}| ${appId}\n`;
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
