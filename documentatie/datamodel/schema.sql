-- Auto-generated SQL schema from ODDToolkit
-- Ontology: null
-- Generated: 2026-02-20T21:26:28.250069+01:00[Europe/Brussels]

-- http://www.w3.org/ns/sosa/Procedure
CREATE TYPE procedure AS ENUM (
  'VERBRUIK_PROCEDURE',
  'EMISSIE_PROCEDURE',
  'TRANSPORT_PROCEDURE',
  'MEET_PROCEDURE',
  'VERWERKING_PROCEDURE'
);

-- http://www.w3.org/ns/adms#Status
CREATE TYPE status AS ENUM (
  'GESLOTEN',
  'VOORGESTELD',
  'INACTIEF',
  'ACTIEF'
);

CREATE TYPE proces_proces_variabele_merge_type AS ENUM (
  'HEEFT_INVOER_PROCES_VARIABELE',
  'HEEFT_UITVOER_PROCES_VARIABELE'
);

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
CREATE TABLE proces (
  -- Foreign key referencing proces_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  type VARCHAR,
  -- Foreign key referencing systeem(uuid)
  geimplementeerd_door_uuid VARCHAR,
  geldig_tot DATE,
  geldig_van DATE,
  status VARCHAR,
  aangemaakt_op TIMESTAMP,
  -- Foreign key referencing proces_identity(uuid)
  revisie_van_uuid VARCHAR,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN proces.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces.geimplementeerd_door_uuid IS 'http://www.w3.org/ns/ssn/implementedBy';
COMMENT ON COLUMN proces.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces.revisie_van_uuid IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN proces.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN proces.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie
CREATE TABLE exploitatie_locatie (
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  -- Foreign key referencing exploitant_identity(uuid)
  toegewezen_aan_uuid VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  geometrie VARCHAR,
  geldig_van DATE,
  -- Foreign key referencing adres(uuid)
  adres_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  beinvloed_door VARCHAR,
  benaming VARCHAR,
  primaire_bron VARCHAR,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  revisie_van_uuid VARCHAR,
  same_as VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op, same_as)
);

COMMENT ON TABLE exploitatie_locatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie';
COMMENT ON COLUMN exploitatie_locatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_locatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatie_locatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitatie_locatie.toegewezen_aan_uuid IS 'http://www.w3.org/ns/prov#wasAttributedTo';
COMMENT ON COLUMN exploitatie_locatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie_locatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatie_locatie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN exploitatie_locatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_locatie.adres_uuid IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitatie_locatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_locatie.beinvloed_door IS 'http://www.w3.org/ns/prov#wasInfluencedBy';
COMMENT ON COLUMN exploitatie_locatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie_locatie.primaire_bron IS 'http://www.w3.org/ns/prov#hadPrimarySource';
COMMENT ON COLUMN exploitatie_locatie.revisie_van_uuid IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN exploitatie_locatie.same_as IS 'http://www.w3.org/2002/07/owl#sameAs';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: IDENTITY
CREATE TABLE proces_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE proces_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie
-- Table type: IDENTITY
CREATE TABLE exploitatie_locatie_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE exploitatie_locatie_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie';
COMMENT ON COLUMN exploitatie_locatie_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
CREATE TABLE emissiepunt (
  -- Foreign key referencing emissiepunt_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  geldig_van DATE,
  status VARCHAR,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  geometrie VARCHAR,
  type VARCHAR,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  locatie_uuid VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN emissiepunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN emissiepunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN emissiepunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN emissiepunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN emissiepunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN emissiepunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN emissiepunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN emissiepunt.locatie_uuid IS 'http://www.w3.org/ns/sosa/isHostedBy';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
CREATE TABLE meetpunt (
  -- Foreign key referencing meetpunt_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geometrie VARCHAR,
  type VARCHAR,
  geldig_tot DATE,
  status VARCHAR,
  geldig_van DATE,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  PRIMARY KEY (uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE meetpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meetpunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN meetpunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN meetpunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meetpunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN meetpunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN meetpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
CREATE TABLE onttrekkingspunt (
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  geldig_van DATE,
  benaming VARCHAR,
  aangepast_op TIMESTAMP,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  locatie_uuid VARCHAR,
  geldig_tot DATE,
  status VARCHAR,
  geometrie VARCHAR,
  type VARCHAR,
  aangemaakt_op TIMESTAMP,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN onttrekkingspunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN onttrekkingspunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN onttrekkingspunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN onttrekkingspunt.locatie_uuid IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN onttrekkingspunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN onttrekkingspunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN onttrekkingspunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN onttrekkingspunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN onttrekkingspunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: IDENTITY
CREATE TABLE emissiepunt_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE emissiepunt_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: IDENTITY
CREATE TABLE meetpunt_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE meetpunt_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: IDENTITY
CREATE TABLE onttrekkingspunt_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE onttrekkingspunt_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozing
CREATE TABLE lozing (
  -- Foreign key referencing emissie(uuid)
  emissie_uuid VARCHAR,
  PRIMARY KEY (emissie_uuid)
);

COMMENT ON TABLE lozing IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozing';
COMMENT ON COLUMN lozing.emissie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon
CREATE TABLE contactpersoon (
  -- Foreign key referencing contactpersoon_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  geldig_van DATE,
  email VARCHAR,
  name VARCHAR,
  beschrijving VARCHAR,
  aangepast_op TIMESTAMP,
  geldig_tot DATE,
  telefoonnummer VARCHAR,
  has_role VARCHAR,
  benaming VARCHAR,
  aangemaakt_op TIMESTAMP,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';
COMMENT ON COLUMN contactpersoon.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactpersoon.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN contactpersoon.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon.email IS 'http://xmlns.com/foaf/0.1/mbox';
COMMENT ON COLUMN contactpersoon.name IS 'http://xmlns.com/foaf/0.1/name';
COMMENT ON COLUMN contactpersoon.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN contactpersoon.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN contactpersoon.telefoonnummer IS 'http://xmlns.com/foaf/0.1/phone';
COMMENT ON COLUMN contactpersoon.has_role IS 'http://www.w3.org/ns/org#hasRole';
COMMENT ON COLUMN contactpersoon.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
CREATE TABLE exploitatie (
  -- Foreign key referencing exploitatie_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  geldig_tot DATE,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  status VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  implementeert_uuid VARCHAR,
  aangepast_op TIMESTAMP,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  locatie_uuid VARCHAR,
  benaming VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN exploitatie.implementeert_uuid IS 'http://www.w3.org/ns/ssn/implements';
COMMENT ON COLUMN exploitatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatie.locatie_uuid IS 'http://www.w3.org/ns/ssn/deployedOnPlatform';
COMMENT ON COLUMN exploitatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
CREATE TABLE exploitant (
  -- Foreign key referencing exploitant_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  benaming VARCHAR,
  -- Foreign key referencing adres(uuid)
  adres_uuid VARCHAR,
  type VARCHAR,
  geldig_van DATE,
  aangepast_op TIMESTAMP,
  geldig_tot DATE,
  aangemaakt_op TIMESTAMP,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN exploitant.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitant.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitant.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitant.adres_uuid IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitant.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN exploitant.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitant.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele
CREATE TABLE proces_variabele (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  eenheid VARCHAR,
  type VARCHAR,
  waarde DECIMAL,
  benaming VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele';
COMMENT ON COLUMN proces_variabele.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_variabele.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces_variabele.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN proces_variabele.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN proces_variabele.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces_variabele.waarde IS 'http://qudt.org/schema/qudt/numericValue';
COMMENT ON COLUMN proces_variabele.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Schouw
CREATE TABLE schouw (
  hoogte VARCHAR,
  diameter VARCHAR,
  -- Foreign key referencing emissiepunt(uuid)
  emissiepunt_uuid VARCHAR,
  PRIMARY KEY (emissiepunt_uuid)
);

COMMENT ON TABLE schouw IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Schouw';
COMMENT ON COLUMN schouw.hoogte IS 'http://dbpedia.org/ontology/height';
COMMENT ON COLUMN schouw.diameter IS 'http://dbpedia.org/ontology/diameter';
COMMENT ON COLUMN schouw.emissiepunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie
CREATE TABLE emissie (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE emissie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie';
COMMENT ON COLUMN emissie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN emissie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie
CREATE TABLE observatie (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  -- Foreign key referencing lozing(emissie_uuid)
  heeft_resultaat_emissie_uuid VARCHAR,
  -- Foreign key referencing emissie(uuid)
  heeft_aandachtspunt_uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE observatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie';
COMMENT ON COLUMN observatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN observatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN observatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN observatie.heeft_resultaat_emissie_uuid IS 'http://www.w3.org/ns/sosa/hasResult';
COMMENT ON COLUMN observatie.heeft_aandachtspunt_uuid IS 'http://www.w3.org/ns/sosa/hasFeatureOfInterest';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AbstractEmissiepunt
CREATE TABLE abstract_emissiepunt (
  -- Foreign key referencing emissiepunt(uuid)
  emissiepunt_uuid VARCHAR,
  PRIMARY KEY (emissiepunt_uuid)
);

COMMENT ON TABLE abstract_emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AbstractEmissiepunt';
COMMENT ON COLUMN abstract_emissiepunt.emissiepunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
CREATE TABLE installatie (
  -- Foreign key referencing installatie_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  locatie_uuid VARCHAR,
  status VARCHAR,
  geldig_van DATE,
  benaming VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  -- Foreign key referencing installatie_identity(uuid)
  revisie_van_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE installatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN installatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN installatie.locatie_uuid IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN installatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN installatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN installatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN installatie.revisie_van_uuid IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN installatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
CREATE TABLE filter (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN filter.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN filter.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Grondwaterput
CREATE TABLE grondwaterput (
  diepte VARCHAR,
  -- Foreign key referencing onttrekkingspunt(uuid)
  onttrekkingspunt_uuid VARCHAR,
  PRIMARY KEY (onttrekkingspunt_uuid)
);

COMMENT ON TABLE grondwaterput IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Grondwaterput';
COMMENT ON COLUMN grondwaterput.diepte IS 'http://dbpedia.org/ontology/depth';
COMMENT ON COLUMN grondwaterput.onttrekkingspunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozingspunt
CREATE TABLE lozingspunt (
  diepte VARCHAR,
  -- Foreign key referencing emissiepunt(uuid)
  emissiepunt_uuid VARCHAR,
  PRIMARY KEY (emissiepunt_uuid)
);

COMMENT ON TABLE lozingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozingspunt';
COMMENT ON COLUMN lozingspunt.diepte IS 'http://dbpedia.org/ontology/depth';
COMMENT ON COLUMN lozingspunt.emissiepunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon
-- Table type: IDENTITY
CREATE TABLE contactpersoon_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE contactpersoon_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';
COMMENT ON COLUMN contactpersoon_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: IDENTITY
CREATE TABLE exploitatie_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE exploitatie_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
-- Table type: IDENTITY
CREATE TABLE exploitant_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE exploitant_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN exploitant_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: IDENTITY
CREATE TABLE installatie_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE installatie_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- http://www.w3.org/ns/adms#Identifier
CREATE TABLE externe_identificator (
  schema VARCHAR,
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  value VARCHAR,
  notatie VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE externe_identificator IS 'http://www.w3.org/ns/adms#Identifier';
COMMENT ON COLUMN externe_identificator.schema IS 'http://www.w3.org/ns/adms#schemeAgency';
COMMENT ON COLUMN externe_identificator.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN externe_identificator.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN externe_identificator.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN externe_identificator.value IS 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value';
COMMENT ON COLUMN externe_identificator.notatie IS 'http://www.w3.org/2004/02/skos/core#notation';

----------------------------------------------------------------------

-- http://www.w3.org/ns/locn#Address
CREATE TABLE adres (
  stad VARCHAR,
  straat VARCHAR,
  postcode VARCHAR,
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE adres IS 'http://www.w3.org/ns/locn#Address';
COMMENT ON COLUMN adres.stad IS 'http://www.w3.org/ns/locn#postName';
COMMENT ON COLUMN adres.straat IS 'http://www.w3.org/ns/locn#thoroughfare';
COMMENT ON COLUMN adres.postcode IS 'http://www.w3.org/ns/locn#postCode';
COMMENT ON COLUMN adres.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN adres.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN adres.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- http://www.w3.org/ns/ssn/System
CREATE TABLE systeem (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE systeem IS 'http://www.w3.org/ns/ssn/System';
COMMENT ON COLUMN systeem.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN systeem.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN systeem.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: heeft_invoer_proces_variabele
CREATE TABLE rel_proces_variabele (
  -- Foreign key referencing proces_identity(uuid)
  proces_uuid VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  proces_geldig_van DATE,
  -- Foreign key referencing proces_identity(uuid)
  proces_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing proces_identity(uuid)
  proces_variabele_uuid VARCHAR,
  relation_type proces_proces_variabele_merge_type,
  PRIMARY KEY (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_variabele_uuid, relation_type)
);

COMMENT ON TABLE rel_proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN rel_proces_variabele.proces_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_proces_variabele.proces_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_proces_variabele.proces_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_proces_variabele.proces_variabele_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: onderdeel_van_proces
CREATE TABLE rel_proces_onderdeel_van_proces (
  -- Foreign key referencing proces_identity(uuid)
  proces_uuid VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  proces_geldig_van DATE,
  -- Foreign key referencing proces_identity(uuid)
  proces_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing proces_identity(uuid)
  proces_identity_uuid VARCHAR,
  PRIMARY KEY (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
);

COMMENT ON TABLE rel_proces_onderdeel_van_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN rel_proces_onderdeel_van_proces.proces_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_proces_onderdeel_van_proces.proces_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_proces_onderdeel_van_proces.proces_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_proces_onderdeel_van_proces.proces_identity_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_exploitatie_locatie_externe_identificator (
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  exploitatie_locatie_uuid VARCHAR,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  exploitatie_locatie_geldig_van DATE,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  exploitatie_locatie_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  exploitatie_locatie_same_as VARCHAR,
  -- Foreign key referencing exploitatie_locatie_identity(uuid)
  externe_identificator_uuid VARCHAR,
  PRIMARY KEY (exploitatie_locatie_uuid, exploitatie_locatie_geldig_van, exploitatie_locatie_aangemaakt_op, exploitatie_locatie_same_as, externe_identificator_uuid)
);

COMMENT ON TABLE rel_exploitatie_locatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie';
COMMENT ON COLUMN rel_exploitatie_locatie_externe_identificator.exploitatie_locatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_locatie_externe_identificator.exploitatie_locatie_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitatie_locatie_externe_identificator.exploitatie_locatie_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitatie_locatie_externe_identificator.exploitatie_locatie_same_as IS 'http://www.w3.org/2002/07/owl#sameAs';
COMMENT ON COLUMN rel_exploitatie_locatie_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_emissiepunt_externe_identificator (
  -- Foreign key referencing emissiepunt_identity(uuid)
  emissiepunt_uuid VARCHAR,
  -- Foreign key referencing emissiepunt_identity(uuid)
  emissiepunt_geldig_van DATE,
  -- Foreign key referencing emissiepunt_identity(uuid)
  emissiepunt_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing emissiepunt_identity(uuid)
  externe_identificator_uuid VARCHAR,
  PRIMARY KEY (emissiepunt_uuid, emissiepunt_geldig_van, emissiepunt_aangemaakt_op, externe_identificator_uuid)
);

COMMENT ON TABLE rel_emissiepunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.emissiepunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.emissiepunt_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.emissiepunt_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_meetpunt_externe_identificator (
  -- Foreign key referencing meetpunt_identity(uuid)
  meetpunt_uuid VARCHAR,
  -- Foreign key referencing meetpunt_identity(uuid)
  meetpunt_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing meetpunt_identity(uuid)
  meetpunt_geldig_van DATE,
  -- Foreign key referencing meetpunt_identity(uuid)
  externe_identificator_uuid VARCHAR,
  PRIMARY KEY (meetpunt_uuid, meetpunt_aangemaakt_op, meetpunt_geldig_van, externe_identificator_uuid)
);

COMMENT ON TABLE rel_meetpunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.meetpunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.meetpunt_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.meetpunt_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_onttrekkingspunt_externe_identificator (
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  onttrekkingspunt_uuid VARCHAR,
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  onttrekkingspunt_geldig_van DATE,
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  onttrekkingspunt_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  externe_identificator_uuid VARCHAR,
  PRIMARY KEY (onttrekkingspunt_uuid, onttrekkingspunt_geldig_van, onttrekkingspunt_aangemaakt_op, externe_identificator_uuid)
);

COMMENT ON TABLE rel_onttrekkingspunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.onttrekkingspunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.onttrekkingspunt_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.onttrekkingspunt_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_filter
CREATE TABLE rel_onttrekkingspunt_filter (
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  onttrekkingspunt_uuid VARCHAR,
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  onttrekkingspunt_geldig_van DATE,
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  onttrekkingspunt_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  filter_uuid VARCHAR,
  PRIMARY KEY (onttrekkingspunt_uuid, onttrekkingspunt_geldig_van, onttrekkingspunt_aangemaakt_op, filter_uuid)
);

COMMENT ON TABLE rel_onttrekkingspunt_filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.onttrekkingspunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.onttrekkingspunt_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.onttrekkingspunt_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.filter_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: inzetbaar_systeem_systeem
CREATE TABLE rel_exploitatie_systeem (
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_geldig_van DATE,
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing exploitatie_identity(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (exploitatie_uuid, exploitatie_geldig_van, exploitatie_aangemaakt_op, systeem_uuid)
);

COMMENT ON TABLE rel_exploitatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN rel_exploitatie_systeem.exploitatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_systeem.exploitatie_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitatie_systeem.exploitatie_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitatie_systeem.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_exploitatie_externe_identificator (
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_geldig_van DATE,
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing exploitatie_identity(uuid)
  externe_identificator_uuid VARCHAR,
  PRIMARY KEY (exploitatie_uuid, exploitatie_geldig_van, exploitatie_aangemaakt_op, externe_identificator_uuid)
);

COMMENT ON TABLE rel_exploitatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.exploitatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.exploitatie_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.exploitatie_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: heeft_contactpersoon_contactpersoon
CREATE TABLE rel_exploitatie_contactpersoon (
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_geldig_van DATE,
  -- Foreign key referencing exploitatie_identity(uuid)
  exploitatie_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing exploitatie_identity(uuid)
  contactpersoon_identity_uuid VARCHAR,
  PRIMARY KEY (exploitatie_uuid, exploitatie_geldig_van, exploitatie_aangemaakt_op, contactpersoon_identity_uuid)
);

COMMENT ON TABLE rel_exploitatie_contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.exploitatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.exploitatie_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.exploitatie_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.contactpersoon_identity_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
-- Table type: JOIN
-- Original relation: heeft_contactpersoon_contactpersoon
CREATE TABLE rel_exploitant_contactpersoon (
  -- Foreign key referencing exploitant_identity(uuid)
  exploitant_uuid VARCHAR,
  -- Foreign key referencing exploitant_identity(uuid)
  exploitant_geldig_van DATE,
  -- Foreign key referencing exploitant_identity(uuid)
  exploitant_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing exploitant_identity(uuid)
  contactpersoon_identity_uuid VARCHAR,
  PRIMARY KEY (exploitant_uuid, exploitant_geldig_van, exploitant_aangemaakt_op, contactpersoon_identity_uuid)
);

COMMENT ON TABLE rel_exploitant_contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN rel_exploitant_contactpersoon.exploitant_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitant_contactpersoon.exploitant_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitant_contactpersoon.exploitant_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitant_contactpersoon.contactpersoon_identity_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_systeem
CREATE TABLE rel_installatie_systeem (
  -- Foreign key referencing installatie_identity(uuid)
  installatie_uuid VARCHAR,
  -- Foreign key referencing installatie_identity(uuid)
  installatie_geldig_van DATE,
  -- Foreign key referencing installatie_identity(uuid)
  installatie_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing installatie_identity(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (installatie_uuid, installatie_geldig_van, installatie_aangemaakt_op, systeem_uuid)
);

COMMENT ON TABLE rel_installatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN rel_installatie_systeem.installatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_systeem.installatie_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_installatie_systeem.installatie_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_installatie_systeem.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_installatie_externe_identificator (
  -- Foreign key referencing installatie_identity(uuid)
  installatie_uuid VARCHAR,
  -- Foreign key referencing installatie_identity(uuid)
  installatie_geldig_van DATE,
  -- Foreign key referencing installatie_identity(uuid)
  installatie_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing installatie_identity(uuid)
  externe_identificator_uuid VARCHAR,
  PRIMARY KEY (installatie_uuid, installatie_geldig_van, installatie_aangemaakt_op, externe_identificator_uuid)
);

COMMENT ON TABLE rel_installatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN rel_installatie_externe_identificator.installatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_externe_identificator.installatie_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_installatie_externe_identificator.installatie_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_installatie_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: implementeert_proces
CREATE TABLE rel_installatie_proces (
  -- Foreign key referencing installatie_identity(uuid)
  installatie_uuid VARCHAR,
  -- Foreign key referencing installatie_identity(uuid)
  installatie_geldig_van DATE,
  -- Foreign key referencing installatie_identity(uuid)
  installatie_aangemaakt_op TIMESTAMP,
  -- Foreign key referencing installatie_identity(uuid)
  proces_identity_uuid VARCHAR,
  PRIMARY KEY (installatie_uuid, installatie_geldig_van, installatie_aangemaakt_op, proces_identity_uuid)
);

COMMENT ON TABLE rel_installatie_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN rel_installatie_proces.installatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_proces.installatie_geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_installatie_proces.installatie_aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_installatie_proces.proces_identity_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- Foreign key constraints

ALTER TABLE proces ADD FOREIGN KEY (uuid) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (geimplementeerd_door_uuid) REFERENCES systeem(uuid);
ALTER TABLE proces ADD FOREIGN KEY (revisie_van_uuid) REFERENCES proces_identity(uuid);
ALTER TABLE exploitatie_locatie ADD FOREIGN KEY (uuid) REFERENCES exploitatie_locatie_identity(uuid);
ALTER TABLE exploitatie_locatie ADD FOREIGN KEY (toegewezen_aan_uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitatie_locatie ADD FOREIGN KEY (adres_uuid) REFERENCES adres(uuid);
ALTER TABLE exploitatie_locatie ADD FOREIGN KEY (revisie_van_uuid) REFERENCES exploitatie_locatie_identity(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (uuid) REFERENCES emissiepunt_identity(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (locatie_uuid) REFERENCES exploitatie_locatie_identity(uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (uuid) REFERENCES meetpunt_identity(uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (uuid) REFERENCES onttrekkingspunt_identity(uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (locatie_uuid) REFERENCES exploitatie_locatie_identity(uuid);
ALTER TABLE contactpersoon ADD FOREIGN KEY (uuid) REFERENCES contactpersoon_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (implementeert_uuid) REFERENCES proces_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (locatie_uuid) REFERENCES exploitatie_locatie_identity(uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (adres_uuid) REFERENCES adres(uuid);
ALTER TABLE observatie ADD FOREIGN KEY (heeft_resultaat_emissie_uuid) REFERENCES lozing(emissie_uuid);
ALTER TABLE observatie ADD FOREIGN KEY (heeft_aandachtspunt_uuid) REFERENCES emissie(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (uuid) REFERENCES installatie_identity(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (locatie_uuid) REFERENCES exploitatie_locatie_identity(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (revisie_van_uuid) REFERENCES installatie_identity(uuid);
ALTER TABLE rel_proces_variabele ADD FOREIGN KEY (proces_uuid) REFERENCES proces_identity(uuid);
ALTER TABLE rel_proces_onderdeel_van_proces ADD FOREIGN KEY (proces_uuid) REFERENCES proces_identity(uuid);
ALTER TABLE rel_exploitatie_locatie_externe_identificator ADD FOREIGN KEY (exploitatie_locatie_uuid) REFERENCES exploitatie_locatie_identity(uuid);
ALTER TABLE rel_emissiepunt_externe_identificator ADD FOREIGN KEY (emissiepunt_uuid) REFERENCES emissiepunt_identity(uuid);
ALTER TABLE rel_meetpunt_externe_identificator ADD FOREIGN KEY (meetpunt_uuid) REFERENCES meetpunt_identity(uuid);
ALTER TABLE rel_onttrekkingspunt_externe_identificator ADD FOREIGN KEY (onttrekkingspunt_uuid) REFERENCES onttrekkingspunt_identity(uuid);
ALTER TABLE rel_onttrekkingspunt_filter ADD FOREIGN KEY (onttrekkingspunt_uuid) REFERENCES onttrekkingspunt_identity(uuid);
ALTER TABLE rel_exploitatie_systeem ADD FOREIGN KEY (exploitatie_uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE rel_exploitatie_externe_identificator ADD FOREIGN KEY (exploitatie_uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE rel_exploitatie_contactpersoon ADD FOREIGN KEY (exploitatie_uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE rel_exploitant_contactpersoon ADD FOREIGN KEY (exploitant_uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE rel_installatie_systeem ADD FOREIGN KEY (installatie_uuid) REFERENCES installatie_identity(uuid);
ALTER TABLE rel_installatie_externe_identificator ADD FOREIGN KEY (installatie_uuid) REFERENCES installatie_identity(uuid);
ALTER TABLE rel_installatie_proces ADD FOREIGN KEY (installatie_uuid) REFERENCES installatie_identity(uuid);
