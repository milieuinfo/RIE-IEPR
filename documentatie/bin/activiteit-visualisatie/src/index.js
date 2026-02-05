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

const MERMAID_SCALE = process.env.MMD_SCALE || '10';

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
    Plan: namedNode('http://purl.org/net/p-plan#Plan'),
    Step: namedNode('http://purl.org/net/p-plan#Step'),
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
const sosa = {
    System: namedNode('http://www.w3.org/ns/sosa/System'),
    Platform: namedNode('http://www.w3.org/ns/sosa/Platform'),
    Deployment: namedNode('http://www.w3.org/ns/sosa/Deployment'),
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
        // First truncate, then escape to avoid breaking escape sequences
        const commentText = quads[0].object.value
            .substring(0, 100)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ');
        return commentText;
    }
    return null;
}

function escapeMermaidLabel(label) {
    if (!label) return label;
    return String(label)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ');
}

// Helper functions to check for both specific RIE types and generic P-PLAN/SOSA types
function isProcessOrStep(store, uri) {
    const types = store.getQuads(namedNode(uri), rdf.type, null).map(q => q.object.value);
    return types.includes(riepr.Proces.value) || types.includes(pplan.Step.value) || types.includes(pplan.Plan.value);
}

function isApparatusOrSystem(store, uri) {
    const types = store.getQuads(namedNode(uri), rdf.type, null).map(q => q.object.value);
    return types.includes(riepr.Apparaat.value) || types.includes(sosa.System.value);
}

function isEmissionPoint(store, uri) {
    const types = store.getQuads(namedNode(uri), rdf.type, null).map(q => q.object.value);
    return types.includes(riepr.Emissiepunt.value);
}

function isInstallationOrPlatform(store, uri) {
    const types = store.getQuads(namedNode(uri), rdf.type, null).map(q => q.object.value);
    return types.includes(riepr.Installatie.value) || types.includes(sosa.Platform.value);
}

function getRootActivities(store) {
    // Get all activities (both specific riepr:Proces and generic p-plan:Step/Plan)
    const procesActivities = store.getQuads(null, rdf.type, riepr.Proces);
    const stepActivities = store.getQuads(null, rdf.type, pplan.Step);
    const planActivities = store.getQuads(null, rdf.type, pplan.Plan);
    const allActivities = [...procesActivities, ...stepActivities, ...planActivities];
    
    // Only return root activities (those that are not steps of another activity)
    const rootActivities = [];
    const seen = new Set();
    for (const activity of allActivities) {
        const uri = activity.subject.value;
        if (seen.has(uri)) continue;
        seen.add(uri);
        
        const isStepQuads = store.getQuads(activity.subject, pplan.isStepOfPlan, null);
        if (isStepQuads.length === 0) {
            rootActivities.push(uri);
        }
    }
    return rootActivities;
}

function getActivitySteps(store, activityUri) {
    // Get all steps (both specific riepr:Proces and generic p-plan:Step)
    const procesSteps = store.getQuads(null, rdf.type, riepr.Proces);
    const pplanSteps = store.getQuads(null, rdf.type, pplan.Step);
    const allSteps = [...procesSteps, ...pplanSteps];
    
    return allSteps.filter(quad => {
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
        
        // Skip all hidden procedures: transport, consumption (verbruiks), emission (uitstoot), and non-apparatus processing
        if (procedureUri) {
            const isProcedureHidden = 
                procedureChecker.isTransportProcedure(procedureUri) ||
                procedureChecker.isVerbruiksProcedure(procedureUri) ||
                procedureChecker.isUitstootProcedure(procedureUri) ||
                (procedureChecker.isVerwerkingsProcedure(procedureUri) &&
                    !procedureChecker.isApparaatVerwerkingsProcedure(procedureUri));
            
            if (isProcedureHidden) {
                // Skip hidden procedures - don't add to nodeMap, don't create nodes
                continue;
            }
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
        
        // Check if this step is attributed to any apparatus
        const gebruikteApparaten = store.getQuads(namedNode(stepUri), prov.wasAttributedTo, null).filter(q => {
            return isApparatusOrSystem(store, q.object.value);
        });
        
        // Check if this is a purification step (derived from apparaatVerwerkingsProces)
        const apparaatVerwerkingsProcesUri = namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#apparaatVerwerkingsProces');
        const purificationCheck = store.getQuads(namedNode(stepUri), prov.wasDerivedFrom, apparaatVerwerkingsProcesUri);
        const isPurificationStep = purificationCheck.length > 0;
        
        if (gebruikteApparaten.length > 0) {
            // This step is performed by apparatus(es) - show label first, then "(Apparaat: ...)"
            const apparaatUri = gebruikteApparaten[0].object.value;
            const apparaatLabel = escapeMermaidLabel(getLabel(store, apparaatUri));
            const apparaatComment = getComment(store, apparaatUri);
            nodeLabel = `${label} (Apparaat: ${apparaatLabel}`;
            if (apparaatComment) {
                nodeLabel += `<br/><i>${apparaatComment}</i>`;
            } else if (comment) {
                nodeLabel += `<br/><i>${comment}</i>`;
            }
            nodeLabel += ')';
        } else if (isPurificationStep) {
            // Purification step - show as "(Apparaat: ...)" with technique/comment
            nodeLabel = `${label} (Apparaat: ${label}`;
            if (comment) {
                nodeLabel += `<br/><i>${comment}</i>`;
            }
            nodeLabel += ')';
        } else if (comment) {
            nodeLabel += `<br/><i>${comment}</i>`;
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
    // Get all steps (both riepr:Proces and pplan:Step)
    const procesSteps = exampleStore.getQuads(null, rdf.type, riepr.Proces);
    const pplanSteps = exampleStore.getQuads(null, rdf.type, pplan.Step);
    const steps = [...procesSteps, ...pplanSteps];

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

    const emissiePunten = combinedStore
        .getQuads(null, rdf.type, riepr.Emissiepunt)
        .filter(q => !exampleNodes.has(q.subject.value) && q.subject.termType !== 'BlankNode');
    const puntId = 'emissiepunt';
    const emissiepuntIndex = new Map(emissiePunten.map((q, idx) => [q.subject.value, idx]));

    const stofRdf = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    const stofClass = namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Stof');
    // Get all steps (both riepr:Proces and pplan:Step)
    const allProcesSteps = exampleStore.getQuads(null, stofRdf, riepr.Proces);
    const allPplanSteps = exampleStore.getQuads(null, stofRdf, pplan.Step);
    const allSteps = [...allProcesSteps, ...allPplanSteps];
    
    // Verzamel alle input/output stoffen per stap
    const inputStofUris = new Set();
    const outputStofUris = new Set();
    const stofToInputSteps = new Map();
    const stofToOutputSteps = new Map();
    const outputStofByStep = new Map();

    for (const stepQuad of allSteps) {
        const stepUri = stepQuad.subject.value;
        const inputVars = exampleStore.getQuads(namedNode(stepUri), pplan.hasInputVar, null);
        const outputVars = exampleStore.getQuads(namedNode(stepUri), pplan.hasOutputVar, null);

        for (const varQuad of inputVars) {
            const varUri = varQuad.object.value;
            const varTypes = exampleStore.getQuads(namedNode(varUri), stofRdf, null);
            if (varTypes.some(t => t.object.value === stofClass.value)) {
                inputStofUris.add(varUri);
                if (!stofToInputSteps.has(varUri)) stofToInputSteps.set(varUri, new Set());
                stofToInputSteps.get(varUri).add(stepUri);
            }
        }
        
        for (const varQuad of outputVars) {
            const varUri = varQuad.object.value;
            const varTypes = exampleStore.getQuads(namedNode(varUri), stofRdf, null);
            if (varTypes.some(t => t.object.value === stofClass.value)) {
                outputStofUris.add(varUri);
                if (!stofToOutputSteps.has(varUri)) stofToOutputSteps.set(varUri, new Set());
                stofToOutputSteps.get(varUri).add(stepUri);
                if (!outputStofByStep.has(stepUri)) outputStofByStep.set(stepUri, new Set());
                outputStofByStep.get(stepUri).add(varUri);
            }
        }
    }

    // Stoffen die enkel als tussenoutput dienen voor zuiveringsketens verbergen
    const apparaatVerwerkingsProcesUri = namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#apparaatVerwerkingsProces');
    const intermediateStofUris = new Set();
    for (const [stepUri, stofSet] of outputStofByStep.entries()) {
        const purificationSuccessors = exampleStore.getQuads(null, pplan.isPrecededBy, namedNode(stepUri))
            .map(q => q.subject.value)
            .filter(succ => exampleStore.getQuads(namedNode(succ), prov.wasDerivedFrom, apparaatVerwerkingsProcesUri).length > 0);
        if (purificationSuccessors.length > 0) {
            for (const stofUri of stofSet) {
                intermediateStofUris.add(stofUri);
            }
        }
    }

    // Filter: toon stoffen enkel als ze NIET rechtstreeks output->input tussen verschillende stappen zijn
    const stofUris = new Set([...inputStofUris, ...outputStofUris].filter(uri => {
        const inputSteps = stofToInputSteps.get(uri) || new Set();
        const outputSteps = stofToOutputSteps.get(uri) || new Set();

        // Verberg tussenoutputs (alleen output van een stap met zuiveringsopvolger)
        if (intermediateStofUris.has(uri) && inputSteps.size === 0 && outputSteps.size === 1) {
            return false;
        }

        // Toon altijd als er geen input of output is
        if (inputSteps.size === 0 || outputSteps.size === 0) return true;

        // Als ALLE stappen die deze stof gebruiken het ZOWEL als input EN output gebruiken,
        // dan is het een "verbruiksstof" zoals brandstof - toon wél
        const allStepsUseBothWays = [...inputSteps].every(step => outputSteps.has(step)) &&
                                     [...outputSteps].every(step => inputSteps.has(step));
        if (allStepsUseBothWays) return true;

        // Verberg als output van een stap wordt gebruikt als input in een andere stap
        return false;
    }));


    const stofIndex = new Map([...stofUris].map((uri, idx) => [uri, idx]));


    const installatieQuads = combinedStore.getQuads(null, rdf.type, riepr.Installatie);
    const platformQuads = combinedStore.getQuads(null, rdf.type, sosa.Platform);
    const installaties = [...installatieQuads, ...platformQuads];
    const indent = (text, spaces = 4) => text
        .split('\n')
        .filter(Boolean)
        .map(line => `${' '.repeat(spaces)}${line}`)
        .join('\n') + (text.endsWith('\n') ? '\n' : '');

    const emittedSteps = new Set();
    const emittedEmissiepunten = new Set();

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

        // Collect all apparatus URIs (both direct members and zuiveringsapparaten)
        const allApparatusInInstallatie = new Set();
        const stepsUsingApparatusInInstallatie = new Set();
        
        for (const apparaatQuad of apparatusQuads) {
            const memberUri = apparaatQuad.object.value;
            
            if (isApparatusOrSystem(combinedStore, memberUri)) {
                allApparatusInInstallatie.add(memberUri);
            }
            
            if (isProcessOrStep(combinedStore, memberUri)) {
                // This is the main activity - find ALL apparatus attributed to steps of this activity
                // Get all steps that are part of this activity
                const allActivitySteps = combinedStore.getQuads(null, pplan.isStepOfPlan, namedNode(memberUri));
                for (const stepQuad of allActivitySteps) {
                    const stepUri = stepQuad.subject.value;
                    // Check if this is a purification step
                    const apparaatVerwerkingsProcesUri = namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#apparaatVerwerkingsProces');
                    const isPurification = combinedStore.getQuads(namedNode(stepUri), prov.wasDerivedFrom, apparaatVerwerkingsProcesUri).length > 0;
                    if (isPurification) {
                        // Add purification step directly - it will be labeled as "(Apparaat: NAME)"
                        stapUris.add(stepUri);
                    } else {
                        // Find all apparatus this step is attributed to
                        const stepApparatus = combinedStore.getQuads(namedNode(stepUri), prov.wasAttributedTo, null);
                        for (const stepApparaatQuad of stepApparatus) {
                            const stepApparaatUri = stepApparaatQuad.object.value;
                            if (isApparatusOrSystem(combinedStore, stepApparaatUri)) {
                                allApparatusInInstallatie.add(stepApparaatUri);
                            }
                        }
                    }
                }
            }
        }

        // Now add all steps that use any of these apparatus to stapUris
        for (const apparaatUri of allApparatusInInstallatie) {
            const gebruikteInStappen = combinedStore.getQuads(null, prov.wasAttributedTo, namedNode(apparaatUri));
            for (const gebruikteStapQuad of gebruikteInStappen) {
                const stepUri = gebruikteStapQuad.subject.value;
                stepsUsingApparatusInInstallatie.add(stepUri);
                stapUris.add(stepUri);
                getAncestorSteps(stepUri).forEach(ancestor => {
                    stapUris.add(ancestor);
                });
            }
        }
        
        // Collect emissiepunten for all apparatus in this installatie
        const emissiepuntenForInstallatie = new Set();
        for (const apparaatUri of allApparatusInInstallatie) {
            // Find proces/activity that uses this apparatus
            const stepsUsingApparaat = combinedStore.getQuads(null, prov.wasAttributedTo, namedNode(apparaatUri));
            for (const stepQuad of stepsUsingApparaat) {
                const stepUri = stepQuad.subject.value;
                // Check if this step isStepOfPlan for an activity
                const planQuads = combinedStore.getQuads(namedNode(stepUri), pplan.isStepOfPlan, null);
                for (const planQuad of planQuads) {
                    const activityUri = planQuad.object.value;
                    // Find emission steps for this activity
                    const emissionSteps = combinedStore.getQuads(null, pplan.isStepOfPlan, namedNode(activityUri));
                    for (const emissionStepQuad of emissionSteps) {
                        const emissionStepUri = emissionStepQuad.subject.value;
                        if (!stepsUsingApparatusInInstallatie.has(emissionStepUri)) continue;
                        // Check if this is an emission step (attributed to an emissiepunt)
                        const attributedToQuads = combinedStore.getQuads(namedNode(emissionStepUri), prov.wasAttributedTo, null);
                        for (const attributedQuad of attributedToQuads) {
                            const influencerUri = attributedQuad.object.value;
                            if (emissiepuntIndex.has(influencerUri)) {
                                emissiepuntenForInstallatie.add(influencerUri);
                            }
                        }
                    }
                }
            }
        }
        
        // Add all purification steps (steps preceded by root steps, used for emission processing)
        // These are steps that flow towards an emissiepunt via pplan.isPrecededBy chain
        for (const eptUri of emissiepuntenForInstallatie) {
            // Find all emission steps attributed to this emissiepunt
            const emissionSteps = combinedStore.getQuads(null, prov.wasAttributedTo, namedNode(eptUri));
            for (const emissionStepQuad of emissionSteps) {
                const emissionStepUri = emissionStepQuad.subject.value;
                if (!stepsUsingApparatusInInstallatie.has(emissionStepUri)) continue;
                stapUris.add(emissionStepUri);
                // Find all steps that precede this emission step (the purification chain)
                const precedingSteps = combinedStore.getQuads(namedNode(emissionStepUri), pplan.isPrecededBy, null);
                for (const precedingQuad of precedingSteps) {
                    const precedingUri = precedingQuad.object.value;
                    stapUris.add(precedingUri);
                    // Recursively add all predecessors in the purification chain
                    let current = precedingUri;
                    while (true) {
                        const nextPreceding = combinedStore.getQuads(namedNode(current), pplan.isPrecededBy, null);
                        if (nextPreceding.length === 0) break;
                        const nextUri = nextPreceding[0].object.value;
                        stapUris.add(nextUri);
                        current = nextUri;
                    }
                    // Also add ancestors via parent relationships
                    getAncestorSteps(precedingUri).forEach(ancestor => {
                        stapUris.add(ancestor);
                    });
                }
            }
        }
        
        // Also add Proces members directly to stapUris and collect their emissiepunten
        for (const apparaatQuad of apparatusQuads) {
            const apparaatUri = apparaatQuad.object.value;
            
            if (isProcessOrStep(combinedStore, apparaatUri)) {
                stapUris.add(apparaatUri);
                
                // Find emissiepunten linked to this activity and all its sub-activities
                const allActivitySteps = combinedStore.getQuads(null, pplan.isStepOfPlan, namedNode(apparaatUri));
                const activityUris = [apparaatUri, ...allActivitySteps.map(q => q.subject.value)];
                
                for (const activityUri of activityUris) {
                    const emissionSteps = combinedStore.getQuads(null, pplan.isStepOfPlan, namedNode(activityUri));
                    for (const emissionStepQuad of emissionSteps) {
                        const emissionStepUri = emissionStepQuad.subject.value;
                        if (!stepsUsingApparatusInInstallatie.has(emissionStepUri)) continue;
                        // Check if this is an emission step (attributed to an emissiepunt)
                        const attributedToQuads = combinedStore.getQuads(namedNode(emissionStepUri), prov.wasAttributedTo, null);
                        for (const attributedQuad of attributedToQuads) {
                            const influencerUri = attributedQuad.object.value;
                            if (emissiepuntIndex.has(influencerUri)) {
                                emissiepuntenForInstallatie.add(influencerUri);
                            }
                        }
                    }
                }
            }

            if (emissiepuntIndex.has(apparaatUri)) {
                emissiepuntenForInstallatie.add(apparaatUri);
            }
        }
        
        // Add all emissiepunten for this installatie to the body
        for (const eptUri of emissiepuntenForInstallatie) {
            if (emissiepuntIndex.has(eptUri) && !emittedEmissiepunten.has(eptUri)) {
                const idx = emissiepuntIndex.get(eptUri);
                const label = escapeMermaidLabel(getLabel(exampleStore, eptUri));
                const def = `${puntId}${idx}(["${label}"])\nstyle ${puntId}${idx} ${styles.emissiepunt}\n`;
                body += indent(def);
                emittedEmissiepunten.add(eptUri);
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

    // Collect labels of all processes that have been rendered
    const renderedProcessLabels = new Set();
    for (const [stepUri, def] of nodeDefs.entries()) {
        const label = escapeMermaidLabel(getLabel(exampleStore, stepUri));
        renderedProcessLabels.add(label);
    }
    for (const [stepUri, def] of subgraphDefs.entries()) {
        const label = escapeMermaidLabel(getLabel(exampleStore, stepUri));
        renderedProcessLabels.add(label);
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

generateMermaidFlowchart(
    ontologyFile,
    path.resolve(__dirname, '..', 'koekjes.mmd'),
    path.resolve(basePath, 'main/input/bedrijf/01-exploitant-deployment-platform-system-plan-observation.ttl'),
).catch(err => console.error('Error:', err));

const outputDir = path.resolve(imjvBasePath, 'output');
    const directories = fs.readdirSync(outputDir).filter(file => 
        fs.statSync(path.resolve(outputDir, file)).isDirectory()
    );

for (const dir of directories) {
    const dirPath = path.resolve(outputDir, dir);
        const ttlFiles = fs.readdirSync(dirPath)
            .filter(file => file.endsWith('.ttl'))
            .filter(file => file !== 'merged.ttl' && file !== 'test.ttl')
            .map(file => path.resolve(dirPath, file));
    
    if (ttlFiles.length > 0) {
        generateMermaidFlowchart(
            ontologyFile,
            path.resolve(__dirname, '..', `imjv_${dir}.mmd`),
            ...ttlFiles
        ).catch(err => console.error('Error:', err));
    }
}
