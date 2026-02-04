import { TurtleBuilder } from './turtle-builder.js';
import { BaseParser } from './base-parser.js';
import { LAMBERT72_CRS } from './constants.js';

export class LuchtParser extends BaseParser {
    constructor(xmlData) {
        super(new TurtleBuilder(), null, null);
        this.data = xmlData;
        this.activityRootSteps = new Map();
        this.activities = new Set();
        this.apparaatByActiviteitId = new Map();
        this.installatieByKey = new Map();
        this.outputVarByStepUri = new Map();
    }

    getLocalIdFromQName(qname) {
        if (!qname) return '';
        if (qname.includes(':')) return qname.split(':').pop();
        const lastSlash = qname.lastIndexOf('/');
        return lastSlash >= 0 ? qname.substring(lastSlash + 1) : qname;
    }

    ensureOutputVarForStep(stepUri, label = 'Onbekende stroom') {
        if (this.outputVarByStepUri.has(stepUri)) {
            return this.outputVarByStepUri.get(stepUri);
        }

        const stepId = this.getLocalIdFromQName(stepUri);
        const varId = `var_${stepId}`;
        const varUri = this.turtle.qname('var', varId);

        this.turtle.triple(
            varUri,
            this.turtle.qname('rdf', 'type'),
            this.turtle.qname('riepr', 'Variable')
        );
        this.turtle.triple(
            varUri,
            this.turtle.qname('rdfs', 'label'),
            this.turtle.literal(label, null, 'nl')
        );
        this.turtle.triple(
            stepUri,
            this.turtle.qname('pplan', 'hasOutputVar'),
            varUri
        );

        this.outputVarByStepUri.set(stepUri, varUri);
        return varUri;
    }

    async parse() {
        const luchtData = this.data['lucht:VasteGegevensAangifteLucht']?.[0];
        if (!luchtData) {
            console.warn('No lucht data found in XML');
            return '';
        }

        this.cbbNumber = luchtData.CBBExploitatieNummer?.[0];
        this.reportYear = luchtData.RapporteringsJaar?.[0];

        if (!this.cbbNumber) {
            console.warn('No CBBExploitatieNummer found in lucht XML');
            return '';
        }

        // Create exploitant and exploitatielocatie
        this.createExploitant();
        this.createExploitatieLocatie(null, `Exploitatie locatie ${this.cbbNumber}`);

        // Parse processen (Installatie/ProductieEenheid/EnergieActiviteit)
        if (luchtData.Activiteiten?.[0]?.Installatie) {
            this.parseInstallaties(luchtData.Activiteiten[0].Installatie);
        }

        // Parse stoffen
        if (luchtData.Stoffen?.[0]?.Stof) {
            this.parseStoffen(luchtData.Stoffen[0].Stof);
        }

        // Parse emissiepunten
        if (luchtData.EmissiePunten?.[0]?.Emissiepunt) {
            this.parseEmissiepunten(luchtData.EmissiePunten[0].Emissiepunt);
        }

        // Parse meetmethoden
        if (luchtData.MeetMethoden?.[0]?.Meetmethode) {
            this.parseMeetmethoden(luchtData.MeetMethoden[0].Meetmethode);
        }

        // Parse Milieudruk (fuel, feedstock, end products consumption)
        const milieudrukNode = luchtData.Milieudruk?.[0]
            || luchtData['lucht:Milieudruk']?.[0]
            || luchtData['Milieudruk']?.[0];
        const productieEenheden = milieudrukNode?.ProductieEenheid
            || milieudrukNode?.['lucht:ProductieEenheid'];

        if (productieEenheden) {
            this.parseMilieudruk(productieEenheden);
        }

        return this.turtle.build();
    }

    parseInstallaties(installatiesArray) {
        if (!Array.isArray(installatiesArray)) installatiesArray = [installatiesArray];
        installatiesArray.forEach((inst, index) => {
            let parentActiviteitId = null;
            let parentActiviteitNaam = null;
            
            // ProductieEenheid or EnergieActiviteit
            if (inst.ProductieEenheid) {
                parentActiviteitId = inst.ProductieEenheid[0].$.activiteitID;
                parentActiviteitNaam = inst.ProductieEenheid[0].Naam?.[0] || null;
            } else if (inst.EnergieActiviteit) {
                parentActiviteitId = inst.EnergieActiviteit[0].$.activiteitID;
                parentActiviteitNaam = inst.EnergieActiviteit[0].Naam?.[0] || null;
            }

            const installatieKey = parentActiviteitId || `idx_${index + 1}`;
            const installatieLabel = parentActiviteitNaam || `Installatie ${index + 1}`;
            const installatieUri = this.ensureInstallatie(installatieKey, installatieLabel);

            // Now parse the ProductieEenheid/EnergieActiviteit with the installatieUri
            if (inst.ProductieEenheid) {
                this.parseProductieEenheid(inst.ProductieEenheid[0], installatieUri);
            } else if (inst.EnergieActiviteit) {
                this.parseEnergieActiviteit(inst.EnergieActiviteit[0], installatieUri);
            }

            if (parentActiviteitId) {
                const activiteitUri = this.turtle.qname('proces', `${this.cbbNumber}_${parentActiviteitId}`);
                this.turtle.triple(
                    installatieUri,
                    this.turtle.qname('rdfs', 'member'),
                    activiteitUri
                );
            }

            // Apparaten (optioneel)
            if (inst.Apparaten?.[0]?.Apparaat) {
                inst.Apparaten[0].Apparaat.forEach(app => {
                    if (app.ProductieEenheid) {
                        this.parseApparaatProductieEenheid(app.ProductieEenheid[0], parentActiviteitId, installatieUri);
                    }
                });
            }
        });
    }

    ensureInstallatie(installatieKey, label) {
        if (this.installatieByKey.has(installatieKey)) {
            return this.installatieByKey.get(installatieKey);
        }

        const installatieUri = this.turtle.qname('installatie', `${this.cbbNumber}_${installatieKey}`);

        this.turtle.triple(
            installatieUri,
            this.turtle.qname('rdf', 'type'),
            this.turtle.qname('riepr', 'Installatie')
        );

        this.turtle.triple(
            installatieUri,
            this.turtle.qname('rdfs', 'label'),
            this.turtle.literal(label, null, 'nl')
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

        // Set creation date to today
        const now = new Date().toISOString();
        this.turtle.triple(
            installatieUri,
            this.turtle.qname('dct', 'created'),
            this.turtle.literal(now, this.turtle.qname('xsd', 'dateTime'), null)
        );

        if (this.reportYear) {
            // Start date (issue date)
            this.turtle.triple(
                installatieUri,
                this.turtle.qname('dct', 'issued'),
                this.turtle.literal(`${this.reportYear}-01-01`, this.turtle.qname('xsd', 'date'), null)
            );
            // End date (validity date) - using end of next year by default
            const nextYear = parseInt(this.reportYear) + 1;
            this.turtle.triple(
                installatieUri,
                this.turtle.qname('dct', 'valid'),
                this.turtle.literal(`${nextYear}-12-31`, this.turtle.qname('xsd', 'date'), null)
            );
        }

        this.installatieByKey.set(installatieKey, installatieUri);
        return installatieUri;
    }

    parseProductieEenheid(eenheid, installatieUri = null) {
        const activiteitId = eenheid.$.activiteitID;
        const naam = eenheid.Naam?.[0];
        const activiteitUri = this.turtle.qname('proces', `${this.cbbNumber}_${activiteitId}`);

        this.turtle.triple(activiteitUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
        if (naam) {
            this.turtle.triple(activiteitUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }
        this.turtle.triple(activiteitUri, this.turtle.qname('prov', 'atLocation'), this.turtle.qname('exploitatielocatie', this.cbbNumber));
        this.turtle.triple(activiteitUri, this.turtle.qname('adms', 'status'), this.turtle.qname('riepr', 'Actief'));
        const now = new Date().toISOString();
        this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'created'), this.turtle.literal(now, this.turtle.qname('xsd', 'dateTime'), null));
        if (this.reportYear) {
            // Start date (issue date)
            this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'issued'), this.turtle.literal(`${this.reportYear}-01-01`, this.turtle.qname('xsd', 'date'), null));
            // End date (validity date) - using end of next year by default
            const nextYear = parseInt(this.reportYear) + 1;
            this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'valid'), this.turtle.literal(`${nextYear}-12-31`, this.turtle.qname('xsd', 'date'), null));
        }
        // Refertes
        if (eenheid.Refertes?.[0]?.Referte) {
            this.parseRefertes(eenheid.Refertes[0].Referte, activiteitUri);
        }
        // Beschrijving
        if (eenheid.Beschrijving?.[0]) {
            this.turtle.triple(activiteitUri, this.turtle.qname('rdfs', 'comment'), this.turtle.literal(eenheid.Beschrijving[0], null, 'nl'));
        }
        // GeproduceerdeStof
        let producedStofUri = null;
        if (eenheid.GeproduceerdeStof?.[0]?.Naam) {
            const stofNaam = eenheid.GeproduceerdeStof[0].Naam[0];
            const stofId = this.sanitizeId(stofNaam);
            producedStofUri = this.turtle.qname('stof', stofId);
            this.turtle.triple(producedStofUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Stof'));
            this.turtle.triple(producedStofUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(stofNaam, null, 'nl'));
        }
        // Create corresponding Apparaat for this ProductieEenheid
        const apparaatUri = this.turtle.qname('apparaat', `${this.cbbNumber}_${activiteitId}`);
        this.turtle.triple(apparaatUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Apparaat'));
        if (naam) {
            this.turtle.triple(apparaatUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }
        this.turtle.triple(apparaatUri, this.turtle.qname('prov', 'atLocation'), this.turtle.qname('exploitatielocatie', this.cbbNumber));
        if (eenheid.Beschrijving?.[0]) {
            this.turtle.triple(apparaatUri, this.turtle.qname('rdfs', 'comment'), this.turtle.literal(eenheid.Beschrijving[0], null, 'nl'));
        }
        if (eenheid.DatumIngebruikname?.[0]) {
            this.turtle.triple(apparaatUri, this.turtle.qname('dct', 'created'), this.turtle.literal(eenheid.DatumIngebruikname[0], this.turtle.qname('xsd', 'date'), null));
            this.turtle.triple(apparaatUri, this.turtle.qname('dct', 'issued'), this.turtle.literal(eenheid.DatumIngebruikname[0], this.turtle.qname('xsd', 'date'), null));
        }
        if (installatieUri) {
            this.turtle.triple(installatieUri, this.turtle.qname('rdfs', 'member'), apparaatUri);
        }

        // Proces root step
        const rootStepId = `${this.cbbNumber}_proces_step_${activiteitId}`;
        const rootStepUri = this.turtle.qname('proces', rootStepId);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
        this.turtle.triple(rootStepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
        if (naam) {
            this.turtle.triple(rootStepUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }
        if (producedStofUri) {
            this.turtle.triple(
                rootStepUri,
                this.turtle.qname('pplan', 'hasOutputVar'),
                producedStofUri
            );
        }
        // Link root step to the apparatus
        this.turtle.triple(rootStepUri, this.turtle.qname('prov', 'wasAttributedTo'), apparaatUri);
        
        this.activityRootSteps.set(activiteitId, rootStepUri);
        this.activities.add(activiteitId);
        
        // Register apparatus for this activity
        this.apparaatByActiviteitId.set(activiteitId, {
            parentActiviteitId: activiteitId,
            apparaatUri: apparaatUri,
            apparaatNaam: naam,
        });
    }

    parseEnergieActiviteit(eenheid, installatieUri = null) {
        // Treated as a Proces
        const activiteitId = eenheid.$.activiteitID;
        const naam = eenheid.Naam?.[0];
        const activiteitUri = this.turtle.qname('proces', `${this.cbbNumber}_${activiteitId}`);
        this.turtle.triple(activiteitUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
        if (naam) {
            this.turtle.triple(activiteitUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }
        this.turtle.triple(activiteitUri, this.turtle.qname('prov', 'atLocation'), this.turtle.qname('exploitatielocatie', this.cbbNumber));
        this.turtle.triple(activiteitUri, this.turtle.qname('adms', 'status'), this.turtle.qname('riepr', 'Actief'));
        const now = new Date().toISOString();
        this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'created'), this.turtle.literal(now, this.turtle.qname('xsd', 'dateTime'), null));
        if (this.reportYear) {
            // Start date (issue date)
            this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'issued'), this.turtle.literal(`${this.reportYear}-01-01`, this.turtle.qname('xsd', 'date'), null));
            // End date (validity date) - using end of next year by default
            const nextYear = parseInt(this.reportYear) + 1;
            this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'valid'), this.turtle.literal(`${nextYear}-12-31`, this.turtle.qname('xsd', 'date'), null));
        }
        // Refertes
        if (eenheid.Refertes?.[0]?.Referte) {
            this.parseRefertes(eenheid.Refertes[0].Referte, activiteitUri);
        }
        // Functie
        if (eenheid.Functie?.[0]) {
            this.turtle.triple(activiteitUri, this.turtle.qname('rdfs', 'comment'), this.turtle.literal(eenheid.Functie[0], null, 'nl'));
        }
        
        // Create corresponding Apparaat for this EnergieActiviteit
        const apparaatUri = this.turtle.qname('apparaat', `${this.cbbNumber}_${activiteitId}`);
        this.turtle.triple(apparaatUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Apparaat'));
        if (naam) {
            this.turtle.triple(apparaatUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }
        this.turtle.triple(apparaatUri, this.turtle.qname('prov', 'atLocation'), this.turtle.qname('exploitatielocatie', this.cbbNumber));
        if (eenheid.Functie?.[0]) {
            this.turtle.triple(apparaatUri, this.turtle.qname('rdfs', 'comment'), this.turtle.literal(eenheid.Functie[0], null, 'nl'));
        }
        
        // Proces root step
        const rootStepId = `${this.cbbNumber}_proces_step_${activiteitId}`;
        const rootStepUri = this.turtle.qname('proces', rootStepId);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
        this.turtle.triple(rootStepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
        if (naam) {
            this.turtle.triple(rootStepUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }
        // Link root step to the apparatus
        this.turtle.triple(rootStepUri, this.turtle.qname('prov', 'wasAttributedTo'), apparaatUri);
        
        this.activityRootSteps.set(activiteitId, rootStepUri);
        this.activities.add(activiteitId);
        
        // Register apparatus for this activity
        this.apparaatByActiviteitId.set(activiteitId, {
            parentActiviteitId: activiteitId,
            apparaatUri: apparaatUri,
            apparaatNaam: naam,
        });
    }

    ensureActiviteitExists(activiteitId) {
        if (this.activities.has(activiteitId)) return;

        const activiteitUri = this.turtle.qname('proces', `${this.cbbNumber}_${activiteitId}`);
        this.turtle.triple(activiteitUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
        this.turtle.triple(activiteitUri, this.turtle.qname('prov', 'atLocation'), this.turtle.qname('exploitatielocatie', this.cbbNumber));
        this.turtle.triple(activiteitUri, this.turtle.qname('adms', 'status'), this.turtle.qname('riepr', 'Actief'));
        const now = new Date().toISOString();
        this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'created'), this.turtle.literal(now, this.turtle.qname('xsd', 'dateTime'), null));

        const rootStepId = `${this.cbbNumber}_proces_step_${activiteitId}`;
        const rootStepUri = this.turtle.qname('proces', rootStepId);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
        this.turtle.triple(rootStepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);

        this.activityRootSteps.set(activiteitId, rootStepUri);
        this.activities.add(activiteitId);
    }

    parseApparaatProductieEenheid(eenheid, parentActiviteitId, installatieUri = null) {
        const apparaatId = eenheid.$.activiteitID;
        const naam = eenheid.Naam?.[0];
        const datumIngebruikname = eenheid.DatumIngebruikname?.[0];
        const apparaatUri = this.turtle.qname('apparaat', `${this.cbbNumber}_${apparaatId}`);

        this.turtle.triple(apparaatUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Apparaat'));

        if (naam) {
            this.turtle.triple(apparaatUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }

        this.turtle.triple(
            apparaatUri,
            this.turtle.qname('prov', 'atLocation'),
            this.turtle.qname('exploitatielocatie', this.cbbNumber)
        );

        if (eenheid.Beschrijving?.[0]) {
            this.turtle.triple(
                apparaatUri,
                this.turtle.qname('rdfs', 'comment'),
                this.turtle.literal(eenheid.Beschrijving[0], null, 'nl')
            );
        }

        if (datumIngebruikname) {
            // Start date from datum ingebruikname
            this.turtle.triple(
                apparaatUri,
                this.turtle.qname('dct', 'issued'),
                this.turtle.literal(datumIngebruikname, this.turtle.qname('xsd', 'date'), null)
            );
            // End date - using end of next year by default
            const datumYear = parseInt(datumIngebruikname.split('-')[0]);
            const nextYear = datumYear + 1;
            this.turtle.triple(
                apparaatUri,
                this.turtle.qname('dct', 'valid'),
                this.turtle.literal(`${nextYear}-12-31`, this.turtle.qname('xsd', 'date'), null)
            );
        } else if (this.reportYear) {
            // Start date (issue date)
            this.turtle.triple(
                apparaatUri,
                this.turtle.qname('dct', 'issued'),
                this.turtle.literal(`${this.reportYear}-01-01`, this.turtle.qname('xsd', 'date'), null)
            );
            // End date (validity date) - using end of next year by default
            const nextYear = parseInt(this.reportYear) + 1;
            this.turtle.triple(
                apparaatUri,
                this.turtle.qname('dct', 'valid'),
                this.turtle.literal(`${nextYear}-12-31`, this.turtle.qname('xsd', 'date'), null)
            );
        }

        // Creation date (today)
        const now = new Date().toISOString();
        this.turtle.triple(
            apparaatUri,
            this.turtle.qname('dct', 'created'),
            this.turtle.literal(now, this.turtle.qname('xsd', 'dateTime'), null)
        );

        if (eenheid.Refertes?.[0]?.Referte) {
            this.parseRefertes(eenheid.Refertes[0].Referte, apparaatUri);
        }

        if (installatieUri) {
            this.turtle.triple(
                installatieUri,
                this.turtle.qname('rdfs', 'member'),
                apparaatUri
            );
        }

        if (parentActiviteitId) {
            this.ensureActiviteitExists(parentActiviteitId);
            const rootStepUri = this.activityRootSteps.get(parentActiviteitId);
            if (rootStepUri) {
                this.turtle.triple(
                    rootStepUri,
                    this.turtle.qname('prov', 'wasAttributedTo'),
                    apparaatUri
                );
            }

            this.apparaatByActiviteitId.set(apparaatId, {
                parentActiviteitId,
                apparaatUri,
                apparaatNaam: naam,
            });
        }
    }

    ensureActiviteitExists(activiteitId) {
        if (this.activities.has(activiteitId)) {
            return;
        }

        const activiteitUri = this.turtle.qname('proces', `${this.cbbNumber}_${activiteitId}`);
        
        // Check if this is an apparatus ID - use apparatus name if available
        const apparaatInfo = this.apparaatByActiviteitId.get(activiteitId);
        const label = apparaatInfo?.apparaatNaam || `Onbekend proces ${activiteitId}`;

        this.turtle.triple(activiteitUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
        this.turtle.triple(activiteitUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(label, null, 'nl'));
        this.turtle.triple(activiteitUri, this.turtle.qname('prov', 'atLocation'), this.turtle.qname('exploitatielocatie', this.cbbNumber));
        this.turtle.triple(activiteitUri, this.turtle.qname('adms', 'status'), this.turtle.qname('riepr', 'Actief'));

        const now = new Date().toISOString();
        this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'created'), this.turtle.literal(now, this.turtle.qname('xsd', 'dateTime'), null));
        if (this.reportYear) {
            // Start date (issue date)
            this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'issued'), this.turtle.literal(`${this.reportYear}-01-01`, this.turtle.qname('xsd', 'date'), null));
            // End date (validity date) - using end of next year by default
            const nextYear = parseInt(this.reportYear) + 1;
            this.turtle.triple(activiteitUri, this.turtle.qname('dct', 'valid'), this.turtle.literal(`${nextYear}-12-31`, this.turtle.qname('xsd', 'date'), null));
        }

        const rootStepId = `${this.cbbNumber}_proces_step_${activiteitId}`;
        const rootStepUri = this.turtle.qname('proces', rootStepId);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
        this.turtle.triple(rootStepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(label, null, 'nl'));

        if (apparaatInfo?.apparaatUri) {
            this.turtle.triple(
                rootStepUri,
                this.turtle.qname('prov', 'wasAttributedTo'),
                apparaatInfo.apparaatUri
            );
        }

        this.activityRootSteps.set(activiteitId, rootStepUri);
        this.activities.add(activiteitId);
    }

    parseStoffen(stoffenArray) {
        if (!Array.isArray(stoffenArray)) stoffenArray = [stoffenArray];
        stoffenArray.forEach(stof => {
            const stofId = stof.$.stofID;
            const naam = stof.Benaming?.[0];
            const stofUri = this.turtle.qname('stof', stofId);
            this.turtle.triple(stofUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Stof'));
            if (naam) {
                this.turtle.triple(stofUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
            }
            if (stof.Refertes?.[0]?.Referte) {
                this.parseRefertes(stof.Refertes[0].Referte, stofUri);
            }
        });
    }

    parseEmissiepunten(emissiepuntenArray) {
        if (!Array.isArray(emissiepuntenArray)) emissiepuntenArray = [emissiepuntenArray];
        emissiepuntenArray.forEach(punt => {
            const puntId = punt.$.emissiepuntID;
            const naam = punt.Naam?.[0];
            const emissiepuntUri = this.turtle.qname('emissiepunt', `${this.cbbNumber}_${puntId}`);
            this.turtle.triple(emissiepuntUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Schouw'));
            if (naam) {
                this.turtle.triple(emissiepuntUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
            }
            // Coordinates
            const x = punt.XCoordinaat?.[0];
            const y = punt.YCoordinaat?.[0];
            if (x && y) {
                const wktWithCRS = `<http://www.opengis.net/gml/srs/epsg.xml#${LAMBERT72_CRS}> POINT(${x} ${y})`;
                this.turtle.triple(emissiepuntUri, this.turtle.qname('ogc', 'hasGeometry'), `[ ${this.turtle.qname('ogc', 'asWKT')} "${wktWithCRS}"^^${this.turtle.qname('ogc', 'WKTLiteral')} ]`);
            }
            // Hoogte with unit
            if (punt.Hoogte?.[0]) {
                this.turtle.triple(
                    emissiepuntUri,
                    this.turtle.qname('dbo', 'height'),
                    `[ ${this.turtle.qname('rdf', 'type')} ${this.turtle.qname('qudt', 'QuantityValue')} ; ${this.turtle.qname('qudt', 'numericValue')} "${punt.Hoogte[0]}"^^${this.turtle.qname('xsd', 'decimal')} ; ${this.turtle.qname('qudt', 'unit')} ${this.turtle.qname('unit', 'M')} ]`
                );
            }
                // EquivalenteDiameter with unit
                if (punt.EquivalenteDiameter?.[0]) {
                    this.turtle.triple(
                        emissiepuntUri,
                        this.turtle.qname('dbo', 'diameter'),
                        `[ ${this.turtle.qname('rdf', 'type')} ${this.turtle.qname('qudt', 'QuantityValue')} ; ${this.turtle.qname('qudt', 'numericValue')} "${punt.EquivalenteDiameter[0]}"^^${this.turtle.qname('xsd', 'decimal')} ; ${this.turtle.qname('qudt', 'unit')} ${this.turtle.qname('unit', 'M')} ]`
                    );
                }
            // Refertes
            if (punt.Refertes?.[0]?.Referte) {
                this.parseRefertes(punt.Refertes[0].Referte, emissiepuntUri);
            }
            
            // Collect purification apparatus IDs for this emission point and parse them with sequence info
            const purificationApparaatIds = [];
            if (punt.Zuiveringsapparatuur?.[0]?.Zuiveringsapparaat) {
                const zuiveringsArray = Array.isArray(punt.Zuiveringsapparatuur[0].Zuiveringsapparaat) 
                    ? punt.Zuiveringsapparatuur[0].Zuiveringsapparaat 
                    : [punt.Zuiveringsapparatuur[0].Zuiveringsapparaat];
                
                zuiveringsArray.forEach((zuivering, index) => {
                    const apparaatId = zuivering.$.zuiveringsapparaatID;
                    purificationApparaatIds.push(apparaatId);
                });
                
                // Pass purification sequence: each apparatus position and total count
                this.parseZuiveringsapparatuur(
                    punt.Zuiveringsapparatuur[0].Zuiveringsapparaat, 
                    emissiepuntUri,
                    purificationApparaatIds  // Pass the list so each can know its position
                );
            }
            
            // GekoppeldeActiviteiten
            if (punt.GekoppeldeActiviteiten?.[0]?.Activiteit) {
                punt.GekoppeldeActiviteiten[0].Activiteit.forEach(act => {
                    const activiteitId = act.$.activiteitID;
                    const apparaatInfo = this.apparaatByActiviteitId.get(activiteitId);
                    // For emission points directly linked to apparatus activities, use the apparatus activity ID
                    // Don't use parent activity ID here - the emission belongs to the apparatus activity itself
                    this.ensureActiviteitExists(activiteitId);
                    const activiteitUri = this.turtle.qname('proces', `${this.cbbNumber}_${activiteitId}`);
                    // Create uitstoot Proces
                    const stepId = `${this.cbbNumber}_emit_step_${puntId}_${activiteitId}`;
                    const stepUri = this.turtle.qname('proces', stepId);
                    this.turtle.triple(stepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
                    this.turtle.triple(stepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
                    // Uitstootproces als plan afgeleid van generieke emissieprocedure
                    this.turtle.triple(stepUri, this.turtle.qname('prov', 'wasDerivedFrom'), this.turtle.qname('riepr', 'uitstootProces'));
                    // Emissiepunt (prov:Entity) beïnvloedt de uitstootstap (prov:Entity)
                    this.turtle.triple(stepUri, this.turtle.qname('prov', 'wasAttributedTo'), emissiepuntUri);
                    
                    if (apparaatInfo?.apparaatUri) {
                        // Apparaten worden als prov:Agent gemodelleerd en gelinkt via prov:wasAttributedTo
                        this.turtle.triple(stepUri, this.turtle.qname('prov', 'wasAttributedTo'), apparaatInfo.apparaatUri);
                    }
                    
                    // Emission step preceded by purification steps (if any), otherwise by root step
                    if (purificationApparaatIds.length > 0) {
                        // Preceded by the last purification step of this emission point
                        const lastPurificationId = purificationApparaatIds[purificationApparaatIds.length - 1];
                        const lastPurificationStepId = `${this.cbbNumber}_purification_step_${lastPurificationId}_${activiteitId}`;
                        const lastPurificationStepUri = this.turtle.qname('proces', lastPurificationStepId);
                        this.turtle.triple(stepUri, this.turtle.qname('pplan', 'isPrecededBy'), lastPurificationStepUri);
                    } else {
                        // Preceded by root step if no purification apparatus
                        const rootStepUri = this.activityRootSteps.get(activiteitId);
                        if (rootStepUri) {
                            this.turtle.triple(stepUri, this.turtle.qname('pplan', 'isPrecededBy'), rootStepUri);
                        }
                    }
                });
            }
        });
    }

    parseZuiveringsapparatuur(zuiveringsArray, emissiepuntUri, purificationApparaatIds = []) {
        if (!Array.isArray(zuiveringsArray)) {
            zuiveringsArray = [zuiveringsArray];
        }

        zuiveringsArray.forEach((apparaat, index) => {
            const apparaatId = apparaat.$.zuiveringsapparaatID;
            const naam = apparaat.Naam?.[0];
            const techniek = apparaat.Techniek?.[0];

            // Zuiveringsapparaten are NOT created as separate Apparaat entities
            // They only serve as purification process steps, not as independent apparatus
            // However, we do create the purification process steps that use them

            let stofUris = [];
            if (apparaat.Zuivering?.[0]?.Verwijdering) {
                stofUris = this.parseZuivering(apparaat.Zuivering[0].Verwijdering, null, naam);
            }

            if (apparaat.GekoppeldeActiviteiten?.[0]?.Activiteit) {
                apparaat.GekoppeldeActiviteiten[0].Activiteit.forEach((act) => {
                    const activiteitId = act.$.activiteitID;
                    const activiteitIdToUse = activiteitId;
                    this.ensureActiviteitExists(activiteitIdToUse);
                    const rootStepUri = this.activityRootSteps.get(activiteitIdToUse);

                    const zuiveringStepId = `${this.cbbNumber}_purification_step_${apparaatId}_${activiteitIdToUse}`;
                    const zuiveringStepUri = this.turtle.qname('proces', zuiveringStepId);
                    const activiteitUri = this.turtle.qname('proces', `${this.cbbNumber}_${activiteitIdToUse}`);

                    this.turtle.triple(
                        zuiveringStepUri,
                        this.turtle.qname('rdf', 'type'),
                        this.turtle.qname('riepr', 'Proces')
                    );

                    this.turtle.triple(
                        zuiveringStepUri,
                        this.turtle.qname('pplan', 'isStepOfPlan'),
                        activiteitUri
                    );

                    // Zuiveringsstap als plan afgeleid van apparaatVerwerkingsProces
                    this.turtle.triple(
                        zuiveringStepUri,
                        this.turtle.qname('prov', 'wasDerivedFrom'),
                        this.turtle.qname('riepr', 'apparaatVerwerkingsProces')
                    );

                    // Label purification step with the purification apparatus name
                    if (naam) {
                        this.turtle.triple(
                            zuiveringStepUri,
                            this.turtle.qname('rdfs', 'label'),
                            this.turtle.literal(naam, null, 'nl')
                        );
                    }

                    // Add purification technique as comment if available
                    if (techniek) {
                        this.turtle.triple(
                            zuiveringStepUri,
                            this.turtle.qname('rdfs', 'comment'),
                            this.turtle.literal(`Techniek: ${techniek}`, null, 'nl')
                        );
                    }

                    // Determine what this purification step is preceded by
                    let previousOutputVarUri = null;
                    if (index === 0) {
                        // First purification step is preceded by root step
                        if (rootStepUri) {
                            this.turtle.triple(
                                zuiveringStepUri,
                                this.turtle.qname('pplan', 'isPrecededBy'),
                                rootStepUri
                            );
                            previousOutputVarUri = this.ensureOutputVarForStep(rootStepUri, 'Onbekende stroom');

                            // Stoffen zijn ZOWEL output van de root step (vervuilde lucht) ALS input van de purification step
                            stofUris.forEach((stofUri) => {
                                // Als output van root step (de stoffen in de vervuilde lucht)
                                this.turtle.triple(
                                    rootStepUri,
                                    this.turtle.qname('pplan', 'hasOutputVar'),
                                    stofUri
                                );
                                // Als input van purification step (de stoffen die verwijderd moeten worden)
                                this.turtle.triple(
                                    zuiveringStepUri,
                                    this.turtle.qname('pplan', 'hasInputVar'),
                                    stofUri
                                );
                            });
                        }
                    } else {
                        // Subsequent purification steps are preceded by the previous purification step
                        const previousApparaatId = purificationApparaatIds[index - 1];
                        const previousPurificationStepId = `${this.cbbNumber}_purification_step_${previousApparaatId}_${activiteitIdToUse}`;
                        const previousPurificationStepUri = this.turtle.qname('proces', previousPurificationStepId);
                        this.turtle.triple(
                            zuiveringStepUri,
                            this.turtle.qname('pplan', 'isPrecededBy'),
                            previousPurificationStepUri
                        );
                        previousOutputVarUri = this.outputVarByStepUri.get(previousPurificationStepUri)
                            || this.ensureOutputVarForStep(previousPurificationStepUri, 'Gezuiverde lucht');
                    }
                    // Add input/output variables for purification step
                    if (previousOutputVarUri) {
                        this.turtle.triple(
                            zuiveringStepUri,
                            this.turtle.qname('pplan', 'hasInputVar'),
                            previousOutputVarUri
                        );
                    } else {
                        const inputVarId = `${this.cbbNumber}_var_input_vervuilde_lucht_${apparaatId}`;
                        const inputVarUri = this.turtle.qname('var', inputVarId);
                        this.turtle.triple(
                            inputVarUri,
                            this.turtle.qname('rdf', 'type'),
                            this.turtle.qname('riepr', 'Variable')
                        );
                        this.turtle.triple(
                            inputVarUri,
                            this.turtle.qname('rdfs', 'label'),
                            this.turtle.literal('Vervuilde lucht', null, 'nl')
                        );
                        this.turtle.triple(
                            zuiveringStepUri,
                            this.turtle.qname('pplan', 'hasInputVar'),
                            inputVarUri
                        );
                    }

                    const outputVarId = `${this.cbbNumber}_var_output_gezuiverde_lucht_${apparaatId}`;
                    const outputVarUri = this.turtle.qname('var', outputVarId);
                    this.turtle.triple(
                        outputVarUri,
                        this.turtle.qname('rdf', 'type'),
                        this.turtle.qname('riepr', 'Variable')
                    );
                    this.turtle.triple(
                        outputVarUri,
                        this.turtle.qname('rdfs', 'label'),
                        this.turtle.literal('Gezuiverde lucht', null, 'nl')
                    );
                    this.turtle.triple(
                        zuiveringStepUri,
                        this.turtle.qname('pplan', 'hasOutputVar'),
                        outputVarUri
                    );
                    this.outputVarByStepUri.set(zuiveringStepUri, outputVarUri);
                });
            }
        });
    }

    parseZuivering(verwijderingen, parentUri, apparaatNaam = null) {
        const verwijderingenArray = Array.isArray(verwijderingen) ? verwijderingen : [verwijderingen];
        const stofUris = [];
        verwijderingenArray.forEach((verwijdering) => {
            const stofNaam = verwijdering.VerontreinigendeStof?.[0];
            if (!stofNaam) return;

            const stofId = this.sanitizeId(stofNaam);
            const stofUri = this.turtle.qname('stof', stofId);

            this.turtle.triple(
                stofUri,
                this.turtle.qname('rdf', 'type'),
                this.turtle.qname('riepr', 'Stof')
            );

            this.turtle.triple(
                stofUri,
                this.turtle.qname('rdfs', 'label'),
                this.turtle.literal(stofNaam, null, 'nl')
            );

            if (parentUri) {
                this.turtle.triple(
                    parentUri,
                    this.turtle.qname('rdfs', 'comment'),
                    this.turtle.literal(`Zuivering van: ${stofNaam}`, null, 'nl')
                );
            }

            stofUris.push(stofUri);
        });

        return stofUris;
    }

    parseMeetmethoden(meetmethodenArray) {
        if (!Array.isArray(meetmethodenArray)) meetmethodenArray = [meetmethodenArray];
        meetmethodenArray.forEach(methode => {
            const methodeId = methode.$.meetmethodeID;
            const stofNaam = methode.VerontreinigendeStof?.[0];
            const methodeNaam = methode.Methode?.[0];
            if (!methodeNaam) return;
            const procedureId = `${this.cbbNumber}_meetprocedure_${methodeId}`;
            const procedureUri = this.turtle.qname('meetprocedure', procedureId);
            this.turtle.triple(procedureUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'MeetProcedure'));
            this.turtle.triple(procedureUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(methodeNaam, null, 'nl'));
            if (stofNaam) {
                const stofId = this.sanitizeId(stofNaam);
                const stofUri = this.turtle.qname('stof', stofId);
                this.turtle.triple(stofUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Stof'));
                this.turtle.triple(stofUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(stofNaam, null, 'nl'));
                this.turtle.triple(procedureUri, this.turtle.qname('rdfs', 'comment'), this.turtle.literal(`Meet ${stofNaam}`, null, 'nl'));
            }
        });
    }

    parseMilieudruk(milieudrukArray) {
        if (!Array.isArray(milieudrukArray)) milieudrukArray = [milieudrukArray];
        
        milieudrukArray.forEach(productieEenheid => {
            const verbruiksGegevens = productieEenheid.VerbruiksGegevens?.[0]
                || productieEenheid.VerbruiksGegevens;
            if (!verbruiksGegevens) return;

            // Parse Brandstof (fuel consumption)
            this.parseVerbruiksType(verbruiksGegevens.Brandstof, 'brandstof', 'riepr:brandstofVerbruikProces', 'Brandstofverbruik');

            // Parse Eindproducten (end products)
            this.parseVerbruiksType(verbruiksGegevens.Eindproducten, 'eindproduct', 'riepr:eindproductProductieProces', 'Eindproductproductie');
        });
    }

    parseVerbruiksType(verbruiksData, typePrefix, procedureQName, label) {
        if (!verbruiksData) return;
        
        const verbruiksArray = Array.isArray(verbruiksData) ? verbruiksData : [verbruiksData];
        
        verbruiksArray.forEach(verbruik => {
            const gekoppelde = verbruik.GekoppeldeActiviteiten?.[0]?.Activiteit
                || verbruik.GekoppeldeActiviteiten?.Activiteit
                || [];
            const gekoppeldeActiviteiten = Array.isArray(gekoppelde) ? gekoppelde : [gekoppelde];

            if (gekoppeldeActiviteiten.length > 0) {
                gekoppeldeActiviteiten.forEach(act => {
                    const activiteitId = act.$.activiteitID;
                    this.ensureActiviteitExists(activiteitId);
                    
                    const stepId = `${this.cbbNumber}_${typePrefix}_step_${verbruik.$.stofHoeveelheidID}_${activiteitId}`;
                    const stepUri = this.turtle.qname('proces', stepId);
                    const activiteitUri = this.turtle.qname('proces', `${this.cbbNumber}_${activiteitId}`);
                    
                    this.turtle.triple(stepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Proces'));
                    this.turtle.triple(stepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
                    // Verbruiksstap als plan afgeleid van generieke verbruiksprocedure
                    this.turtle.triple(stepUri, this.turtle.qname('prov', 'wasDerivedFrom'), this.turtle.qname(procedureQName.split(':')[0], procedureQName.split(':')[1]));
                    this.turtle.triple(stepUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(label, null, 'nl'));
                    
                    // Link to stof if available
                    const stofNode = verbruik.Stof?.[0] || verbruik.Stof;
                    if (stofNode?.$.StofID) {
                        const stofId = stofNode.$.StofID;
                        const stofUri = this.turtle.qname('stof', stofId);
                        if (typePrefix === 'brandstof') {
                            // Brandstof is INPUT only (consumed, not produced)
                            this.turtle.triple(stepUri, this.turtle.qname('pplan', 'hasInputVar'), stofUri);
                        } else if (typePrefix === 'eindproduct') {
                            // Eindproducten are OUTPUT only (produced, not consumed)
                            this.turtle.triple(stepUri, this.turtle.qname('pplan', 'hasOutputVar'), stofUri);
                        }
                    }
                    
                    // Preceded by root step
                    const rootStepUri = this.activityRootSteps.get(activiteitId);
                    if (rootStepUri) {
                        this.turtle.triple(stepUri, this.turtle.qname('pplan', 'isPrecededBy'), rootStepUri);
                    }
                });
            }
        });
    }
}
