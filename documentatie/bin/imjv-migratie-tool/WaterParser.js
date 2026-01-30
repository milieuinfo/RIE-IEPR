import { TurtleBuilder } from './TurtleBuilder.js';
import { BaseParser } from './BaseParser.js';

export class WaterParser extends BaseParser {
    constructor(xmlData) {
        super(new TurtleBuilder(), null, null);
        this.data = xmlData;
        this.activityRootSteps = new Map();
    }

    async parse() {
        const waterData = this.data['water:VasteGegevensAangifteWater']?.[0];
        if (!waterData) {
            console.warn('No water data found in XML');
            return '';
        }

        this.cbbNumber = waterData.CBBExploitatieNummer?.[0];
        this.reportYear = waterData.RapporteringsJaar?.[0];

        if (!this.cbbNumber) {
            console.warn('No CBBExploitatieNummer found in water XML');
            return '';
        }

        // Create exploitant and exploitatielocatie
        this.createExploitant();
        this.createExploitatieLocatie(null, `Exploitatie locatie ${this.cbbNumber}`);

        // Parse activiteiten (activities)
        if (waterData.Activiteiten?.[0]?.Activiteit) {
            this.parseActiviteiten(waterData.Activiteiten[0].Activiteit);
        }

        // Parse lozingspunten (discharge points)
        if (waterData.Lozingspunten?.[0]?.Lozingspunt) {
            this.parseLozingspunten(waterData.Lozingspunten[0].Lozingspunt);
        }

        // Parse apparaten (equipment/devices)
        if (waterData.Apparaten?.[0]?.Apparaat) {
            this.parseApparatuur(waterData.Apparaten[0].Apparaat);
        }

        // Parse meetmethoden (measurement methods) at top level
        if (waterData.Meetmethoden?.[0]?.Meetmethode) {
            this.parseMeetmethoden(waterData.Meetmethoden[0].Meetmethode);
        }

        return this.turtle.build();
    }

    parseActiviteiten(activiteitenArray) {
        if (!Array.isArray(activiteitenArray)) {
            activiteitenArray = [activiteitenArray];
        }

        activiteitenArray.forEach((activiteit, index) => {
            this.parseActiviteit(activiteit, index);
        });
    }

    parseActiviteit(activiteit, index) {
        const activiteitId = activiteit.$.activiteitID;
        const naam = activiteit.Naam?.[0];
        const noseCode = activiteit.NosePCode?.[0];

        const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${activiteitId}`);

        this.turtle.triple(
            activiteitUri,
            this.turtle.qname('rdf', 'type'),
            this.turtle.qname('riepr', 'Activiteit')
        );

        if (naam) {
            this.turtle.triple(
                activiteitUri,
                this.turtle.qname('rdfs', 'label'),
                this.turtle.literal(naam, null, 'nl')
            );
        }

        if (noseCode) {
            this.turtle.triple(
                activiteitUri,
                this.turtle.qname('rdfs', 'comment'),
                this.turtle.literal(`NOSE-P Code: ${noseCode}`, null, 'nl')
            );
        }

        // Link to exploitatielocatie
        const locatieUri = this.turtle.qname('exploitatielocatie', this.cbbNumber);
        this.turtle.triple(
            activiteitUri,
            this.turtle.qname('prov', 'atLocation'),
            locatieUri
        );

        // Add status with OWL constraints
        this.turtle.triple(
            activiteitUri,
            this.turtle.qname('adms', 'status'),
            this.turtle.qname('riepr', 'Actief')
        );

        // Add date constraints (OWL: dct:valid, dct:created)
        const now = new Date().toISOString();
        this.turtle.triple(
            activiteitUri,
            this.turtle.qname('dct', 'created'),
            this.turtle.literal(now, this.turtle.qname('xsd', 'dateTime'), null)
        );
        
        if (this.reportYear) {
            this.turtle.triple(
                activiteitUri,
                this.turtle.qname('dct', 'valid'),
                this.turtle.literal(`${this.reportYear}-01-01/`, null, null)
            );
        }

        // Create a root activiteitstap with the same name
        const rootStepId = `${this.cbbNumber}_activiteit_step_${activiteitId}`;
        const rootStepUri = this.turtle.qname('activiteitstap', rootStepId);

        this.turtle.triple(
            rootStepUri,
            this.turtle.qname('rdf', 'type'),
            this.turtle.qname('riepr', 'ActiviteitStap')
        );

        this.turtle.triple(
            rootStepUri,
            this.turtle.qname('pplan', 'isStepOfPlan'),
            activiteitUri
        );

        if (naam) {
            this.turtle.triple(
                rootStepUri,
                this.turtle.qname('rdfs', 'label'),
                this.turtle.literal(naam, null, 'nl')
            );
        }

        this.activityRootSteps.set(activiteitId, rootStepUri);

        // Parse watergebruiken if present
        if (activiteit.Watergebruiken?.[0]?.Watergebruik) {
            this.parseWatergebruiken(activiteit.Watergebruiken[0].Watergebruik, activiteitUri);
        }
    }

    parseWatergebruiken(gebruikenArray, parentUri) {
        if (!Array.isArray(gebruikenArray)) {
            gebruikenArray = [gebruikenArray];
        }

        gebruikenArray.forEach((gebruik, index) => {
            // Create ActiviteitStap for watergebruik (waterGebruikProces)
            const stepId = `${this.cbbNumber}_water_usage_step_${index}`;
            const stepUri = this.turtle.qname('activiteitstap', stepId);

            this.turtle.triple(
                stepUri,
                this.turtle.qname('rdf', 'type'),
                this.turtle.qname('riepr', 'ActiviteitStap')
            );

            this.turtle.triple(
                stepUri,
                this.turtle.qname('pplan', 'isStepOfPlan'),
                parentUri
            );

            const activiteitId = parentUri.split('_').pop();
            const rootStepUri = this.activityRootSteps.get(activiteitId);
            if (rootStepUri) {
                this.turtle.triple(
                    stepUri,
                    this.turtle.qname('pplan', 'isPrecededBy'),
                    rootStepUri
                );
            }

            // Map as waterVerbruikProces via ssn:implements
            this.turtle.triple(
                stepUri,
                this.turtle.qname('ssn', 'implements'),
                this.turtle.qname('riepr', 'waterVerbruikProces')
            );

            // Add source information as Bron entity with prov:used relation
            const herkomst = gebruik.Herkomst?.[0];
            if (herkomst) {
                const bronId = this.sanitizeId(herkomst);
                const bronUri = this.turtle.qname('bron', `${this.cbbNumber}_${bronId}`);

                // Create Bron entity
                this.turtle.triple(
                    bronUri,
                    this.turtle.qname('rdf', 'type'),
                    this.turtle.qname('riepr', 'Bron')
                );

                this.turtle.triple(
                    bronUri,
                    this.turtle.qname('rdfs', 'label'),
                    this.turtle.literal(herkomst, null, 'nl')
                );

                // Link watergebruik step to water source via prov:used
                this.turtle.triple(
                    stepUri,
                    this.turtle.qname('prov', 'used'),
                    bronUri
                );
            }
        });
    }

    parseLozingspunten(puntenArray) {
        if (!Array.isArray(puntenArray)) {
            puntenArray = [puntenArray];
        }

        puntenArray.forEach((punt, index) => {
            this.parseLozingspunt(punt, index);
        });
    }

    parseLozingspunt(punt, index) {
        const puntId = punt.$.lozingspuntID;
        const naam = punt.Naam?.[0];
        const meetputType = punt.MeetputType?.[0];
        const lozingsplaats = punt.Lozingsplaats?.[0];

        const emissiepuntUri = this.turtle.qname('emissiepunt', `${this.cbbNumber}_${puntId}`);

        // Determine riepr:Emissiepunt subclass based on lozingsplaats
        let emissiepuntType = this.turtle.qname('riepr', 'Emissiepunt');
        if (lozingsplaats?.includes('Oppervlaktewater')) {
            emissiepuntType = this.turtle.qname('riepr', 'Lozingspunt');
        } else if (lozingsplaats?.includes('Grondwater')) {
            emissiepuntType = this.turtle.qname('riepr', 'Grondwaterput');
        }

        this.turtle.triple(
            emissiepuntUri,
            this.turtle.qname('rdf', 'type'),
            emissiepuntType
        );

        if (naam) {
            this.turtle.triple(
                emissiepuntUri,
                this.turtle.qname('rdfs', 'label'),
                this.turtle.literal(naam, null, 'nl')
            );
        }

        // Link to exploitatielocatie
        const locatieUri = this.turtle.qname('exploitatielocatie', this.cbbNumber);
        this.turtle.triple(
            emissiepuntUri,
            this.turtle.qname('prov', 'atLocation'),
            locatieUri
        );

        // Add comment with lozingsplaats info
        if (lozingsplaats) {
            this.turtle.triple(
                emissiepuntUri,
                this.turtle.qname('rdfs', 'comment'),
                this.turtle.literal(`Lozingsplaats: ${lozingsplaats}`, null, 'nl')
            );
        }

        this.turtle.triple(
            emissiepuntUri,
            this.turtle.qname('adms', 'status'),
            this.turtle.qname('riepr', 'Actief')
        );

        // Parse gekoppeldeActiviteiten if present
        if (punt.GekoppeldeActiviteiten?.[0]?.Activiteit) {
            this.parseGekoppeldeActiviteiten(punt.GekoppeldeActiviteiten[0].Activiteit, emissiepuntUri);
        }
    }

    parseGekoppeldeActiviteiten(activiteitenArray, parentUri) {
        if (!Array.isArray(activiteitenArray)) {
            activiteitenArray = [activiteitenArray];
        }

        activiteitenArray.forEach((act) => {
            const activiteitId = act.$.activiteitID;
            const activiteitUri = this.turtle.qname('activiteit', `${this.cbbNumber}_${activiteitId}`);

            // Create ActiviteitStap that uses this emissiepunt
            const stepId = `${this.cbbNumber}_emit_step_${activiteitId}`;
            const stepUri = this.turtle.qname('activiteitstap', stepId);

            this.turtle.triple(
                stepUri,
                this.turtle.qname('rdf', 'type'),
                this.turtle.qname('riepr', 'ActiviteitStap')
            );

            this.turtle.triple(
                stepUri,
                this.turtle.qname('pplan', 'isStepOfPlan'),
                activiteitUri
            );

            const rootStepUri = this.activityRootSteps.get(activiteitId);
            if (rootStepUri) {
                this.turtle.triple(
                    stepUri,
                    this.turtle.qname('pplan', 'isPrecededBy'),
                    rootStepUri
                );
            }

            this.turtle.triple(
                stepUri,
                this.turtle.qname('ssn', 'implements'),
                this.turtle.qname('riepr', 'uitstootProces')
            );

            this.turtle.triple(
                stepUri,
                this.turtle.qname('prov', 'used'),
                parentUri
            );
        });
    }

    parseApparatuur(apparaatArray) {
        if (!Array.isArray(apparaatArray)) {
            apparaatArray = [apparaatArray];
        }

        apparaatArray.forEach((apparaat, index) => {
            this.parseApparaat(apparaat, index);
        });
    }

    parseApparaat(apparaat, index) {
        const apparaatId = apparaat.$.apparaatID;
        const naam = apparaat.Naam?.[0];

        const apparaatUri = this.turtle.qname('apparaat', `${this.cbbNumber}_${apparaatId}`);

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

        // Link to exploitatielocatie
        const locatieUri = this.turtle.qname('exploitatielocatie', this.cbbNumber);
        this.turtle.triple(
            apparaatUri,
            this.turtle.qname('prov', 'atLocation'),
            locatieUri
        );

        this.turtle.triple(
            apparaatUri,
            this.turtle.qname('adms', 'status'),
            this.turtle.qname('riepr', 'Actief')
        );

        // Extract dct:valid from JaarIngebruikname in Technieken
        if (apparaat.Technieken?.[0]?.Techniek) {
            const techniekArray = Array.isArray(apparaat.Technieken[0].Techniek)
                ? apparaat.Technieken[0].Techniek
                : [apparaat.Technieken[0].Techniek];
            
            const jaren = techniekArray
                .map(t => t.JaarIngebruikname?.[0])
                .filter(j => j);
            
            if (jaren.length > 0) {
                // Use earliest (oldest) year as valid start date
                const minJaar = Math.min(...jaren.map(Number));
                this.turtle.triple(
                    apparaatUri,
                    this.turtle.qname('dct', 'valid'),
                    this.turtle.literal(`${minJaar}-01-01/`)
                );
            }
        }

        // Parse technieken (techniques) if present
        if (apparaat.Technieken?.[0]?.Techniek) {
            this.parseTechnieken(apparaat.Technieken[0].Techniek, apparaatUri);
        }

        // Parse zuivering (purification) if present  
        if (apparaat.Zuivering?.[0]) {
            this.parseZuivering(apparaat.Zuivering[0], apparaatUri);
        }

        // Parse gekoppeldeActiviteiten if present
        if (apparaat.GekoppeldeActiviteiten?.[0]?.Activiteit) {
            this.parseGekoppeldeActiviteiten(apparaat.GekoppeldeActiviteiten[0].Activiteit, apparaatUri);
        }
    }

    parseTechnieken(techniekArray, parentUri) {
        if (!Array.isArray(techniekArray)) {
            techniekArray = [techniekArray];
        }

        const technieken = techniekArray
            .map(t => `${t.Techniek?.[0]} (${t.JaarIngebruikname?.[0]})`)
            .filter(t => t);

        if (technieken.length > 0) {
            this.turtle.triple(
                parentUri,
                this.turtle.qname('rdfs', 'comment'),
                this.turtle.literal(`Technieken: ${technieken.join(', ')}`, null, 'nl')
            );
        }
    }

    parseZuivering(zuiveringData, parentUri) {
        // Parse Verwijdering elements (removal/purification)
        const verwijderingen = zuiveringData.Verwijdering;
        if (!verwijderingen) return;

        const verwijderingenArray = Array.isArray(verwijderingen) ? verwijderingen : [verwijderingen];
        
        verwijderingenArray.forEach(verwijdering => {
            const stofNaam = verwijdering.VerontreinigendeStof?.[0];
            const rendement = verwijdering.Rendement?.[0];
            
            if (!stofNaam) return;
            
            // Create riepr:Stof instance
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

            // Link zuivering to apparaat via comment
            const comment = rendement 
                ? `Zuivering van ${stofNaam} (rendement: ${rendement}%)`
                : `Zuivering van: ${stofNaam}`;
                
            this.turtle.triple(
                parentUri,
                this.turtle.qname('rdfs', 'comment'),
                this.turtle.literal(comment, null, 'nl')
            );
        });
    }

    parseMeetmethoden(meetmethodenArray) {
        if (!Array.isArray(meetmethodenArray)) {
            meetmethodenArray = [meetmethodenArray];
        }

        meetmethodenArray.forEach((methode) => {
            const methodeId = methode.$.meetmethodeID;
            const stofNaam = methode.VerontreinigendeStof?.[0];
            const methodeNaam = methode.Meetmethode?.[0];
            const commentaar = methode.Commentaar?.[0];

            if (!methodeNaam) return;

            // Create MeetProcedure instance  
            const procedureId = `${this.cbbNumber}_meetprocedure_${methodeId}`;
            const procedureUri = this.turtle.qname('meetprocedure', procedureId);

            this.turtle.triple(
                procedureUri,
                this.turtle.qname('rdf', 'type'),
                this.turtle.qname('riepr', 'MeetProcedure')
            );

            this.turtle.triple(
                procedureUri,
                this.turtle.qname('rdfs', 'label'),
                this.turtle.literal(methodeNaam, null, 'nl')
            );

            // Create Stof if present
            if (stofNaam) {
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

                // Link procedure to substance via comment
                const comment = commentaar 
                    ? `Meet ${stofNaam} (${commentaar})`
                    : `Meet ${stofNaam}`;
                    
                this.turtle.triple(
                    procedureUri,
                    this.turtle.qname('rdfs', 'comment'),
                    this.turtle.literal(comment, null, 'nl')
                );
            }
        });
    }
}
