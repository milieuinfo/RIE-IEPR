import { TurtleBuilder } from './turtle-builder.js';
import { BaseParser } from './base-parser.js';
import { LAMBERT72_CRS } from './constants.js';

export class GrondwaterParser extends BaseParser {
    constructor(xmlData) {
        super(new TurtleBuilder(), null, null);
        this.data = xmlData;
        this.installatieById = new Map();
    }

    async parse() {
        const grondwaterData = this.data['grondwater:VasteGegevensAangifteGrondwaterwinning']?.[0];
        if (!grondwaterData) {
            console.warn('No grondwater data found in XML');
            return '';
        }

        this.cbbNumber = grondwaterData.CBBExploitatieNummer?.[0];
        this.reportYear = grondwaterData.RapporteringsJaar?.[0];

        if (!this.cbbNumber) {
            console.warn('No CBBExploitatieNummer found in grondwater XML');
            return;
        }

        // Create exploitant (operator)
        this.createExploitant();

        // Create exploitatielocatie (operation location)
        this.createExploitatieLocatie(null, `Exploitatie locatie ${this.cbbNumber}`);

        // Parse grondwaterputten (groundwater wells)
        if (this.data.Grondwaterputten?.[0]?.Grondwaterput) {
            this.parseGrondwaterputten(this.data.Grondwaterputten[0].Grondwaterput);
        }

        return this.turtle.build();
    }

    parseGrondwaterputten(puttenArray) {
        if (!Array.isArray(puttenArray)) {
            puttenArray = [puttenArray];
        }

        puttenArray.forEach((put, index) => {
            this.parseGrondwaterput(put, index + 1);
        });
    }

    parseGrondwaterput(put, index) {
        const putId = put.$.GrondwaterputID;
        const putNumber = put.Putnummer?.[0] || `Put ${index}`;
        const putType = put.Type?.[0] || 'GRONDWATERWINNING';
        const depth = put.Diepte?.[0];
        const coordX = put.LambertcoordinaatX?.[0];
        const coordY = put.LambertcoordinaatY?.[0];

        // Create emissiepunt (emission point) for groundwater
        const emissiepuntUri = this.turtle.qname('emissiepunt', `${this.cbbNumber}_${putId}`);

        this.turtle.triple(
            emissiepuntUri,
            this.turtle.qname('rdf', 'type'),
            this.turtle.qname('riepr', 'Grondwaterput')
        );

        this.turtle.triple(
            emissiepuntUri,
            this.turtle.qname('rdfs', 'label'),
            this.turtle.literal(`${putNumber} (${putType})`, null, 'nl')
        );

        this.turtle.triple(
            emissiepuntUri,
            this.turtle.qname('adms', 'status'),
            this.turtle.qname('riepr', 'Actief')
        );

        // Add coordinates with Lambert72 CRS
        if (coordX && coordY) {
            const wktWithCRS = `<http://www.opengis.net/gml/srs/epsg.xml#${LAMBERT72_CRS}> POINT(${coordX} ${coordY})`;
            
            this.turtle.triple(
                emissiepuntUri,
                this.turtle.qname('ogc', 'hasGeometry'),
                `[ ${this.turtle.qname('ogc', 'asWKT')} "${wktWithCRS}"^^${this.turtle.qname('ogc', 'WKTLiteral')} ]`
            );
        }

        // Add depth information with unit
        if (depth) {
            this.turtle.triple(
                emissiepuntUri,
                this.turtle.qname('dbo', 'depth'),
                `[ ${this.turtle.qname('rdf', 'type')} ${this.turtle.qname('qudt', 'QuantityValue')} ; ${this.turtle.qname('qudt', 'numericValue')} "${depth}"^^${this.turtle.qname('xsd', 'decimal')} ; ${this.turtle.qname('qudt', 'unit')} ${this.turtle.qname('unit', 'M')} ]`
            );
        }

        // Parse peilfilters (measurement filters) if present
        if (put.Peilfilters?.[0]?.Peilfilter) {
            this.parsePeilfilters(put.Peilfilters[0].Peilfilter, emissiepuntUri, putId);
        }

        // Parse pompfilter (pump filter) if present
        if (put.Pompfilter) {
            this.parsePompfilter(put.Pompfilter, emissiepuntUri, putId);
        }

        // Parse refertes (references) as external identifiers
        if (put.Refertes?.[0]?.Referte) {
            const installatieId = this.getInstallatieId(put.Refertes[0].Referte);
            if (installatieId) {
                const installatieUri = this.ensureInstallatie(installatieId);
                this.turtle.triple(
                    installatieUri,
                    this.turtle.qname('rdfs', 'member'),
                    emissiepuntUri
                );
            }
            this.parseRefertes(put.Refertes[0].Referte, emissiepuntUri);
        }
    }

    getInstallatieId(refertesArray) {
        if (!Array.isArray(refertesArray)) {
            refertesArray = [refertesArray];
        }

        for (const ref of refertesArray) {
            if (ref?.$?.naam === 'VMM_installatieID' && ref._) {
                return ref._;
            }
        }

        return null;
    }

    ensureInstallatie(installatieId) {
        if (this.installatieById.has(installatieId)) {
            return this.installatieById.get(installatieId);
        }

        const installatieUri = this.turtle.qname('installatie', `${this.cbbNumber}_${installatieId}`);

        this.turtle.triple(
            installatieUri,
            this.turtle.qname('rdf', 'type'),
            this.turtle.qname('riepr', 'Installatie')
        );

        this.turtle.triple(
            installatieUri,
            this.turtle.qname('rdfs', 'label'),
            this.turtle.literal(`Installatie ${installatieId}`, null, 'nl')
        );

        this.turtle.triple(
            installatieUri,
            this.turtle.qname('prov', 'atLocation'),
            this.turtle.qname('exploitatielocatie', this.cbbNumber)
        );

        this.turtle.triple(
            installatieUri,
            this.turtle.qname('adms', 'status'),
            this.turtle.qname('riepr', 'Actief')
        );

        if (this.reportYear) {
            this.turtle.triple(
                installatieUri,
                this.turtle.qname('dct', 'valid'),
                this.turtle.literal(`${this.reportYear}-01-01/`)
            );
        }

        this.installatieById.set(installatieId, installatieUri);
        return installatieUri;
    }

    parsePeilfilters(filtersArray, parentUri, putId) {
        if (!Array.isArray(filtersArray)) {
            filtersArray = [filtersArray];
        }

        filtersArray.forEach((filter) => {
            const filterId = filter.$.peilfilterID;
            const filterNumber = filter.Filternummer?.[0];
            const waterLayer = filter.WatervoerendeLaag?.[0];

            let filterDesc = `Filter ${filterNumber}`;
            if (waterLayer) {
                filterDesc += `, watervoerendeLaag: ${waterLayer}`;
            }

            this.turtle.triple(
                parentUri,
                this.turtle.qname('rdfs', 'comment'),
                this.turtle.literal(filterDesc, null, 'nl')
            );
        });
    }

    parsePompfilter(pompfilter, parentUri, putId) {
        const filterId = pompfilter[0].$.pompfilterID;
        const filterNumber = pompfilter[0].Filternummer?.[0];
        const pumpCapacity = pompfilter[0].Pompcapaciteit?.[0];

        let filterDesc = `Pompfilter ${filterNumber}`;
        if (pumpCapacity) {
            filterDesc += `, pompcapaciteit: ${pumpCapacity}`;
        }

        this.turtle.triple(
            parentUri,
            this.turtle.qname('rdfs', 'comment'),
            this.turtle.literal(filterDesc, null, 'nl')
        );
    }
}
