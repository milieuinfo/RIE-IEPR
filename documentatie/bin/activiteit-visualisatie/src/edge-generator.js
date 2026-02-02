import N3 from 'n3';

const { namedNode } = N3.DataFactory;

const rdf = {
    type: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
};

const pplan = {
    isPrecededBy: namedNode('http://purl.org/net/p-plan#isPrecededBy'),
};

const prov = {
    used: namedNode('http://www.w3.org/ns/prov#used'),
    wasInfluencedBy: namedNode('http://www.w3.org/ns/prov#wasInfluencedBy'),
    wasAttributedTo: namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
};

prov.wasDerivedFrom = namedNode('http://www.w3.org/ns/prov#wasDerivedFrom');

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
        const procedureQuads = this.store.getQuads(namedNode(stepUri), prov.wasDerivedFrom, null);
        return procedureQuads.length > 0 ? procedureQuads[0].object.value : null;
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
                    // Stappen (prov:Entity) worden beïnvloed door emissiepunten (prov:Entity)
                    const emittedPoints = this.store.getQuads(namedNode(stepUri), prov.wasInfluencedBy, null);
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

        // Handle emission and transport steps that are not in nodeMap
        const allSteps = this.store.getQuads(null, rdf.type, riepr.ActiviteitStap);
        
        for (const stepQuad of allSteps) {
            const stepUri = stepQuad.subject.value;
            
            // Skip if already in nodeMap (already processed)
            if (this.nodeMap.has(stepUri)) continue;
            
            const procedureUri = this.getProcedureUri(stepUri);
            
            if (procedureUri && this.procedureChecker.isUitstootProcedure(procedureUri)) {
                // This is an emission step - connect from the nearest
                // preceding step that is represented as a node in the graph.
                const rootStepUri = this.findRootStepInNodeMap(stepUri);
                if (!rootStepUri) continue;

                const rootNodeId = this.nodeMap.get(rootStepUri);
                if (!rootNodeId) continue;

                const emittedPoints = this.store.getQuads(namedNode(stepUri), prov.wasInfluencedBy, null);
                const label = this.getStepLabel(stepUri);

                for (const pointQuad of emittedPoints) {
                    const pointUri = pointQuad.object.value;
                    if (this.emissiePuntenIndex.has(pointUri)) {
                        const idx = this.emissiePuntenIndex.get(pointUri);
                        if (label) {
                            edges.push(`    ${rootNodeId} -.->|${label}| emissiepunt${idx}`);
                        } else {
                            edges.push(`    ${rootNodeId} -.-> emissiepunt${idx}`);
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
                            const nextPrecededByQuads = this.store.getQuads(namedNode(nextStepUri), pplan.isPrecededBy, namedNode(stepUri));
                            if (nextPrecededByQuads.length > 0) {
                                nextNodeId = this.nodeMap.get(nextStepUri);
                                break;
                            }
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
            }
        }

        return edges;
    }

    generateBronEdges(steps) {
        const edges = [];

        for (const stepQuad of steps) {
            const stepUri = stepQuad.subject.value;
            const procedureUri = this.getProcedureUri(stepUri);
            if (!procedureUri) continue;

            const label = this.getStepLabel(stepUri);
            // Bronnen (prov:Entity) beïnvloeden de stap (prov:Entity)
            const usedBronnen = this.store.getQuads(namedNode(stepUri), prov.wasInfluencedBy, null);

            for (const bronQuad of usedBronnen) {
                const bronUri = bronQuad.object.value;
                if (this.bronnenIndex.has(bronUri)) {
                    const idx = this.bronnenIndex.get(bronUri);
                    if (label) {
                        edges.push(`    bron${idx} -->|${label}| ${this.nodeMap.get(stepUri)}`);
                    } else {
                        edges.push(`    bron${idx} --> ${this.nodeMap.get(stepUri)}`);
                    }
                }
            }
        }

        return edges;
    }

    generateStofEdges(stofUris) {
        const edges = [];
        for (const stofUri of stofUris) {
            const label = this.getStepLabel(stofUri);
            for (const stepUri of this.nodeMap.keys()) {
                // Stoffen (prov:Entity) beïnvloeden de stap (prov:Entity)
                const usedStoffen = this.store.getQuads(namedNode(stepUri), prov.wasInfluencedBy, namedNode(stofUri));
                if (usedStoffen.length > 0) {
                    edges.push(`    stof --> ${this.nodeMap.get(stepUri)} : ${label}`);
                }
            }
        }
        return edges;
    }
}
