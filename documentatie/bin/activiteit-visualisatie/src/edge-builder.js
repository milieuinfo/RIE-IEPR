import N3 from 'n3';

const { namedNode } = N3.DataFactory;

const prov = {
    used: namedNode('http://www.w3.org/ns/prov#used'),
};

const rdfs = {
    label: namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
};

export class EdgeBuilder {
    constructor(store, procedureChecker) {
        this.store = store;
        this.procedureChecker = procedureChecker;
        this.mermaidLines = [];
    }

    getLabel(uri) {
        const quads = this.store.getQuads(namedNode(uri), rdfs.label, null);
        return quads.length > 0 ? quads[0].object.value : uri.split(/[/#]/).pop();
    }

    // Create edges between sequential activity steps (normal flow)
    addTransitionEdge(fromNodeId, toNodeId) {
        this.mermaidLines.push(`    ${fromNodeId} --> ${toNodeId}`);
    }

    // Create edges for transport procedures (bold arrows)
    addTransportEdge(fromNodeId, toNodeId, label) {
        this.mermaidLines.push(`    ${fromNodeId} ==>|${label}| ${toNodeId}`);
    }

    // Create edges for emission procedures (dotted arrows to emission points)
    addEmissionEdge(fromNodeId, emissionPointId, label) {
        this.mermaidLines.push(`    ${fromNodeId} -.->|${label}| ${emissionPointId}`);
    }

    // Create edges from stoffen (input vars) to steps
    addStofEdge(stofId, toNodeId, label) {
        this.mermaidLines.push(`    ${stofId} -->|${label}| ${toNodeId}`);
    }

    getOutput() {
        return this.mermaidLines.join('\n') + (this.mermaidLines.length > 0 ? '\n' : '');
    }
}
