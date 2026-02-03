import N3 from 'n3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { ProcedureChecker } from './procedure-checker.js';
import { EdgeGenerator } from './edge-generator.js';
import { parseTurtleFile } from '../../common/src/rdf.js';
import { resolveProjectPath, PATHS } from '../../common/src/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const basePath = resolveProjectPath('src');
const imjvBasePath = resolveProjectPath('documentatie/bin/imjv-migratie-tool');
const rulesFile = resolveProjectPath('src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.n3');
const ontologyFile = resolveProjectPath('src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl');
const { namedNode } = N3.DataFactory;

const MERMAID_SCALE = process.env.MMD_SCALE || '2';

function getMmdcPath() {
    const binPath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'mmdc');
    if (fs.existsSync(binPath)) return binPath;
    const winBinPath = `${binPath}.cmd`;
    if (fs.existsSync(winBinPath)) return winBinPath;
    return null;
}

function exportMermaidAssets(mmdPath) {
    const mmdcPath = getMmdcPath();
    if (!mmdcPath) {
        console.warn('mmdc not found. Skipping PNG/PDF export.');
        return;
    }

    const pngPath = mmdPath.replace(/\.mmd$/i, '.png');
    const pdfPath = mmdPath.replace(/\.mmd$/i, '.pdf');

    try {
        execFileSync(mmdcPath, ['-i', mmdPath, '-o', pngPath, '--scale', MERMAID_SCALE], { stdio: 'inherit' });
        execFileSync(mmdcPath, ['-i', mmdPath, '-o', pdfPath, '--scale', MERMAID_SCALE], { stdio: 'inherit' });
    } catch (err) {
        console.warn(`Failed to export PNG/PDF for ${mmdPath}:`, err.message);
    }
}

const rdf = {
    type: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
};
const rdfs = {
    label: namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    comment: namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
    member: namedNode('http://www.w3.org/2000/01/rdf-schema#member'),
};
const prov = {
    type: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    used: namedNode('http://www.w3.org/ns/prov#used'),
    wasInfluencedBy: namedNode('http://www.w3.org/ns/prov#wasInfluencedBy'),
    wasAttributedTo: namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
};
const pplan = {
    isPrecededBy: namedNode('http://purl.org/net/p-plan#isPrecededBy'),
    isStepOfPlan: namedNode('http://purl.org/net/p-plan#isStepOfPlan'),
    hasInputVar: namedNode('http://purl.org/net/p-plan#hasInputVar'),
    hasOutputVar: namedNode('http://purl.org/net/p-plan#hasOutputVar'),
};
prov.wasDerivedFrom = namedNode('http://www.w3.org/ns/prov#wasDerivedFrom');
const skos = {
    example: namedNode('http://www.w3.org/2004/02/skos/core#example'),
};
const riepr = {
    Apparaat: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Apparaat'),
    Proces: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces'),
    Emissiepunt: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt'),
    Installatie: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie'),
};

const styles = {
    proces: 'color:white,fill:#4A90E2,stroke:#2E5C8A,color:#fff',
    emissiepunt: 'color:white,fill:#7ED321,stroke:#5A9E17,color:#fff',
    stof: 'color:white,fill:#FF9500,stroke:#CC7700,color:#fff',
    installatie: 'color:black,fill:#D3D3D3,stroke:#808080,color:#000',
};

function indentContent(text, spaces = 4) {
    return text
        .split('\n')
        .filter(Boolean)
        .map(line => `${' '.repeat(spaces)}${line}`)
        .join('\n') + (text.endsWith('\n') ? '\n' : '');
}

function getLabel(store, uri) {
    const quads = store.getQuads(namedNode(uri), rdfs.label, null);
    return quads.length > 0 ? quads[0].object.value : uri.split(/[/#]/).pop();
}

function getComment(store, uri) {
    const quads = store.getQuads(namedNode(uri), rdfs.comment, null);
    if (quads.length > 0) {
        const commentText = quads[0].object.value.replace(/"/g, '\\"').replace(/\n/g, ' ').substring(0, 100);
        return commentText;
    }
    return null;
}

function escapeMermaidLabel(label) {
    if (!label) return label;
    return String(label)
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ');
}

function getRootActivities(store) {
    const activities = store.getQuads(null, rdf.type, riepr.Proces);
    return activities.map(a => a.subject.value);
}

function getActivitySteps(store, activityUri) {
    return store.getQuads(null, rdf.type, riepr.Proces)
        .filter(quad => {
            const isPartOfPlanQuads = store.getQuads(quad.subject, pplan.isStepOfPlan, namedNode(activityUri));
            return isPartOfPlanQuads.length > 0;
        });
}

function constructMermaidGraph(store, steps, nodeMap, parentMap, nodeDefs, subgraphDefs, procedureChecker) {
    let mermaid = '';
    for (const stepQuad of steps) {
        const stepUri = stepQuad.subject.value;
        
        // Skip if already processed (prevents duplicate node creation from recursive calls)
        if (nodeMap.has(stepUri)) {
            continue;
        }
        
        const procedureQuads = store.getQuads(namedNode(stepUri), prov.wasDerivedFrom, null);
        const procedureUri = procedureQuads.length > 0 ? procedureQuads[0].object.value : null;
        if (procedureUri && (
            procedureChecker.isTransportProcedure(procedureUri) ||
            procedureChecker.isVerbruiksProcedure(procedureUri) ||
            procedureChecker.isUitstootProcedure(procedureUri)
        )) {
            // Skip hidden procedures - don't add to nodeMap, don't create nodes
            continue;
        }

        const index = nodeMap.size;
        const nodeId = `step${index}`;
        nodeMap.set(stepUri, nodeId);
        const subSteps = getActivitySteps(store, stepUri);
        if (subSteps.length > 0) {
            const content = constructMermaidGraph(store, subSteps, nodeMap, parentMap, nodeDefs, subgraphDefs, procedureChecker);
            for (const sub of subSteps) {
                parentMap.set(sub.subject.value, stepUri);
            }
            const definition =`subgraph ${nodeId}["${escapeMermaidLabel(getLabel(store, stepUri))}"]
${indentContent(content, 0)}end
style ${nodeId} ${styles.proces}
`;
            // Store definition and include content in return value
            subgraphDefs.set(stepUri, definition);
            mermaid += definition;
            continue;
        }

        const label = escapeMermaidLabel(getLabel(store, stepUri));
        let nodeLabel = procedureQuads.length > 0
            ? `${label}[${escapeMermaidLabel(getLabel(store, procedureQuads[0].object.value))}]`
            : label;
        const comment = getComment(store, stepUri);
        if (comment) {
            nodeLabel += `<br/><i>${comment}</i>`;
        }
        if (procedureChecker && procedureChecker.isApparaatVerwerkingsProcedure(procedureUri)) {
            // Apparaten worden als prov:Agent gemodelleerd en gelinkt via prov:wasAttributedTo
            const gebruikteApparaten = store.getQuads(namedNode(stepUri), prov.wasAttributedTo, null).filter(q => {
                const types = store.getQuads(q.object, rdf.type, null).map(t => t.object.value);
                return types.includes(riepr.Apparaat.value);
            });
            if (gebruikteApparaten.length > 0) {
                const apparaatUri = gebruikteApparaten[0].object.value;
                    const apparaatLabel = escapeMermaidLabel(getLabel(store, apparaatUri));
                const apparaatComment = getComment(store, apparaatUri);
                nodeLabel = `(Apparaat: ${apparaatLabel}`;
                if (apparaatComment) {
                    nodeLabel += `<br/><i>${apparaatComment}</i>`;
                }
                nodeLabel += ')';
            }
        }
        const definition = `${nodeId}["${nodeLabel}"]\nstyle ${nodeId} ${styles.proces}\n`;
        nodeDefs.set(stepUri, definition);
        mermaid += definition;
    }
    return mermaid;
}

async function generateMermaidFlowchart(ontologyPath, outputPath, ...examplePaths) {
    console.log('Parsing ontology and example...');
    const ontologyStore = await parseTurtleFile(ontologyPath);
    const exampleStore = new N3.Store();
    for (const examplePath of examplePaths) {
        if (!fs.existsSync(examplePath)) {
            console.log(`Skipping missing file: ${examplePath}`);
            continue;
        }
        const exampleStorePart = await parseTurtleFile(examplePath);
        exampleStore.addQuads(exampleStorePart.getQuads(null, null, null));
    }

    const combinedStore = new N3.Store([...ontologyStore, ...exampleStore]);
    const rulesContent = fs.readFileSync(rulesFile, 'utf8');
    const rulesParser = new N3.Parser({ format: 'text/n3' });
    const rulesDataset = new N3.Store();
    
    await new Promise((resolve, reject) => {
        rulesParser.parse(rulesContent, (err, ruleQuad) => {
            if (err) reject(err);
            else if (ruleQuad) rulesDataset.addQuad(ruleQuad);
            else resolve();
        });
    });
    const reasoner = new N3.Reasoner(combinedStore);
    const combinedQuads = combinedStore.getQuads(null, null, null);
    reasoner.reason(rulesDataset);
    const newCombinedQuads = combinedStore.getQuads(null, null, null);
    const inferredQuads = newCombinedQuads.filter(q => 
        !combinedQuads.some(existingQ => 
            existingQ.subject.equals(q.subject) &&
            existingQ.predicate.equals(q.predicate) &&
            existingQ.object.equals(q.object)
        )
    );
    exampleStore.addQuads(inferredQuads);

    const exampleNodes = new Set(
        combinedStore.getQuads(null, skos.example, null).map(q => q.object.value)
    );

    const rootActivityUris = getRootActivities(exampleStore);
    const steps = exampleStore.getQuads(null, rdf.type, riepr.Proces);

    let mermaid = 'flowchart LR\n';
    const nodeMap = new Map();
    const nodeDefs = new Map();
    const subgraphDefs = new Map();
    const parentMap = new Map();

    const procedureChecker = new ProcedureChecker(combinedStore);

    for (const rootActivityUri of rootActivityUris) {
        const rootSteps = getActivitySteps(exampleStore, rootActivityUri);
        constructMermaidGraph(combinedStore, rootSteps, nodeMap, parentMap, nodeDefs, subgraphDefs, procedureChecker);
    }

    const emissiePunten = exampleStore
        .getQuads(null, rdf.type, riepr.Emissiepunt)
        .filter(q => !exampleNodes.has(q.subject.value));
    const puntId = 'emissiepunt';
    const emissiepuntIndex = new Map(emissiePunten.map((q, idx) => [q.subject.value, idx]));

    const stofRdf = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const stofClass = namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Stof');
    const allSteps = exampleStore.getQuads(null, stofRdf, riepr.Proces);
    
    // Verzamel alle input en output stoffen
    const inputStofUris = new Set();
    const outputStofUris = new Set();

    for (const stepQuad of allSteps) {
        const stepUri = stepQuad.subject.value;
        const inputVars = exampleStore.getQuads(namedNode(stepUri), pplan.hasInputVar, null);
        const outputVars = exampleStore.getQuads(namedNode(stepUri), pplan.hasOutputVar, null);

        for (const varQuad of inputVars) {
            const varUri = varQuad.object.value;
            const varTypes = exampleStore.getQuads(namedNode(varUri), stofRdf, null);
            if (varTypes.some(t => t.object.value === stofClass.value)) {
                inputStofUris.add(varUri);
            }
        }
        
        for (const varQuad of outputVars) {
            const varUri = varQuad.object.value;
            const varTypes = exampleStore.getQuads(namedNode(varUri), stofRdf, null);
            if (varTypes.some(t => t.object.value === stofClass.value)) {
                outputStofUris.add(varUri);
            }
        }
    }

    // Filter: alleen stoffen die NIET zowel input als output zijn (begin of einde van ketting)
    const stofUris = new Set([...inputStofUris, ...outputStofUris].filter(uri => {
        const isInput = inputStofUris.has(uri);
        const isOutput = outputStofUris.has(uri);
        // Toon alleen als het NIET beide is (dus alleen input OF alleen output)
        return !(isInput && isOutput);
    }));


    const stofIndex = new Map([...stofUris].map((uri, idx) => [uri, idx]));

    const installaties = exampleStore.getQuads(null, rdf.type, riepr.Installatie);
    const indent = (text, spaces = 4) => text
        .split('\n')
        .filter(Boolean)
        .map(line => `${' '.repeat(spaces)}${line}`)
        .join('\n') + (text.endsWith('\n') ? '\n' : '');

    const emittedSteps = new Set();
    const emittedEmissiepunten = new Set();
    const usedApparatusUris = new Set();

    const getAncestorSteps = (stepUri) => {
        const ancestors = [];
        let current = stepUri;
        while (parentMap.has(current)) {
            const parent = parentMap.get(current);
            ancestors.push(parent);
            current = parent;
        }
        return ancestors;
    };

    for (const [installatieIdx, installatieQuad] of installaties.entries()) {
        const installatieUri = installatieQuad.subject.value;
        const installatieLabel = escapeMermaidLabel(getLabel(exampleStore, installatieUri));
        const installatieNodeId = `installatie${installatieIdx}`;
        let body = '';

        const apparatusQuads = exampleStore.getQuads(namedNode(installatieUri), rdfs.member, null);
        const stapUris = new Set();

        for (const apparaatQuad of apparatusQuads) {
            const apparaatUri = apparaatQuad.object.value;
            // Stappen worden aan apparaten toegeschreven via prov:wasAttributedTo (Agent-relatie)
            const gebruikteInStappen = exampleStore.getQuads(null, prov.wasAttributedTo, namedNode(apparaatUri));
            for (const gebruikteStapQuad of gebruikteInStappen) {
                const stepUri = gebruikteStapQuad.subject.value;
                stapUris.add(stepUri);
                usedApparatusUris.add(apparaatUri);
                getAncestorSteps(stepUri).forEach(ancestor => stapUris.add(ancestor));
            }

            if (emissiepuntIndex.has(apparaatUri)) {
                const idx = emissiepuntIndex.get(apparaatUri);
                const label = escapeMermaidLabel(getLabel(exampleStore, apparaatUri));
                const def = `${puntId}${idx}(["${label}"])\nstyle ${puntId}${idx} ${styles.emissiepunt}\n`;
                if (!emittedEmissiepunten.has(apparaatUri)) {
                    body += indent(def);
                    emittedEmissiepunten.add(apparaatUri);
                }
            }
        }

        for (const stepUri of stapUris) {
            const ancestorInSet = getAncestorSteps(stepUri).some(ancestor => stapUris.has(ancestor));
            if (ancestorInSet) continue;
            if (subgraphDefs.has(stepUri) && !emittedSteps.has(stepUri)) {
                body += indent(subgraphDefs.get(stepUri));
                emittedSteps.add(stepUri);
            } else if (nodeDefs.has(stepUri) && !emittedSteps.has(stepUri)) {
                body += indent(nodeDefs.get(stepUri));
                emittedSteps.add(stepUri);
            }
        }

        if (body) {
            mermaid += `    subgraph ${installatieNodeId}["${installatieLabel}"]\n`;
            mermaid += body;
            mermaid += '    end\n';
            mermaid += `    style ${installatieNodeId} ${styles.installatie}\n`;
        }
    }

    // Add any remaining nodes/subgraphs that weren't emitted yet
    // (These are top-level steps not part of any installatie)
    // But ONLY if they're not children of something already emitted
    for (const [stepUri, def] of nodeDefs.entries()) {
        // Skip if this step is a child of another step (has a parent)
        if (parentMap.has(stepUri)) continue;
        if (!emittedSteps.has(stepUri) && !subgraphDefs.has(stepUri)) {
            mermaid += indent(def);
            emittedSteps.add(stepUri);
        }
    }

    for (const [stepUri, def] of subgraphDefs.entries()) {
        // Skip if this step is a child of another step
        if (parentMap.has(stepUri)) continue;
        if (!emittedSteps.has(stepUri)) {
            mermaid += indent(def);
            emittedSteps.add(stepUri);
        }
    }

    for (const [uri, idx] of emissiepuntIndex.entries()) {
        if (!emittedEmissiepunten.has(uri)) {
            const label = escapeMermaidLabel(getLabel(exampleStore, uri));
            mermaid += indent(`${puntId}${idx}(["${label}"])\nstyle ${puntId}${idx} ${styles.emissiepunt}\n`);
            emittedEmissiepunten.add(uri);
        }
    }

    let standaloneApparatusIdx = 0;
    for (const installatieQuad of installaties) {
        const installatieUri = installatieQuad.subject.value;
        const apparatusQuads = exampleStore.getQuads(namedNode(installatieUri), rdfs.member, null);
        
        for (const apparaatQuad of apparatusQuads) {
            const apparaatUri = apparaatQuad.object.value;
            if (emissiepuntIndex.has(apparaatUri)) continue;
            if (usedApparatusUris.has(apparaatUri)) continue;
            
            const types = exampleStore.getQuads(namedNode(apparaatUri), rdf.type, null).map(q => q.object.value);
            if (types.includes(riepr.Proces.value)) continue;
            
            const label = escapeMermaidLabel(getLabel(exampleStore, apparaatUri));
            const comment = getComment(exampleStore, apparaatUri);
            const apparaatLabel = comment 
                ? `(Apparaat: ${label}<br/><i>${comment}</i>)`
                : `(Apparaat: ${label})`;
            
            const nodeId = `apparatus${standaloneApparatusIdx}`;
            mermaid += indent(`${nodeId}["${apparaatLabel}"]\nstyle ${nodeId} ${styles.proces}\n`);
            standaloneApparatusIdx++;
        }
    }

    const emittedStoffen = new Set();
    for (const [stofUri, idx] of stofIndex.entries()) {
        const label = escapeMermaidLabel(getLabel(exampleStore, stofUri));
        mermaid += indent(`stof${idx}(["${label}"])\nstyle stof${idx} ${styles.stof}\n`);
        emittedStoffen.add(stofUri);
    }

    mermaid += '\n';

    const edgeGenerator = new EdgeGenerator(
        exampleStore, 
        procedureChecker, 
        nodeMap, 
        emissiepuntIndex, 
        stofIndex,
        inputStofUris,
        outputStofUris
    );

    const normalEdges = edgeGenerator.generateEdges(steps);
    mermaid += normalEdges.join('\n') + (normalEdges.length > 0 ? '\n' : '');

    const stofEdges = edgeGenerator.generateStofEdges(steps);
    mermaid += stofEdges.join('\n') + (stofEdges.length > 0 ? '\n' : '');

    fs.writeFileSync(outputPath, mermaid);
    console.log(`Flowchart generated: ${outputPath}`);
    exportMermaidAssets(outputPath);
}

generateMermaidFlowchart(
    ontologyFile,
    path.resolve(__dirname, '..', 'staalfabriek.mmd'),
    path.resolve(basePath, 'main/input/activiteit/03-staalfabriek.ttl'),
).catch(err => console.error('Error:', err));

generateMermaidFlowchart(
    ontologyFile,
    path.resolve(__dirname, '..', 'fabriek-proces-genest.mmd'),
    path.resolve(basePath, 'main/input/activiteit/02-fabriek-proces-genest.ttl'),
).catch(err => console.error('Error:', err));

const outputDir = path.resolve(imjvBasePath, 'output');
const directories = fs.readdirSync(outputDir).filter(file => 
    fs.statSync(path.resolve(outputDir, file)).isDirectory()
);

for (const dir of directories) {
    const dirPath = path.resolve(outputDir, dir);
    const ttlFiles = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.ttl'))
        .map(file => path.resolve(dirPath, file));
    
    if (ttlFiles.length > 0) {
        generateMermaidFlowchart(
            ontologyFile,
            path.resolve(__dirname, '..', `imjv_${dir}.mmd`),
            ...ttlFiles
        ).catch(err => console.error('Error:', err));
    }
}
