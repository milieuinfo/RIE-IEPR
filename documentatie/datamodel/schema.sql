-- Auto-generated SQL schema from ODDToolkit
-- Ontology: null
-- Generated: 2026-02-20T14:52:15.174862+01:00[Europe/Brussels]

-- http://www.w3.org/ns/sosa/Procedure
CREATE TYPE Procedure AS ENUM (
  'VERBRUIK_PROCEDURE',
  'EMISSIE_PROCEDURE',
  'TRANSPORT_PROCEDURE',
  'MEET_PROCEDURE',
  'VERWERKING_PROCEDURE'
);

-- http://www.w3.org/ns/adms#Status
CREATE TYPE Status AS ENUM (
  'GESLOTEN',
  'VOORGESTELD',
  'INACTIEF',
  'ACTIEF'
);

CREATE TYPE proces_proces_variabele_merge_type AS ENUM (
  'heeft_uitvoer_uuid',
  'heeft_invoer_uuid'
);

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
CREATE TABLE emissiepunt (
  uri String,
  ingediend Boolean,
  geometrie String,
  aangepastOp DateTime,
  status Status,
  aangemaaktOp DateTime,
  locatie_uuid String,
  type String,
  geldigVan Date,
  benaming String,
  geldigTot Date,
  emissiepunt_uuid String,
  PRIMARY KEY (aangemaaktOp, geldigVan, emissiepunt_uuid),
  FOREIGN KEY (locatie_uuid) REFERENCES exploitatie_locatie(uuid),
  FOREIGN KEY (emissiepunt_uuid) REFERENCES systeem(uuid)
);

COMMENT ON TABLE emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN emissiepunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN emissiepunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN emissiepunt.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN emissiepunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN emissiepunt.aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt.locatie_uuid IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN emissiepunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN emissiepunt.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN emissiepunt.geldigTot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozing
CREATE TABLE lozing (
  lozing_uuid String,
  PRIMARY KEY (lozing_uuid),
  FOREIGN KEY (lozing_uuid) REFERENCES emissie(uuid)
);

COMMENT ON TABLE lozing IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozing';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon
CREATE TABLE contactpersoon (
  uuid String,
  uri String,
  ingediend Boolean,
  geldigVan Date,
  beschrijving String,
  aangepastOp DateTime,
  name String,
  benaming String,
  telefoonnummer String,
  aangemaaktOp DateTime,
  email String,
  hasRole String,
  geldigTot Date,
  PRIMARY KEY (uuid, geldigVan, aangemaaktOp)
);

COMMENT ON TABLE contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Contactpersoon';
COMMENT ON COLUMN contactpersoon.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN contactpersoon.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN contactpersoon.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN contactpersoon.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN contactpersoon.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN contactpersoon.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN contactpersoon.name IS 'http://xmlns.com/foaf/0.1/name';
COMMENT ON COLUMN contactpersoon.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN contactpersoon.telefoonnummer IS 'http://xmlns.com/foaf/0.1/phone';
COMMENT ON COLUMN contactpersoon.aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN contactpersoon.email IS 'http://xmlns.com/foaf/0.1/mbox';
COMMENT ON COLUMN contactpersoon.hasRole IS 'http://www.w3.org/ns/org#hasRole';
COMMENT ON COLUMN contactpersoon.geldigTot IS 'http://purl.org/dc/terms/valid';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
CREATE TABLE exploitatie (
  uri String,
  ingediend Boolean,
  implementeert_uuid String,
  aangepastOp DateTime,
  geldigTot Date,
  aangemaaktOp DateTime,
  status Status,
  geldigVan Date,
  benaming String,
  locatie_uuid String,
  PRIMARY KEY (aangemaaktOp, geldigVan),
  FOREIGN KEY (implementeert_uuid) REFERENCES proces(uuid),
  FOREIGN KEY (locatie_uuid) REFERENCES exploitatie_locatie(uuid)
);

COMMENT ON TABLE exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitatie.implementeert_uuid IS 'http://www.w3.org/ns/ssn/implements';
COMMENT ON COLUMN exploitatie.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatie.geldigTot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie.aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN exploitatie.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie.locatie_uuid IS 'http://www.w3.org/ns/ssn/deployedOnPlatform';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
CREATE TABLE exploitant (
  uri String,
  ingediend Boolean,
  benaming String,
  geldigTot Date,
  aangepastOp DateTime,
  adres_uuid String,
  geldigVan Date,
  type String,
  aangemaaktOp DateTime,
  PRIMARY KEY (geldigVan, aangemaaktOp),
  FOREIGN KEY (adres_uuid) REFERENCES adres(uuid)
);

COMMENT ON TABLE exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN exploitant.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitant.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitant.geldigTot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitant.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitant.adres_uuid IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitant.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN exploitant.aangemaaktOp IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
CREATE TABLE meetpunt (
  uri String,
  ingediend Boolean,
  benaming String,
  geometrie String,
  geldigVan Date,
  aangepastOp DateTime,
  type String,
  status Status,
  geldigTot Date,
  aangemaaktOp DateTime,
  meetpunt_uuid String,
  PRIMARY KEY (geldigVan, aangemaaktOp, meetpunt_uuid),
  FOREIGN KEY (meetpunt_uuid) REFERENCES systeem(uuid)
);

COMMENT ON TABLE meetpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN meetpunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN meetpunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN meetpunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN meetpunt.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN meetpunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN meetpunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN meetpunt.geldigTot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN meetpunt.aangemaaktOp IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele
CREATE TABLE proces_variabele (
  uuid String,
  uri String,
  ingediend Boolean,
  waarde Decimal,
  eenheid String,
  benaming String,
  type String,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesVariabele';
COMMENT ON COLUMN proces_variabele.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_variabele.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces_variabele.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN proces_variabele.waarde IS 'http://qudt.org/schema/qudt/numericValue';
COMMENT ON COLUMN proces_variabele.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN proces_variabele.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces_variabele.type IS 'http://purl.org/dc/terms/type';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Schouw
CREATE TABLE schouw (
  hoogte String,
  diameter String,
  schouw_uuid String,
  PRIMARY KEY (schouw_uuid),
  FOREIGN KEY (schouw_uuid) REFERENCES emissiepunt(uuid)
);

COMMENT ON TABLE schouw IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Schouw';
COMMENT ON COLUMN schouw.hoogte IS 'http://dbpedia.org/ontology/height';
COMMENT ON COLUMN schouw.diameter IS 'http://dbpedia.org/ontology/diameter';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie
CREATE TABLE emissie (
  uuid String,
  uri String,
  ingediend Boolean,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE emissie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissie';
COMMENT ON COLUMN emissie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN emissie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie
CREATE TABLE observatie (
  uuid String,
  uri String,
  ingediend Boolean,
  heeftResultaat Lozing,
  heeftAandachtspunt_uuid String,
  PRIMARY KEY (uuid),
  FOREIGN KEY (heeftAandachtspunt_uuid) REFERENCES emissie(uuid)
);

COMMENT ON TABLE observatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie';
COMMENT ON COLUMN observatie.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN observatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN observatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN observatie.heeftResultaat IS 'http://www.w3.org/ns/sosa/hasResult';
COMMENT ON COLUMN observatie.heeftAandachtspunt_uuid IS 'http://www.w3.org/ns/sosa/hasFeatureOfInterest';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AbstractEmissiepunt
CREATE TABLE abstract_emissiepunt (
  abstract_emissiepunt_uuid String,
  PRIMARY KEY (abstract_emissiepunt_uuid),
  FOREIGN KEY (abstract_emissiepunt_uuid) REFERENCES emissiepunt(uuid)
);

COMMENT ON TABLE abstract_emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#AbstractEmissiepunt';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
CREATE TABLE installatie (
  uri String,
  ingediend Boolean,
  revisieVan_uuid String,
  status Status,
  geldigVan Date,
  aangemaaktOp DateTime,
  locatie_uuid String,
  geldigTot Date,
  aangepastOp DateTime,
  benaming String,
  installatie_uuid String,
  PRIMARY KEY (geldigVan, aangemaaktOp, installatie_uuid),
  FOREIGN KEY (revisieVan_uuid) REFERENCES installatie(uuid),
  FOREIGN KEY (locatie_uuid) REFERENCES exploitatie_locatie(uuid),
  FOREIGN KEY (installatie_uuid) REFERENCES systeem(uuid)
);

COMMENT ON TABLE installatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN installatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN installatie.revisieVan_uuid IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN installatie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN installatie.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie.aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie.locatie_uuid IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN installatie.geldigTot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN installatie.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN installatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
CREATE TABLE onttrekkingspunt (
  uri String,
  ingediend Boolean,
  locatie_uuid String,
  type String,
  geldigVan Date,
  benaming String,
  aangepastOp DateTime,
  geldigTot Date,
  status Status,
  geometrie String,
  aangemaaktOp DateTime,
  onttrekkingspunt_uuid String,
  PRIMARY KEY (geldigVan, aangemaaktOp, onttrekkingspunt_uuid),
  FOREIGN KEY (locatie_uuid) REFERENCES exploitatie_locatie(uuid),
  FOREIGN KEY (onttrekkingspunt_uuid) REFERENCES systeem(uuid)
);

COMMENT ON TABLE onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN onttrekkingspunt.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN onttrekkingspunt.locatie_uuid IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN onttrekkingspunt.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN onttrekkingspunt.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN onttrekkingspunt.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN onttrekkingspunt.geldigTot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN onttrekkingspunt.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN onttrekkingspunt.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN onttrekkingspunt.aangemaaktOp IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
CREATE TABLE proces (
  uri String,
  ingediend Boolean,
  status Status,
  type Procedure,
  aangepastOp DateTime,
  geldigVan Date,
  geimplementeerdDoor_uuid String,
  aangemaaktOp DateTime,
  benaming String,
  geldigTot Date,
  revisieVan_uuid String,
  PRIMARY KEY (geldigVan, aangemaaktOp),
  FOREIGN KEY (geimplementeerdDoor_uuid) REFERENCES systeem(uuid),
  FOREIGN KEY (revisieVan_uuid) REFERENCES proces(uuid)
);

COMMENT ON TABLE proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN proces.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN proces.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN proces.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN proces.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN proces.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces.geimplementeerdDoor_uuid IS 'http://www.w3.org/ns/ssn/implementedBy';
COMMENT ON COLUMN proces.aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN proces.geldigTot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN proces.revisieVan_uuid IS 'http://www.w3.org/ns/prov#wasRevisionOf';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter
CREATE TABLE filter (
  uuid String,
  uri String,
  ingediend Boolean,
  filter_uuid String,
  PRIMARY KEY (uuid, filter_uuid),
  FOREIGN KEY (filter_uuid) REFERENCES systeem(uuid)
);

COMMENT ON TABLE filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter';
COMMENT ON COLUMN filter.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN filter.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN filter.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie
CREATE TABLE exploitatie_locatie (
  uri String,
  ingediend Boolean,
  beinvloedDoor String,
  toegewezenAan_uuid String,
  geldigVan Date,
  aangemaaktOp DateTime,
  aangepastOp DateTime,
  revisieVan_uuid String,
  geldigTot Date,
  adres_uuid String,
  benaming String,
  geometrie String,
  primaireBron Site,
  sameAs String,
  PRIMARY KEY (geldigVan, aangemaaktOp, sameAs),
  FOREIGN KEY (toegewezenAan_uuid) REFERENCES exploitant(uuid),
  FOREIGN KEY (revisieVan_uuid) REFERENCES exploitatie_locatie(uuid),
  FOREIGN KEY (adres_uuid) REFERENCES adres(uuid)
);

COMMENT ON TABLE exploitatie_locatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie';
COMMENT ON COLUMN exploitatie_locatie.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN exploitatie_locatie.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';
COMMENT ON COLUMN exploitatie_locatie.beinvloedDoor IS 'http://www.w3.org/ns/prov#wasInfluencedBy';
COMMENT ON COLUMN exploitatie_locatie.toegewezenAan_uuid IS 'http://www.w3.org/ns/prov#wasAttributedTo';
COMMENT ON COLUMN exploitatie_locatie.geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_locatie.aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_locatie.aangepastOp IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN exploitatie_locatie.revisieVan_uuid IS 'http://www.w3.org/ns/prov#wasRevisionOf';
COMMENT ON COLUMN exploitatie_locatie.geldigTot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN exploitatie_locatie.adres_uuid IS 'http://www.w3.org/ns/locn#address';
COMMENT ON COLUMN exploitatie_locatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN exploitatie_locatie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN exploitatie_locatie.primaireBron IS 'http://www.w3.org/ns/prov#hadPrimarySource';
COMMENT ON COLUMN exploitatie_locatie.sameAs IS 'http://www.w3.org/2002/07/owl#sameAs';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Grondwaterput
CREATE TABLE grondwaterput (
  diepte String,
  grondwaterput_uuid String,
  PRIMARY KEY (grondwaterput_uuid),
  FOREIGN KEY (grondwaterput_uuid) REFERENCES onttrekkingspunt(uuid)
);

COMMENT ON TABLE grondwaterput IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Grondwaterput';
COMMENT ON COLUMN grondwaterput.diepte IS 'http://dbpedia.org/ontology/depth';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozingspunt
CREATE TABLE lozingspunt (
  diepte String,
  lozingspunt_uuid String,
  PRIMARY KEY (lozingspunt_uuid),
  FOREIGN KEY (lozingspunt_uuid) REFERENCES emissiepunt(uuid)
);

COMMENT ON TABLE lozingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Lozingspunt';
COMMENT ON COLUMN lozingspunt.diepte IS 'http://dbpedia.org/ontology/depth';

----------------------------------------------------------------------

-- http://www.w3.org/ns/adms#Identifier
CREATE TABLE externe_identificator (
  schema String,
  uuid String,
  uri String,
  ingediend Boolean,
  value String,
  notatie String,
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
  stad String,
  straat String,
  postcode String,
  uuid String,
  uri String,
  ingediend Boolean,
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
  uuid String,
  uri String,
  ingediend Boolean,
  PRIMARY KEY (uuid)
);

COMMENT ON TABLE systeem IS 'http://www.w3.org/ns/ssn/System';
COMMENT ON COLUMN systeem.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN systeem.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN systeem.ingediend IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ingediend';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt
CREATE TABLE emissiepunt_externe_identificator (
  emissiepunt_uuid String,
  emissiepunt_aangemaaktOp DateTime,
  emissiepunt_geldigVan Date,
  emissiepunt_emissiepunt_uuid String,
  externe_identificator_uuid String,
  PRIMARY KEY (emissiepunt_uuid, emissiepunt_aangemaaktOp, emissiepunt_geldigVan, emissiepunt_emissiepunt_uuid, externe_identificator_uuid)
);

COMMENT ON TABLE emissiepunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN emissiepunt_externe_identificator.emissiepunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN emissiepunt_externe_identificator.emissiepunt_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN emissiepunt_externe_identificator.emissiepunt_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN emissiepunt_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
CREATE TABLE exploitatie_externe_identificator (
  exploitatie_uuid String,
  exploitatie_aangemaaktOp DateTime,
  exploitatie_geldigVan Date,
  externe_identificator_uuid String,
  PRIMARY KEY (exploitatie_uuid, exploitatie_aangemaaktOp, exploitatie_geldigVan, externe_identificator_uuid)
);

COMMENT ON TABLE exploitatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie_externe_identificator.exploitatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_externe_identificator.exploitatie_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_externe_identificator.exploitatie_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
CREATE TABLE exploitatie_contactpersoon (
  exploitatie_aangemaaktOp DateTime,
  exploitatie_geldigVan Date,
  contactpersoon_uuid String,
  contactpersoon_geldigVan Date,
  contactpersoon_aangemaaktOp DateTime,
  PRIMARY KEY (exploitatie_aangemaaktOp, exploitatie_geldigVan, contactpersoon_uuid, contactpersoon_geldigVan, contactpersoon_aangemaaktOp)
);

COMMENT ON TABLE exploitatie_contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie_contactpersoon.exploitatie_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_contactpersoon.exploitatie_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_contactpersoon.contactpersoon_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_contactpersoon.contactpersoon_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_contactpersoon.contactpersoon_aangemaaktOp IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie
CREATE TABLE exploitatie_systeem (
  exploitatie_aangemaaktOp DateTime,
  exploitatie_geldigVan Date,
  systeem_uuid String,
  PRIMARY KEY (exploitatie_aangemaaktOp, exploitatie_geldigVan, systeem_uuid)
);

COMMENT ON TABLE exploitatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN exploitatie_systeem.exploitatie_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_systeem.exploitatie_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_systeem.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant
CREATE TABLE exploitant_contactpersoon (
  exploitant_uuid String,
  exploitant_geldigVan Date,
  exploitant_aangemaaktOp DateTime,
  contactpersoon_uuid String,
  contactpersoon_geldigVan Date,
  contactpersoon_aangemaaktOp DateTime,
  PRIMARY KEY (exploitant_uuid, exploitant_geldigVan, exploitant_aangemaaktOp, contactpersoon_uuid, contactpersoon_geldigVan, contactpersoon_aangemaaktOp)
);

COMMENT ON TABLE exploitant_contactpersoon IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN exploitant_contactpersoon.exploitant_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitant_contactpersoon.exploitant_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant_contactpersoon.exploitant_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitant_contactpersoon.contactpersoon_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitant_contactpersoon.contactpersoon_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitant_contactpersoon.contactpersoon_aangemaaktOp IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt
CREATE TABLE meetpunt_externe_identificator (
  meetpunt_uuid String,
  meetpunt_geldigVan Date,
  meetpunt_aangemaaktOp DateTime,
  meetpunt_meetpunt_uuid String,
  externe_identificator_uuid String,
  PRIMARY KEY (meetpunt_uuid, meetpunt_geldigVan, meetpunt_aangemaaktOp, meetpunt_meetpunt_uuid, externe_identificator_uuid)
);

COMMENT ON TABLE meetpunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN meetpunt_externe_identificator.meetpunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN meetpunt_externe_identificator.meetpunt_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN meetpunt_externe_identificator.meetpunt_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN meetpunt_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
CREATE TABLE installatie_proces (
  installatie_uuid String,
  installatie_geldigVan Date,
  installatie_aangemaaktOp DateTime,
  installatie_installatie_uuid String,
  proces_uuid String,
  proces_geldigVan Date,
  proces_aangemaaktOp DateTime,
  PRIMARY KEY (installatie_uuid, installatie_geldigVan, installatie_aangemaaktOp, installatie_installatie_uuid, proces_uuid, proces_geldigVan, proces_aangemaaktOp)
);

COMMENT ON TABLE installatie_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_proces.installatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_proces.installatie_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_proces.installatie_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie_proces.proces_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN installatie_proces.proces_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_proces.proces_aangemaaktOp IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
CREATE TABLE installatie_systeem (
  installatie_geldigVan Date,
  installatie_aangemaaktOp DateTime,
  installatie_installatie_uuid String,
  systeem_uuid String,
  PRIMARY KEY (installatie_geldigVan, installatie_aangemaaktOp, installatie_installatie_uuid, systeem_uuid)
);

COMMENT ON TABLE installatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_systeem.installatie_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_systeem.installatie_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie_systeem.systeem_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie
CREATE TABLE installatie_externe_identificator (
  installatie_geldigVan Date,
  installatie_aangemaaktOp DateTime,
  installatie_installatie_uuid String,
  externe_identificator_uuid String,
  PRIMARY KEY (installatie_geldigVan, installatie_aangemaaktOp, installatie_installatie_uuid, externe_identificator_uuid)
);

COMMENT ON TABLE installatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN installatie_externe_identificator.installatie_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN installatie_externe_identificator.installatie_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN installatie_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
CREATE TABLE onttrekkingspunt_filter (
  onttrekkingspunt_uuid String,
  onttrekkingspunt_geldigVan Date,
  onttrekkingspunt_aangemaaktOp DateTime,
  onttrekkingspunt_onttrekkingspunt_uuid String,
  filter_uuid String,
  filter_filter_uuid String,
  PRIMARY KEY (onttrekkingspunt_uuid, onttrekkingspunt_geldigVan, onttrekkingspunt_aangemaaktOp, onttrekkingspunt_onttrekkingspunt_uuid, filter_uuid, filter_filter_uuid)
);

COMMENT ON TABLE onttrekkingspunt_filter IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_filter.onttrekkingspunt_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN onttrekkingspunt_filter.onttrekkingspunt_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt_filter.onttrekkingspunt_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt_filter.filter_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt
CREATE TABLE onttrekkingspunt_externe_identificator (
  onttrekkingspunt_geldigVan Date,
  onttrekkingspunt_aangemaaktOp DateTime,
  onttrekkingspunt_onttrekkingspunt_uuid String,
  externe_identificator_uuid String,
  PRIMARY KEY (onttrekkingspunt_geldigVan, onttrekkingspunt_aangemaaktOp, onttrekkingspunt_onttrekkingspunt_uuid, externe_identificator_uuid)
);

COMMENT ON TABLE onttrekkingspunt_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN onttrekkingspunt_externe_identificator.onttrekkingspunt_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN onttrekkingspunt_externe_identificator.onttrekkingspunt_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN onttrekkingspunt_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
CREATE TABLE proces_proces_variabele (
  proces_uuid String,
  proces_geldigVan Date,
  proces_aangemaaktOp DateTime,
  proces_variabele_uuid String,
  relation_type proces_proces_variabele_merge_type,
  PRIMARY KEY (proces_uuid, proces_geldigVan, proces_aangemaaktOp, proces_variabele_uuid, relation_type)
);

COMMENT ON TABLE proces_proces_variabele IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces_proces_variabele.proces_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN proces_proces_variabele.proces_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_proces_variabele.proces_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_proces_variabele.proces_variabele_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces
CREATE TABLE proces_proces (
  proces_geldigVan Date,
  proces_aangemaaktOp DateTime,
  proces_proces_geldigVan Date,
  proces_proces_aangemaaktOp DateTime,
  PRIMARY KEY (proces_geldigVan, proces_aangemaaktOp, proces_proces_geldigVan, proces_proces_aangemaaktOp)
);

COMMENT ON TABLE proces_proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN proces_proces.proces_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_proces.proces_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN proces_proces.proces_proces_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN proces_proces.proces_proces_aangemaaktOp IS 'http://purl.org/dc/terms/created';

----------------------------------------------------------------------

-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie
CREATE TABLE exploitatie_locatie_externe_identificator (
  exploitatie_locatie_uuid String,
  exploitatie_locatie_geldigVan Date,
  exploitatie_locatie_aangemaaktOp DateTime,
  exploitatie_locatie_sameAs String,
  externe_identificator_uuid String,
  PRIMARY KEY (exploitatie_locatie_uuid, exploitatie_locatie_geldigVan, exploitatie_locatie_aangemaaktOp, exploitatie_locatie_sameAs, externe_identificator_uuid)
);

COMMENT ON TABLE exploitatie_locatie_externe_identificator IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie';
COMMENT ON COLUMN exploitatie_locatie_externe_identificator.exploitatie_locatie_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN exploitatie_locatie_externe_identificator.exploitatie_locatie_geldigVan IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN exploitatie_locatie_externe_identificator.exploitatie_locatie_aangemaaktOp IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN exploitatie_locatie_externe_identificator.exploitatie_locatie_sameAs IS 'http://www.w3.org/2002/07/owl#sameAs';
COMMENT ON COLUMN exploitatie_locatie_externe_identificator.externe_identificator_uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

----------------------------------------------------------------------

