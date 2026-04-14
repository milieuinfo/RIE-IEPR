-- Auto-generated SQL schema from ODDToolkit
-- Ontology: null
-- Generated: 2026-03-26T15:48:24.767240+01:00[Europe/Brussels]

-- http://www.w3.org/ns/sosa/Procedure
CREATE TYPE procedure AS ENUM (
  'EMISSIE',
  'MEET',
  'ONTTREKKING',
  'TRANSPORT',
  'VERWERKING'
);

CREATE TYPE proces_proces_variabele_merge_type AS ENUM (
  'HEEFT_INVOER_PROCES_VARIABELE',
  'HEEFT_UITVOER_PROCES_VARIABELE'
);

-- http://www.w3.org/ns/adms#Status
CREATE TYPE status AS ENUM (
  'DEFINITIEF_UIT_DIENST',
  'IN_GEBRUIK',
  'ONTMANTELD',
  'TIJDELIJK_UIT_DIENST',
  'VOORGESTELD'
);

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte
CREATE TABLE aangifte (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  had_part VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte';
COMMENT ON COLUMN aangifte.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN aangifte.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN aangifte.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN aangifte.had_part IS 'http://www.w3.org/ns/prov#hadPart';

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

-- http://www.w3.org/ns/locn#Address
CREATE TABLE adres (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  postcode VARCHAR,
  stad VARCHAR,
  straat VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE adres IS 'http://www.w3.org/ns/locn#Address';
COMMENT ON COLUMN adres.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN adres.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN adres.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN adres.postcode IS 'http://www.w3.org/ns/locn#postCode';
COMMENT ON COLUMN adres.stad IS 'http://www.w3.org/ns/locn#postName';
COMMENT ON COLUMN adres.straat IS 'http://www.w3.org/ns/locn#thoroughfare';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon
CREATE TABLE contactpersoon (
  -- Foreign key referencing contactpersoon_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  beschrijving VARCHAR,
  benaming VARCHAR,
  functie VARCHAR,
  email VARCHAR,
  name VARCHAR,
  telefoonnummer VARCHAR,
  PRIMARY KEY (uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';
COMMENT ON COLUMN contactpersoon.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactpersoon.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN contactpersoon.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN contactpersoon.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN contactpersoon.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN contactpersoon.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN contactpersoon.functie IS 'http://www.w3.org/ns/org#hasRole';
COMMENT ON COLUMN contactpersoon.email IS 'http://xmlns.com/foaf/0.1/mbox';
COMMENT ON COLUMN contactpersoon.name IS 'http://xmlns.com/foaf/0.1/name';
COMMENT ON COLUMN contactpersoon.telefoonnummer IS 'http://xmlns.com/foaf/0.1/phone';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
CREATE TABLE emissiepunt (
  -- Foreign key referencing emissiepunt_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing systeem(systeem_uuid)
  revisie_van VARCHAR,
  PRIMARY KEY (systeem_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN emissiepunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN emissiepunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN emissiepunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN emissiepunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN emissiepunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN emissiepunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN emissiepunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN emissiepunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: IDENTITY
CREATE TABLE emissiepunt_identity (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE emissiepunt_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt_identity.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
CREATE TABLE exploitant (
  -- Foreign key referencing exploitant_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  -- Foreign key referencing adres(uuid)
  adres VARCHAR,
  classification VARCHAR,
  PRIMARY KEY (uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN exploitant.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitant.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitant.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitant.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitant.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitant.adres IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitant.classification IS 'http://www.w3.org/ns/org#classification';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
CREATE TABLE exploitatie (
  -- Foreign key referencing exploitatie_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  implementeert_proces VARCHAR,
  PRIMARY KEY (uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN exploitatie.locatie IS 'http://www.w3.org/ns/ssn/deployedOnPlatform';
COMMENT ON COLUMN exploitatie.implementeert_proces IS 'http://www.w3.org/ns/ssn/implements';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie
CREATE TABLE exploitatielocatie (
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  geometrie VARCHAR,
  beschrijving VARCHAR,
  benaming VARCHAR,
  -- Foreign key referencing adres(uuid)
  adres VARCHAR,
  primaire_bron VARCHAR,
  -- Foreign key referencing exploitant_identity(uuid)
  toegewezen_aan VARCHAR,
  beinvloed_door VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  revisie_van VARCHAR,
  PRIMARY KEY (uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE exploitatielocatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie';
COMMENT ON COLUMN exploitatielocatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatielocatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatielocatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitatielocatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatielocatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatielocatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatielocatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatielocatie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN exploitatielocatie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN exploitatielocatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatielocatie.adres IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitatielocatie.primaire_bron IS 'http://www.w3.org/ns/prov#hadPrimarySource';
COMMENT ON COLUMN exploitatielocatie.toegewezen_aan IS 'http://www.w3.org/ns/prov#wasAttributedTo';
COMMENT ON COLUMN exploitatielocatie.beinvloed_door IS 'http://www.w3.org/ns/prov#wasInfluencedBy';
COMMENT ON COLUMN exploitatielocatie.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie
-- Table type: IDENTITY
CREATE TABLE exploitatielocatie_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE exploitatielocatie_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie';
COMMENT ON COLUMN exploitatielocatie_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- http://www.w3.org/ns/adms#Identifier
CREATE TABLE externe_identificator (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  datatype VARCHAR,
  notatie VARCHAR,
  schema VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE externe_identificator IS 'http://www.w3.org/ns/adms#Identifier';
COMMENT ON COLUMN externe_identificator.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN externe_identificator.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN externe_identificator.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN externe_identificator.datatype IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN externe_identificator.notatie IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN externe_identificator.schema IS 'http://www.w3.org/ns/adms#schemeAgency';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
CREATE TABLE filter (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing systeem(uuid)
  revisie_van VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN filter.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN filter.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN filter.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN filter.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN filter.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN filter.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN filter.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN filter.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN filter.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN filter.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN filter.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
CREATE TABLE installatie (
  -- Foreign key referencing installatie_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  beschrijving VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing systeem(systeem_uuid)
  revisie_van VARCHAR,
  PRIMARY KEY (systeem_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE installatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN installatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN installatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN installatie.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN installatie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN installatie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN installatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN installatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN installatie.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: IDENTITY
CREATE TABLE installatie_identity (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE installatie_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_identity.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument
CREATE TABLE meet_instrument (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing systeem(uuid)
  revisie_van VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE meet_instrument IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument';
COMMENT ON COLUMN meet_instrument.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meet_instrument.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meet_instrument.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN meet_instrument.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meet_instrument.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meet_instrument.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meet_instrument.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN meet_instrument.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meet_instrument.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN meet_instrument.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meet_instrument.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN meet_instrument.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
CREATE TABLE meetpunt (
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing systeem(systeem_uuid)
  revisie_van VARCHAR,
  PRIMARY KEY (systeem_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE meetpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meetpunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN meetpunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN meetpunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meetpunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN meetpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meetpunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN meetpunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: IDENTITY
CREATE TABLE meetpunt_identity (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE meetpunt_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_identity.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
CREATE TABLE onttrekkingspunt (
  -- Foreign key referencing onttrekkingspunt_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  depth VARCHAR,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing systeem(systeem_uuid)
  revisie_van VARCHAR,
  PRIMARY KEY (systeem_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN onttrekkingspunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN onttrekkingspunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN onttrekkingspunt.depth IS 'http://dbpedia.org/ontology/depth';
COMMENT ON COLUMN onttrekkingspunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN onttrekkingspunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN onttrekkingspunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN onttrekkingspunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN onttrekkingspunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN onttrekkingspunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: IDENTITY
CREATE TABLE onttrekkingspunt_identity (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE onttrekkingspunt_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_identity.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
CREATE TABLE proces (
  -- Foreign key referencing proces_identity(uuid)
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  onderdeel_van VARCHAR,
  beschrijving VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  revisie_van VARCHAR,
  -- Foreign key referencing systeem(uuid)
  systeem VARCHAR,
  PRIMARY KEY (uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN proces.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces.onderdeel_van IS 'http://purl.org/net/p-plan#isStepOfPlan';
COMMENT ON COLUMN proces.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN proces.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN proces.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN proces.systeem IS 'http://www.w3.org/ns/ssn/implementedBy';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele
CREATE TABLE proces_variabele (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  type VARCHAR,
  eenheid VARCHAR,
  waarde DECIMAL,
  benaming VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele';
COMMENT ON COLUMN proces_variabele.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_variabele.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces_variabele.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN proces_variabele.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces_variabele.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN proces_variabele.waarde IS 'http://qudt.org/schema/qudt/numericValue';
COMMENT ON COLUMN proces_variabele.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_emissiepunt_externe_identificator (
  -- Foreign key referencing emissiepunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_emissiepunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_emissiepunt_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_systeem
CREATE TABLE rel_emissiepunt_systeem (
  -- Foreign key referencing emissiepunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing systeem(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_emissiepunt_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN rel_emissiepunt_systeem.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_emissiepunt_systeem.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_emissiepunt_systeem.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_emissiepunt_systeem.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_emissiepunt_systeem.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeem_eigenschap
CREATE TABLE rel_emissiepunt_systeem_eigenschap (
  -- Foreign key referencing emissiepunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing systeem_eigenschap(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_emissiepunt_systeem_eigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN rel_emissiepunt_systeem_eigenschap.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_emissiepunt_systeem_eigenschap.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_emissiepunt_systeem_eigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_emissiepunt_systeem_eigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_emissiepunt_systeem_eigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
-- Table type: JOIN
-- Original relation: heeft_contactpersoon_contactpersoon
CREATE TABLE rel_exploitant_contactpersoon (
  -- Foreign key referencing exploitant_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing contactpersoon_identity(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_exploitant_contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN rel_exploitant_contactpersoon.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitant_contactpersoon.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitant_contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitant_contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitant_contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: heeft_contactpersoon_contactpersoon
CREATE TABLE rel_exploitatie_contactpersoon (
  -- Foreign key referencing exploitatie_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing contactpersoon_identity(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_exploitatie_contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitatie_contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_exploitatie_externe_identificator (
  -- Foreign key referencing exploitatie_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_exploitatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitatie_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: systemen_systeem
CREATE TABLE rel_exploitatie_systeem (
  -- Foreign key referencing exploitatie_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing systeem(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_exploitatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN rel_exploitatie_systeem.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_systeem.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatie_systeem.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitatie_systeem.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitatie_systeem.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_exploitatielocatie_externe_identificator (
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_exploitatielocatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie';
COMMENT ON COLUMN rel_exploitatielocatie_externe_identificator.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatielocatie_externe_identificator.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_exploitatielocatie_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_exploitatielocatie_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_exploitatielocatie_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_filter_externe_identificator (
  -- Foreign key referencing filter(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid)
);

COMMENT ON TABLE rel_filter_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN rel_filter_externe_identificator.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_filter_externe_identificator.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_filter_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_filter_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_filter_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_installatie_externe_identificator (
  -- Foreign key referencing installatie_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_installatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN rel_installatie_externe_identificator.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_externe_identificator.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_installatie_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_installatie_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_systeem
CREATE TABLE rel_installatie_systeem (
  -- Foreign key referencing installatie_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing systeem(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_installatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN rel_installatie_systeem.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_systeem.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_systeem.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_installatie_systeem.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_installatie_systeem.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeem_eigenschap
CREATE TABLE rel_installatie_systeem_eigenschap (
  -- Foreign key referencing installatie_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing systeem_eigenschap(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_installatie_systeem_eigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN rel_installatie_systeem_eigenschap.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_systeem_eigenschap.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_installatie_systeem_eigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_installatie_systeem_eigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_installatie_systeem_eigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_meet_instrument_externe_identificator (
  -- Foreign key referencing meet_instrument(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid)
);

COMMENT ON TABLE rel_meet_instrument_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument';
COMMENT ON COLUMN rel_meet_instrument_externe_identificator.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meet_instrument_externe_identificator.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meet_instrument_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_meet_instrument_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_meet_instrument_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_meetpunt_externe_identificator (
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_meetpunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_meetpunt_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_meet_instrument
CREATE TABLE rel_meetpunt_meet_instrument (
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing meet_instrument(systeem_uuid)
  target_systeem_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_systeem_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_meetpunt_meet_instrument IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN rel_meetpunt_meet_instrument.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meetpunt_meet_instrument.target_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meetpunt_meet_instrument.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_meetpunt_meet_instrument.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_meetpunt_meet_instrument.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeem_eigenschap
CREATE TABLE rel_meetpunt_systeem_eigenschap (
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing systeem_eigenschap(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_meetpunt_systeem_eigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN rel_meetpunt_systeem_eigenschap.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meetpunt_systeem_eigenschap.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_meetpunt_systeem_eigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_meetpunt_systeem_eigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_meetpunt_systeem_eigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE rel_onttrekkingspunt_externe_identificator (
  -- Foreign key referencing onttrekkingspunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_onttrekkingspunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_onttrekkingspunt_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_filter
CREATE TABLE rel_onttrekkingspunt_filter (
  -- Foreign key referencing onttrekkingspunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing filter(systeem_uuid)
  target_systeem_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_systeem_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_onttrekkingspunt_filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.target_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_onttrekkingspunt_filter.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeem_eigenschap
CREATE TABLE rel_onttrekkingspunt_systeem_eigenschap (
  -- Foreign key referencing onttrekkingspunt_identity(systeem_uuid)
  source_systeem_uuid VARCHAR,
  -- Foreign key referencing systeem_eigenschap(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_systeem_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_onttrekkingspunt_systeem_eigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN rel_onttrekkingspunt_systeem_eigenschap.source_systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_onttrekkingspunt_systeem_eigenschap.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_onttrekkingspunt_systeem_eigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_onttrekkingspunt_systeem_eigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_onttrekkingspunt_systeem_eigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: rubriek_rubriek
CREATE TABLE rel_proces_rubriek (
  -- Foreign key referencing proces_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing rubriek(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_proces_rubriek IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN rel_proces_rubriek.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_proces_rubriek.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_proces_rubriek.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_proces_rubriek.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_proces_rubriek.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: proces_proces_variabele
CREATE TABLE rel_proces_variabele (
  -- Foreign key referencing proces_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing proces_variabele(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  relation_type proces_proces_variabele_merge_type,
  PRIMARY KEY (source_uuid, target_uuid, aangemaakt_op, geldig_van, relation_type)
);

COMMENT ON TABLE rel_proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN rel_proces_variabele.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_proces_variabele.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_proces_variabele.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_proces_variabele.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_proces_variabele.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: volgt_op_proces
CREATE TABLE rel_proces_volgt_op_proces (
  -- Foreign key referencing proces_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  target_uuid VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, aangemaakt_op, geldig_van)
);

COMMENT ON TABLE rel_proces_volgt_op_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN rel_proces_volgt_op_proces.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_proces_volgt_op_proces.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rel_proces_volgt_op_proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN rel_proces_volgt_op_proces.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN rel_proces_volgt_op_proces.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- http://www.w3.org/ns/sosa/Result
CREATE TABLE resultaat (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE resultaat IS 'http://www.w3.org/ns/sosa/Result';
COMMENT ON COLUMN resultaat.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN resultaat.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN resultaat.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek
CREATE TABLE rubriek (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  type VARCHAR,
  definition VARCHAR,
  datatype VARCHAR,
  notatie VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE rubriek IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek';
COMMENT ON COLUMN rubriek.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rubriek.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN rubriek.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN rubriek.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN rubriek.definition IS 'http://www.w3.org/2004/02/skos/core#definition';
COMMENT ON COLUMN rubriek.datatype IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN rubriek.notatie IS 'http://www.w3.org/2004/02/skos/core#notation';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#SysteemEigenschap
CREATE TABLE systeem_eigenschap (
  uuid VARCHAR,
  uri VARCHAR,
  ingediend BOOLEAN,
  type VARCHAR,
  eenheid VARCHAR,
  datatype VARCHAR,
  range VARCHAR,
  value VARCHAR,
  parameter VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE systeem_eigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#SysteemEigenschap';
COMMENT ON COLUMN systeem_eigenschap.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN systeem_eigenschap.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN systeem_eigenschap.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN systeem_eigenschap.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN systeem_eigenschap.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN systeem_eigenschap.datatype IS 'http://www.w3.org/2000/01/rdf-schema#range';
COMMENT ON COLUMN systeem_eigenschap.range IS 'http://www.w3.org/2000/01/rdf-schema#range';
COMMENT ON COLUMN systeem_eigenschap.value IS 'http://www.w3.org/2000/01/rdf-schema#value';
COMMENT ON COLUMN systeem_eigenschap.parameter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#parameter';

----------------------------------------------------------------------

-- Foreign key constraints

ALTER TABLE contactpersoon ADD FOREIGN KEY (uuid) REFERENCES contactpersoon_identity(uuid);
ALTER TABLE contactpersoon ADD FOREIGN KEY (uuid) REFERENCES contactpersoon_identity(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (systeem_uuid) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (systeem_uuid) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (revisie_van) REFERENCES systeem(systeem_uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (adres) REFERENCES adres(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (implementeert_proces) REFERENCES proces_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (uuid) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (uuid) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (adres) REFERENCES adres(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (toegewezen_aan) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (revisie_van) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE filter ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (systeem_uuid) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE installatie ADD FOREIGN KEY (systeem_uuid) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE installatie ADD FOREIGN KEY (revisie_van) REFERENCES systeem(systeem_uuid);
ALTER TABLE meet_instrument ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (systeem_uuid) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (systeem_uuid) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (revisie_van) REFERENCES systeem(systeem_uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (systeem_uuid) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (systeem_uuid) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (revisie_van) REFERENCES systeem(systeem_uuid);
ALTER TABLE proces ADD FOREIGN KEY (uuid) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (uuid) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (onderdeel_van) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (revisie_van) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (systeem) REFERENCES systeem(uuid);
ALTER TABLE rel_emissiepunt_externe_identificator ADD FOREIGN KEY (source_systeem_uuid) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE rel_emissiepunt_systeem ADD FOREIGN KEY (source_systeem_uuid) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE rel_emissiepunt_systeem_eigenschap ADD FOREIGN KEY (source_systeem_uuid) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE rel_exploitant_contactpersoon ADD FOREIGN KEY (source_uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE rel_exploitatie_contactpersoon ADD FOREIGN KEY (source_uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE rel_exploitatie_externe_identificator ADD FOREIGN KEY (source_uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE rel_exploitatie_systeem ADD FOREIGN KEY (source_uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE rel_exploitatielocatie_externe_identificator ADD FOREIGN KEY (source_uuid) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE rel_installatie_externe_identificator ADD FOREIGN KEY (source_systeem_uuid) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE rel_installatie_systeem ADD FOREIGN KEY (source_systeem_uuid) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE rel_installatie_systeem_eigenschap ADD FOREIGN KEY (source_systeem_uuid) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE rel_meetpunt_externe_identificator ADD FOREIGN KEY (source_systeem_uuid) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE rel_meetpunt_meet_instrument ADD FOREIGN KEY (source_systeem_uuid) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE rel_meetpunt_systeem_eigenschap ADD FOREIGN KEY (source_systeem_uuid) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE rel_onttrekkingspunt_externe_identificator ADD FOREIGN KEY (source_systeem_uuid) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE rel_onttrekkingspunt_filter ADD FOREIGN KEY (source_systeem_uuid) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE rel_onttrekkingspunt_systeem_eigenschap ADD FOREIGN KEY (source_systeem_uuid) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE rel_proces_rubriek ADD FOREIGN KEY (source_uuid) REFERENCES proces_identity(uuid);
ALTER TABLE rel_proces_variabele ADD FOREIGN KEY (source_uuid) REFERENCES proces_identity(uuid);
ALTER TABLE rel_proces_volgt_op_proces ADD FOREIGN KEY (source_uuid) REFERENCES proces_identity(uuid);
