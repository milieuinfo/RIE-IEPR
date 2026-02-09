-- Auto-generated from OWL/SHACL ontology
-- Generated: 2026-02-09T15:24:09.624Z

-- PostgreSQL DDL

-- Enum types
CREATE TYPE proces_toegewezen_aan_target_type_enum AS ENUM ('INSTALLATIE', 'EMISSIEPUNT', 'ONTTREKKINGSPUNT', 'SCHOUW', 'LOZINGSPUNT', 'MEETPUNT', 'APPARAAT', 'EXPLOITANT');
CREATE TYPE proces_variabele_relatie_relationship_type_enum AS ENUM ('INPUT_VAR', 'OUTPUT_VAR');

CREATE TABLE adres (
    uri TEXT NOT NULL,
    straat TEXT NULL,
    stad TEXT NULL,
    postcode TEXT NULL,
    CONSTRAINT pk_adres PRIMARY KEY (uri)
);
COMMENT ON COLUMN adres.straat IS 'http://www.w3.org/ns/locn#thoroughfare';
COMMENT ON COLUMN adres.stad IS 'http://www.w3.org/ns/locn#postName';
COMMENT ON COLUMN adres.postcode IS 'http://www.w3.org/ns/locn#postCode';
COMMENT ON TABLE adres IS 'http://www.w3.org/ns/locn#Address';

CREATE TABLE apparaat (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    locatie_id TEXT NOT NULL,
    benaming TEXT NOT NULL,
    CONSTRAINT pk_apparaat PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN apparaat.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN apparaat.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN apparaat.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN apparaat.locatie_id IS 'http://www.w3.org/ns/prov#atLocation';
COMMENT ON COLUMN apparaat.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON TABLE apparaat IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Apparaat';

CREATE TABLE contactpersoon (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    member_of_id TEXT NOT NULL,
    benaming TEXT NOT NULL,
    mbox TEXT NULL,
    phone TEXT NULL,
    has_role TEXT NOT NULL,
    address_id TEXT NULL,
    name TEXT NOT NULL,
    CONSTRAINT pk_contactpersoon PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN contactpersoon.member_of_id IS 'http://www.w3.org/ns/org#memberOf';
COMMENT ON COLUMN contactpersoon.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN contactpersoon.mbox IS 'http://xmlns.com/foaf/0.1/mbox';
COMMENT ON COLUMN contactpersoon.phone IS 'http://xmlns.com/foaf/0.1/phone';
COMMENT ON COLUMN contactpersoon.has_role IS 'http://www.w3.org/ns/org#hasRole';
COMMENT ON COLUMN contactpersoon.address_id IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN contactpersoon.name IS 'http://xmlns.com/foaf/0.1/name';
COMMENT ON TABLE contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';

CREATE TABLE emissiepunt (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    benaming TEXT NOT NULL,
    type TEXT NULL,
    locatie_id TEXT NOT NULL,
    CONSTRAINT pk_emissiepunt PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN emissiepunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN emissiepunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN emissiepunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN emissiepunt.locatie_id IS 'http://www.w3.org/ns/prov#atLocation';
COMMENT ON TABLE emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';

CREATE TABLE exploitant (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    type_id TEXT NOT NULL,
    benaming TEXT NOT NULL,
    address_id TEXT NULL,
    CONSTRAINT pk_exploitant PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN exploitant.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitant.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitant.type_id IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitant.address_id IS 'http://www.w3.org/ns/locn#address';
COMMENT ON TABLE exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';

CREATE TABLE exploitatie_locatie (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    benaming TEXT NOT NULL,
    beinvloed_door TEXT NULL,
    afgeleid_van_id TEXT NULL,
    CONSTRAINT pk_exploitatie_locatie PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN exploitatie_locatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_locatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_locatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie_locatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie_locatie.beinvloed_door IS 'http://www.w3.org/ns/prov#wasInfluencedBy';
COMMENT ON COLUMN exploitatie_locatie.afgeleid_van_id IS 'http://www.w3.org/ns/prov#wasDerivedFrom';
COMMENT ON TABLE exploitatie_locatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie';

CREATE TABLE exploitatie_locatie_identifier (
    geldig_van DATE NOT NULL,
    geldig_tot DATE NULL,
    exploitatie_locatie_uid TEXT NOT NULL,
    schema TEXT NOT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_exploitatie_locatie_identifier PRIMARY KEY (geldig_van, exploitatie_locatie_uid, schema, notation)
);
COMMENT ON COLUMN exploitatie_locatie_identifier.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_locatie_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie_locatie_identifier.exploitatie_locatie_uid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN exploitatie_locatie_identifier.schema IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN exploitatie_locatie_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN exploitatie_locatie_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE grondwaterput (
    uri TEXT NOT NULL,
    depth DOUBLE PRECISION NOT NULL,
    CONSTRAINT pk_grondwaterput PRIMARY KEY (uri)
);
COMMENT ON COLUMN grondwaterput.depth IS 'http://dbpedia.org/ontology/depth';
COMMENT ON TABLE grondwaterput IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Grondwaterput';

CREATE TABLE installatie (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    has_sub_system_id TEXT NULL,
    benaming TEXT NOT NULL,
    locatie_id TEXT NOT NULL,
    afgeleid_van_id TEXT NULL,
    CONSTRAINT pk_installatie PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN installatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie.has_sub_system_id IS 'http://www.w3.org/ns/ssn/hasSubSystem';
COMMENT ON COLUMN installatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN installatie.locatie_id IS 'http://www.w3.org/ns/prov#atLocation';
COMMENT ON COLUMN installatie.afgeleid_van_id IS 'http://www.w3.org/ns/prov#wasDerivedFrom';
COMMENT ON TABLE installatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';

CREATE TABLE installatie_identifier (
    geldig_van DATE NOT NULL,
    geldig_tot DATE NULL,
    installatie_uid TEXT NOT NULL,
    schema TEXT NOT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_installatie_identifier PRIMARY KEY (geldig_van, installatie_uid, schema, notation)
);
COMMENT ON COLUMN installatie_identifier.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie_identifier.installatie_uid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN installatie_identifier.schema IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN installatie_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN installatie_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE lozingspunt (
    uri TEXT NOT NULL,
    emissiepunt_id TEXT NULL,
    CONSTRAINT pk_lozingspunt PRIMARY KEY (uri)
);
COMMENT ON TABLE lozingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozingspunt';

CREATE TABLE meetpunt (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    benaming TEXT NOT NULL,
    type TEXT NULL,
    CONSTRAINT pk_meetpunt PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN meetpunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meetpunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON TABLE meetpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';

CREATE TABLE meetpunt_identifier (
    geldig_van DATE NOT NULL,
    geldig_tot DATE NULL,
    meetpunt_uid TEXT NOT NULL,
    schema TEXT NOT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_meetpunt_identifier PRIMARY KEY (geldig_van, meetpunt_uid, schema, notation)
);
COMMENT ON COLUMN meetpunt_identifier.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt_identifier.meetpunt_uid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN meetpunt_identifier.schema IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN meetpunt_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN meetpunt_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE observatie (
    uri TEXT NOT NULL,
    has_feature_of_interest_id TEXT NOT NULL,
    CONSTRAINT pk_observatie PRIMARY KEY (uri)
);
COMMENT ON COLUMN observatie.has_feature_of_interest_id IS 'http://www.w3.org/ns/sosa/hasFeatureOfInterest';
COMMENT ON TABLE observatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie';

CREATE TABLE onttrekkingspunt (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    benaming TEXT NOT NULL,
    type TEXT NULL,
    locatie_id TEXT NOT NULL,
    CONSTRAINT pk_onttrekkingspunt PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN onttrekkingspunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN onttrekkingspunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN onttrekkingspunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN onttrekkingspunt.locatie_id IS 'http://www.w3.org/ns/prov#atLocation';
COMMENT ON TABLE onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';

CREATE TABLE proces (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    benaming TEXT NOT NULL,
    locatie_id TEXT NOT NULL,
    onderdeel_van_id TEXT NULL,
    CONSTRAINT pk_proces PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN proces.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces.locatie_id IS 'http://www.w3.org/ns/prov#atLocation';
COMMENT ON COLUMN proces.onderdeel_van_id IS 'http://purl.org/net/p-plan#isStepOfPlan';
COMMENT ON TABLE proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';

CREATE TABLE proces_identifier (
    geldig_van DATE NOT NULL,
    geldig_tot DATE NULL,
    proces_uid TEXT NOT NULL,
    schema TEXT NOT NULL,
    notation TEXT NOT NULL,
    value TEXT NULL,
    CONSTRAINT pk_proces_identifier PRIMARY KEY (geldig_van, proces_uid, schema, notation)
);
COMMENT ON COLUMN proces_identifier.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_identifier.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces_identifier.proces_uid IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN proces_identifier.schema IS 'http://www.w3.org/2004/02/skos/core#inScheme';
COMMENT ON COLUMN proces_identifier.notation IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN proces_identifier.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';

CREATE TABLE proces_variabele (
    uri TEXT NOT NULL,
    geldig_van DATE NOT NULL,
    aangemaakt_op TIMESTAMP NOT NULL,
    geldig_tot DATE NULL,
    benaming TEXT NOT NULL,
    type TEXT NULL,
    eenheid TEXT NULL,
    waarde TEXT NULL,
    CONSTRAINT pk_proces_variabele PRIMARY KEY (uri, geldig_van, aangemaakt_op)
);
COMMENT ON COLUMN proces_variabele.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_variabele.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_variabele.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces_variabele.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces_variabele.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces_variabele.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN proces_variabele.waarde IS 'http://qudt.org/schema/qudt/hasNumericValue';
COMMENT ON TABLE proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele';

CREATE TABLE schouw (
    uri TEXT NOT NULL,
    emissiepunt_id TEXT NULL,
    diameter DOUBLE PRECISION NOT NULL,
    hoogte DOUBLE PRECISION NOT NULL,
    CONSTRAINT pk_schouw PRIMARY KEY (uri)
);
COMMENT ON COLUMN schouw.diameter IS 'http://dbpedia.org/ontology/diameter';
COMMENT ON COLUMN schouw.hoogte IS 'http://dbpedia.org/ontology/height';
COMMENT ON TABLE schouw IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Schouw';

CREATE TABLE proces_toegewezen_aan (
    proces_uri TEXT NOT NULL,
    target_uri TEXT NOT NULL,
    target_type proces_toegewezen_aan_target_type_enum NULL,
    CONSTRAINT pk_proces_toegewezen_aan PRIMARY KEY (proces_uri, target_uri)
);

CREATE TABLE proces_gaat_vooraf_aan_proces (
    proces_uri_from TEXT NOT NULL,
    proces_uri_to TEXT NOT NULL,
    CONSTRAINT pk_proces_gaat_vooraf_aan_proces PRIMARY KEY (proces_uri_from, proces_uri_to)
);

CREATE TABLE exploitatie_locatie_toegewezen_aan_exploitant (
    exploitatie_locatie_uri TEXT NOT NULL,
    exploitant_uri TEXT NOT NULL,
    CONSTRAINT pk_exploitatie_locatie_toegewezen_aan_exploitant PRIMARY KEY (exploitatie_locatie_uri, exploitant_uri)
);

CREATE TABLE proces_variabele_relatie (
    proces_uri TEXT NOT NULL,
    proces_variabele_uri TEXT NOT NULL,
    relationship_type proces_variabele_relatie_relationship_type_enum NOT NULL,
    CONSTRAINT pk_proces_variabele_relatie PRIMARY KEY (proces_uri, proces_variabele_uri, relationship_type)
);

-- Foreign Key Constraints
ALTER TABLE apparaat ADD CONSTRAINT fk_apparaat_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE contactpersoon ADD CONSTRAINT fk_contactpersoon_member_of_id FOREIGN KEY (member_of_id) REFERENCES exploitant(uri);
ALTER TABLE contactpersoon ADD CONSTRAINT fk_contactpersoon_address_id FOREIGN KEY (address_id) REFERENCES adres(uri);
ALTER TABLE emissiepunt ADD CONSTRAINT fk_emissiepunt_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE exploitant ADD CONSTRAINT fk_exploitant_type_id FOREIGN KEY (type_id) REFERENCES contactpersoon(uri);
ALTER TABLE exploitant ADD CONSTRAINT fk_exploitant_address_id FOREIGN KEY (address_id) REFERENCES adres(uri);
ALTER TABLE exploitatie_locatie ADD CONSTRAINT fk_exploitatie_locatie_afgeleid_van_id FOREIGN KEY (afgeleid_van_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE exploitatie_locatie_identifier ADD CONSTRAINT fk_exploitatie_locatie_identifier_exploitatie_locatie_uid FOREIGN KEY (exploitatie_locatie_uid) REFERENCES exploitatie_locatie(uri);
ALTER TABLE installatie ADD CONSTRAINT fk_installatie_has_sub_system_id FOREIGN KEY (has_sub_system_id) REFERENCES proces(uri);
ALTER TABLE installatie ADD CONSTRAINT fk_installatie_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE installatie ADD CONSTRAINT fk_installatie_afgeleid_van_id FOREIGN KEY (afgeleid_van_id) REFERENCES installatie(uri);
ALTER TABLE installatie_identifier ADD CONSTRAINT fk_installatie_identifier_installatie_uid FOREIGN KEY (installatie_uid) REFERENCES installatie(uri);
ALTER TABLE lozingspunt ADD CONSTRAINT fk_lozingspunt_emissiepunt_id FOREIGN KEY (emissiepunt_id) REFERENCES emissiepunt(uri);
ALTER TABLE meetpunt_identifier ADD CONSTRAINT fk_meetpunt_identifier_meetpunt_uid FOREIGN KEY (meetpunt_uid) REFERENCES meetpunt(uri);
ALTER TABLE observatie ADD CONSTRAINT fk_observatie_has_feature_of_interest_id FOREIGN KEY (has_feature_of_interest_id) REFERENCES meetpunt(uri);
ALTER TABLE onttrekkingspunt ADD CONSTRAINT fk_onttrekkingspunt_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE proces ADD CONSTRAINT fk_proces_locatie_id FOREIGN KEY (locatie_id) REFERENCES exploitatie_locatie(uri);
ALTER TABLE proces ADD CONSTRAINT fk_proces_onderdeel_van_id FOREIGN KEY (onderdeel_van_id) REFERENCES proces(uri);
ALTER TABLE proces_identifier ADD CONSTRAINT fk_proces_identifier_proces_uid FOREIGN KEY (proces_uid) REFERENCES proces(uri);
ALTER TABLE schouw ADD CONSTRAINT fk_schouw_emissiepunt_id FOREIGN KEY (emissiepunt_id) REFERENCES emissiepunt(uri);
ALTER TABLE proces_toegewezen_aan ADD CONSTRAINT fk_proces_toegewezen_aan_proces_uri FOREIGN KEY (proces_uri) REFERENCES proces(uri);
ALTER TABLE proces_gaat_vooraf_aan_proces ADD CONSTRAINT fk_proces_gaat_vooraf_aan_proces_proces_uri_from FOREIGN KEY (proces_uri_from) REFERENCES proces(uri);
ALTER TABLE proces_gaat_vooraf_aan_proces ADD CONSTRAINT fk_proces_gaat_vooraf_aan_proces_proces_uri_to FOREIGN KEY (proces_uri_to) REFERENCES proces(uri);
ALTER TABLE exploitatie_locatie_toegewezen_aan_exploitant ADD CONSTRAINT fk_exploitatie_locatie_toegewezen_aan_exploitant_exploitatie_lo FOREIGN KEY (exploitatie_locatie_uri) REFERENCES exploitatie_locatie(uri);
ALTER TABLE exploitatie_locatie_toegewezen_aan_exploitant ADD CONSTRAINT fk_exploitatie_locatie_toegewezen_aan_exploitant_exploitant_uri FOREIGN KEY (exploitant_uri) REFERENCES exploitant(uri);
ALTER TABLE proces_variabele_relatie ADD CONSTRAINT fk_proces_variabele_relatie_proces_uri FOREIGN KEY (proces_uri) REFERENCES proces(uri);
ALTER TABLE proces_variabele_relatie ADD CONSTRAINT fk_proces_variabele_relatie_proces_variabele_uri FOREIGN KEY (proces_variabele_uri) REFERENCES proces_variabele(uri);

-- Indexes
CREATE INDEX idx_apparaat_locatie_id ON apparaat(locatie_id);
CREATE INDEX idx_contactpersoon_member_of_id ON contactpersoon(member_of_id);
CREATE INDEX idx_contactpersoon_address_id ON contactpersoon(address_id);
CREATE INDEX idx_emissiepunt_locatie_id ON emissiepunt(locatie_id);
CREATE INDEX idx_exploitant_type_id ON exploitant(type_id);
CREATE INDEX idx_exploitant_address_id ON exploitant(address_id);
CREATE INDEX idx_exploitatie_locatie_afgeleid_van_id ON exploitatie_locatie(afgeleid_van_id);
CREATE INDEX idx_exploitatie_locatie_identifiers ON exploitatie_locatie(identifiers);
CREATE INDEX idx_installatie_has_sub_system_id ON installatie(has_sub_system_id);
CREATE INDEX idx_installatie_locatie_id ON installatie(locatie_id);
CREATE INDEX idx_installatie_afgeleid_van_id ON installatie(afgeleid_van_id);
CREATE INDEX idx_installatie_identifiers ON installatie(identifiers);
CREATE INDEX idx_lozingspunt_emissiepunt_id ON lozingspunt(emissiepunt_id);
CREATE INDEX idx_meetpunt_identifiers ON meetpunt(identifiers);
CREATE INDEX idx_observatie_has_feature_of_interest_id ON observatie(has_feature_of_interest_id);
CREATE INDEX idx_onttrekkingspunt_locatie_id ON onttrekkingspunt(locatie_id);
CREATE INDEX idx_proces_locatie_id ON proces(locatie_id);
CREATE INDEX idx_proces_onderdeel_van_id ON proces(onderdeel_van_id);
CREATE INDEX idx_proces_identifiers ON proces(identifiers);
CREATE INDEX idx_schouw_emissiepunt_id ON schouw(emissiepunt_id);
CREATE INDEX idx_proces_toegewezen_aan_proces_uri ON proces_toegewezen_aan(proces_uri);
CREATE INDEX idx_proces_gaat_vooraf_aan_proces_proces_uri_from ON proces_gaat_vooraf_aan_proces(proces_uri_from);
CREATE INDEX idx_proces_gaat_vooraf_aan_proces_proces_uri_to ON proces_gaat_vooraf_aan_proces(proces_uri_to);
CREATE INDEX idx_exploitatie_locatie_toegewezen_aan_exploitant_exploitatie_locatie_uri ON exploitatie_locatie_toegewezen_aan_exploitant(exploitatie_locatie_uri);
CREATE INDEX idx_exploitatie_locatie_toegewezen_aan_exploitant_exploitant_uri ON exploitatie_locatie_toegewezen_aan_exploitant(exploitant_uri);
CREATE INDEX idx_proces_variabele_relatie_proces_uri ON proces_variabele_relatie(proces_uri);
CREATE INDEX idx_proces_variabele_relatie_proces_variabele_uri ON proces_variabele_relatie(proces_variabele_uri);
