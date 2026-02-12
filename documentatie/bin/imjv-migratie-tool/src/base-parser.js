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

        // add a simple adms:identifier literal for the exploitant (keeps provenance accessible)
        this.turtle.triple(
            exploitantUri,
            this.turtle.qname('adms', 'identifier'),
            this.turtle.literal(exploitantId)
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

        // According to the RIE-IEPR ontology an exploitation location is an entity
        // that can be attributed to an agent (the exploitant). Use prov:wasAttributedTo.
        this.turtle.triple(
            locatieUri,
            this.turtle.qname('prov', 'wasAttributedTo'),
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
                // Create a proper blank node for the ADMS identifier instead of an inline bracket string
                // Many turtle builders expose a blankNode() helper; fall back to a generated blank node id
                const idNode = (typeof this.turtle.blankNode === 'function')
                    ? this.turtle.blankNode()
                    : `_:id_${this.sanitizeId(naam)}_${Math.abs(hashCode(value))}`;

                const scheme = this.turtle.literal('VMM');
                const notation = naam.replace('VMM_', '');

                this.turtle.triple(
                    parentUri,
                    this.turtle.qname('adms', 'identifier'),
                    idNode
                );

                this.turtle.triple(
                    idNode,
                    this.turtle.qname('rdf', 'value'),
                    this.turtle.literal(value)
                );

                this.turtle.triple(
                    idNode,
                    this.turtle.qname('adms', 'schemeAgency'),
                    scheme
                );

                this.turtle.triple(
                    idNode,
                    this.turtle.qname('skos', 'notation'),
                    this.turtle.literal(notation)
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

// small helper to produce a stable-ish hash for fallback blank node ids
function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0; // convert to 32bit int
    }
    return h;
}
