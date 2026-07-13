-- Auto-generated SQL schema from ODDToolkit
-- Ontology: null
-- Generated: 2026-07-10T15:15:23.234027+02:00[Europe/Brussels]

-- http://www.w3.org/ns/sosa/Procedure
CREATE TYPE procedure AS ENUM (
  'EMISSIE',
  'MEET',
  'ONTTREKKING',
  'UITWISSEL',
  'VERWERKING'
);

CREATE TYPE proces_proces_variabele_merge_type AS ENUM (
  'HEEFT_INVOER_PROCES_VARIABELE',
  'HEEFT_UITVOER_PROCES_VARIABELE'
);

-- http://www.w3.org/ns/adms#Status
CREATE TYPE status AS ENUM (
  'IN_GEBRUIK',
  'ONTMANTELD'
);

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte
CREATE TABLE aangifte (
  id VARCHAR,
  uuid VARCHAR,
  uri VARCHAR,
  aangemaakt_op DATE,
  -- Foreign key referencing aangifte_bundel(uuid)
  onderdeel_van VARCHAR,
  aangepast_op DATE,
  vlaanderen_id VARCHAR,
  informatieclassificatie VARCHAR,
  PRIMARY KEY (id)
);

COMMENT ON TABLE aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte';
COMMENT ON COLUMN aangifte.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN aangifte.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN aangifte.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN aangifte.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN aangifte.onderdeel_van IS 'http://purl.org/dc/terms/isPartOf';
COMMENT ON COLUMN aangifte.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN aangifte.vlaanderen_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId';
COMMENT ON COLUMN aangifte.informatieclassificatie IS 'https://data.vlaanderen.be/ns/dossier#informatieclassificatie';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AangifteBundel
CREATE TABLE aangifte_bundel (
  id VARCHAR,
  uuid VARCHAR,
  uri VARCHAR,
  aangemaakt_op DATE,
  -- Foreign key referencing exploitant(uuid)
  creator VARCHAR,
  aangepast_op DATE,
  type VARCHAR,
  status VARCHAR,
  vlaanderen_id VARCHAR,
  PRIMARY KEY (id)
);

COMMENT ON TABLE aangifte_bundel IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AangifteBundel';
COMMENT ON COLUMN aangifte_bundel.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN aangifte_bundel.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN aangifte_bundel.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN aangifte_bundel.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN aangifte_bundel.creator IS 'http://purl.org/dc/terms/creator';
COMMENT ON COLUMN aangifte_bundel.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN aangifte_bundel.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN aangifte_bundel.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN aangifte_bundel.vlaanderen_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte
-- Table type: JOIN
-- Original relation: onderwerp_exploitatie
CREATE TABLE aangifte_exploitatie (
  -- Foreign key referencing aangifte(uuid)
  aangifte_id VARCHAR,
  -- Foreign key referencing exploitatie(uuid)
  exploitatie_id VARCHAR,
  aangemaakt_op DATE
);

COMMENT ON TABLE aangifte_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte';
COMMENT ON COLUMN aangifte_exploitatie.aangifte_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN aangifte_exploitatie.exploitatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN aangifte_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- http://www.w3.org/ns/locn#Address
CREATE TABLE adres (
  uuid VARCHAR,
  uri VARCHAR,
  full_address VARCHAR,
  locator_designator VARCHAR,
  postcode VARCHAR,
  stad VARCHAR,
  straat VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE adres IS 'http://www.w3.org/ns/locn#Address';
COMMENT ON COLUMN adres.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN adres.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN adres.full_address IS 'http://www.w3.org/ns/locn#fullAddress';
COMMENT ON COLUMN adres.locator_designator IS 'http://www.w3.org/ns/locn#locatorDesignator';
COMMENT ON COLUMN adres.postcode IS 'http://www.w3.org/ns/locn#postCode';
COMMENT ON COLUMN adres.stad IS 'http://www.w3.org/ns/locn#postName';
COMMENT ON COLUMN adres.straat IS 'http://www.w3.org/ns/locn#thoroughfare';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactgegevens
CREATE TABLE contactgegevens (
  id VARCHAR,
  uuid VARCHAR,
  uri VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van VARCHAR,
  aangepast_op TIMESTAMP,
  beschrijving VARCHAR,
  -- Foreign key referencing exploitatie(uuid)
  has_target VARCHAR,
  name VARCHAR,
  telefoonnummer VARCHAR,
  PRIMARY KEY (id)
);

COMMENT ON TABLE contactgegevens IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactgegevens';
COMMENT ON COLUMN contactgegevens.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN contactgegevens.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactgegevens.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN contactgegevens.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactgegevens.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactgegevens.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN contactgegevens.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN contactgegevens.has_target IS 'http://www.w3.org/ns/oa#hasTarget';
COMMENT ON COLUMN contactgegevens.name IS 'http://xmlns.com/foaf/0.1/name';
COMMENT ON COLUMN contactgegevens.telefoonnummer IS 'http://xmlns.com/foaf/0.1/phone';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie
CREATE TABLE emissie (
  -- Foreign key referencing gebeurtenis(uuid)
  gebeurtenis_uuid VARCHAR,
  uri VARCHAR,
  PRIMARY KEY (gebeurtenis_uuid)
);

COMMENT ON TABLE emissie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie';
COMMENT ON COLUMN emissie.gebeurtenis_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissie.uri IS 'http://example.org/vocab/uri';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie
-- Table type: JOIN
-- Original relation: betrekking_tot_proces
CREATE TABLE emissie_proces (
  -- Foreign key referencing emissie(gebeurtenis_uuid)
  emissie_id VARCHAR,
  -- Foreign key referencing proces(uuid)
  proces_id VARCHAR,
  PRIMARY KEY (emissie_id)
);

COMMENT ON TABLE emissie_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie';
COMMENT ON COLUMN emissie_proces.emissie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissie_proces.proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
CREATE TABLE emissiepunt (
  id VARCHAR,
  -- Foreign key referencing emissiepunt_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
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
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  in_gebruik_tot DATE,
  in_gebruik_vanaf DATE,
  PRIMARY KEY (id, systeem_uuid)
);

COMMENT ON TABLE emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN emissiepunt.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN emissiepunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN emissiepunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN emissiepunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN emissiepunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN emissiepunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN emissiepunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN emissiepunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN emissiepunt.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN emissiepunt.in_gebruik_tot IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot';
COMMENT ON COLUMN emissiepunt.in_gebruik_vanaf IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE emissiepunt_externe_identificator (
  -- Foreign key referencing emissiepunt_identity(systeem_uuid)
  emissiepunt_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (emissiepunt_id, externe_identificator_id)
);

COMMENT ON TABLE emissiepunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt_externe_identificator.emissiepunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_systeem
CREATE TABLE emissiepunt_systeem (
  -- Foreign key referencing emissiepunt_identity(systeem_uuid)
  emissiepunt_id VARCHAR,
  -- Foreign key referencing systeem(uuid)
  systeem_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (emissiepunt_id, systeem_id)
);

COMMENT ON TABLE emissiepunt_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt_systeem.emissiepunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_systeem.systeem_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_systeem.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt_systeem.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt_systeem.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeemeigenschap
CREATE TABLE emissiepunt_systeemeigenschap (
  -- Foreign key referencing emissiepunt_identity(systeem_uuid)
  emissiepunt_id VARCHAR,
  -- Foreign key referencing systeemeigenschap(uuid)
  systeemeigenschap_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (emissiepunt_id, systeemeigenschap_id)
);

COMMENT ON TABLE emissiepunt_systeemeigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt_systeemeigenschap.emissiepunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_systeemeigenschap.systeemeigenschap_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_systeemeigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt_systeemeigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt_systeemeigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
CREATE TABLE exploitant (
  uuid VARCHAR,
  uri VARCHAR,
  aangemaakt_op TIMESTAMP,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  -- Foreign key referencing adres(uuid)
  adres VARCHAR,
  primaire_bron VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN exploitant.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitant.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitant.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitant.adres IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitant.primaire_bron IS 'http://www.w3.org/ns/prov#hadPrimarySource';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
CREATE TABLE exploitatie (
  id VARCHAR,
  uuid VARCHAR,
  uri VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  status VARCHAR,
  classification VARCHAR,
  -- Foreign key referencing exploitatielocatie(uuid)
  locatie VARCHAR,
  -- Foreign key referencing proces(uuid)
  implementeert_proces VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (id)
);

COMMENT ON TABLE exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN exploitatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN exploitatie.classification IS 'http://www.w3.org/ns/org#classification';
COMMENT ON COLUMN exploitatie.locatie IS 'http://www.w3.org/ns/ssn/deployedOnPlatform';
COMMENT ON COLUMN exploitatie.implementeert_proces IS 'http://www.w3.org/ns/ssn/implements';
COMMENT ON COLUMN exploitatie.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE exploitatie_externe_identificator (
  -- Foreign key referencing exploitatie(uuid)
  exploitatie_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (externe_identificator_id)
);

COMMENT ON TABLE exploitatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie_externe_identificator.exploitatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: systemen_systeem
CREATE TABLE exploitatie_systeem (
  -- Foreign key referencing exploitatie(uuid)
  exploitatie_id VARCHAR,
  -- Foreign key referencing systeem(uuid)
  systeem_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (systeem_id)
);

COMMENT ON TABLE exploitatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie_systeem.exploitatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_systeem.systeem_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_systeem.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_systeem.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_systeem.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie
CREATE TABLE exploitatielocatie (
  id VARCHAR,
  uuid VARCHAR,
  uri VARCHAR,
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
  -- Foreign key referencing exploitant(uuid)
  toegewezen_aan VARCHAR,
  -- Foreign key referencing exploitatielocatie(uuid)
  revisie_van VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (id)
);

COMMENT ON TABLE exploitatielocatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie';
COMMENT ON COLUMN exploitatielocatie.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN exploitatielocatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatielocatie.uri IS 'http://example.org/vocab/uri';
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
COMMENT ON COLUMN exploitatielocatie.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN exploitatielocatie.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE exploitatielocatie_externe_identificator (
  -- Foreign key referencing exploitatielocatie(uuid)
  exploitatielocatie_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (externe_identificator_id)
);

COMMENT ON TABLE exploitatielocatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie';
COMMENT ON COLUMN exploitatielocatie_externe_identificator.exploitatielocatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatielocatie_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatielocatie_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatielocatie_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatielocatie_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- http://www.w3.org/ns/adms#Identifier
CREATE TABLE externe_identificator (
  uuid VARCHAR,
  uri VARCHAR,
  notatie VARCHAR,
  notatie_datatype VARCHAR,
  schema VARCHAR,
  notatietype VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE externe_identificator IS 'http://www.w3.org/ns/adms#Identifier';
COMMENT ON COLUMN externe_identificator.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN externe_identificator.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN externe_identificator.notatie IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN externe_identificator.notatie_datatype IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN externe_identificator.schema IS 'http://www.w3.org/ns/adms#schemeAgency';
COMMENT ON COLUMN externe_identificator.notatietype IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#notatietype';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
CREATE TABLE filter (
  id VARCHAR,
  uri VARCHAR,
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
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  in_gebruik_tot DATE,
  in_gebruik_vanaf DATE,
  PRIMARY KEY (id)
);

COMMENT ON TABLE filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN filter.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN filter.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN filter.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN filter.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN filter.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN filter.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN filter.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN filter.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN filter.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN filter.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN filter.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN filter.in_gebruik_tot IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot';
COMMENT ON COLUMN filter.in_gebruik_vanaf IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE filter_externe_identificator (
  -- Foreign key referencing filter_identity(systeem_uuid)
  filter_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (filter_id, externe_identificator_id)
);

COMMENT ON TABLE filter_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter_externe_identificator.filter_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN filter_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN filter_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN filter_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN filter_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
-- Table type: IDENTITY
CREATE TABLE filter_identity (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE filter_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter_identity.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- http://www.w3.org/ns/sosa/FeatureOfInterest
CREATE TABLE gebeurtenis (
  uuid VARCHAR,
  uri VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE gebeurtenis IS 'http://www.w3.org/ns/sosa/FeatureOfInterest';
COMMENT ON COLUMN gebeurtenis.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN gebeurtenis.uri IS 'http://example.org/vocab/uri';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
CREATE TABLE installatie (
  id VARCHAR,
  -- Foreign key referencing installatie_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  beschrijving VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing systeem(uuid)
  revisie_van VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  in_gebruik_tot DATE,
  in_gebruik_vanaf DATE,
  ingediend VARCHAR,
  PRIMARY KEY (id, systeem_uuid)
);

COMMENT ON TABLE installatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN installatie.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie.uri IS 'http://example.org/vocab/uri';
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
COMMENT ON COLUMN installatie.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN installatie.in_gebruik_tot IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot';
COMMENT ON COLUMN installatie.in_gebruik_vanaf IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf';
COMMENT ON COLUMN installatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE installatie_externe_identificator (
  -- Foreign key referencing installatie_identity(systeem_uuid)
  installatie_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (installatie_id, externe_identificator_id)
);

COMMENT ON TABLE installatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_externe_identificator.installatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_systeem
CREATE TABLE installatie_systeem (
  -- Foreign key referencing installatie_identity(systeem_uuid)
  installatie_id VARCHAR,
  -- Foreign key referencing systeem(uuid)
  systeem_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (installatie_id, systeem_id)
);

COMMENT ON TABLE installatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_systeem.installatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_systeem.systeem_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_systeem.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie_systeem.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_systeem.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeemeigenschap
CREATE TABLE installatie_systeemeigenschap (
  -- Foreign key referencing installatie_identity(systeem_uuid)
  installatie_id VARCHAR,
  -- Foreign key referencing systeemeigenschap(uuid)
  systeemeigenschap_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (installatie_id, systeemeigenschap_id)
);

COMMENT ON TABLE installatie_systeemeigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_systeemeigenschap.installatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_systeemeigenschap.systeemeigenschap_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_systeemeigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie_systeemeigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_systeemeigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument
CREATE TABLE meet_instrument (
  id VARCHAR,
  uri VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing systeem(uuid)
  revisie_van VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  in_gebruik_tot DATE,
  in_gebruik_vanaf DATE,
  PRIMARY KEY (id)
);

COMMENT ON TABLE meet_instrument IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument';
COMMENT ON COLUMN meet_instrument.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN meet_instrument.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meet_instrument.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meet_instrument.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meet_instrument.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meet_instrument.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN meet_instrument.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meet_instrument.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meet_instrument.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN meet_instrument.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN meet_instrument.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN meet_instrument.in_gebruik_tot IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot';
COMMENT ON COLUMN meet_instrument.in_gebruik_vanaf IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE meet_instrument_externe_identificator (
  -- Foreign key referencing meet_instrument_identity(systeem_uuid)
  meet_instrument_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (meet_instrument_id, externe_identificator_id)
);

COMMENT ON TABLE meet_instrument_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument';
COMMENT ON COLUMN meet_instrument_externe_identificator.meet_instrument_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meet_instrument_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meet_instrument_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meet_instrument_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meet_instrument_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument
-- Table type: IDENTITY
CREATE TABLE meet_instrument_identity (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE meet_instrument_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument';
COMMENT ON COLUMN meet_instrument_identity.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- http://www.w3.org/ns/sosa/madeBySensor
CREATE TABLE meetinstrument (
  uuid VARCHAR,
  uri VARCHAR,
  made_by_sensor VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE meetinstrument IS 'http://www.w3.org/ns/sosa/madeBySensor';
COMMENT ON COLUMN meetinstrument.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetinstrument.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meetinstrument.made_by_sensor IS 'http://www.w3.org/ns/sosa/madeBySensor';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
CREATE TABLE meetpunt (
  id VARCHAR,
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
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
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  in_gebruik_tot DATE,
  in_gebruik_vanaf DATE,
  PRIMARY KEY (id, systeem_uuid)
);

COMMENT ON TABLE meetpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN meetpunt.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meetpunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN meetpunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meetpunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN meetpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meetpunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN meetpunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN meetpunt.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN meetpunt.in_gebruik_tot IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot';
COMMENT ON COLUMN meetpunt.in_gebruik_vanaf IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE meetpunt_externe_identificator (
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  meetpunt_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (meetpunt_id, externe_identificator_id)
);

COMMENT ON TABLE meetpunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_externe_identificator.meetpunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_filter
CREATE TABLE meetpunt_filter (
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  meetpunt_id VARCHAR,
  -- Foreign key referencing filter_identity(systeem_uuid)
  filter_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (meetpunt_id, filter_id)
);

COMMENT ON TABLE meetpunt_filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_filter.meetpunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_filter.filter_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_filter.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt_filter.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt_filter.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_meet_instrument
CREATE TABLE meetpunt_meet_instrument (
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  meetpunt_id VARCHAR,
  -- Foreign key referencing meet_instrument_identity(systeem_uuid)
  meet_instrument_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (meetpunt_id, meet_instrument_id)
);

COMMENT ON TABLE meetpunt_meet_instrument IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_meet_instrument.meetpunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_meet_instrument.meet_instrument_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_meet_instrument.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt_meet_instrument.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt_meet_instrument.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeemeigenschap
CREATE TABLE meetpunt_systeemeigenschap (
  -- Foreign key referencing meetpunt_identity(systeem_uuid)
  meetpunt_id VARCHAR,
  -- Foreign key referencing systeemeigenschap(uuid)
  systeemeigenschap_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (meetpunt_id, systeemeigenschap_id)
);

COMMENT ON TABLE meetpunt_systeemeigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_systeemeigenschap.meetpunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_systeemeigenschap.systeemeigenschap_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_systeemeigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt_systeemeigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt_systeemeigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie
CREATE TABLE observatie (
  uuid VARCHAR,
  uri VARCHAR,
  -- Foreign key referencing gebeurtenis(uuid)
  betrekking_tot VARCHAR,
  -- Foreign key referencing meet_instrument_identity(systeem_uuid)
  made_by_sensor VARCHAR,
  observed_property VARCHAR,
  phenomenon_time VARCHAR,
  result_time TIMESTAMP,
  used_procedure VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE observatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie';
COMMENT ON COLUMN observatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN observatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN observatie.betrekking_tot IS 'http://www.w3.org/ns/sosa/hasFeatureOfInterest';
COMMENT ON COLUMN observatie.made_by_sensor IS 'http://www.w3.org/ns/sosa/madeBySensor';
COMMENT ON COLUMN observatie.observed_property IS 'http://www.w3.org/ns/sosa/observedProperty';
COMMENT ON COLUMN observatie.phenomenon_time IS 'http://www.w3.org/ns/sosa/phenomenonTime';
COMMENT ON COLUMN observatie.result_time IS 'http://www.w3.org/ns/sosa/resultTime';
COMMENT ON COLUMN observatie.used_procedure IS 'http://www.w3.org/ns/sosa/usedProcedure';
COMMENT ON COLUMN observatie.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie
-- Table type: JOIN
-- Original relation: heeft_resultaat_resultaat
CREATE TABLE observatie_resultaat (
  -- Foreign key referencing observatie(uuid)
  observatie_id VARCHAR,
  -- Foreign key referencing resultaat(uuid)
  resultaat_id VARCHAR,
  PRIMARY KEY (observatie_id, resultaat_id)
);

COMMENT ON TABLE observatie_resultaat IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie';
COMMENT ON COLUMN observatie_resultaat.observatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN observatie_resultaat.resultaat_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekking
CREATE TABLE onttrekking (
  -- Foreign key referencing gebeurtenis(uuid)
  gebeurtenis_uuid VARCHAR,
  uri VARCHAR,
  PRIMARY KEY (gebeurtenis_uuid)
);

COMMENT ON TABLE onttrekking IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekking';
COMMENT ON COLUMN onttrekking.gebeurtenis_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekking.uri IS 'http://example.org/vocab/uri';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekking
-- Table type: JOIN
-- Original relation: betrekking_tot_proces
CREATE TABLE onttrekking_proces (
  -- Foreign key referencing onttrekking(gebeurtenis_uuid)
  onttrekking_id VARCHAR,
  -- Foreign key referencing proces(uuid)
  proces_id VARCHAR,
  PRIMARY KEY (onttrekking_id)
);

COMMENT ON TABLE onttrekking_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekking';
COMMENT ON COLUMN onttrekking_proces.onttrekking_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekking_proces.proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
CREATE TABLE onttrekkingspunt (
  id VARCHAR,
  -- Foreign key referencing onttrekkingspunt_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
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
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  in_gebruik_tot DATE,
  in_gebruik_vanaf DATE,
  PRIMARY KEY (id, systeem_uuid)
);

COMMENT ON TABLE onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN onttrekkingspunt.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN onttrekkingspunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN onttrekkingspunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN onttrekkingspunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN onttrekkingspunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN onttrekkingspunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN onttrekkingspunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN onttrekkingspunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN onttrekkingspunt.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN onttrekkingspunt.in_gebruik_tot IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot';
COMMENT ON COLUMN onttrekkingspunt.in_gebruik_vanaf IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE onttrekkingspunt_externe_identificator (
  -- Foreign key referencing onttrekkingspunt_identity(systeem_uuid)
  onttrekkingspunt_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (onttrekkingspunt_id, externe_identificator_id)
);

COMMENT ON TABLE onttrekkingspunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_externe_identificator.onttrekkingspunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_filter
CREATE TABLE onttrekkingspunt_filter (
  -- Foreign key referencing onttrekkingspunt_identity(systeem_uuid)
  onttrekkingspunt_id VARCHAR,
  -- Foreign key referencing filter_identity(systeem_uuid)
  filter_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (onttrekkingspunt_id, filter_id)
);

COMMENT ON TABLE onttrekkingspunt_filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_filter.onttrekkingspunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_filter.filter_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN onttrekkingspunt_filter.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt_filter.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt_filter.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeemeigenschap
CREATE TABLE onttrekkingspunt_systeemeigenschap (
  -- Foreign key referencing onttrekkingspunt_identity(systeem_uuid)
  onttrekkingspunt_id VARCHAR,
  -- Foreign key referencing systeemeigenschap(uuid)
  systeemeigenschap_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (onttrekkingspunt_id, systeemeigenschap_id)
);

COMMENT ON TABLE onttrekkingspunt_systeemeigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_systeemeigenschap.onttrekkingspunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_systeemeigenschap.systeemeigenschap_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_systeemeigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt_systeemeigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt_systeemeigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- http://www.w3.org/ns/sosa/observedProperty
CREATE TABLE parameter (
  uuid VARCHAR,
  uri VARCHAR,
  observed_property VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE parameter IS 'http://www.w3.org/ns/sosa/observedProperty';
COMMENT ON COLUMN parameter.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN parameter.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN parameter.observed_property IS 'http://www.w3.org/ns/sosa/observedProperty';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
CREATE TABLE proces (
  id VARCHAR,
  uuid VARCHAR,
  uri VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  -- Foreign key referencing proces(uuid)
  onderdeel_van VARCHAR,
  beschrijving VARCHAR,
  benaming VARCHAR,
  -- Foreign key referencing proces(uuid)
  revisie_van VARCHAR,
  -- Foreign key referencing systeem(uuid)
  systeem VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (id)
);

COMMENT ON TABLE proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN proces.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN proces.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces.onderdeel_van IS 'http://purl.org/net/p-plan#isStepOfPlan';
COMMENT ON COLUMN proces.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN proces.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN proces.systeem IS 'http://www.w3.org/ns/ssn/implementedBy';
COMMENT ON COLUMN proces.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: has_step_proces
CREATE TABLE proces_proces_has_step (
  -- Foreign key referencing proces(uuid)
  proces_id VARCHAR,
  -- Foreign key referencing proces(uuid)
  has_step_proces_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE
);

COMMENT ON TABLE proces_proces_has_step IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces_proces_has_step.proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_has_step.has_step_proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_has_step.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_proces_has_step.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_proces_has_step.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: proces_proces_variabele
CREATE TABLE proces_proces_variabele (
  -- Foreign key referencing proces(uuid)
  proces_id VARCHAR,
  -- Foreign key referencing proces_variabele(uuid)
  proces_variabele_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  relation_type proces_proces_variabele_merge_type,
  PRIMARY KEY (proces_variabele_id, relation_type)
);

COMMENT ON TABLE proces_proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces_proces_variabele.proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_variabele.proces_variabele_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_variabele.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_proces_variabele.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_proces_variabele.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: volgt_op_proces
CREATE TABLE proces_proces_volgt_op (
  -- Foreign key referencing proces(uuid)
  proces_id VARCHAR,
  -- Foreign key referencing proces(uuid)
  volgt_op_proces_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE
);

COMMENT ON TABLE proces_proces_volgt_op IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces_proces_volgt_op.proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_volgt_op.volgt_op_proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_volgt_op.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_proces_volgt_op.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_proces_volgt_op.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: rubriek_rubriek
CREATE TABLE proces_rubriek (
  -- Foreign key referencing proces(uuid)
  proces_id VARCHAR,
  -- Foreign key referencing rubriek(uuid)
  rubriek_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (rubriek_id)
);

COMMENT ON TABLE proces_rubriek IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces_rubriek.proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_rubriek.rubriek_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_rubriek.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_rubriek.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_rubriek.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele
CREATE TABLE proces_variabele (
  uuid VARCHAR,
  uri VARCHAR,
  type VARCHAR,
  eenheid VARCHAR,
  waarde DECIMAL,
  benaming VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele';
COMMENT ON COLUMN proces_variabele.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_variabele.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces_variabele.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces_variabele.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN proces_variabele.waarde IS 'http://qudt.org/schema/qudt/numericValue';
COMMENT ON COLUMN proces_variabele.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat
CREATE TABLE resultaat (
  uuid VARCHAR,
  uri VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE resultaat IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat';
COMMENT ON COLUMN resultaat.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN resultaat.uri IS 'http://example.org/vocab/uri';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek
CREATE TABLE rubriek (
  uuid VARCHAR,
  uri VARCHAR,
  type VARCHAR,
  definition VARCHAR,
  notatie VARCHAR,
  notatie_datatype VARCHAR,
  primaire_bron VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE rubriek IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek';
COMMENT ON COLUMN rubriek.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN rubriek.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN rubriek.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN rubriek.definition IS 'http://www.w3.org/2004/02/skos/core#definition';
COMMENT ON COLUMN rubriek.notatie IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN rubriek.notatie_datatype IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN rubriek.primaire_bron IS 'http://www.w3.org/ns/prov#hadPrimarySource';

----------------------------------------------------------------------

-- http://www.w3.org/ns/ssn/System
CREATE TABLE systeem (
  uuid VARCHAR,
  uri VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE systeem IS 'http://www.w3.org/ns/ssn/System';
COMMENT ON COLUMN systeem.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN systeem.uri IS 'http://example.org/vocab/uri';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Systeemeigenschap
CREATE TABLE systeemeigenschap (
  uuid VARCHAR,
  uri VARCHAR,
  type VARCHAR,
  eenheid VARCHAR,
  benaming VARCHAR,
  value VARCHAR,
  datatype VARCHAR,
  datatype_datatype VARCHAR,
  parameter VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE systeemeigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Systeemeigenschap';
COMMENT ON COLUMN systeemeigenschap.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN systeemeigenschap.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN systeemeigenschap.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN systeemeigenschap.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN systeemeigenschap.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN systeemeigenschap.value IS 'http://www.w3.org/2000/01/rdf-schema#value';
COMMENT ON COLUMN systeemeigenschap.datatype IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#datatype';
COMMENT ON COLUMN systeemeigenschap.datatype_datatype IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#datatype';
COMMENT ON COLUMN systeemeigenschap.parameter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#parameter';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie
CREATE TABLE transactie (
  uuid VARCHAR,
  uri VARCHAR,
  einddatum TIMESTAMP,
  startdatum TIMESTAMP,
  -- Foreign key referencing exploitant(uuid)
  verantwoordelijke VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE transactie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie';
COMMENT ON COLUMN transactie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN transactie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN transactie.einddatum IS 'http://www.w3.org/ns/prov#endedAtTime';
COMMENT ON COLUMN transactie.startdatum IS 'http://www.w3.org/ns/prov#startedAtTime';
COMMENT ON COLUMN transactie.verantwoordelijke IS 'http://www.w3.org/ns/prov#wasAssociatedWith';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie
-- Table type: JOIN
-- Original relation: genereert_aangifte_bundel
CREATE TABLE transactie_aangifte_bundel (
  -- Foreign key referencing transactie(uuid)
  transactie_id VARCHAR,
  -- Foreign key referencing aangifte_bundel(uuid)
  aangifte_bundel_id VARCHAR,
  PRIMARY KEY (transactie_id)
);

COMMENT ON TABLE transactie_aangifte_bundel IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie';
COMMENT ON COLUMN transactie_aangifte_bundel.transactie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN transactie_aangifte_bundel.aangifte_bundel_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisseling
CREATE TABLE uitwisseling (
  -- Foreign key referencing gebeurtenis(uuid)
  gebeurtenis_uuid VARCHAR,
  uri VARCHAR,
  PRIMARY KEY (gebeurtenis_uuid)
);

COMMENT ON TABLE uitwisseling IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisseling';
COMMENT ON COLUMN uitwisseling.gebeurtenis_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN uitwisseling.uri IS 'http://example.org/vocab/uri';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisseling
-- Table type: JOIN
-- Original relation: betrekking_tot_proces
CREATE TABLE uitwisseling_proces (
  -- Foreign key referencing uitwisseling(gebeurtenis_uuid)
  uitwisseling_id VARCHAR,
  -- Foreign key referencing proces(uuid)
  proces_id VARCHAR,
  PRIMARY KEY (uitwisseling_id)
);

COMMENT ON TABLE uitwisseling_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisseling';
COMMENT ON COLUMN uitwisseling_proces.uitwisseling_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN uitwisseling_proces.proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt
CREATE TABLE uitwisselpunt (
  id VARCHAR,
  -- Foreign key referencing uitwisselpunt_identity(systeem_uuid)
  systeem_uuid VARCHAR,
  uri VARCHAR,
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
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  in_gebruik_tot DATE,
  in_gebruik_vanaf DATE,
  PRIMARY KEY (id, systeem_uuid)
);

COMMENT ON TABLE uitwisselpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt';
COMMENT ON COLUMN uitwisselpunt.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN uitwisselpunt.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN uitwisselpunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN uitwisselpunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN uitwisselpunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN uitwisselpunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN uitwisselpunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN uitwisselpunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN uitwisselpunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN uitwisselpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN uitwisselpunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN uitwisselpunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN uitwisselpunt.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN uitwisselpunt.in_gebruik_tot IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikTot';
COMMENT ON COLUMN uitwisselpunt.in_gebruik_vanaf IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#inGebruikVanaf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt
-- Table type: JOIN
-- Original relation: identifier_externe_identificator
CREATE TABLE uitwisselpunt_externe_identificator (
  -- Foreign key referencing uitwisselpunt_identity(systeem_uuid)
  uitwisselpunt_id VARCHAR,
  -- Foreign key referencing externe_identificator(uuid)
  externe_identificator_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (uitwisselpunt_id, externe_identificator_id)
);

COMMENT ON TABLE uitwisselpunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt';
COMMENT ON COLUMN uitwisselpunt_externe_identificator.uitwisselpunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN uitwisselpunt_externe_identificator.externe_identificator_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN uitwisselpunt_externe_identificator.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN uitwisselpunt_externe_identificator.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN uitwisselpunt_externe_identificator.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_filter
CREATE TABLE uitwisselpunt_filter (
  -- Foreign key referencing uitwisselpunt_identity(systeem_uuid)
  uitwisselpunt_id VARCHAR,
  -- Foreign key referencing filter_identity(systeem_uuid)
  filter_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (uitwisselpunt_id, filter_id)
);

COMMENT ON TABLE uitwisselpunt_filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt';
COMMENT ON COLUMN uitwisselpunt_filter.uitwisselpunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN uitwisselpunt_filter.filter_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#id';
COMMENT ON COLUMN uitwisselpunt_filter.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN uitwisselpunt_filter.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN uitwisselpunt_filter.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt
-- Table type: IDENTITY
CREATE TABLE uitwisselpunt_identity (
  -- Foreign key referencing systeem(uuid)
  systeem_uuid VARCHAR,
  PRIMARY KEY (systeem_uuid)
);

COMMENT ON TABLE uitwisselpunt_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt';
COMMENT ON COLUMN uitwisselpunt_identity.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt
-- Table type: JOIN
-- Original relation: heeft_eigenschap_systeemeigenschap
CREATE TABLE uitwisselpunt_systeemeigenschap (
  -- Foreign key referencing uitwisselpunt_identity(systeem_uuid)
  uitwisselpunt_id VARCHAR,
  -- Foreign key referencing systeemeigenschap(uuid)
  systeemeigenschap_id VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  geldig_tot DATE,
  PRIMARY KEY (uitwisselpunt_id, systeemeigenschap_id)
);

COMMENT ON TABLE uitwisselpunt_systeemeigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Uitwisselpunt';
COMMENT ON COLUMN uitwisselpunt_systeemeigenschap.uitwisselpunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN uitwisselpunt_systeemeigenschap.systeemeigenschap_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN uitwisselpunt_systeemeigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN uitwisselpunt_systeemeigenschap.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN uitwisselpunt_systeemeigenschap.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- Foreign key constraints

ALTER TABLE aangifte ADD FOREIGN KEY (onderdeel_van) REFERENCES aangifte_bundel(uuid);
ALTER TABLE aangifte_bundel ADD FOREIGN KEY (creator) REFERENCES exploitant(uuid);
ALTER TABLE contactgegevens ADD FOREIGN KEY (has_target) REFERENCES exploitatie(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (systeem_uuid) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (systeem_uuid) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE emissiepunt_externe_identificator ADD FOREIGN KEY (emissiepunt_id) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE emissiepunt_systeem ADD FOREIGN KEY (emissiepunt_id) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE emissiepunt_systeemeigenschap ADD FOREIGN KEY (emissiepunt_id) REFERENCES emissiepunt_identity(systeem_uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (adres) REFERENCES adres(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (implementeert_proces) REFERENCES proces(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (adres) REFERENCES adres(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (toegewezen_aan) REFERENCES exploitant(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (revisie_van) REFERENCES exploitatielocatie(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE filter ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE filter ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE filter_externe_identificator ADD FOREIGN KEY (filter_id) REFERENCES filter_identity(systeem_uuid);
ALTER TABLE installatie ADD FOREIGN KEY (systeem_uuid) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE installatie ADD FOREIGN KEY (systeem_uuid) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE installatie ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE installatie_externe_identificator ADD FOREIGN KEY (installatie_id) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE installatie_systeem ADD FOREIGN KEY (installatie_id) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE installatie_systeemeigenschap ADD FOREIGN KEY (installatie_id) REFERENCES installatie_identity(systeem_uuid);
ALTER TABLE meet_instrument ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE meet_instrument ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE meet_instrument_externe_identificator ADD FOREIGN KEY (meet_instrument_id) REFERENCES meet_instrument_identity(systeem_uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (systeem_uuid) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (systeem_uuid) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE meetpunt_externe_identificator ADD FOREIGN KEY (meetpunt_id) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE meetpunt_filter ADD FOREIGN KEY (meetpunt_id) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE meetpunt_filter ADD FOREIGN KEY (filter_id) REFERENCES filter_identity(systeem_uuid);
ALTER TABLE meetpunt_meet_instrument ADD FOREIGN KEY (meetpunt_id) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE meetpunt_meet_instrument ADD FOREIGN KEY (meet_instrument_id) REFERENCES meet_instrument_identity(systeem_uuid);
ALTER TABLE meetpunt_systeemeigenschap ADD FOREIGN KEY (meetpunt_id) REFERENCES meetpunt_identity(systeem_uuid);
ALTER TABLE observatie ADD FOREIGN KEY (betrekking_tot) REFERENCES gebeurtenis(uuid);
ALTER TABLE observatie ADD FOREIGN KEY (made_by_sensor) REFERENCES meet_instrument_identity(systeem_uuid);
ALTER TABLE observatie ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (systeem_uuid) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (systeem_uuid) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE onttrekkingspunt_externe_identificator ADD FOREIGN KEY (onttrekkingspunt_id) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE onttrekkingspunt_filter ADD FOREIGN KEY (onttrekkingspunt_id) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE onttrekkingspunt_systeemeigenschap ADD FOREIGN KEY (onttrekkingspunt_id) REFERENCES onttrekkingspunt_identity(systeem_uuid);
ALTER TABLE proces ADD FOREIGN KEY (onderdeel_van) REFERENCES proces(uuid);
ALTER TABLE proces ADD FOREIGN KEY (revisie_van) REFERENCES proces(uuid);
ALTER TABLE proces ADD FOREIGN KEY (systeem) REFERENCES systeem(uuid);
ALTER TABLE proces ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE transactie ADD FOREIGN KEY (verantwoordelijke) REFERENCES exploitant(uuid);
ALTER TABLE uitwisselpunt ADD FOREIGN KEY (systeem_uuid) REFERENCES uitwisselpunt_identity(systeem_uuid);
ALTER TABLE uitwisselpunt ADD FOREIGN KEY (systeem_uuid) REFERENCES uitwisselpunt_identity(systeem_uuid);
ALTER TABLE uitwisselpunt ADD FOREIGN KEY (revisie_van) REFERENCES systeem(uuid);
ALTER TABLE uitwisselpunt ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE uitwisselpunt_externe_identificator ADD FOREIGN KEY (uitwisselpunt_id) REFERENCES uitwisselpunt_identity(systeem_uuid);
ALTER TABLE uitwisselpunt_filter ADD FOREIGN KEY (uitwisselpunt_id) REFERENCES uitwisselpunt_identity(systeem_uuid);
ALTER TABLE uitwisselpunt_systeemeigenschap ADD FOREIGN KEY (uitwisselpunt_id) REFERENCES uitwisselpunt_identity(systeem_uuid);
