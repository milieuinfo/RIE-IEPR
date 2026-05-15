-- Auto-generated SQL schema from ODDToolkit
-- Ontology: null
-- Generated: 2026-05-15T17:21:22.017447912+02:00[Europe/Amsterdam]

-- http://www.w3.org/ns/sosa/Procedure
CREATE TYPE procedure AS ENUM (
  'EMISSIE',
  'MEET',
  'ONTTREKKING',
  'TRANSPORT',
  'VERWERKING'
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
  vlaanderen_id VARCHAR,
  uri VARCHAR,
  aangemaakt_op DATE,
  -- Foreign key referencing aangifte(vlaanderen_id)
  onderdeel_van VARCHAR,
  verantwoordelijke VARCHAR,
  informatieclassificatie VARCHAR,
  PRIMARY KEY (vlaanderen_id)
);

COMMENT ON TABLE aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte';
COMMENT ON COLUMN aangifte.vlaanderen_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId';
COMMENT ON COLUMN aangifte.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN aangifte.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN aangifte.onderdeel_van IS 'http://purl.org/dc/terms/isPartOf';
COMMENT ON COLUMN aangifte.verantwoordelijke IS 'http://www.w3.org/ns/prov#wasAssociatedWith';
COMMENT ON COLUMN aangifte.informatieclassificatie IS 'https://data.vlaanderen.be/ns/dossier#informatieclassificatie';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte
-- Table type: JOIN
-- Original relation: subject_exploitatie
CREATE TABLE aangifte_exploitatie (
  -- Foreign key referencing aangifte(vlaanderen_id)
  source_vlaanderen_id VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  aangemaakt_op DATE,
  PRIMARY KEY (source_vlaanderen_id, target_uuid)
);

COMMENT ON TABLE aangifte_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte';
COMMENT ON COLUMN aangifte_exploitatie.source_vlaanderen_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId';
COMMENT ON COLUMN aangifte_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN aangifte_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte
-- Table type: JOIN
-- Original relation: subject_observatie
CREATE TABLE aangifte_observatie (
  -- Foreign key referencing aangifte(vlaanderen_id)
  source_vlaanderen_id VARCHAR,
  -- Foreign key referencing observatie(uuid)
  target_uuid VARCHAR,
  aangemaakt_op DATE,
  PRIMARY KEY (source_vlaanderen_id, target_uuid)
);

COMMENT ON TABLE aangifte_observatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte';
COMMENT ON COLUMN aangifte_observatie.source_vlaanderen_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId';
COMMENT ON COLUMN aangifte_observatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN aangifte_observatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';

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
  uri VARCHAR,
  full_address VARCHAR,
  locator_designator VARCHAR
);

COMMENT ON TABLE adres IS 'http://www.w3.org/ns/locn#Address';
COMMENT ON COLUMN adres.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN adres.full_address IS 'http://www.w3.org/ns/locn#fullAddress';
COMMENT ON COLUMN adres.locator_designator IS 'http://www.w3.org/ns/locn#locatorDesignator';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon
CREATE TABLE contactpersoon (
  -- Foreign key referencing contactpersoon_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  beschrijving VARCHAR,
  benaming VARCHAR,
  functie VARCHAR,
  email VARCHAR,
  name VARCHAR,
  telefoonnummer VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';
COMMENT ON COLUMN contactpersoon.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactpersoon.uri IS 'http://example.org/vocab/uri';
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
-- Table type: JOIN
-- Original relation: contactpersoon_van_exploitant
CREATE TABLE contactpersoon_exploitant (
  -- Foreign key referencing contactpersoon_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitant_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE contactpersoon_exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';
COMMENT ON COLUMN contactpersoon_exploitant.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactpersoon_exploitant.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactpersoon_exploitant.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon_exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactpersoon_exploitant.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon
-- Table type: JOIN
-- Original relation: contactpersoon_van_exploitatie
CREATE TABLE contactpersoon_exploitatie (
  -- Foreign key referencing contactpersoon_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE contactpersoon_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';
COMMENT ON COLUMN contactpersoon_exploitatie.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactpersoon_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactpersoon_exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactpersoon_exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie
CREATE TABLE emissie (
  uri VARCHAR,
  quantity_value VARCHAR,
  is_result_of VARCHAR
);

COMMENT ON TABLE emissie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie';
COMMENT ON COLUMN emissie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN emissie.quantity_value IS 'http://qudt.org/schema/qudt/quantityValue';
COMMENT ON COLUMN emissie.is_result_of IS 'http://www.w3.org/ns/sosa/isResultOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
CREATE TABLE emissiepunt (
  -- Foreign key referencing emissiepunt_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  identifier VARCHAR,
  status VARCHAR,
  revisie_van VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR,
  heeft_eigenschap VARCHAR,
  heeft_sub_systeem VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN emissiepunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN emissiepunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN emissiepunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN emissiepunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN emissiepunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN emissiepunt.identifier IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN emissiepunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN emissiepunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN emissiepunt.locatie IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN emissiepunt.heeft_eigenschap IS 'http://www.w3.org/ns/ssn/hasProperty';
COMMENT ON COLUMN emissiepunt.heeft_sub_systeem IS 'http://www.w3.org/ns/ssn/hasSubSystem';
COMMENT ON COLUMN emissiepunt.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
-- Table type: JOIN
-- Original relation: has_deployment_exploitatie
CREATE TABLE emissiepunt_exploitatie (
  -- Foreign key referencing emissiepunt_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE emissiepunt_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt_exploitatie.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt_exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
CREATE TABLE exploitant (
  -- Foreign key referencing exploitant_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  adres VARCHAR,
  classification VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN exploitant.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitant.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitant.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitant.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitant.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitant.adres IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitant.classification IS 'http://www.w3.org/ns/org#classification';
COMMENT ON COLUMN exploitant.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
-- Table type: JOIN
-- Original relation: heeft_contactpersoon_contactpersoon
CREATE TABLE exploitant_contactpersoon (
  -- Foreign key referencing exploitant_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing contactpersoon_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE exploitant_contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN exploitant_contactpersoon.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitant_contactpersoon.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitant_contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant_contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitant_contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';

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
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  identifier VARCHAR,
  status VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR,
  systemen VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  implementeert_proces VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie.identifier IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN exploitatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN exploitatie.locatie IS 'http://www.w3.org/ns/ssn/deployedOnPlatform';
COMMENT ON COLUMN exploitatie.systemen IS 'http://www.w3.org/ns/ssn/deployedSystem';
COMMENT ON COLUMN exploitatie.implementeert_proces IS 'http://www.w3.org/ns/ssn/implements';
COMMENT ON COLUMN exploitatie.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
-- Table type: JOIN
-- Original relation: heeft_contactpersoon_contactpersoon
CREATE TABLE exploitatie_contactpersoon (
  -- Foreign key referencing exploitatie_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing contactpersoon_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE exploitatie_contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie_contactpersoon.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_contactpersoon.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_contactpersoon.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_contactpersoon.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_contactpersoon.geldig_tot IS 'http://purl.org/dc/terms/valid';

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
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  geometrie VARCHAR,
  beschrijving VARCHAR,
  benaming VARCHAR,
  identifier VARCHAR,
  adres VARCHAR,
  primaire_bron VARCHAR,
  -- Foreign key referencing exploitant_identity(uuid)
  toegewezen_aan VARCHAR,
  beinvloed_door VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  revisie_van VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE exploitatielocatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie';
COMMENT ON COLUMN exploitatielocatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatielocatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatielocatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatielocatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatielocatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatielocatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatielocatie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN exploitatielocatie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN exploitatielocatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatielocatie.identifier IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN exploitatielocatie.adres IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitatielocatie.primaire_bron IS 'http://www.w3.org/ns/prov#hadPrimarySource';
COMMENT ON COLUMN exploitatielocatie.toegewezen_aan IS 'http://www.w3.org/ns/prov#wasAttributedTo';
COMMENT ON COLUMN exploitatielocatie.beinvloed_door IS 'http://www.w3.org/ns/prov#wasInfluencedBy';
COMMENT ON COLUMN exploitatielocatie.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN exploitatielocatie.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie
-- Table type: JOIN
-- Original relation: in_deployment_exploitatie
CREATE TABLE exploitatielocatie_exploitatie (
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE exploitatielocatie_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie';
COMMENT ON COLUMN exploitatielocatie_exploitatie.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatielocatie_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatielocatie_exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatielocatie_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatielocatie_exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';

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
  uri VARCHAR,
  datatype VARCHAR,
  notatie VARCHAR,
  notatietype VARCHAR
);

COMMENT ON TABLE externe_identificator IS 'http://www.w3.org/ns/adms#Identifier';
COMMENT ON COLUMN externe_identificator.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN externe_identificator.datatype IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN externe_identificator.notatie IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN externe_identificator.notatietype IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#notatietype';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
CREATE TABLE filter (
  -- Foreign key referencing filter_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  identifier VARCHAR,
  status VARCHAR,
  revisie_van VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN filter.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN filter.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN filter.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN filter.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN filter.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN filter.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN filter.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN filter.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN filter.identifier IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN filter.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN filter.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN filter.locatie IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN filter.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
-- Table type: JOIN
-- Original relation: has_deployment_exploitatie
CREATE TABLE filter_exploitatie (
  -- Foreign key referencing filter_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE filter_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter_exploitatie.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN filter_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN filter_exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN filter_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN filter_exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
-- Table type: IDENTITY
CREATE TABLE filter_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE filter_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#HoeveelheidWaarde
CREATE TABLE hoeveelheid_waarde (
  uri VARCHAR,
  eenheid VARCHAR,
  waarde DECIMAL
);

COMMENT ON TABLE hoeveelheid_waarde IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#HoeveelheidWaarde';
COMMENT ON COLUMN hoeveelheid_waarde.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN hoeveelheid_waarde.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN hoeveelheid_waarde.waarde IS 'http://qudt.org/schema/qudt/numericValue';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
CREATE TABLE installatie (
  -- Foreign key referencing installatie_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  beschrijving VARCHAR,
  benaming VARCHAR,
  identifier VARCHAR,
  status VARCHAR,
  revisie_van VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR,
  heeft_eigenschap VARCHAR,
  heeft_sub_systeem VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  ingediend VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE installatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN installatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN installatie.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN installatie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN installatie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN installatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN installatie.identifier IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN installatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN installatie.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN installatie.locatie IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN installatie.heeft_eigenschap IS 'http://www.w3.org/ns/ssn/hasProperty';
COMMENT ON COLUMN installatie.heeft_sub_systeem IS 'http://www.w3.org/ns/ssn/hasSubSystem';
COMMENT ON COLUMN installatie.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN installatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
-- Table type: JOIN
-- Original relation: has_deployment_exploitatie
CREATE TABLE installatie_exploitatie (
  -- Foreign key referencing installatie_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE installatie_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_exploitatie.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie_exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument
CREATE TABLE meet_instrument (
  -- Foreign key referencing meet_instrument_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  identifier VARCHAR,
  status VARCHAR,
  revisie_van VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE meet_instrument IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument';
COMMENT ON COLUMN meet_instrument.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meet_instrument.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meet_instrument.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meet_instrument.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meet_instrument.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meet_instrument.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN meet_instrument.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meet_instrument.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN meet_instrument.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meet_instrument.identifier IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN meet_instrument.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN meet_instrument.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN meet_instrument.locatie IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN meet_instrument.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument
-- Table type: JOIN
-- Original relation: has_deployment_exploitatie
CREATE TABLE meet_instrument_exploitatie (
  -- Foreign key referencing meet_instrument_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE meet_instrument_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument';
COMMENT ON COLUMN meet_instrument_exploitatie.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meet_instrument_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meet_instrument_exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meet_instrument_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meet_instrument_exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument
-- Table type: IDENTITY
CREATE TABLE meet_instrument_identity (
  uuid VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE meet_instrument_identity IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument';
COMMENT ON COLUMN meet_instrument_identity.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
CREATE TABLE meetpunt (
  -- Foreign key referencing meetpunt_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  identifier VARCHAR,
  status VARCHAR,
  revisie_van VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR,
  heeft_eigenschap VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE meetpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meetpunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN meetpunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meetpunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN meetpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meetpunt.identifier IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN meetpunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN meetpunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN meetpunt.locatie IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN meetpunt.heeft_eigenschap IS 'http://www.w3.org/ns/ssn/hasProperty';
COMMENT ON COLUMN meetpunt.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: has_deployment_exploitatie
CREATE TABLE meetpunt_exploitatie (
  -- Foreign key referencing meetpunt_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE meetpunt_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_exploitatie.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt_exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_meet_instrument
CREATE TABLE meetpunt_meet_instrument (
  -- Foreign key referencing meetpunt_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing meet_instrument_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE meetpunt_meet_instrument IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_meet_instrument.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_meet_instrument.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_meet_instrument.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt_meet_instrument.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt_meet_instrument.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie
CREATE TABLE observatie (
  uuid VARCHAR,
  uri VARCHAR,
  aangemaakt_op TIMESTAMP,
  geldig_van DATE,
  aangepast_op TIMESTAMP,
  benaming VARCHAR,
  -- Foreign key referencing meetpunt_identity(uuid)
  heeft_aandachtspunt VARCHAR,
  heeft_resultaat VARCHAR,
  made_by_sensor VARCHAR,
  observed_property VARCHAR,
  phenomenon_time VARCHAR,
  result_time TIMESTAMP,
  used_procedure VARCHAR,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE observatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie';
COMMENT ON COLUMN observatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN observatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN observatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN observatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN observatie.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN observatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN observatie.heeft_aandachtspunt IS 'http://www.w3.org/ns/sosa/hasFeatureOfInterest';
COMMENT ON COLUMN observatie.heeft_resultaat IS 'http://www.w3.org/ns/sosa/hasResult';
COMMENT ON COLUMN observatie.made_by_sensor IS 'http://www.w3.org/ns/sosa/madeBySensor';
COMMENT ON COLUMN observatie.observed_property IS 'http://www.w3.org/ns/sosa/observedProperty';
COMMENT ON COLUMN observatie.phenomenon_time IS 'http://www.w3.org/ns/sosa/phenomenonTime';
COMMENT ON COLUMN observatie.result_time IS 'http://www.w3.org/ns/sosa/resultTime';
COMMENT ON COLUMN observatie.used_procedure IS 'http://www.w3.org/ns/sosa/usedProcedure';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekking
CREATE TABLE onttrekking (
  uri VARCHAR,
  quantity_value VARCHAR,
  is_result_of VARCHAR
);

COMMENT ON TABLE onttrekking IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekking';
COMMENT ON COLUMN onttrekking.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN onttrekking.quantity_value IS 'http://qudt.org/schema/qudt/quantityValue';
COMMENT ON COLUMN onttrekking.is_result_of IS 'http://www.w3.org/ns/sosa/isResultOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
CREATE TABLE onttrekkingspunt (
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  depth VARCHAR,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  geometrie VARCHAR,
  benaming VARCHAR,
  identifier VARCHAR,
  status VARCHAR,
  revisie_van VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR,
  heeft_eigenschap VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN onttrekkingspunt.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN onttrekkingspunt.depth IS 'http://dbpedia.org/ontology/depth';
COMMENT ON COLUMN onttrekkingspunt.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN onttrekkingspunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN onttrekkingspunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN onttrekkingspunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN onttrekkingspunt.identifier IS 'http://www.w3.org/ns/adms#identifier';
COMMENT ON COLUMN onttrekkingspunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN onttrekkingspunt.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN onttrekkingspunt.locatie IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN onttrekkingspunt.heeft_eigenschap IS 'http://www.w3.org/ns/ssn/hasProperty';
COMMENT ON COLUMN onttrekkingspunt.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: has_deployment_exploitatie
CREATE TABLE onttrekkingspunt_exploitatie (
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing exploitatie_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE onttrekkingspunt_exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_exploitatie.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_exploitatie.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_exploitatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt_exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt_exploitatie.geldig_tot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
-- Table type: JOIN
-- Original relation: heeft_sub_systeem_filter
CREATE TABLE onttrekkingspunt_filter (
  -- Foreign key referencing onttrekkingspunt_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing filter_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE onttrekkingspunt_filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_filter.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_filter.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_filter.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt_filter.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt_filter.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
CREATE TABLE proces (
  -- Foreign key referencing proces_identity(uuid)
  uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  uri VARCHAR,
  geldig_tot DATE,
  aangepast_op TIMESTAMP,
  type VARCHAR,
  heeft_invoer VARCHAR,
  heeft_uitvoer VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  onderdeel_van VARCHAR,
  beschrijving VARCHAR,
  benaming VARCHAR,
  status VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  revisie_van VARCHAR,
  -- Foreign key referencing installatie_identity(uuid)
  systeem VARCHAR,
  -- Foreign key referencing aangifte(uuid)
  aangifte VARCHAR,
  rubriek VARCHAR,
  PRIMARY KEY (uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces.aangepast_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN proces.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces.heeft_invoer IS 'http://purl.org/net/p-plan#hasInputVar';
COMMENT ON COLUMN proces.heeft_uitvoer IS 'http://purl.org/net/p-plan#hasOutputVar';
COMMENT ON COLUMN proces.onderdeel_van IS 'http://purl.org/net/p-plan#isStepOfPlan';
COMMENT ON COLUMN proces.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN proces.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN proces.revisie_van IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN proces.systeem IS 'http://www.w3.org/ns/ssn/implementedBy';
COMMENT ON COLUMN proces.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN proces.rubriek IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#rubriek';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
-- Table type: JOIN
-- Original relation: volgt_op_proces
CREATE TABLE proces_proces_volgt_op (
  -- Foreign key referencing proces_identity(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  target_uuid VARCHAR,
  geldig_van DATE,
  aangemaakt_op TIMESTAMP,
  geldig_tot DATE,
  PRIMARY KEY (source_uuid, target_uuid, geldig_van, aangemaakt_op)
);

COMMENT ON TABLE proces_proces_volgt_op IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces_proces_volgt_op.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_volgt_op.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_volgt_op.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_proces_volgt_op.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_proces_volgt_op.geldig_tot IS 'http://purl.org/dc/terms/valid';

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

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele
-- Table type: JOIN
-- Original relation: is_input_var_of_proces
CREATE TABLE proces_variabele_proces (
  -- Foreign key referencing proces_variabele(uuid)
  source_uuid VARCHAR,
  -- Foreign key referencing proces_identity(uuid)
  target_uuid VARCHAR,
  PRIMARY KEY (source_uuid, target_uuid)
);

COMMENT ON TABLE proces_variabele_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele';
COMMENT ON COLUMN proces_variabele_proces.source_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_variabele_proces.target_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Productievolume
CREATE TABLE productievolume (
  uri VARCHAR,
  quantity_value VARCHAR,
  is_result_of VARCHAR
);

COMMENT ON TABLE productievolume IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Productievolume';
COMMENT ON COLUMN productievolume.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN productievolume.quantity_value IS 'http://qudt.org/schema/qudt/quantityValue';
COMMENT ON COLUMN productievolume.is_result_of IS 'http://www.w3.org/ns/sosa/isResultOf';

----------------------------------------------------------------------

-- http://www.w3.org/ns/sosa/Result
CREATE TABLE resultaat (
  uri VARCHAR
);

COMMENT ON TABLE resultaat IS 'http://www.w3.org/ns/sosa/Result';
COMMENT ON COLUMN resultaat.uri IS 'http://example.org/vocab/uri';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek
CREATE TABLE rubriek (
  uri VARCHAR,
  type VARCHAR,
  definition VARCHAR,
  datatype VARCHAR,
  notatie VARCHAR
);

COMMENT ON TABLE rubriek IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek';
COMMENT ON COLUMN rubriek.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN rubriek.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN rubriek.definition IS 'http://www.w3.org/2004/02/skos/core#definition';
COMMENT ON COLUMN rubriek.datatype IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN rubriek.notatie IS 'http://www.w3.org/2004/02/skos/core#notation';

----------------------------------------------------------------------

-- http://www.w3.org/ns/ssn/System
CREATE TABLE systeem (
  uri VARCHAR
);

COMMENT ON TABLE systeem IS 'http://www.w3.org/ns/ssn/System';
COMMENT ON COLUMN systeem.uri IS 'http://example.org/vocab/uri';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#SysteemEigenschap
CREATE TABLE systeem_eigenschap (
  uri VARCHAR,
  type VARCHAR,
  eenheid VARCHAR,
  datatype VARCHAR,
  range VARCHAR,
  value VARCHAR,
  parameter VARCHAR
);

COMMENT ON TABLE systeem_eigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#SysteemEigenschap';
COMMENT ON COLUMN systeem_eigenschap.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN systeem_eigenschap.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN systeem_eigenschap.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN systeem_eigenschap.datatype IS 'http://www.w3.org/2000/01/rdf-schema#range';
COMMENT ON COLUMN systeem_eigenschap.range IS 'http://www.w3.org/2000/01/rdf-schema#range';
COMMENT ON COLUMN systeem_eigenschap.value IS 'http://www.w3.org/2000/01/rdf-schema#value';
COMMENT ON COLUMN systeem_eigenschap.parameter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#parameter';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie
CREATE TABLE transactie (
  uri VARCHAR,
  einddatum TIMESTAMP,
  startdatum TIMESTAMP,
  verantwoordelijke VARCHAR,
  -- Foreign key referencing aangifte(vlaanderen_id)
  genereert VARCHAR
);

COMMENT ON TABLE transactie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie';
COMMENT ON COLUMN transactie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN transactie.einddatum IS 'http://www.w3.org/ns/prov#endedAtTime';
COMMENT ON COLUMN transactie.startdatum IS 'http://www.w3.org/ns/prov#startedAtTime';
COMMENT ON COLUMN transactie.verantwoordelijke IS 'http://www.w3.org/ns/prov#wasAssociatedWith';
COMMENT ON COLUMN transactie.genereert IS 'https://data.vlaanderen.be/ns/dossier#genereert';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ZuiveringsApparaat
CREATE TABLE zuiverings_apparaat (
  uri VARCHAR,
  -- Foreign key referencing exploitatielocatie_identity(uuid)
  locatie VARCHAR
);

COMMENT ON TABLE zuiverings_apparaat IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ZuiveringsApparaat';
COMMENT ON COLUMN zuiverings_apparaat.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN zuiverings_apparaat.locatie IS 'http://www.w3.org/ns/sosa/isHostedBy';

----------------------------------------------------------------------

-- Foreign key constraints

ALTER TABLE aangifte ADD FOREIGN KEY (onderdeel_van) REFERENCES aangifte(vlaanderen_id);
ALTER TABLE contactpersoon ADD FOREIGN KEY (uuid) REFERENCES contactpersoon_identity(uuid);
ALTER TABLE contactpersoon ADD FOREIGN KEY (uuid) REFERENCES contactpersoon_identity(uuid);
ALTER TABLE contactpersoon_exploitant ADD FOREIGN KEY (source_uuid) REFERENCES contactpersoon_identity(uuid);
ALTER TABLE contactpersoon_exploitatie ADD FOREIGN KEY (source_uuid) REFERENCES contactpersoon_identity(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (uuid) REFERENCES emissiepunt_identity(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (uuid) REFERENCES emissiepunt_identity(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE emissiepunt ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE emissiepunt_exploitatie ADD FOREIGN KEY (source_uuid) REFERENCES emissiepunt_identity(uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitant ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE exploitant_contactpersoon ADD FOREIGN KEY (source_uuid) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (implementeert_proces) REFERENCES proces_identity(uuid);
ALTER TABLE exploitatie ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE exploitatie_contactpersoon ADD FOREIGN KEY (source_uuid) REFERENCES exploitatie_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (uuid) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (uuid) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (toegewezen_aan) REFERENCES exploitant_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (revisie_van) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE exploitatielocatie ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE exploitatielocatie_exploitatie ADD FOREIGN KEY (source_uuid) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE filter ADD FOREIGN KEY (uuid) REFERENCES filter_identity(uuid);
ALTER TABLE filter ADD FOREIGN KEY (uuid) REFERENCES filter_identity(uuid);
ALTER TABLE filter ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE filter ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE filter_exploitatie ADD FOREIGN KEY (source_uuid) REFERENCES filter_identity(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (uuid) REFERENCES installatie_identity(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (uuid) REFERENCES installatie_identity(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE installatie ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE installatie_exploitatie ADD FOREIGN KEY (source_uuid) REFERENCES installatie_identity(uuid);
ALTER TABLE meet_instrument ADD FOREIGN KEY (uuid) REFERENCES meet_instrument_identity(uuid);
ALTER TABLE meet_instrument ADD FOREIGN KEY (uuid) REFERENCES meet_instrument_identity(uuid);
ALTER TABLE meet_instrument ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE meet_instrument ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE meet_instrument_exploitatie ADD FOREIGN KEY (source_uuid) REFERENCES meet_instrument_identity(uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (uuid) REFERENCES meetpunt_identity(uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (uuid) REFERENCES meetpunt_identity(uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE meetpunt ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE meetpunt_exploitatie ADD FOREIGN KEY (source_uuid) REFERENCES meetpunt_identity(uuid);
ALTER TABLE meetpunt_meet_instrument ADD FOREIGN KEY (source_uuid) REFERENCES meetpunt_identity(uuid);
ALTER TABLE observatie ADD FOREIGN KEY (heeft_aandachtspunt) REFERENCES meetpunt_identity(uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (uuid) REFERENCES onttrekkingspunt_identity(uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (uuid) REFERENCES onttrekkingspunt_identity(uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
ALTER TABLE onttrekkingspunt ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE onttrekkingspunt_exploitatie ADD FOREIGN KEY (source_uuid) REFERENCES onttrekkingspunt_identity(uuid);
ALTER TABLE onttrekkingspunt_filter ADD FOREIGN KEY (source_uuid) REFERENCES onttrekkingspunt_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (uuid) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (uuid) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (onderdeel_van) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (revisie_van) REFERENCES proces_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (systeem) REFERENCES installatie_identity(uuid);
ALTER TABLE proces ADD FOREIGN KEY (aangifte) REFERENCES aangifte(uuid);
ALTER TABLE proces_proces_volgt_op ADD FOREIGN KEY (source_uuid) REFERENCES proces_identity(uuid);
ALTER TABLE transactie ADD FOREIGN KEY (genereert) REFERENCES aangifte(vlaanderen_id);
ALTER TABLE zuiverings_apparaat ADD FOREIGN KEY (locatie) REFERENCES exploitatielocatie_identity(uuid);
