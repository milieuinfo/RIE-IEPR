import N3 from 'n3';

const { namedNode } = N3.DataFactory;

const rdf = {
    type: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
};

const pplan = {
    isPrecededBy: namedNode('http://purl.org/net/p-plan#isPrecededBy'),
    hasInputVar: namedNode('http://purl.org/net/p-plan#hasInputVar'),
    hasOutputVar: namedNode('http://purl.org/net/p-plan#hasOutputVar'),
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
    Proces: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces'),
    uitstootProces: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#uitstootProces'),
    transportProces: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#transportProces'),
};

export class EdgeGenerator {
    constructor(store, procedureChecker, nodeMap, emissiePuntenIndex, stofIndex, inputStofUris, outputStofUris) {
        this.store = store;
        this.procedureChecker = procedureChecker;
        this.nodeMap = nodeMap;
        this.emissiePuntenIndex = emissiePuntenIndex;
        this.stofIndex = stofIndex;
        this.inputStofUris = inputStofUris || new Set();
        this.outputStofUris = outputStofUris || new Set();
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

    // Helper: Find the visible predecessor, skipping hidden procedures
    findVisiblePredecessor(stepUri, visited = new Set()) {
        if (visited.has(stepUri)) return null;
        visited.add(stepUri);

        const precededByQuads = this.store.getQuads(namedNode(stepUri), pplan.isPrecededBy, null);
        if (precededByQuads.length === 0) return null;

        const predecessorUri = precededByQuads[0].object.value;
        if (this.nodeMap.has(predecessorUri)) {
            return predecessorUri;
        }

        return this.findVisiblePredecessor(predecessorUri, visited);
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
        const processedEdges = new Set(); // Track edges to avoid duplicates

        // Generate edges for all steps in nodeMap
        for (const stepUri of this.nodeMap.keys()) {
            const currentNodeId = this.nodeMap.get(stepUri);
            const procedureUri = this.getProcedureUri(stepUri);
            const label = this.getStepLabel(stepUri);

            if (!procedureUri) {
                // Regular step - normal arrow
                const visiblePredecessorUri = this.findVisiblePredecessor(stepUri);
                if (visiblePredecessorUri) {
                    const predecessorNodeId = this.nodeMap.get(visiblePredecessorUri);
                    if (predecessorNodeId && predecessorNodeId !== currentNodeId) {
                        const edgeKey = `${predecessorNodeId}-->${currentNodeId}`;
                        if (!processedEdges.has(edgeKey)) {
                            edges.push(`    ${predecessorNodeId} --> ${currentNodeId}`);
                            processedEdges.add(edgeKey);
                        }
                    }
                }
            } else if (this.procedureChecker.isTransportProcedure(procedureUri)) {
                // Transport procedure - skip, don't create edges
                // (Transport steps should not be in nodeMap, so this should never happen)
                continue;
            } else {
                // Regular step without procedure (or other procedure types)
                const visiblePredecessorUri = this.findVisiblePredecessor(stepUri);
                if (visiblePredecessorUri) {
                    const predecessorNodeId = this.nodeMap.get(visiblePredecessorUri);
                    if (predecessorNodeId && predecessorNodeId !== currentNodeId) {
                        const edgeKey = `${predecessorNodeId}-->${currentNodeId}`;
                        if (!processedEdges.has(edgeKey)) {
                            edges.push(`    ${predecessorNodeId} --> ${currentNodeId}`);
                            processedEdges.add(edgeKey);
                        }
                    }
                }
            }
        }

        // Process ALL steps (including hidden procedures) to generate emission edges
        const allSteps = this.store.getQuads(null, rdf.type, namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces'));
        for (const stepQuad of allSteps) {
            const stepUri = stepQuad.subject.value;
            const procedureUri = this.getProcedureUri(stepUri);
            const label = this.getStepLabel(stepUri);

            if (procedureUri && this.procedureChecker.isUitstootProcedure(procedureUri)) {
                // Emission procedure - dotted arrows to emission points
                // Find the visible predecessor to start the edge from
                const visiblePredecessorUri = this.findVisiblePredecessor(stepUri);
                const sourceNodeId = visiblePredecessorUri ? this.nodeMap.get(visiblePredecessorUri) : null;
                
                if (sourceNodeId) {
                    const emittedPoints = this.store.getQuads(namedNode(stepUri), prov.wasInfluencedBy, null);
                    for (const pointQuad of emittedPoints) {
                        const pointUri = pointQuad.object.value;
                        if (this.emissiePuntenIndex.has(pointUri)) {
                            const idx = this.emissiePuntenIndex.get(pointUri);
                            if (label) {
                                const edgeKey = `${sourceNodeId}-.->emissiepunt${idx}:${label}`;
                                if (!processedEdges.has(edgeKey)) {
                                    edges.push(`    ${sourceNodeId} -.->|${label}| emissiepunt${idx}`);
                                    processedEdges.add(edgeKey);
                                }
                            } else {
                                const edgeKey = `${sourceNodeId}-.->emissiepunt${idx}`;
                                if (!processedEdges.has(edgeKey)) {
                                    edges.push(`    ${sourceNodeId} -.-> emissiepunt${idx}`);
                                    processedEdges.add(edgeKey);
                                }
                            }
                        }
                    }
                }
            }
        }

        return edges;
    }

    generateStofEdges(steps) {
        const edges = [];
        const processedEdges = new Set();

        for (const stepQuad of steps) {
            const stepUri = stepQuad.subject.value;

            // Voor zichtbare processen: gebruik het proces zelf
            // Voor hidden processen: gebruik visible predecessor voor input, visible successor voor output
            const isVisible = this.nodeMap.has(stepUri);
            
            if (isVisible) {
                const stepNode = this.nodeMap.get(stepUri);
                
                // Input vars: stof → proces (alleen als stof zichtbaar is)
                const inputVars = this.store.getQuads(namedNode(stepUri), pplan.hasInputVar, null);
                for (const inputQuad of inputVars) {
                    const varUri = inputQuad.object.value;
                    if (this.stofIndex.has(varUri)) {
                        // Stof is zichtbaar - toon als node
                        const idx = this.stofIndex.get(varUri);
                        const edgeKey = `stof${idx}-->${stepNode}`;
                        if (!processedEdges.has(edgeKey)) {
                            edges.push(`    stof${idx} --> ${stepNode}`);
                            processedEdges.add(edgeKey);
                        }
                    }
                }

                // Output vars: proces → stof (alleen als stof zichtbaar is)
                const outputVars = this.store.getQuads(namedNode(stepUri), pplan.hasOutputVar, null);
                for (const outputQuad of outputVars) {
                    const varUri = outputQuad.object.value;
                    if (this.stofIndex.has(varUri)) {
                        // Stof is zichtbaar - toon als node
                        const idx = this.stofIndex.get(varUri);
                        const edgeKey = `${stepNode}-->stof${idx}`;
                        if (!processedEdges.has(edgeKey)) {
                            edges.push(`    ${stepNode} --> stof${idx}`);
                            processedEdges.add(edgeKey);
                        }
                    }
                }
            } else {
                // Hidden proces: verbind stoffen met zichtbare neighbors
                const procedureUri = this.getProcedureUri(stepUri);
                
                // Voor hidden processen: vind zichtbare predecessor voor output, successor voor input
                const visiblePred = this.findVisiblePredecessor(stepUri);
                const visibleSucc = this.findVisibleSuccessor(stepUri);
                
                // Output vars van hidden proces → verbind met visible predecessor (als die bestaat)
                if (visiblePred) {
                    const predNode = this.nodeMap.get(visiblePred);
                    const outputVars = this.store.getQuads(namedNode(stepUri), pplan.hasOutputVar, null);
                    for (const outputQuad of outputVars) {
                        const varUri = outputQuad.object.value;
                        if (this.stofIndex.has(varUri)) {
                            const idx = this.stofIndex.get(varUri);
                            const edgeKey = `${predNode}-->stof${idx}`;
                            if (!processedEdges.has(edgeKey)) {
                                edges.push(`    ${predNode} --> stof${idx}`);
                                processedEdges.add(edgeKey);
                            }
                        }
                    }
                }
                
                // Input vars van hidden proces → verbind met visible successor (als die bestaat)
                if (visibleSucc) {
                    const succNode = this.nodeMap.get(visibleSucc);
                    const inputVars = this.store.getQuads(namedNode(stepUri), pplan.hasInputVar, null);
                    for (const inputQuad of inputVars) {
                        const varUri = inputQuad.object.value;
                        if (this.stofIndex.has(varUri)) {
                            const idx = this.stofIndex.get(varUri);
                            const edgeKey = `stof${idx}-->${succNode}`;
                            if (!processedEdges.has(edgeKey)) {
                                edges.push(`    stof${idx} --> ${succNode}`);
                                processedEdges.add(edgeKey);
                            }
                        }
                    }
                }
            }
        }

        return edges;
    }

    // Helper: Find visible successor by searching steps that precede from current step
    findVisibleSuccessor(stepUri, visited = new Set()) {
        if (visited.has(stepUri)) return null;
        visited.add(stepUri);

        // Find steps that have this step as predecessor
        const successorQuads = this.store.getQuads(null, pplan.isPrecededBy, namedNode(stepUri));
        for (const succQuad of successorQuads) {
            const successorUri = succQuad.subject.value;
            
            // Check if it's a visible step
            if (this.nodeMap.has(successorUri)) {
                return successorUri;
            }
            
            // Recursively search through hidden successors
            const visibleSucc = this.findVisibleSuccessor(successorUri, visited);
            if (visibleSucc) return visibleSucc;
        }
        
        return null;
    }
}
