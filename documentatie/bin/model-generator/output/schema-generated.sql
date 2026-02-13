-- Auto-generated from OWL/SHACL ontology
-- Generated: 2026-02-13T23:32:02.471Z

-- PostgreSQL DDL

-- Enum types
CREATE TYPE exploitatie_deployed_system_target_type_enum AS ENUM ('INSTALLATIE', 'EMISSIEPUNT', 'ACTUATOR', 'ONTTREKKINGSPUNT', 'ABSTRACTEMISSIEPUNT', 'SCHOUW', 'GRONDWATERPUT', 'LOZINGSPUNT', 'MEETPUNT', 'APPARAAT');
CREATE TYPE installatie_heeft_subsysteem_target_type_enum AS ENUM ('INSTALLATIE', 'EMISSIEPUNT', 'ACTUATOR', 'ONTTREKKINGSPUNT', 'ABSTRACTEMISSIEPUNT', 'SCHOUW', 'GRONDWATERPUT', 'LOZINGSPUNT', 'MEETPUNT', 'APPARAAT');
CREATE TYPE proces_variabele_relatie_relationship_type_enum AS ENUM ('INPUT_VAR', 'OUTPUT_VAR');

CREATE TABLE abstract_emissiepunt (
    uri TEXT NULL,
    uuid UUID NOT NULL,
    emissiepunt_uuid UUID NULL,
    CONSTRAINT pk_abstract_emissiepunt PRIMARY KEY (uuid)
);
COMMENT ON TABLE abstract_emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AbstractEmissiepunt';

CREATE TABLE adres (
    straat TEXT NULL,
    stad TEXT NULL,
    postcode TEXT NULL

);
COMMENT ON COLUMN adres.straat IS 'https://data.riepr.omgeving.vlaanderen.be/id/concept/straat';
COMMENT ON COLUMN adres.stad IS 'https://data.riepr.omgeving.vlaanderen.be/id/concept/stad';
COMMENT ON COLUMN adres.postcode IS 'https://data.riepr.omgeving.vlaanderen.be/id/concept/postcode';

CREATE TABLE apparaat (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    locatie_id TEXT NOT NULL,
    benaming TEXT NOT NULL,
    geometrie TEXT NULL,
    CONSTRAINT pk_apparaat PRIMARY KEY (uuid)
);
COMMENT ON COLUMN apparaat.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN apparaat.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN apparaat.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN apparaat.locatie_id IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN apparaat.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN apparaat.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON TABLE apparaat IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Apparaat';

CREATE TABLE contactpersoon (
    uri TEXT NULL,
    geldig_van DATE NULL,
    aangemaakt_op TIMESTAMP NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    exploitant_id TEXT NOT NULL,
    benaming TEXT NOT NULL,
    email TEXT NULL,
    telefoonnummer TEXT NULL,
    has_role TEXT NOT NULL,
    adres_id TEXT NULL,
    name TEXT NOT NULL,
    CONSTRAINT pk_contactpersoon PRIMARY KEY (uuid)
);
COMMENT ON COLUMN contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN contactpersoon.exploitant_id IS 'http://www.w3.org/ns/org#memberOf';
COMMENT ON COLUMN contactpersoon.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN contactpersoon.email IS 'http://xmlns.com/foaf/0.1/mbox';
COMMENT ON COLUMN contactpersoon.telefoonnummer IS 'http://xmlns.com/foaf/0.1/phone';
COMMENT ON COLUMN contactpersoon.has_role IS 'http://www.w3.org/ns/org#hasRole';
COMMENT ON COLUMN contactpersoon.adres_id IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN contactpersoon.name IS 'http://xmlns.com/foaf/0.1/name';
COMMENT ON TABLE contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';

CREATE TABLE emissiepunt (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    type TEXT NULL,
    locatie_id TEXT NOT NULL,
    geometrie TEXT NULL,
    CONSTRAINT pk_emissiepunt PRIMARY KEY (uuid)
);
COMMENT ON COLUMN emissiepunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN emissiepunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN emissiepunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN emissiepunt.locatie_id IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN emissiepunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON TABLE emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';

CREATE TABLE exploitant (
    uri TEXT NULL,
    geldig_van DATE NULL,
    aangemaakt_op TIMESTAMP NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    type_id TEXT NOT NULL,
    benaming TEXT NOT NULL,
    adres_id TEXT NULL,
    CONSTRAINT pk_exploitant PRIMARY KEY (uuid)
);
COMMENT ON COLUMN exploitant.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitant.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitant.type_id IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitant.adres_id IS 'http://www.w3.org/ns/locn#address';
COMMENT ON TABLE exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';

CREATE TABLE exploitatie (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    deployed_system_id TEXT NULL,
    locatie_id TEXT NOT NULL,
    CONSTRAINT pk_exploitatie PRIMARY KEY (uuid)
);
COMMENT ON COLUMN exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie.deployed_system_id IS 'http://www.w3.org/ns/ssn/deployedSystem';
COMMENT ON COLUMN exploitatie.locatie_id IS 'http://www.w3.org/ns/ssn/deployedOnPlatform';
COMMENT ON TABLE exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';

CREATE TABLE exploitatie_locatie (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    toegewezen_aan_id TEXT NOT NULL,
    beinvloed_door TEXT NULL,
    afgeleid_van_id TEXT NULL,
    geometrie TEXT NULL,
    adres_id TEXT NULL,
    CONSTRAINT pk_exploitatie_locatie PRIMARY KEY (uuid)
);
COMMENT ON COLUMN exploitatie_locatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_locatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_locatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie_locatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie_locatie.toegewezen_aan_id IS 'http://www.w3.org/ns/prov#wasAttributedTo';
COMMENT ON COLUMN exploitatie_locatie.beinvloed_door IS 'http://www.w3.org/ns/prov#wasInfluencedBy';
COMMENT ON COLUMN exploitatie_locatie.afgeleid_van_id IS 'http://www.w3.org/ns/prov#wasDerivedFrom';
COMMENT ON COLUMN exploitatie_locatie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN exploitatie_locatie.adres_id IS 'http://www.w3.org/ns/locn#address';
COMMENT ON TABLE exploitatie_locatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie';

CREATE TABLE exploitatie_locatie_identifier (
    geldig_tot DATE NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    in_scheme TEXT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_exploitatie_locatie_identifier PRIMARY KEY (exploitatie_locatie_uuid, notation)
);
COMMENT ON COLUMN exploitatie_locatie_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie_locatie_identifier.exploitatie_locatie_uuid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN exploitatie_locatie_identifier.in_scheme IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN exploitatie_locatie_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN exploitatie_locatie_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE grondwaterput (
    uri TEXT NULL,
    uuid UUID NOT NULL,
    onttrekkingspunt_uuid UUID NULL,
    diepte DOUBLE PRECISION NOT NULL,
    CONSTRAINT pk_grondwaterput PRIMARY KEY (uuid)
);
COMMENT ON COLUMN grondwaterput.diepte IS 'http://dbpedia.org/ontology/depth';
COMMENT ON TABLE grondwaterput IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Grondwaterput';

CREATE TABLE installatie (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    heeft_sub_systeem_id TEXT NULL,
    benaming TEXT NOT NULL,
    locatie_id TEXT NOT NULL,
    afgeleid_van_id TEXT NULL,
    CONSTRAINT pk_installatie PRIMARY KEY (uuid)
);
COMMENT ON COLUMN installatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie.heeft_sub_systeem_id IS 'http://www.w3.org/ns/ssn/hasSubSystem';
COMMENT ON COLUMN installatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN installatie.locatie_id IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN installatie.afgeleid_van_id IS 'http://www.w3.org/ns/prov#wasDerivedFrom';
COMMENT ON TABLE installatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';

CREATE TABLE installatie_identifier (
    geldig_tot DATE NULL,
    installatie_uuid UUID NOT NULL,
    in_scheme TEXT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_installatie_identifier PRIMARY KEY (installatie_uuid, notation)
);
COMMENT ON COLUMN installatie_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie_identifier.installatie_uuid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN installatie_identifier.in_scheme IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN installatie_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN installatie_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE lozingspunt (
    uri TEXT NULL,
    uuid UUID NOT NULL,
    emissiepunt_uuid UUID NULL,
    diepte DOUBLE PRECISION NULL,
    CONSTRAINT pk_lozingspunt PRIMARY KEY (uuid)
);
COMMENT ON COLUMN lozingspunt.diepte IS 'http://dbpedia.org/ontology/depth';
COMMENT ON TABLE lozingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozingspunt';

CREATE TABLE meetpunt (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    type TEXT NULL,
    geometrie TEXT NULL,
    CONSTRAINT pk_meetpunt PRIMARY KEY (uuid)
);
COMMENT ON COLUMN meetpunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meetpunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meetpunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON TABLE meetpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';

CREATE TABLE meetpunt_identifier (
    geldig_tot DATE NULL,
    meetpunt_uuid UUID NOT NULL,
    in_scheme TEXT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_meetpunt_identifier PRIMARY KEY (meetpunt_uuid, notation)
);
COMMENT ON COLUMN meetpunt_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt_identifier.meetpunt_uuid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN meetpunt_identifier.in_scheme IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN meetpunt_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN meetpunt_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE observatie (
    uri TEXT NULL,
    uuid UUID NOT NULL,
    has_feature_of_interest_id TEXT NOT NULL,
    CONSTRAINT pk_observatie PRIMARY KEY (uuid)
);
COMMENT ON COLUMN observatie.has_feature_of_interest_id IS 'http://www.w3.org/ns/sosa/hasFeatureOfInterest';
COMMENT ON TABLE observatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie';

CREATE TABLE onttrekkingspunt (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    type TEXT NULL,
    locatie_id TEXT NOT NULL,
    geometrie TEXT NULL,
    CONSTRAINT pk_onttrekkingspunt PRIMARY KEY (uuid)
);
COMMENT ON COLUMN onttrekkingspunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN onttrekkingspunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN onttrekkingspunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN onttrekkingspunt.locatie_id IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN onttrekkingspunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON TABLE onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';

CREATE TABLE proces (
    uri TEXT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    heeft_invoer_id TEXT NULL,
    heeft_uitvoer_id TEXT NULL,
    onderdeel_van_id TEXT NULL,
    gebruikt TEXT NULL,
    CONSTRAINT pk_proces PRIMARY KEY (uuid)
);
COMMENT ON COLUMN proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces.heeft_invoer_id IS 'http://purl.org/net/p-plan#hasInputVar';
COMMENT ON COLUMN proces.heeft_uitvoer_id IS 'http://purl.org/net/p-plan#hasOutputVar';
COMMENT ON COLUMN proces.onderdeel_van_id IS 'http://purl.org/net/p-plan#isStepOfPlan';
COMMENT ON COLUMN proces.gebruikt IS 'hasInputVar__system';
COMMENT ON TABLE proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';

CREATE TABLE proces_identifier (
    geldig_tot DATE NULL,
    proces_uuid UUID NOT NULL,
    in_scheme TEXT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_proces_identifier PRIMARY KEY (proces_uuid, notation)
);
COMMENT ON COLUMN proces_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces_identifier.proces_uuid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN proces_identifier.in_scheme IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN proces_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN proces_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE proces_variabele (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    type TEXT NULL,
    eenheid DOUBLE PRECISION NULL,
    waarde TEXT NULL,
    CONSTRAINT pk_proces_variabele PRIMARY KEY (uuid)
);
COMMENT ON COLUMN proces_variabele.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_variabele.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_variabele.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces_variabele.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces_variabele.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces_variabele.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN proces_variabele.waarde IS 'http://qudt.org/schema/qudt/numericValue';
COMMENT ON TABLE proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele';

CREATE TABLE schouw (
    uri TEXT NULL,
    uuid UUID NOT NULL,
    emissiepunt_uuid UUID NULL,
    diameter DOUBLE PRECISION NOT NULL,
    hoogte DOUBLE PRECISION NOT NULL,
    CONSTRAINT pk_schouw PRIMARY KEY (uuid)
);
COMMENT ON COLUMN schouw.diameter IS 'http://dbpedia.org/ontology/diameter';
COMMENT ON COLUMN schouw.hoogte IS 'http://dbpedia.org/ontology/height';
COMMENT ON TABLE schouw IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Schouw';

CREATE TABLE exploitant_type_contactpersoon (
    exploitant_uuid UUID NOT NULL,
    contactpersoon_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitant_type_contactpersoon PRIMARY KEY (exploitant_uuid, contactpersoon_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE contactpersoon_exploitant_exploitant (
    contactpersoon_uuid UUID NOT NULL,
    exploitant_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_contactpersoon_exploitant_exploitant PRIMARY KEY (contactpersoon_uuid, exploitant_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_locatie_toegewezen_aan_exploitant (
    exploitatie_locatie_uuid UUID NOT NULL,
    exploitant_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_locatie_toegewezen_aan_exploitant PRIMARY KEY (exploitatie_locatie_uuid, exploitant_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_locatie_afgeleid_van_exploitatie_locatie (
    exploitatie_locatie_uuid_from UUID NOT NULL,
    exploitatie_locatie_uuid_to UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_locatie_afgeleid_van_exploitatie_locatie PRIMARY KEY (exploitatie_locatie_uuid_from, exploitatie_locatie_uuid_to, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_deployed_system (
    exploitatie_uuid UUID NOT NULL,
    target_uuid UUID NOT NULL,
    target_type exploitatie_deployed_system_target_type_enum NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_deployed_system PRIMARY KEY (exploitatie_uuid, target_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_locatie_exploitatie_locatie (
    exploitatie_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_locatie_exploitatie_locatie PRIMARY KEY (exploitatie_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE proces_type_proces (
    proces_uuid_from UUID NOT NULL,
    proces_uuid_to UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_proces_type_proces PRIMARY KEY (proces_uuid_from, proces_uuid_to, geldig_van, aangemaakt_op)
);

CREATE TABLE proces_onderdeel_van_proces (
    proces_uuid_from UUID NOT NULL,
    proces_uuid_to UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_proces_onderdeel_van_proces PRIMARY KEY (proces_uuid_from, proces_uuid_to, geldig_van, aangemaakt_op)
);

CREATE TABLE installatie_heeft_subsysteem (
    installatie_uuid UUID NOT NULL,
    target_uuid UUID NOT NULL,
    target_type installatie_heeft_subsysteem_target_type_enum NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_installatie_heeft_subsysteem PRIMARY KEY (installatie_uuid, target_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE installatie_locatie_exploitatie_locatie (
    installatie_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_installatie_locatie_exploitatie_locatie PRIMARY KEY (installatie_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE installatie_afgeleid_van_installatie (
    installatie_uuid_from UUID NOT NULL,
    installatie_uuid_to UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_installatie_afgeleid_van_installatie PRIMARY KEY (installatie_uuid_from, installatie_uuid_to, geldig_van, aangemaakt_op)
);

CREATE TABLE emissiepunt_locatie_exploitatie_locatie (
    emissiepunt_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_emissiepunt_locatie_exploitatie_locatie PRIMARY KEY (emissiepunt_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE onttrekkingspunt_locatie_exploitatie_locatie (
    onttrekkingspunt_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_onttrekkingspunt_locatie_exploitatie_locatie PRIMARY KEY (onttrekkingspunt_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE apparaat_locatie_exploitatie_locatie (
    apparaat_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_apparaat_locatie_exploitatie_locatie PRIMARY KEY (apparaat_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE observatie_has_feature_of_interest_meetpunt (
    observatie_uuid UUID NOT NULL,
    meetpunt_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_observatie_has_feature_of_interest_meetpunt PRIMARY KEY (observatie_uuid, meetpunt_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE proces_variabele_relatie (
    proces_uuid UUID NOT NULL,
    proces_variabele_uuid UUID NOT NULL,
    relationship_type proces_variabele_relatie_relationship_type_enum NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_proces_variabele_relatie PRIMARY KEY (proces_uuid, proces_variabele_uuid, relationship_type, geldig_van, aangemaakt_op)
);

-- Foreign Key Constraints
ALTER TABLE apparaat ADD CONSTRAINT fk_apparaat_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE contactpersoon ADD CONSTRAINT fk_contactpersoon_exploitant_id FOREIGN KEY (exploitant_id) REFERENCES exploitant(uri);
ALTER TABLE contactpersoon ADD CONSTRAINT fk_contactpersoon_adres_id FOREIGN KEY (adres_id) REFERENCES adres(uri);
ALTER TABLE emissiepunt ADD CONSTRAINT fk_emissiepunt_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE exploitant ADD CONSTRAINT fk_exploitant_type_id FOREIGN KEY (type_id) REFERENCES contactpersoon(uri);
ALTER TABLE exploitant ADD CONSTRAINT fk_exploitant_adres_id FOREIGN KEY (adres_id) REFERENCES adres(uri);
ALTER TABLE exploitatie ADD CONSTRAINT fk_exploitatie_deployed_system_id FOREIGN KEY (deployed_system_id) REFERENCES installatie(uri);
ALTER TABLE exploitatie ADD CONSTRAINT fk_exploitatie_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE exploitatie_locatie ADD CONSTRAINT fk_exploitatie_locatie_toegewezen_aan_id FOREIGN KEY (toegewezen_aan_id) REFERENCES exploitant(uri);
ALTER TABLE exploitatie_locatie ADD CONSTRAINT fk_exploitatie_locatie_afgeleid_van_id FOREIGN KEY (afgeleid_van_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE exploitatie_locatie ADD CONSTRAINT fk_exploitatie_locatie_adres_id FOREIGN KEY (adres_id) REFERENCES adres(uri);
ALTER TABLE installatie ADD CONSTRAINT fk_installatie_heeft_sub_systeem_id FOREIGN KEY (heeft_sub_systeem_id) REFERENCES installatie(uri);
ALTER TABLE installatie ADD CONSTRAINT fk_installatie_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE installatie ADD CONSTRAINT fk_installatie_afgeleid_van_id FOREIGN KEY (afgeleid_van_id) REFERENCES installatie(uri);
ALTER TABLE observatie ADD CONSTRAINT fk_observatie_has_feature_of_interest_id FOREIGN KEY (has_feature_of_interest_id) REFERENCES meetpunt(uri);
ALTER TABLE onttrekkingspunt ADD CONSTRAINT fk_onttrekkingspunt_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE proces ADD CONSTRAINT fk_proces_heeft_invoer_id FOREIGN KEY (heeft_invoer_id) REFERENCES proces_variabele(uri);
ALTER TABLE proces ADD CONSTRAINT fk_proces_heeft_uitvoer_id FOREIGN KEY (heeft_uitvoer_id) REFERENCES proces_variabele(uri);
ALTER TABLE proces ADD CONSTRAINT fk_proces_onderdeel_van_id FOREIGN KEY (onderdeel_van_id) REFERENCES proces(uri);
ALTER TABLE proces ADD CONSTRAINT fk_proces_gebruikt FOREIGN KEY (gebruikt) REFERENCES system(uri);

-- Indexes
CREATE INDEX idx_abstract_emissiepunt_emissiepunt_uuid ON abstract_emissiepunt(emissiepunt_uuid);
CREATE INDEX idx_apparaat_locatie_id ON apparaat(locatie_id);
CREATE INDEX idx_contactpersoon_exploitant_id ON contactpersoon(exploitant_id);
CREATE INDEX idx_contactpersoon_adres_id ON contactpersoon(adres_id);
CREATE INDEX idx_emissiepunt_locatie_id ON emissiepunt(locatie_id);
CREATE INDEX idx_exploitant_type_id ON exploitant(type_id);
CREATE INDEX idx_exploitant_adres_id ON exploitant(adres_id);
CREATE INDEX idx_exploitatie_deployed_system_id ON exploitatie(deployed_system_id);
CREATE INDEX idx_exploitatie_locatie_id ON exploitatie(locatie_id);
CREATE INDEX idx_exploitatie_locatie_toegewezen_aan_id ON exploitatie_locatie(toegewezen_aan_id);
CREATE INDEX idx_exploitatie_locatie_afgeleid_van_id ON exploitatie_locatie(afgeleid_van_id);
CREATE INDEX idx_exploitatie_locatie_adres_id ON exploitatie_locatie(adres_id);
CREATE INDEX idx_exploitatie_locatie_identifiers ON exploitatie_locatie(identifiers);
CREATE INDEX idx_grondwaterput_onttrekkingspunt_uuid ON grondwaterput(onttrekkingspunt_uuid);
CREATE INDEX idx_installatie_heeft_sub_systeem_id ON installatie(heeft_sub_systeem_id);
CREATE INDEX idx_installatie_locatie_id ON installatie(locatie_id);
CREATE INDEX idx_installatie_afgeleid_van_id ON installatie(afgeleid_van_id);
CREATE INDEX idx_installatie_identifiers ON installatie(identifiers);
CREATE INDEX idx_lozingspunt_emissiepunt_uuid ON lozingspunt(emissiepunt_uuid);
CREATE INDEX idx_meetpunt_identifiers ON meetpunt(identifiers);
CREATE INDEX idx_observatie_has_feature_of_interest_id ON observatie(has_feature_of_interest_id);
CREATE INDEX idx_onttrekkingspunt_locatie_id ON onttrekkingspunt(locatie_id);
CREATE INDEX idx_proces_heeft_invoer_id ON proces(heeft_invoer_id);
CREATE INDEX idx_proces_heeft_uitvoer_id ON proces(heeft_uitvoer_id);
CREATE INDEX idx_proces_onderdeel_van_id ON proces(onderdeel_van_id);
CREATE INDEX idx_proces_identifiers ON proces(identifiers);
CREATE INDEX idx_proces_gebruikt ON proces(gebruikt);
CREATE INDEX idx_schouw_emissiepunt_uuid ON schouw(emissiepunt_uuid);
CREATE INDEX idx_exploitant_type_contactpersoon_exploitant_uuid ON exploitant_type_contactpersoon(exploitant_uuid);
CREATE INDEX idx_exploitant_type_contactpersoon_contactpersoon_uuid ON exploitant_type_contactpersoon(contactpersoon_uuid);
CREATE INDEX idx_contactpersoon_exploitant_exploitant_contactpersoon_uuid ON contactpersoon_exploitant_exploitant(contactpersoon_uuid);
CREATE INDEX idx_contactpersoon_exploitant_exploitant_exploitant_uuid ON contactpersoon_exploitant_exploitant(exploitant_uuid);
CREATE INDEX idx_exploitatie_locatie_toegewezen_aan_exploitant_exploitatie_locatie_uuid ON exploitatie_locatie_toegewezen_aan_exploitant(exploitatie_locatie_uuid);
CREATE INDEX idx_exploitatie_locatie_toegewezen_aan_exploitant_exploitant_uuid ON exploitatie_locatie_toegewezen_aan_exploitant(exploitant_uuid);
CREATE INDEX idx_exploitatie_locatie_afgeleid_van_exploitatie_locatie_exploitatie_locatie_uuid_from ON exploitatie_locatie_afgeleid_van_exploitatie_locatie(exploitatie_locatie_uuid_from);
CREATE INDEX idx_exploitatie_locatie_afgeleid_van_exploitatie_locatie_exploitatie_locatie_uuid_to ON exploitatie_locatie_afgeleid_van_exploitatie_locatie(exploitatie_locatie_uuid_to);
CREATE INDEX idx_exploitatie_deployed_system_exploitatie_uuid ON exploitatie_deployed_system(exploitatie_uuid);
CREATE INDEX idx_exploitatie_locatie_exploitatie_locatie_exploitatie_uuid ON exploitatie_locatie_exploitatie_locatie(exploitatie_uuid);
CREATE INDEX idx_exploitatie_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON exploitatie_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_proces_type_proces_proces_uuid_from ON proces_type_proces(proces_uuid_from);
CREATE INDEX idx_proces_type_proces_proces_uuid_to ON proces_type_proces(proces_uuid_to);
CREATE INDEX idx_proces_onderdeel_van_proces_proces_uuid_from ON proces_onderdeel_van_proces(proces_uuid_from);
CREATE INDEX idx_proces_onderdeel_van_proces_proces_uuid_to ON proces_onderdeel_van_proces(proces_uuid_to);
CREATE INDEX idx_installatie_heeft_subsysteem_installatie_uuid ON installatie_heeft_subsysteem(installatie_uuid);
CREATE INDEX idx_installatie_locatie_exploitatie_locatie_installatie_uuid ON installatie_locatie_exploitatie_locatie(installatie_uuid);
CREATE INDEX idx_installatie_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON installatie_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_installatie_afgeleid_van_installatie_installatie_uuid_from ON installatie_afgeleid_van_installatie(installatie_uuid_from);
CREATE INDEX idx_installatie_afgeleid_van_installatie_installatie_uuid_to ON installatie_afgeleid_van_installatie(installatie_uuid_to);
CREATE INDEX idx_emissiepunt_locatie_exploitatie_locatie_emissiepunt_uuid ON emissiepunt_locatie_exploitatie_locatie(emissiepunt_uuid);
CREATE INDEX idx_emissiepunt_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON emissiepunt_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_onttrekkingspunt_locatie_exploitatie_locatie_onttrekkingspunt_uuid ON onttrekkingspunt_locatie_exploitatie_locatie(onttrekkingspunt_uuid);
CREATE INDEX idx_onttrekkingspunt_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON onttrekkingspunt_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_apparaat_locatie_exploitatie_locatie_apparaat_uuid ON apparaat_locatie_exploitatie_locatie(apparaat_uuid);
CREATE INDEX idx_apparaat_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON apparaat_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_observatie_has_feature_of_interest_meetpunt_observatie_uuid ON observatie_has_feature_of_interest_meetpunt(observatie_uuid);
CREATE INDEX idx_observatie_has_feature_of_interest_meetpunt_meetpunt_uuid ON observatie_has_feature_of_interest_meetpunt(meetpunt_uuid);
CREATE INDEX idx_proces_variabele_relatie_proces_uuid ON proces_variabele_relatie(proces_uuid);
CREATE INDEX idx_proces_variabele_relatie_proces_variabele_uuid ON proces_variabele_relatie(proces_variabele_uuid);
