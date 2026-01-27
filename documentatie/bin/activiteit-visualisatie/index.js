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
    isStepOfPlan: namedNode('http://purl.org/net/p-plan#isStepOfPlan'),
};
const ssn = {
    implements: namedNode('http://www.w3.org/ns/ssn/implements'),
};
const riepr = {
    Activiteit: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Activiteit'),
    ActiviteitStap: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ActiviteitStap'),
    Emissiepunt: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt'),
    Installatie: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie'),
    TransportProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#TransportProcedure'),
    EmissieProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#EmissieProcedure'),
    VerwerkingsProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#VerwerkingsProcedure'),
    apparaatVerwerkingsProces: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#apparaatVerwerkingsProces'),
};

const styles = {
    activiteit: 'fill:#4A90E2,stroke:#2E5C8A,color:#fff',
    emissiepunt: 'fill:#7ED321,stroke:#5A9E17,color:#fff',
    installatie: 'fill:#D3D3D3,stroke:#808080,color:#000',
}

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

function getRootActivity(store) {
    const activities = store.getQuads(null, rdf.type, riepr.Activiteit);
    return activities.length > 0 ? activities[0].subject.value : null;
}

function getActivitySteps(store, activityUri) {
    return store.getQuads(null, rdf.type, riepr.ActiviteitStap)
        .filter(quad => {
            const isPartOfPlanQuads = store.getQuads(quad.subject, pplan.isStepOfPlan, namedNode(activityUri));
            return isPartOfPlanQuads.length > 0;
        });
}

function constructMermaidGraph(store, steps, nodeMap) {
    let mermaid = '';
    for (const stepQuad of steps) {
        const index = nodeMap.size;
        const stepUri = stepQuad.subject.value;
        const nodeId = `step${index}`;
        nodeMap.set(stepUri, nodeId);
        const subSteps = getActivitySteps(store, stepUri);
        if (subSteps.length > 0) {
            mermaid += `    subgraph ${nodeId}["${getLabel(store, stepUri)}"]\n`;
            mermaid += constructMermaidGraph(store, subSteps, nodeMap);
            mermaid += '    end\n';
            mermaid += `    style ${nodeId} ${styles.activiteit}\n`;
            continue;
        }
        // If non-transport, add as normal node to flowchart
        const implementsQuads = store.getQuads(namedNode(stepUri), ssn.implements, null);
        const procedureUri = implementsQuads.length > 0 ? implementsQuads[0].object.value : null;
        if (procedureUri && (
            isTransportProcedure(store, procedureUri) ||
            isUitstootProcedure(store, procedureUri)
        )) {
            continue; // Skip transport/uitstoot procedures for now
        }
        
        const label = getLabel(store, stepUri);
        let nodeLabel = implementsQuads.length > 0 ? `${label}[${getLabel(store, implementsQuads[0].object.value)}]` : label;
        if (isApparaatVerwerkingsProcedure(store, procedureUri)) {
            // Get label of apparaat used
            const gebruikteApparaten = store.getQuads(namedNode(stepUri), prov.used, null);
            if (gebruikteApparaten.length > 0) {
                const apparaatUri = gebruikteApparaten[0].object.value;
                const apparaatLabel = getLabel(store, apparaatUri);
                nodeLabel = `(Apparaat: ${apparaatLabel})`;
            }
        }
        mermaid += `    ${nodeId}["${nodeLabel}"]\n`;
        mermaid += `    style ${nodeId} ${styles.activiteit}\n`;
    }
    return mermaid;
}

async function generateMermaidFlowchart(ontologyPath, examplePath, outputPath) {
    console.log('Parsing ontology and example...');
    const { store: ontologyStore } = await parseTTL(ontologyPath);
    const { store: exampleStore } = await parseTTL(examplePath);
    
    const combinedStore = new N3.Store([...ontologyStore, ...exampleStore]);
    
    // Root activity (IoA)
    const rootActivityUri = getRootActivity(exampleStore);

    // Collect all activity steps of type riepr:ActiviteitStap
    const steps = exampleStore.getQuads(null, rdf.type, riepr.ActiviteitStap);
    const rootSteps = getActivitySteps(exampleStore, rootActivityUri);
    
    let mermaid = 'flowchart TD\n';
    const nodeMap = new Map();

    mermaid += constructMermaidGraph(combinedStore, rootSteps, nodeMap);

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
                    mermaid += `        style ${puntId}${emissiepuntId} ${styles.emissiepunt}\n`;
                } else if (nodeId) {
                    mermaid += `        ${nodeId}\n`;
                }
            }
        }
        mermaid += '    end\n';
        mermaid += `    style ${installatieLabel} ${styles.installatie}\n`;
    }

    mermaid += '\n';

    // Loop through all steps and create edges based on isPrecededBy relationships
    for (const stepUri of nodeMap.keys()) {
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

generateMermaidFlowchart(
    path.join(basePath, 'main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl'),
    path.join(basePath, 'main/input/activiteit/02-fabriek-proces-genest.ttl'),
    path.join(__dirname, 'fabriek-proces-genest.mmd')
).catch(err => console.error('Error:', err));
