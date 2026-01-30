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

        // Parse activiteiten (Installatie/ProductieEenheid/EnergieActiviteit)
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
        if (luchtData.Milieudruk?.[0]?.ProductieEenheid) {
            this.parseMilieudruk(luchtData.Milieudruk[0].ProductieEenheid);
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
                this.parseProductieEenheid(inst.ProductieEenheid[0]);
                parentActiviteitId = inst.ProductieEenheid[0].$.activiteitID;
                parentActiviteitNaam = inst.ProductieEenheid[0].Naam?.[0] || null;
            } else if (inst.EnergieActiviteit) {
                this.parseEnergieActiviteit(inst.EnergieActiviteit[0]);
                parentActiviteitId = inst.EnergieActiviteit[0].$.activiteitID;
                parentActiviteitNaam = inst.EnergieActiviteit[0].Naam?.[0] || null;
            }

            const installatieKey = parentActiviteitId || `idx_${index + 1}`;
            const installatieLabel = parentActiviteitNaam || `Installatie ${index + 1}`;
            const installatieUri = this.ensureInstallatie(installatieKey, installatieLabel);

            if (parentActiviteitId) {
                const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${parentActiviteitId}`);
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

    parseProductieEenheid(eenheid) {
        const activiteitId = eenheid.$.activiteitID;
        const naam = eenheid.Naam?.[0];
        const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${activiteitId}`);

        this.turtle.triple(activiteitUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Activiteit'));
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
        if (eenheid.GeproduceerdeStof?.[0]?.Naam) {
            const stofNaam = eenheid.GeproduceerdeStof[0].Naam[0];
            const stofId = this.sanitizeId(stofNaam);
            const stofUri = this.turtle.qname('stof', stofId);
            this.turtle.triple(stofUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Stof'));
            this.turtle.triple(stofUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(stofNaam, null, 'nl'));
        }
        // Activiteit root step
        const rootStepId = `${this.cbbNumber}_activiteit_step_${activiteitId}`;
        const rootStepUri = this.turtle.qname('activiteitstap', rootStepId);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'ActiviteitStap'));
        this.turtle.triple(rootStepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
        if (naam) {
            this.turtle.triple(rootStepUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }
        this.activityRootSteps.set(activiteitId, rootStepUri);
        this.activities.add(activiteitId);
    }

    parseEnergieActiviteit(eenheid) {
        // Treated as an Activiteit
        const activiteitId = eenheid.$.activiteitID;
        const naam = eenheid.Naam?.[0];
        const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${activiteitId}`);
        this.turtle.triple(activiteitUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Activiteit'));
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
        // Activiteit root step
        const rootStepId = `${this.cbbNumber}_activiteit_step_${activiteitId}`;
        const rootStepUri = this.turtle.qname('activiteitstap', rootStepId);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'ActiviteitStap'));
        this.turtle.triple(rootStepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
        if (naam) {
            this.turtle.triple(rootStepUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(naam, null, 'nl'));
        }
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
                    this.turtle.qname('prov', 'used'),
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

        const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${activiteitId}`);
        
        // Check if this is an apparatus ID - use apparatus name if available
        const apparaatInfo = this.apparaatByActiviteitId.get(activiteitId);
        const label = apparaatInfo?.apparaatNaam || `Onbekende activiteit ${activiteitId}`;

        this.turtle.triple(activiteitUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'Activiteit'));
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

        const rootStepId = `${this.cbbNumber}_activiteit_step_${activiteitId}`;
        const rootStepUri = this.turtle.qname('activiteitstap', rootStepId);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'ActiviteitStap'));
        this.turtle.triple(rootStepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
        this.turtle.triple(rootStepUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(label, null, 'nl'));

        if (apparaatInfo?.apparaatUri) {
            this.turtle.triple(
                rootStepUri,
                this.turtle.qname('prov', 'used'),
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
            
            // Collect purification apparatus IDs for this emission point
            const purificationApparaatIds = [];
            if (punt.Zuiveringsapparatuur?.[0]?.Zuiveringsapparaat) {
                const zuiveringsArray = Array.isArray(punt.Zuiveringsapparatuur[0].Zuiveringsapparaat) 
                    ? punt.Zuiveringsapparatuur[0].Zuiveringsapparaat 
                    : [punt.Zuiveringsapparatuur[0].Zuiveringsapparaat];
                
                zuiveringsArray.forEach(zuivering => {
                    const apparaatId = zuivering.$.zuiveringsapparaatID;
                    purificationApparaatIds.push(apparaatId);
                });
                
                this.parseZuiveringsapparatuur(punt.Zuiveringsapparatuur[0].Zuiveringsapparaat, emissiepuntUri);
            }
            
            // GekoppeldeActiviteiten
            if (punt.GekoppeldeActiviteiten?.[0]?.Activiteit) {
                punt.GekoppeldeActiviteiten[0].Activiteit.forEach(act => {
                    const activiteitId = act.$.activiteitID;
                    const apparaatInfo = this.apparaatByActiviteitId.get(activiteitId);
                    // For emission points directly linked to apparatus activities, use the apparatus activity ID
                    // Don't use parent activity ID here - the emission belongs to the apparatus activity itself
                    this.ensureActiviteitExists(activiteitId);
                    const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${activiteitId}`);
                    // Create uitstoot ActiviteitStap
                    const stepId = `${this.cbbNumber}_emit_step_${puntId}_${activiteitId}`;
                    const stepUri = this.turtle.qname('activiteitstap', stepId);
                    this.turtle.triple(stepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'ActiviteitStap'));
                    this.turtle.triple(stepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
                    this.turtle.triple(stepUri, this.turtle.qname('ssn', 'implements'), this.turtle.qname('riepr', 'uitstootProces'));
                    this.turtle.triple(stepUri, this.turtle.qname('prov', 'used'), emissiepuntUri);
                    
                    if (apparaatInfo?.apparaatUri) {
                        this.turtle.triple(stepUri, this.turtle.qname('prov', 'used'), apparaatInfo.apparaatUri);
                    }
                    
                    // Emission step preceded by purification steps (if any), otherwise by root step
                    if (purificationApparaatIds.length > 0) {
                        // Preceded by the last purification step of this emission point
                        const lastPurificationId = purificationApparaatIds[purificationApparaatIds.length - 1];
                        const lastPurificationStepId = `${this.cbbNumber}_purification_step_${lastPurificationId}_${activiteitId}`;
                        const lastPurificationStepUri = this.turtle.qname('activiteitstap', lastPurificationStepId);
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

    parseZuiveringsapparatuur(zuiveringsArray, emissiepuntUri) {
        if (!Array.isArray(zuiveringsArray)) {
            zuiveringsArray = [zuiveringsArray];
        }

        zuiveringsArray.forEach((apparaat) => {
            const apparaatId = apparaat.$.zuiveringsapparaatID;
            const naam = apparaat.Naam?.[0];
            const techniek = apparaat.Techniek?.[0];
            const datum = apparaat.DatumIngebruikname?.[0];

            const apparaatUri = this.turtle.qname('apparaat', `${this.cbbNumber}_zuivering_${apparaatId}`);

            this.turtle.triple(
                apparaatUri,
                this.turtle.qname('rdf', 'type'),
                this.turtle.qname('riepr', 'Apparaat')
            );

            if (naam) {
                this.turtle.triple(
                    apparaatUri,
                    this.turtle.qname('rdfs', 'label'),
                    this.turtle.literal(naam, null, 'nl')
                );
            }

            this.turtle.triple(
                apparaatUri,
                this.turtle.qname('prov', 'atLocation'),
                this.turtle.qname('exploitatielocatie', this.cbbNumber)
            );

            if (techniek) {
                this.turtle.triple(
                    apparaatUri,
                    this.turtle.qname('rdfs', 'comment'),
                    this.turtle.literal(`Techniek: ${techniek}`, null, 'nl')
                );
            }
            
            if (datum) {
                // Start date from datum ingebruikname
                this.turtle.triple(
                    apparaatUri,
                    this.turtle.qname('dct', 'issued'),
                    this.turtle.literal(datum, this.turtle.qname('xsd', 'date'), null)
                );
                // End date - using end of next year by default
                const datumYear = parseInt(datum.split('-')[0]);
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
            const creationNow = new Date().toISOString();
            this.turtle.triple(
                apparaatUri,
                this.turtle.qname('dct', 'created'),
                this.turtle.literal(creationNow, this.turtle.qname('xsd', 'dateTime'), null)
            );

            if (apparaat.Refertes?.[0]?.Referte) {
                this.parseRefertes(apparaat.Refertes[0].Referte, apparaatUri);
            }

            let stofUris = [];
            if (apparaat.Zuivering?.[0]?.Verwijdering) {
                stofUris = this.parseZuivering(apparaat.Zuivering[0].Verwijdering, apparaatUri);
            }

            if (apparaat.GekoppeldeActiviteiten?.[0]?.Activiteit) {
                apparaat.GekoppeldeActiviteiten[0].Activiteit.forEach((act) => {
                    const activiteitId = act.$.activiteitID;
                    const apparaatInfo = this.apparaatByActiviteitId.get(activiteitId);
                    const activiteitIdToUse = apparaatInfo?.parentActiviteitId || activiteitId;
                    this.ensureActiviteitExists(activiteitIdToUse);
                    const rootStepUri = this.activityRootSteps.get(activiteitIdToUse);
                    if (rootStepUri) {
                        this.turtle.triple(
                            rootStepUri,
                            this.turtle.qname('prov', 'used'),
                            apparaatUri
                        );
                    }

                    const zuiveringStepId = `${this.cbbNumber}_purification_step_${apparaatId}_${activiteitIdToUse}`;
                    const zuiveringStepUri = this.turtle.qname('activiteitstap', zuiveringStepId);
                    const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${activiteitIdToUse}`);

                    this.turtle.triple(
                        zuiveringStepUri,
                        this.turtle.qname('rdf', 'type'),
                        this.turtle.qname('riepr', 'ActiviteitStap')
                    );

                    this.turtle.triple(
                        zuiveringStepUri,
                        this.turtle.qname('pplan', 'isStepOfPlan'),
                        activiteitUri
                    );

                    this.turtle.triple(
                        zuiveringStepUri,
                        this.turtle.qname('ssn', 'implements'),
                        this.turtle.qname('riepr', 'apparaatVerwerkingsProces')
                    );

                    this.turtle.triple(
                        zuiveringStepUri,
                        this.turtle.qname('prov', 'used'),
                        apparaatUri
                    );

                    stofUris.forEach((stofUri) => {
                        this.turtle.triple(
                            zuiveringStepUri,
                            this.turtle.qname('prov', 'used'),
                            stofUri
                        );
                    });

                    if (rootStepUri) {
                        this.turtle.triple(
                            zuiveringStepUri,
                            this.turtle.qname('pplan', 'isPrecededBy'),
                            rootStepUri
                        );
                    }
                });
            }
        });
    }

    parseZuivering(verwijderingen, parentUri) {
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

            this.turtle.triple(
                parentUri,
                this.turtle.qname('rdfs', 'comment'),
                this.turtle.literal(`Zuivering van: ${stofNaam}`, null, 'nl')
            );

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
            const verbruiksGegevens = productieEenheid.VerbruiksGegevens?.[0];
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
            if (verbruik.GekoppeldeActiviteiten?.[0]?.Activiteit) {
                verbruik.GekoppeldeActiviteiten[0].Activiteit.forEach(act => {
                    const activiteitId = act.$.activiteitID;
                    this.ensureActiviteitExists(activiteitId);
                    
                    const stepId = `${this.cbbNumber}_${typePrefix}_step_${verbruik.$.stofHoeveelheidID}_${activiteitId}`;
                    const stepUri = this.turtle.qname('activiteitstap', stepId);
                    const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${activiteitId}`);
                    
                    this.turtle.triple(stepUri, this.turtle.qname('rdf', 'type'), this.turtle.qname('riepr', 'ActiviteitStap'));
                    this.turtle.triple(stepUri, this.turtle.qname('pplan', 'isStepOfPlan'), activiteitUri);
                    this.turtle.triple(stepUri, this.turtle.qname('ssn', 'implements'), this.turtle.qname(procedureQName.split(':')[0], procedureQName.split(':')[1]));
                    this.turtle.triple(stepUri, this.turtle.qname('rdfs', 'label'), this.turtle.literal(label, null, 'nl'));
                    
                    // Link to stof if available
                    if (verbruik.Stof?.[0]?.$.StofID) {
                        const stofId = verbruik.Stof[0].$.StofID;
                        const stofUri = this.turtle.qname('stof', stofId);
                        this.turtle.triple(stepUri, this.turtle.qname('prov', 'used'), stofUri);
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
