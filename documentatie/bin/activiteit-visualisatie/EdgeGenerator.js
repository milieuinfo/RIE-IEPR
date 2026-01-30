import N3 from 'n3';

const { namedNode } = N3.DataFactory;

const rdf = {
    type: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
};

const pplan = {
    isPrecededBy: namedNode('http://purl.org/net/p-plan#isPrecededBy'),
};

const ssn = {
    implements: namedNode('http://www.w3.org/ns/ssn/implements'),
};

const prov = {
    used: namedNode('http://www.w3.org/ns/prov#used'),
};

const rdfs = {
    label: namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    comment: namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
};

const riepr = {
    ActiviteitStap: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ActiviteitStap'),
    uitstootProces: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#uitstootProces'),
    transportProces: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#transportProces'),
};

export class EdgeGenerator {
    constructor(store, procedureChecker, nodeMap, emissiePuntenIndex, bronnenIndex) {
        this.store = store;
        this.procedureChecker = procedureChecker;
        this.nodeMap = nodeMap;
        this.emissiePuntenIndex = emissiePuntenIndex;
        this.bronnenIndex = bronnenIndex;
    }

    getStepLabel(stepUri) {
        const quads = this.store.getQuads(namedNode(stepUri), rdfs.label, null);
        return quads.length > 0 ? quads[0].object.value : null;
    }

    getProcedureUri(stepUri) {
        const implementsQuads = this.store.getQuads(namedNode(stepUri), ssn.implements, null);
        return implementsQuads.length > 0 ? implementsQuads[0].object.value : null;
    }

    findPrecedingStep(stepUri) {
        const precededByQuads = this.store.getQuads(namedNode(stepUri), pplan.isPrecededBy, null);
        return precededByQuads.length > 0 ? precededByQuads[0].object.value : null;
    }

    // Helper: Find the root step in nodeMap by following isPrecededBy chain
    findRootStepInNodeMap(stepUri, visited = new Set()) {
        if (visited.has(stepUri)) return null;
        visited.add(stepUri);

        if (this.nodeMap.has(stepUri)) {
            return stepUri;
        }

        const precededByQuads = this.store.getQuads(namedNode(stepUri), pplan.isPrecededBy, null);
        for (const precededQuad of precededByQuads) {
            const rootUri = this.findRootStepInNodeMap(precededQuad.object.value, visited);
            if (rootUri) return rootUri;
        }
        return null;
    }

    generateEdges(steps) {
        const edges = [];

        // Generate edges for all steps in nodeMap
        for (const stepUri of this.nodeMap.keys()) {
            const precededByQuads = this.store.getQuads(namedNode(stepUri), pplan.isPrecededBy, null);
            
            for (const precededQuad of precededByQuads) {
                const previousStepUri = precededQuad.object.value;
                const previousNodeId = this.nodeMap.get(previousStepUri);
                
                if (!previousNodeId) continue;

                const currentNodeId = this.nodeMap.get(stepUri);
                const procedureUri = this.getProcedureUri(stepUri);
                const label = this.getStepLabel(stepUri);

                if (!procedureUri) {
                    // Regular step - normal arrow
                    if (currentNodeId) {
                        edges.push(`    ${previousNodeId} --> ${currentNodeId}`);
                    }
                } else if (this.procedureChecker.isTransportProcedure(procedureUri)) {
                    // Transport procedure - bold arrow to next node
                    // Find the step that this step precedes
                    let nextNodeId = null;
                    for (const nextStepUri of this.nodeMap.keys()) {
                        if (nextStepUri === stepUri) continue;
                        const nextPrecededByQuads = this.store.getQuads(namedNode(nextStepUri), pplan.isPrecededBy, namedNode(stepUri));
                        if (nextPrecededByQuads.length > 0) {
                            nextNodeId = this.nodeMap.get(nextStepUri);
                            break;
                        }
                    }
                    
                    if (nextNodeId) {
                        if (label) {
                            edges.push(`    ${previousNodeId} ==>|${label}| ${nextNodeId}`);
                        } else {
                            edges.push(`    ${previousNodeId} ==> ${nextNodeId}`);
                        }
                    }
                } else if (this.procedureChecker.isUitstootProcedure(procedureUri)) {
                    // Emission procedure - dotted arrows to emission points
                    const emittedPoints = this.store.getQuads(namedNode(stepUri), prov.used, null);
                    for (const pointQuad of emittedPoints) {
                        const pointUri = pointQuad.object.value;
                        if (this.emissiePuntenIndex.has(pointUri)) {
                            const idx = this.emissiePuntenIndex.get(pointUri);
                            if (label) {
                                edges.push(`    ${previousNodeId} -.->|${label}| emissiepunt${idx}`);
                            } else {
                                edges.push(`    ${previousNodeId} -.-> emissiepunt${idx}`);
                            }
                        }
                    }
                } else {
                    // Regular step without procedure
                    if (currentNodeId) {
                        edges.push(`    ${previousNodeId} --> ${currentNodeId}`);
                    }
                }
            }
        }

        // Handle emission steps that are not in nodeMap but implement uitstootProces
        // These steps use emission points and we need to create edges from the main activity step
        const pplan_isStepOfPlan = namedNode('http://purl.org/net/p-plan#isStepOfPlan');
        const allSteps = this.store.getQuads(null, rdf.type, riepr.ActiviteitStap);
        
        for (const stepQuad of allSteps) {
            const stepUri = stepQuad.subject.value;
            
            // Skip if already in nodeMap (already processed)
            if (this.nodeMap.has(stepUri)) continue;
            
            const implementsQuads = this.store.getQuads(namedNode(stepUri), ssn.implements, null);
            const procedureUri = implementsQuads.length > 0 ? implementsQuads[0].object.value : null;
            
            if (procedureUri && this.procedureChecker.isUitstootProcedure(procedureUri)) {
                // This is an emission step - find which activity it belongs to
                const activityQuads = this.store.getQuads(namedNode(stepUri), pplan_isStepOfPlan, null);
                
                if (activityQuads.length > 0) {
                    const activityUri = activityQuads[0].object.value;
                    
                    // Find the main activity step for this activity (the one in nodeMap)
                    let mainActivityStepUri = null;
                    for (const candidateStepUri of this.nodeMap.keys()) {
                        const candidateActivityQuads = this.store.getQuads(namedNode(candidateStepUri), pplan_isStepOfPlan, namedNode(activityUri));
                        if (candidateActivityQuads.length > 0) {
                            mainActivityStepUri = candidateStepUri;
                            break;
                        }
                    }
                    
                    if (mainActivityStepUri) {
                        const mainActivityStepNodeId = this.nodeMap.get(mainActivityStepUri);
                        // Create edges to emission points
                        const emittedPoints = this.store.getQuads(namedNode(stepUri), prov.used, null);
                        const label = this.getStepLabel(stepUri);
                        
                        for (const pointQuad of emittedPoints) {
                            const pointUri = pointQuad.object.value;
                            if (this.emissiePuntenIndex.has(pointUri)) {
                                const idx = this.emissiePuntenIndex.get(pointUri);
                                if (label) {
                                    edges.push(`    ${mainActivityStepNodeId} -.->|${label}| emissiepunt${idx}`);
                                } else {
                                    edges.push(`    ${mainActivityStepNodeId} -.-> emissiepunt${idx}`);
                                }
                            }
                        }
                    }
                }
            } else if (procedureUri && this.procedureChecker.isTransportProcedure(procedureUri)) {
                // This is a transport step - find preceding and following steps
                const precededByQuads = this.store.getQuads(namedNode(stepUri), pplan.isPrecededBy, null);
                
                for (const precededQuad of precededByQuads) {
                    const precedingStepUri = precededQuad.object.value;
                    const precedingNodeId = this.nodeMap.get(precedingStepUri);
                    
                    if (precedingNodeId) {
                        // Find the step that this transport step precedes
                        let nextNodeId = null;
                        for (const nextStepUri of this.nodeMap.keys()) {
                            if (nextStepUri === precedingStepUri) continue;
                            const nextPrecededByQuads = this.store.getQuads(namedNode(nextStepUri), pplan.isPrecededBy, null);
                            for (const nextPrecQuad of nextPrecededByQuads) {
                                if (nextPrecQuad.object.value === stepUri) {
                                    nextNodeId = this.nodeMap.get(nextStepUri);
                                    break;
                                }
                            }
                            if (nextNodeId) break;
                        }
                        
                        if (nextNodeId) {
                            const label = this.getStepLabel(stepUri);
                            if (label) {
                                edges.push(`    ${precedingNodeId} ==>|${label}| ${nextNodeId}`);
                            } else {
                                edges.push(`    ${precedingNodeId} ==> ${nextNodeId}`);
                            }
                        }
                    }
                }
            } else if (procedureUri && this.procedureChecker.isVerwerkingsProcedure(procedureUri)) {
                // This is a processing step (like zuivering) - add as normal edge
                const precededByQuads = this.store.getQuads(namedNode(stepUri), pplan.isPrecededBy, null);
                
                for (const precededQuad of precededByQuads) {
                    const precedingStepUri = precededQuad.object.value;
                    const precedingNodeId = this.nodeMap.get(precedingStepUri);
                    const processingNodeId = this.nodeMap.get(stepUri);
                    
                    if (precedingNodeId && processingNodeId) {
                        edges.push(`    ${precedingNodeId} --> ${processingNodeId}`);
                    }
                }
            }
        }

        return edges;
    }

    generateBronEdges(steps) {
        const edges = [];

        // Generate edges from bronnen to consumption steps
        for (const [bronUri, bronIdx] of this.bronnenIndex) {
            const consumptionSteps = this.store.getQuads(null, prov.used, namedNode(bronUri));
            
            for (const consumptionQuad of consumptionSteps) {
                const stepUri = consumptionQuad.subject.value;
                const procedureUri = this.getProcedureUri(stepUri);
                const label = this.getStepLabel(stepUri);

                if (procedureUri && this.procedureChecker.isVerbruiksProcedure(procedureUri)) {
                    const precedingStepUri = this.findPrecedingStep(stepUri);
                    if (precedingStepUri) {
                        const precedingNodeId = this.nodeMap.get(precedingStepUri);
                        if (precedingNodeId) {
                            edges.push(`    bron${bronIdx} -->|${label}| ${precedingNodeId}`);
                        }
                    }
                } else {
                    const nodeId = this.nodeMap.get(stepUri);
                    if (nodeId) {
                        edges.push(`    bron${bronIdx} -->|${label}| ${nodeId}`);
                    }
                }
            }
        }

        return edges;
    }

    generateStofEdges(stofUris) {
        const edges = [];
        const rdf = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        const allSteps = this.store.getQuads(null, rdf, namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ActiviteitStap'));
        
        for (const stepQuad of allSteps) {
            const stepUri = stepQuad.subject.value;
            const procedureUri = this.getProcedureUri(stepUri);

            if (procedureUri && this.procedureChecker.isVerbruiksProcedure(procedureUri)) {
                const usedStoffen = this.store.getQuads(namedNode(stepUri), prov.used, null);
                
                for (const stofQuad of usedStoffen) {
                    const stofUri = stofQuad.object.value;
                    if (stofUris.has(stofUri)) {
                        const stofLabel = this.getStepLabel(stofUri);
                        const stepLabel = this.getStepLabel(stepUri);
                        const precedingStepUri = this.findPrecedingStep(stepUri);
                        
                        if (precedingStepUri) {
                            const precedingNodeId = this.nodeMap.get(precedingStepUri);
                            if (precedingNodeId) {
                                edges.push(`    stof["${stofLabel}"] -->|${stepLabel}| ${precedingNodeId}`);
                            }
                        }
                    }
                }
            }
        }

        return edges;
    }
}
