export class BaseParser {
    constructor(turtle, cbbNumber, reportYear) {
        this.turtle = turtle;
        this.cbbNumber = cbbNumber;
        this.reportYear = reportYear;
    }

    createExploitant() {
        const exploitantId = this.cbbNumber;
        const exploitantUri = this.turtle.qname('exploitant', exploitantId);

        this.turtle.triple(
            exploitantUri,
            this.turtle.qname('rdf', 'type'),
            this.turtle.qname('riepr', 'Exploitant')
        );

        this.turtle.triple(
            exploitantUri,
            this.turtle.qname('rdfs', 'label'),
            this.turtle.literal(`Exploitant ${exploitantId}`, null, 'nl')
        );

        this.turtle.triple(
            exploitantUri,
            this.turtle.qname('owl', 'sameAs'),
            this.turtle.qname('vkbo', exploitantId)
        );
    }

    createExploitatieLocatie(type, label) {
        const locatieId = this.cbbNumber;
        const locatieUri = this.turtle.qname('exploitatielocatie', locatieId);
        const exploitantUri = this.turtle.qname('exploitant', this.cbbNumber);

        this.turtle.triple(
            locatieUri,
            this.turtle.qname('rdf', 'type'),
            this.turtle.qname('riepr', 'ExploitatieLocatie')
        );

        this.turtle.triple(
            locatieUri,
            this.turtle.qname('rdfs', 'label'),
            this.turtle.literal(label, null, 'nl')
        );

        this.turtle.triple(
            locatieUri,
            this.turtle.qname('prov', 'atLocation'),
            exploitantUri
        );
    }

    parseRefertes(refertesArray, parentUri) {
        if (!Array.isArray(refertesArray)) {
            refertesArray = [refertesArray];
        }

        refertesArray.forEach((ref) => {
            const naam = ref.$.naam;
            const value = ref._;

            if (value) {
                const scheme = this.turtle.literal('VMM');
                const notation = naam.replace('VMM_', '');
                this.turtle.triple(
                    parentUri,
                    this.turtle.qname('adms', 'identifier'),
                    `[ ${this.turtle.qname('rdf', 'value')} ${this.turtle.literal(value)} ; ${this.turtle.qname('adms', 'schemeAgency')} ${scheme} ; ${this.turtle.qname('skos', 'notation')} ${this.turtle.literal(notation)} ]`
                );
            }
        });
    }

    sanitizeId(name) {
        return name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[()]/g, '')
            .replace(/[^\w-]/g, '');
    }
}
