import N3 from 'n3';

const { namedNode } = N3.DataFactory;

const skos = {
    broader: namedNode('http://www.w3.org/2004/02/skos/core#broader'),
};

const riepr = {
    TransportProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#TransportProcedure'),
    EmissieProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#EmissieProcedure'),
    VerwerkingsProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#VerwerkingsProcedure'),
    VerbruiksProcedure: namedNode('https://data.riepr.omgeving.vlaanderen.be/ns/riepr#VerbruiksProcedure'),
};

export class ProcedureChecker {
    constructor(store) {
        this.store = store;
    }

    getProcedureType(procedureUri) {
        const quads = this.store.getQuads(namedNode(procedureUri), skos.broader, null);
        return quads.map(q => q.object.value);
    }

    isTransportProcedure(procedureUri) {
        return this.getProcedureType(procedureUri).some(typeUri => typeUri === riepr.TransportProcedure.value);
    }

    isUitstootProcedure(procedureUri) {
        return this.getProcedureType(procedureUri).some(typeUri => typeUri === riepr.EmissieProcedure.value);
    }

    isVerwerkingsProcedure(procedureUri) {
        return this.getProcedureType(procedureUri).some(typeUri => typeUri === riepr.VerwerkingsProcedure.value);
    }

    isVerbruiksProcedure(procedureUri) {
        return this.getProcedureType(procedureUri).some(typeUri => typeUri === riepr.VerbruiksProcedure.value);
    }

    isApparaatVerwerkingsProcedure(procedureUri) {
        return this.isVerwerkingsProcedure(procedureUri) &&
            procedureUri === 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#apparaatVerwerkingsProces';
    }

    getProcedureKind(procedureUri) {
        if (this.isTransportProcedure(procedureUri)) return 'transport';
        if (this.isUitstootProcedure(procedureUri)) return 'emission';
        if (this.isVerbruiksProcedure(procedureUri)) return 'consumption';
        if (this.isVerwerkingsProcedure(procedureUri)) return 'processing';
        return 'normal';
    }
}
