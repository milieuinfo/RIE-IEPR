-- Auto-generated from OWL/SHACL ontology
-- Generated: 2026-02-16T15:55:01.197Z

-- PostgreSQL DDL

-- Enum types
CREATE TYPE exploitatie_inzetbaar_systeem_target_type_enum AS ENUM ('INSTALLATIE', 'EMISSIEPUNT', 'ONTTREKKINGSPUNT', 'ABSTRACTEMISSIEPUNT', 'SCHOUW', 'GRONDWATERPUT', 'LOZINGSPUNT', 'MEETPUNT', 'APPARAAT');
CREATE TYPE proces_geimplementeerd_door_target_type_enum AS ENUM ('INSTALLATIE', 'EMISSIEPUNT', 'ONTTREKKINGSPUNT', 'ABSTRACTEMISSIEPUNT', 'SCHOUW', 'GRONDWATERPUT', 'LOZINGSPUNT', 'MEETPUNT', 'APPARAAT');
CREATE TYPE systeem_heeft_subsysteem_target_type_enum AS ENUM ('INSTALLATIE', 'EMISSIEPUNT', 'ONTTREKKINGSPUNT', 'ABSTRACTEMISSIEPUNT', 'SCHOUW', 'GRONDWATERPUT', 'LOZINGSPUNT', 'MEETPUNT', 'APPARAAT');
CREATE TYPE proces_variabele_relatie_relationship_type_enum AS ENUM ('INPUT_VAR', 'OUTPUT_VAR');

CREATE TABLE abstract_emissiepunt (
    uri TEXT NULL,
    uuid UUID NULL,
    emissiepunt_uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    CONSTRAINT pk_abstract_emissiepunt PRIMARY KEY (emissiepunt_uuid, system_uuid)
);
COMMENT ON TABLE abstract_emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AbstractEmissiepunt';

CREATE TABLE adres (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NULL,
    straat TEXT NULL,
    stad TEXT NULL,
    postcode TEXT NULL

);
COMMENT ON COLUMN adres.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN adres.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN adres.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN adres.straat IS 'https://data.riepr.omgeving.vlaanderen.be/id/concept/straat';
COMMENT ON COLUMN adres.stad IS 'https://data.riepr.omgeving.vlaanderen.be/id/concept/stad';
COMMENT ON COLUMN adres.postcode IS 'https://data.riepr.omgeving.vlaanderen.be/id/concept/postcode';
COMMENT ON TABLE adres IS 'http://www.w3.org/ns/locn#Address';

CREATE TABLE agent (
    uri TEXT NULL,
    uuid UUID NULL

);
COMMENT ON TABLE agent IS 'http://dbpedia.org/ontology/Agent';

CREATE TABLE apparaat (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    benaming TEXT NOT NULL,
    geometrie TEXT NULL,
    spatial_object_uuid UUID NULL,
    CONSTRAINT pk_apparaat PRIMARY KEY (geldig_van, uuid, system_uuid, aangepast_op)
);
COMMENT ON COLUMN apparaat.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN apparaat.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN apparaat.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN apparaat.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN apparaat.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN apparaat.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON TABLE apparaat IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Apparaat';

CREATE TABLE contactpersoon (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    email TEXT NULL,
    telefoonnummer TEXT NULL,
    has_role TEXT NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    name TEXT NOT NULL,
    CONSTRAINT pk_contactpersoon PRIMARY KEY (geldig_van, uuid, aangepast_op)
);
COMMENT ON COLUMN contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN contactpersoon.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN contactpersoon.email IS 'http://xmlns.com/foaf/0.1/mbox';
COMMENT ON COLUMN contactpersoon.telefoonnummer IS 'http://xmlns.com/foaf/0.1/phone';
COMMENT ON COLUMN contactpersoon.has_role IS 'http://www.w3.org/ns/org#hasRole';
COMMENT ON COLUMN contactpersoon.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN contactpersoon.name IS 'http://xmlns.com/foaf/0.1/name';
COMMENT ON TABLE contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';

CREATE TABLE emissiepunt (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    geometrie TEXT NULL,
    spatial_object_uuid UUID NULL,
    CONSTRAINT pk_emissiepunt PRIMARY KEY (geldig_van, uuid, system_uuid, aangepast_op)
);
COMMENT ON COLUMN emissiepunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN emissiepunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN emissiepunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN emissiepunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON TABLE emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';

CREATE TABLE exploitant (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    benaming TEXT NOT NULL,
    agent_uuid UUID NULL,
    CONSTRAINT pk_exploitant PRIMARY KEY (geldig_van, uuid, aangepast_op)
);
COMMENT ON COLUMN exploitant.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitant.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitant.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON TABLE exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';

CREATE TABLE exploitatie (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    CONSTRAINT pk_exploitatie PRIMARY KEY (geldig_van, uuid, aangepast_op)
);
COMMENT ON COLUMN exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON TABLE exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';

CREATE TABLE exploitatie_identifier (
    geldig_tot DATE NULL,
    exploitatie_uuid UUID NOT NULL,
    in_scheme TEXT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_exploitatie_identifier PRIMARY KEY (exploitatie_uuid, notation)
);
COMMENT ON COLUMN exploitatie_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie_identifier.exploitatie_uuid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN exploitatie_identifier.in_scheme IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN exploitatie_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN exploitatie_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE exploitatie_locatie (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NULL,
    aangepast_op TIMESTAMP NOT NULL,
    benaming TEXT NOT NULL,
    beinvloed_door TEXT NULL,
    geometrie TEXT NULL,
    CONSTRAINT pk_exploitatie_locatie PRIMARY KEY (geldig_van, aangepast_op)
);
COMMENT ON COLUMN exploitatie_locatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_locatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_locatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie_locatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatie_locatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie_locatie.beinvloed_door IS 'http://www.w3.org/ns/prov#wasInfluencedBy';
COMMENT ON COLUMN exploitatie_locatie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
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
    uuid UUID NULL,
    onttrekkingspunt_uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    diepte DOUBLE PRECISION NOT NULL,
    CONSTRAINT pk_grondwaterput PRIMARY KEY (onttrekkingspunt_uuid, system_uuid)
);
COMMENT ON COLUMN grondwaterput.diepte IS 'http://dbpedia.org/ontology/depth';
COMMENT ON TABLE grondwaterput IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Grondwaterput';

CREATE TABLE installatie (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    CONSTRAINT pk_installatie PRIMARY KEY (geldig_van, uuid, system_uuid, aangepast_op)
);
COMMENT ON COLUMN installatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN installatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
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
    uuid UUID NULL,
    emissiepunt_uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    diepte DOUBLE PRECISION NULL,
    CONSTRAINT pk_lozingspunt PRIMARY KEY (emissiepunt_uuid, system_uuid)
);
COMMENT ON COLUMN lozingspunt.diepte IS 'http://dbpedia.org/ontology/depth';
COMMENT ON TABLE lozingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozingspunt';

CREATE TABLE meetpunt (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    geometrie TEXT NULL,
    spatial_object_uuid UUID NULL,
    CONSTRAINT pk_meetpunt PRIMARY KEY (geldig_van, uuid, system_uuid, aangepast_op)
);
COMMENT ON COLUMN meetpunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meetpunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
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
    CONSTRAINT pk_observatie PRIMARY KEY (uuid)
);
COMMENT ON TABLE observatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie';

CREATE TABLE onttrekkingspunt (
    uri TEXT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    geometrie TEXT NULL,
    spatial_object_uuid UUID NULL,
    CONSTRAINT pk_onttrekkingspunt PRIMARY KEY (geldig_van, uuid, system_uuid, aangepast_op)
);
COMMENT ON COLUMN onttrekkingspunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN onttrekkingspunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN onttrekkingspunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN onttrekkingspunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON TABLE onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';

CREATE TABLE proces (
    uri TEXT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    uuid UUID NOT NULL,
    aangepast_op TIMESTAMP NOT NULL,
    benaming TEXT NOT NULL,
    CONSTRAINT pk_proces PRIMARY KEY (uuid)
);
COMMENT ON COLUMN proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN proces.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON TABLE proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';

CREATE TABLE proces_variabele (
    uri TEXT NULL,
    uuid UUID NOT NULL,
    benaming TEXT NOT NULL,
    eenheid DOUBLE PRECISION NULL,
    waarde TEXT NULL,
    CONSTRAINT pk_proces_variabele PRIMARY KEY (uuid)
);
COMMENT ON COLUMN proces_variabele.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces_variabele.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN proces_variabele.waarde IS 'http://qudt.org/schema/qudt/numericValue';
COMMENT ON TABLE proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele';

CREATE TABLE schouw (
    uri TEXT NULL,
    uuid UUID NULL,
    emissiepunt_uuid UUID NOT NULL,
    system_uuid UUID NOT NULL,
    diameter DOUBLE PRECISION NOT NULL,
    hoogte DOUBLE PRECISION NOT NULL,
    CONSTRAINT pk_schouw PRIMARY KEY (emissiepunt_uuid, system_uuid)
);
COMMENT ON COLUMN schouw.diameter IS 'http://dbpedia.org/ontology/diameter';
COMMENT ON COLUMN schouw.hoogte IS 'http://dbpedia.org/ontology/height';
COMMENT ON TABLE schouw IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Schouw';

CREATE TABLE spatial_object (
    uri TEXT NULL,
    uuid UUID NULL

);
COMMENT ON TABLE spatial_object IS 'http://www.opengis.net/ont/geosparql#SpatialObject';

CREATE TABLE systeem (
    uri TEXT NULL,
    uuid UUID NULL,
    agent_uuid UUID NULL

);
COMMENT ON TABLE systeem IS 'http://www.w3.org/ns/sosa/System';

CREATE TABLE contactpersoon_exploitant_exploitant (
    contactpersoon_uuid UUID NOT NULL,
    exploitant_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_contactpersoon_exploitant_exploitant PRIMARY KEY (contactpersoon_uuid, exploitant_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE contactpersoon_adres_adres (
    contactpersoon_uuid UUID NOT NULL,
    adres_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_contactpersoon_adres_adres PRIMARY KEY (contactpersoon_uuid, adres_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_locatie_toegewezen_aan_exploitant (
    exploitatie_locatie_uuid UUID NOT NULL,
    exploitant_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_locatie_toegewezen_aan_exploitant PRIMARY KEY (exploitatie_locatie_uuid, exploitant_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_locatie_revisie_van_exploitatie_locatie (
    exploitatie_locatie_uuid_from UUID NOT NULL,
    exploitatie_locatie_uuid_to UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_locatie_revisie_van_exploitatie_locatie PRIMARY KEY (exploitatie_locatie_uuid_from, exploitatie_locatie_uuid_to, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_locatie_adres_adres (
    exploitatie_locatie_uuid UUID NOT NULL,
    adres_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_locatie_adres_adres PRIMARY KEY (exploitatie_locatie_uuid, adres_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_inzetbaar_systeem (
    exploitatie_inzetbaar_systeem_uuid UUID NOT NULL,
    exploitatie_uuid UUID NULL,
    target_uuid UUID NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_inzetbaar_systeem PRIMARY KEY (exploitatie_inzetbaar_systeem_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE exploitatie_locatie_exploitatie_locatie (
    exploitatie_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_exploitatie_locatie_exploitatie_locatie PRIMARY KEY (exploitatie_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE proces_revisie_van_proces (
    proces_uuid_from UUID NOT NULL,
    proces_uuid_to UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_proces_revisie_van_proces PRIMARY KEY (proces_uuid_from, proces_uuid_to, geldig_van, aangemaakt_op)
);

CREATE TABLE proces_type_proces (
    proces_uuid_from UUID NOT NULL,
    proces_uuid_to UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_proces_type_proces PRIMARY KEY (proces_uuid_from, proces_uuid_to, geldig_van, aangemaakt_op)
);

CREATE TABLE proces_geimplementeerd_door (
    proces_geimplementeerd_door_uuid UUID NOT NULL,
    proces_uuid UUID NULL,
    target_uuid UUID NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_proces_geimplementeerd_door PRIMARY KEY (proces_geimplementeerd_door_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE proces_onderdeel_van_proces (
    proces_uuid_from UUID NOT NULL,
    proces_uuid_to UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_proces_onderdeel_van_proces PRIMARY KEY (proces_uuid_from, proces_uuid_to, geldig_van, aangemaakt_op)
);

CREATE TABLE observatie_has_feature_of_interest_meetpunt (
    observatie_uuid UUID NOT NULL,
    meetpunt_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_observatie_has_feature_of_interest_meetpunt PRIMARY KEY (observatie_uuid, meetpunt_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE systeem_locatie_exploitatie_locatie (
    systeem_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_systeem_locatie_exploitatie_locatie PRIMARY KEY (systeem_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE agent_adres_adres (
    agent_uuid UUID NOT NULL,
    adres_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_agent_adres_adres PRIMARY KEY (agent_uuid, adres_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE systeem_heeft_subsysteem (
    systeem_heeft_subsysteem_uuid UUID NOT NULL,
    systeem_uuid UUID NULL,
    target_uuid UUID NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_systeem_heeft_subsysteem PRIMARY KEY (systeem_heeft_subsysteem_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE systeem_implementeert_proces (
    systeem_uuid UUID NOT NULL,
    proces_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_systeem_implementeert_proces PRIMARY KEY (systeem_uuid, proces_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE systeem_revisie_van_installatie (
    systeem_uuid UUID NOT NULL,
    installatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_systeem_revisie_van_installatie PRIMARY KEY (systeem_uuid, installatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE spatial_object_locatie_exploitatie_locatie (
    spatial_object_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_spatial_object_locatie_exploitatie_locatie PRIMARY KEY (spatial_object_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
);

CREATE TABLE agent_locatie_exploitatie_locatie (
    agent_uuid UUID NOT NULL,
    exploitatie_locatie_uuid UUID NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    CONSTRAINT pk_agent_locatie_exploitatie_locatie PRIMARY KEY (agent_uuid, exploitatie_locatie_uuid, geldig_van, aangemaakt_op)
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

-- Indexes
CREATE INDEX idx_abstract_emissiepunt_emissiepunt_uuid ON abstract_emissiepunt(emissiepunt_uuid);
CREATE INDEX idx_abstract_emissiepunt_system_uuid ON abstract_emissiepunt(system_uuid);
CREATE INDEX idx_apparaat_system_uuid ON apparaat(system_uuid);
CREATE INDEX idx_apparaat_locatie_id ON apparaat(locatie_id);
CREATE INDEX idx_apparaat_spatial_object_uuid ON apparaat(spatial_object_uuid);
CREATE INDEX idx_contactpersoon_exploitant_id ON contactpersoon(exploitant_id);
CREATE INDEX idx_contactpersoon_adres_id ON contactpersoon(adres_id);
CREATE INDEX idx_emissiepunt_system_uuid ON emissiepunt(system_uuid);
CREATE INDEX idx_emissiepunt_locatie_id ON emissiepunt(locatie_id);
CREATE INDEX idx_emissiepunt_spatial_object_uuid ON emissiepunt(spatial_object_uuid);
CREATE INDEX idx_exploitant_adres_id ON exploitant(adres_id);
CREATE INDEX idx_exploitant_agent_uuid ON exploitant(agent_uuid);
CREATE INDEX idx_exploitatie_inzetbaar_systeem_id ON exploitatie(inzetbaar_systeem_id);
CREATE INDEX idx_exploitatie_locatie_id ON exploitatie(locatie_id);
CREATE INDEX idx_exploitatie_identifiers ON exploitatie(identifiers);
CREATE INDEX idx_exploitatie_locatie_toegewezen_aan_id ON exploitatie_locatie(toegewezen_aan_id);
CREATE INDEX idx_exploitatie_locatie_revisie_van_id ON exploitatie_locatie(revisie_van_id);
CREATE INDEX idx_exploitatie_locatie_adres_id ON exploitatie_locatie(adres_id);
CREATE INDEX idx_exploitatie_locatie_identifiers ON exploitatie_locatie(identifiers);
CREATE INDEX idx_grondwaterput_onttrekkingspunt_uuid ON grondwaterput(onttrekkingspunt_uuid);
CREATE INDEX idx_grondwaterput_system_uuid ON grondwaterput(system_uuid);
CREATE INDEX idx_installatie_system_uuid ON installatie(system_uuid);
CREATE INDEX idx_installatie_heeft_sub_systeem_id ON installatie(heeft_sub_systeem_id);
CREATE INDEX idx_installatie_implementeert_id ON installatie(implementeert_id);
CREATE INDEX idx_installatie_locatie_id ON installatie(locatie_id);
CREATE INDEX idx_installatie_revisie_van_id ON installatie(revisie_van_id);
CREATE INDEX idx_installatie_identifiers ON installatie(identifiers);
CREATE INDEX idx_lozingspunt_emissiepunt_uuid ON lozingspunt(emissiepunt_uuid);
CREATE INDEX idx_lozingspunt_system_uuid ON lozingspunt(system_uuid);
CREATE INDEX idx_meetpunt_system_uuid ON meetpunt(system_uuid);
CREATE INDEX idx_meetpunt_identifiers ON meetpunt(identifiers);
CREATE INDEX idx_meetpunt_spatial_object_uuid ON meetpunt(spatial_object_uuid);
CREATE INDEX idx_observatie_has_feature_of_interest_id ON observatie(has_feature_of_interest_id);
CREATE INDEX idx_onttrekkingspunt_system_uuid ON onttrekkingspunt(system_uuid);
CREATE INDEX idx_onttrekkingspunt_locatie_id ON onttrekkingspunt(locatie_id);
CREATE INDEX idx_onttrekkingspunt_spatial_object_uuid ON onttrekkingspunt(spatial_object_uuid);
CREATE INDEX idx_proces_revisie_van_id ON proces(revisie_van_id);
CREATE INDEX idx_proces_geimplementeerd_door_id ON proces(geimplementeerd_door_id);
CREATE INDEX idx_proces_heeft_invoer_id ON proces(heeft_invoer_id);
CREATE INDEX idx_proces_heeft_uitvoer_id ON proces(heeft_uitvoer_id);
CREATE INDEX idx_proces_onderdeel_van_id ON proces(onderdeel_van_id);
CREATE INDEX idx_schouw_emissiepunt_uuid ON schouw(emissiepunt_uuid);
CREATE INDEX idx_schouw_system_uuid ON schouw(system_uuid);
CREATE INDEX idx_systeem_locatie_id ON systeem(locatie_id);
CREATE INDEX idx_systeem_agent_uuid ON systeem(agent_uuid);
CREATE INDEX idx_contactpersoon_exploitant_exploitant_contactpersoon_uuid ON contactpersoon_exploitant_exploitant(contactpersoon_uuid);
CREATE INDEX idx_contactpersoon_exploitant_exploitant_exploitant_uuid ON contactpersoon_exploitant_exploitant(exploitant_uuid);
CREATE INDEX idx_contactpersoon_adres_adres_contactpersoon_uuid ON contactpersoon_adres_adres(contactpersoon_uuid);
CREATE INDEX idx_contactpersoon_adres_adres_adres_uuid ON contactpersoon_adres_adres(adres_uuid);
CREATE INDEX idx_exploitatie_locatie_toegewezen_aan_exploitant_exploitatie_locatie_uuid ON exploitatie_locatie_toegewezen_aan_exploitant(exploitatie_locatie_uuid);
CREATE INDEX idx_exploitatie_locatie_toegewezen_aan_exploitant_exploitant_uuid ON exploitatie_locatie_toegewezen_aan_exploitant(exploitant_uuid);
CREATE INDEX idx_exploitatie_locatie_revisie_van_exploitatie_locatie_exploitatie_locatie_uuid_from ON exploitatie_locatie_revisie_van_exploitatie_locatie(exploitatie_locatie_uuid_from);
CREATE INDEX idx_exploitatie_locatie_revisie_van_exploitatie_locatie_exploitatie_locatie_uuid_to ON exploitatie_locatie_revisie_van_exploitatie_locatie(exploitatie_locatie_uuid_to);
CREATE INDEX idx_exploitatie_locatie_adres_adres_exploitatie_locatie_uuid ON exploitatie_locatie_adres_adres(exploitatie_locatie_uuid);
CREATE INDEX idx_exploitatie_locatie_adres_adres_adres_uuid ON exploitatie_locatie_adres_adres(adres_uuid);
CREATE INDEX idx_exploitatie_inzetbaar_systeem_exploitatie_uuid ON exploitatie_inzetbaar_systeem(exploitatie_uuid);
CREATE INDEX idx_exploitatie_locatie_exploitatie_locatie_exploitatie_uuid ON exploitatie_locatie_exploitatie_locatie(exploitatie_uuid);
CREATE INDEX idx_exploitatie_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON exploitatie_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_proces_revisie_van_proces_proces_uuid_from ON proces_revisie_van_proces(proces_uuid_from);
CREATE INDEX idx_proces_revisie_van_proces_proces_uuid_to ON proces_revisie_van_proces(proces_uuid_to);
CREATE INDEX idx_proces_type_proces_proces_uuid_from ON proces_type_proces(proces_uuid_from);
CREATE INDEX idx_proces_type_proces_proces_uuid_to ON proces_type_proces(proces_uuid_to);
CREATE INDEX idx_proces_geimplementeerd_door_proces_uuid ON proces_geimplementeerd_door(proces_uuid);
CREATE INDEX idx_proces_onderdeel_van_proces_proces_uuid_from ON proces_onderdeel_van_proces(proces_uuid_from);
CREATE INDEX idx_proces_onderdeel_van_proces_proces_uuid_to ON proces_onderdeel_van_proces(proces_uuid_to);
CREATE INDEX idx_observatie_has_feature_of_interest_meetpunt_observatie_uuid ON observatie_has_feature_of_interest_meetpunt(observatie_uuid);
CREATE INDEX idx_observatie_has_feature_of_interest_meetpunt_meetpunt_uuid ON observatie_has_feature_of_interest_meetpunt(meetpunt_uuid);
CREATE INDEX idx_systeem_locatie_exploitatie_locatie_systeem_uuid ON systeem_locatie_exploitatie_locatie(systeem_uuid);
CREATE INDEX idx_systeem_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON systeem_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_agent_adres_adres_agent_uuid ON agent_adres_adres(agent_uuid);
CREATE INDEX idx_agent_adres_adres_adres_uuid ON agent_adres_adres(adres_uuid);
CREATE INDEX idx_systeem_heeft_subsysteem_systeem_uuid ON systeem_heeft_subsysteem(systeem_uuid);
CREATE INDEX idx_systeem_implementeert_proces_systeem_uuid ON systeem_implementeert_proces(systeem_uuid);
CREATE INDEX idx_systeem_implementeert_proces_proces_uuid ON systeem_implementeert_proces(proces_uuid);
CREATE INDEX idx_systeem_revisie_van_installatie_systeem_uuid ON systeem_revisie_van_installatie(systeem_uuid);
CREATE INDEX idx_systeem_revisie_van_installatie_installatie_uuid ON systeem_revisie_van_installatie(installatie_uuid);
CREATE INDEX idx_spatial_object_locatie_exploitatie_locatie_spatial_object_uuid ON spatial_object_locatie_exploitatie_locatie(spatial_object_uuid);
CREATE INDEX idx_spatial_object_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON spatial_object_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_agent_locatie_exploitatie_locatie_agent_uuid ON agent_locatie_exploitatie_locatie(agent_uuid);
CREATE INDEX idx_agent_locatie_exploitatie_locatie_exploitatie_locatie_uuid ON agent_locatie_exploitatie_locatie(exploitatie_locatie_uuid);
CREATE INDEX idx_proces_variabele_relatie_proces_uuid ON proces_variabele_relatie(proces_uuid);
CREATE INDEX idx_proces_variabele_relatie_proces_variabele_uuid ON proces_variabele_relatie(proces_variabele_uuid);
