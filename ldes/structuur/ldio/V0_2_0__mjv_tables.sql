-- TODO: Merk op: Enkel de tabellen en attributen die gebruikt worden in
--     mjv-webapp/src/models/data worden aangemaakt op databank niveau.

-- Enumeraties
CREATE TYPE mjv.aangifte_status AS ENUM
(
  'IN_MANDJE',
  'VALIDATIE_GEFAALD',
  'INGEDIEND'
);

CREATE TYPE mjv.aangifte_categorie AS ENUM
(
  'EXPLOITATIETOESTAND',
  'OPERATIONEEL'
);

CREATE TYPE mjv.transactie_status AS ENUM
(
  'IN_VERWERKING',
  'ONTVANGEN',
  'GEFAALD'
);

CREATE TYPE mjv.organisatie_code_type AS ENUM
(
  'ONDERNEMINGSNUMMER',
  'OVO_CODE'
);

-- Organisatie en locatie
CREATE TABLE mjv.exploitant
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    benaming                TEXT NOT NULL,
    organisatie_code_type   mjv.organisatie_code_type NOT NULL,
    organisatie_code        TEXT NOT NULL,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL
);

-- MJV-453 (minimale subset voor MJV-397): organisatiecode op de exploitant, lookup-sleutel voor de ingelogde exploitant (JWT)
CREATE UNIQUE INDEX c_exploitant_organisatie_code_u
    ON mjv.exploitant (organisatie_code_type, organisatie_code);

COMMENT ON TABLE mjv.exploitant IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitant';
COMMENT ON COLUMN mjv.exploitant.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.exploitant.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.exploitant.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.exploitant.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.exploitant.uri IS '@id';
COMMENT ON COLUMN mjv.exploitant.organisatie_code_type IS 'Type van organisatie_code: KBO-ondernemingsnummer of OVO-code';
COMMENT ON COLUMN mjv.exploitant.organisatie_code IS 'Identificator van de exploitant-organisatie; lookup-sleutel voor de ingelogde exploitant (KBO-nummer uit de JWT)';

CREATE TABLE mjv.exploitatielocatie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    benaming                TEXT NOT NULL,
    exploitant_id           UUID NOT NULL
        CONSTRAINT c_exploitatielocatie_exploitant_fk
            REFERENCES mjv.exploitant,
    geldig_van              DATE NOT NULL,
    geldig_tot              DATE,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.exploitatielocatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ExploitatieLocatie';
COMMENT ON COLUMN mjv.exploitatielocatie.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.exploitatielocatie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.exploitatielocatie.exploitant_id IS 'http://www.w3.org/ns/prov#wasAttributedTo';
COMMENT ON COLUMN mjv.exploitatielocatie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN mjv.exploitatielocatie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN mjv.exploitatielocatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.exploitatielocatie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.exploitatielocatie.uri IS '@id';

-- Structuur identiteiten
CREATE TABLE mjv.rubriek
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    type                    TEXT NOT NULL,
    bron_uri                TEXT NOT NULL,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL,
    CONSTRAINT c_rubriek_bron_uri_type_u
        UNIQUE (bron_uri, type)
);

COMMENT ON TABLE mjv.rubriek IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Rubriek';
COMMENT ON COLUMN mjv.rubriek.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.rubriek.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN mjv.rubriek.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.rubriek.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.rubriek.uri IS '@id';
COMMENT ON COLUMN mjv.rubriek.bron_uri IS 'http://www.w3.org/ns/prov#hadPrimarySource';

CREATE TABLE mjv.exploitatie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.exploitatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN mjv.exploitatie.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.exploitatie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.exploitatie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.exploitatie.uri IS '@id';

CREATE TABLE mjv.proces
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.proces IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN mjv.proces.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.proces.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.proces.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.proces.uri IS '@id';

CREATE TABLE mjv.systeem
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE mjv.systeem IS 'http://www.w3.org/ns/ssn/System';
COMMENT ON COLUMN mjv.systeem.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.systeem.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.systeem.gewijzigd_op IS 'http://purl.org/dc/terms/modified';

-- Systeem typen en eigenschappen
CREATE TABLE mjv.installatie
(
    systeem_id              UUID NOT NULL
        PRIMARY KEY
        CONSTRAINT c_installatie_systeem_fk
            REFERENCES mjv.systeem,
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.installatie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN mjv.installatie.systeem_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.installatie.uri IS '@id';

CREATE TABLE mjv.emissiepunt
(
    systeem_id              UUID NOT NULL
        PRIMARY KEY
        CONSTRAINT c_emissiepunt_systeem_fk
            REFERENCES mjv.systeem,
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.emissiepunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN mjv.emissiepunt.systeem_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.emissiepunt.uri IS '@id';

CREATE TABLE mjv.onttrekkingspunt
(
    systeem_id              UUID NOT NULL
        PRIMARY KEY
        CONSTRAINT c_onttrekkingspunt_systeem_fk
            REFERENCES mjv.systeem,
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.onttrekkingspunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN mjv.onttrekkingspunt.systeem_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.onttrekkingspunt.uri IS '@id';

CREATE TABLE mjv.meetpunt
(
    systeem_id              UUID NOT NULL
        PRIMARY KEY
        CONSTRAINT c_meetpunt_systeem_fk
            REFERENCES mjv.systeem,
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.meetpunt IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN mjv.meetpunt.systeem_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.meetpunt.uri IS '@id';

CREATE TABLE mjv.systeemeigenschap
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    type                    TEXT NOT NULL,
    datatype                TEXT NOT NULL,
    waarde                  TEXT NOT NULL,
    eenheid                 TEXT,
    systeem_id              UUID NOT NULL
        CONSTRAINT c_systeemeigenschap_systeem_fk
            REFERENCES mjv.systeem,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.systeemeigenschap IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#SysteemEigenschap';
COMMENT ON COLUMN mjv.systeemeigenschap.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.systeemeigenschap.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN mjv.systeemeigenschap.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN mjv.systeemeigenschap.datatype IS 'http://www.w3.org/2000/01/rdf-schema#range';
COMMENT ON COLUMN mjv.systeemeigenschap.waarde IS 'http://www.w3.org/2000/01/rdf-schema#value';
COMMENT ON COLUMN mjv.systeemeigenschap.systeem_id IS 'http://www.w3.org/ns/ssn/hasProperty';
COMMENT ON COLUMN mjv.systeemeigenschap.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.systeemeigenschap.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.systeemeigenschap.uri IS '@id';

-- Systeem versies
CREATE TABLE mjv.installatie_versie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    installatie_id           UUID NOT NULL
        CONSTRAINT c_installatie_versie_installatie_fk
            REFERENCES mjv.installatie,
    benaming                TEXT NOT NULL,
    beschrijving            TEXT,
    type                    TEXT NOT NULL,
    status                  TEXT NOT NULL,
    locatie_id              UUID NOT NULL
        CONSTRAINT c_installatie_versie_exploitatielocatie_fk
            REFERENCES mjv.exploitatielocatie,
    geldig_van              DATE NOT NULL,
    geldig_tot              DATE,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL,
    CONSTRAINT c_installatie_versie_u
        UNIQUE (installatie_id, geldig_van, aangemaakt_op),
    CONSTRAINT c_installatie_versie_geldigheid_check
        CHECK (geldig_tot IS NULL OR geldig_tot >= geldig_van)
);

COMMENT ON TABLE mjv.installatie_versie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Installatie';
COMMENT ON COLUMN mjv.installatie_versie.installatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.installatie_versie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.installatie_versie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN mjv.installatie_versie.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN mjv.installatie_versie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN mjv.installatie_versie.locatie_id IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN mjv.installatie_versie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN mjv.installatie_versie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN mjv.installatie_versie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.installatie_versie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.installatie_versie.uri IS '@id';

CREATE TABLE mjv.emissiepunt_versie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    emissiepunt_id          UUID NOT NULL
        CONSTRAINT c_emissiepunt_versie_emissiepunt_fk
            REFERENCES mjv.emissiepunt,
    benaming                TEXT NOT NULL,
    beschrijving            TEXT,
    type                    TEXT NOT NULL,
    status                  TEXT NOT NULL,
    geometrie               geometry(Point, 3812),
    locatie_id              UUID NOT NULL
        CONSTRAINT c_emissiepunt_versie_exploitatielocatie_fk
            REFERENCES mjv.exploitatielocatie,
    geldig_van              DATE NOT NULL,
    geldig_tot              DATE,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL,
    CONSTRAINT c_emissiepunt_versie_u
        UNIQUE (emissiepunt_id, geldig_van, aangemaakt_op),
    CONSTRAINT c_emissiepunt_versie_geldigheid_check
        CHECK (geldig_tot IS NULL OR geldig_tot >= geldig_van)
);

COMMENT ON TABLE mjv.emissiepunt_versie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Emissiepunt';
COMMENT ON COLUMN mjv.emissiepunt_versie.emissiepunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.emissiepunt_versie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.emissiepunt_versie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN mjv.emissiepunt_versie.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN mjv.emissiepunt_versie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN mjv.emissiepunt_versie.geometrie IS 'http://www.opengis.net/ont/geosparql#hasGeometry';
COMMENT ON COLUMN mjv.emissiepunt_versie.locatie_id IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN mjv.emissiepunt_versie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN mjv.emissiepunt_versie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN mjv.emissiepunt_versie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.emissiepunt_versie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.emissiepunt_versie.uri IS '@id';

CREATE TABLE mjv.onttrekkingspunt_versie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    onttrekkingspunt_id     UUID NOT NULL
        CONSTRAINT c_onttrekkingspunt_versie_onttrekkingspunt_fk
            REFERENCES mjv.onttrekkingspunt,
    benaming                TEXT NOT NULL,
    beschrijving            TEXT,
    type                    TEXT NOT NULL,
    status                  TEXT NOT NULL,
    locatie_id              UUID NOT NULL
        CONSTRAINT c_onttrekkingspunt_versie_exploitatielocatie_fk
            REFERENCES mjv.exploitatielocatie,
    geldig_van              DATE NOT NULL,
    geldig_tot              DATE,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL,
    CONSTRAINT c_onttrekkingspunt_versie_u
        UNIQUE (onttrekkingspunt_id, geldig_van, aangemaakt_op),
    CONSTRAINT c_onttrekkingspunt_versie_geldigheid_check
        CHECK (geldig_tot IS NULL OR geldig_tot >= geldig_van)
);

COMMENT ON TABLE mjv.onttrekkingspunt_versie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Onttrekkingspunt';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.onttrekkingspunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.locatie_id IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.onttrekkingspunt_versie.uri IS '@id';

CREATE TABLE mjv.meetpunt_versie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    meetpunt_id             UUID NOT NULL
        CONSTRAINT c_meetpunt_versie_meetpunt_fk
            REFERENCES mjv.meetpunt,
    benaming                TEXT NOT NULL,
    beschrijving            TEXT,
    type                    TEXT NOT NULL,
    status                  TEXT NOT NULL,
    locatie_id              UUID NOT NULL
        CONSTRAINT c_meetpunt_versie_exploitatielocatie_fk
            REFERENCES mjv.exploitatielocatie,
    geldig_van              DATE NOT NULL,
    geldig_tot              DATE,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL,
    CONSTRAINT c_meetpunt_versie_u
        UNIQUE (meetpunt_id, geldig_van, aangemaakt_op),
    CONSTRAINT c_meetpunt_versie_geldigheid_check
        CHECK (geldig_tot IS NULL OR geldig_tot >= geldig_van)
);

COMMENT ON TABLE mjv.meetpunt_versie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Meetpunt';
COMMENT ON COLUMN mjv.meetpunt_versie.meetpunt_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.meetpunt_versie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.meetpunt_versie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN mjv.meetpunt_versie.type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN mjv.meetpunt_versie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN mjv.meetpunt_versie.locatie_id IS 'http://www.w3.org/ns/sosa/isHostedBy';
COMMENT ON COLUMN mjv.meetpunt_versie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN mjv.meetpunt_versie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN mjv.meetpunt_versie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.meetpunt_versie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.meetpunt_versie.uri IS '@id';

CREATE TABLE mjv.emissiepunt_versie_systeemeigenschap
(
    emissiepunt_versie_id   UUID NOT NULL
        CONSTRAINT c_emissiepunt_versie_systeemeigenschap_emissiepunt_versie_fk
            REFERENCES mjv.emissiepunt_versie,
    systeemeigenschap_id    UUID NOT NULL
        CONSTRAINT c_emissiepunt_versie_systeemeigenschap_systeemeigenschap_fk
            REFERENCES mjv.systeemeigenschap,
    PRIMARY KEY (emissiepunt_versie_id, systeemeigenschap_id)
);

CREATE TABLE mjv.installatie_versie_systeemeigenschap
(
    installatie_versie_id   UUID NOT NULL
        CONSTRAINT c_installatie_versie_systeemeigenschap_installatie_versie_fk
            REFERENCES mjv.installatie_versie,
    systeemeigenschap_id    UUID NOT NULL
        CONSTRAINT c_installatie_versie_systeemeigenschap_systeemeigenschap_fk
            REFERENCES mjv.systeemeigenschap,
    PRIMARY KEY (installatie_versie_id, systeemeigenschap_id)
);

CREATE TABLE mjv.meetpunt_versie_systeemeigenschap
(
    meetpunt_versie_id      UUID NOT NULL
        CONSTRAINT c_meetpunt_versie_systeemeigenschap_meetpunt_versie_fk
            REFERENCES mjv.meetpunt_versie,
    systeemeigenschap_id    UUID NOT NULL
        CONSTRAINT c_meetpunt_versie_systeemeigenschap_systeemeigenschap_fk
            REFERENCES mjv.systeemeigenschap,
    PRIMARY KEY (meetpunt_versie_id, systeemeigenschap_id)
);

CREATE TABLE mjv.onttrekkingspunt_versie_systeemeigenschap
(
    onttrekkingspunt_versie_id UUID NOT NULL
        CONSTRAINT c_onttr_versie_eigenschap_onttr_versie_fk
            REFERENCES mjv.onttrekkingspunt_versie,
    systeemeigenschap_id    UUID NOT NULL
        CONSTRAINT c_onttr_versie_eigenschap_eigenschap_fk
            REFERENCES mjv.systeemeigenschap,
    PRIMARY KEY (onttrekkingspunt_versie_id, systeemeigenschap_id)
);

-- Proces versies en relaties
CREATE TABLE mjv.proces_versie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    proces_id               UUID NOT NULL
        CONSTRAINT c_proces_versie_proces_fk
            REFERENCES mjv.proces,
    benaming                TEXT NOT NULL,
    beschrijving            TEXT,
    procedure_type          TEXT NOT NULL,
    status                  TEXT NOT NULL,
    systeem_id              UUID
        CONSTRAINT c_proces_systeem_fk
            REFERENCES mjv.systeem,
    onderdeel_van_proces_versie_id UUID
        CONSTRAINT c_onderdeel_van_proces_versie_id_fk
            REFERENCES mjv.proces_versie,
    geldig_van              DATE NOT NULL,
    geldig_tot              DATE,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL,
    CONSTRAINT c_proces_versie_u
        UNIQUE (proces_id, geldig_van, aangemaakt_op),
    CONSTRAINT c_proces_versie_geldigheid_check
        CHECK (geldig_tot IS NULL OR geldig_tot >= geldig_van)
);

COMMENT ON TABLE mjv.proces_versie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN mjv.proces_versie.proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.proces_versie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.proces_versie.beschrijving IS 'http://www.w3.org/2000/01/rdf-schema#comment';
COMMENT ON COLUMN mjv.proces_versie.procedure_type IS 'http://purl.org/dc/terms/type';
COMMENT ON COLUMN mjv.proces_versie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN mjv.proces_versie.systeem_id IS 'http://www.w3.org/ns/ssn/implementedBy';
COMMENT ON COLUMN mjv.proces_versie.onderdeel_van_proces_versie_id IS 'http://purl.org/net/p-plan#isStepOfPlan';
COMMENT ON COLUMN mjv.proces_versie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN mjv.proces_versie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN mjv.proces_versie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.proces_versie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.proces_versie.uri IS '@id';

CREATE TABLE mjv.proces_proces_volgt_op
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    bron_proces_id          UUID NOT NULL
        CONSTRAINT c_bron_proces_id_proces_fk
            REFERENCES mjv.proces,
    doel_proces_id          UUID NOT NULL
        CONSTRAINT c_doel_proces_id_proces_fk
            REFERENCES mjv.proces,
    geldig_van              DATE NOT NULL DEFAULT CURRENT_DATE,
    geldig_tot              DATE,
    deleted                 BOOLEAN NOT NULL DEFAULT FALSE,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT c_proces_proces_volgt_op_versie_u
        UNIQUE (bron_proces_id, doel_proces_id, geldig_van, aangemaakt_op),
    CONSTRAINT c_proces_proces_volgt_op_geldigheid_check
        CHECK (geldig_tot IS NULL OR geldig_tot >= geldig_van)
);

COMMENT ON TABLE mjv.proces_proces_volgt_op IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN mjv.proces_proces_volgt_op.bron_proces_id IS 'http://purl.org/net/p-plan#isPrecededBy';
COMMENT ON COLUMN mjv.proces_proces_volgt_op.doel_proces_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.proces_proces_volgt_op.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN mjv.proces_proces_volgt_op.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN mjv.proces_proces_volgt_op.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.proces_proces_volgt_op.gewijzigd_op IS 'http://purl.org/dc/terms/modified';

CREATE TABLE mjv.proces_versie_rubriek
(
    proces_versie_id        UUID NOT NULL
        CONSTRAINT c_proces_versie_rubriek_proces_versie_fk
            REFERENCES mjv.proces_versie,
    rubriek_id              UUID NOT NULL
        CONSTRAINT c_proces_versie_rubriek_rubriek_fk
            REFERENCES mjv.rubriek,
    PRIMARY KEY (proces_versie_id, rubriek_id)
);

COMMENT ON TABLE mjv.proces_versie_rubriek IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Proces';
COMMENT ON COLUMN mjv.proces_versie_rubriek.rubriek_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#rubriek';

CREATE TABLE mjv.ui_proces_metadata
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    proces_id               UUID NOT NULL
        CONSTRAINT c_ui_proces_metadata_proces_fk
            REFERENCES mjv.proces,
        CONSTRAINT c_ui_proces_metadata_proces_id_u
            UNIQUE (proces_id),
    x                       DOUBLE PRECISION NOT NULL,
    y                       DOUBLE PRECISION NOT NULL,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE mjv.ui_proces_metadata IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#ProcesMetadata';
COMMENT ON COLUMN mjv.ui_proces_metadata.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.ui_proces_metadata.proces_id IS 'http://www.w3.org/ns/oa#hasTarget';
COMMENT ON COLUMN mjv.ui_proces_metadata.x IS 'http://purl.org/poso/xAxisValue';
COMMENT ON COLUMN mjv.ui_proces_metadata.y IS 'http://purl.org/poso/yAxisValue';
COMMENT ON COLUMN mjv.ui_proces_metadata.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.ui_proces_metadata.gewijzigd_op IS 'http://purl.org/dc/terms/modified';

-- Aangiftes
CREATE TABLE mjv.aangiftebundel
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    naam                    TEXT,
    exploitant_id           UUID NOT NULL
        CONSTRAINT c_aangiftebundel_exploitant_fk
            REFERENCES mjv.exploitant,
    lock_versie             BIGINT NOT NULL,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL
);

COMMENT ON TABLE mjv.aangiftebundel IS 'https://data.vlaanderen.be/ns/dossier#Stuk';
COMMENT ON COLUMN mjv.aangiftebundel.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.aangiftebundel.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.aangiftebundel.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.aangiftebundel.uri IS '@id';
COMMENT ON COLUMN mjv.aangiftebundel.naam IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.aangiftebundel.exploitant_id IS 'http://www.w3.org/ns/prov#wasAttributedTo';

CREATE TABLE mjv.aangifte
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    status                  mjv.aangifte_status NOT NULL,
    categorie               mjv.aangifte_categorie NOT NULL,
    aangiftebundel_id      UUID NOT NULL
        CONSTRAINT c_aangifte_aangiftebundel_fk
            REFERENCES mjv.aangiftebundel,
    exploitatie_id          UUID NOT NULL
        CONSTRAINT c_aangifte_exploitatie_fk
            REFERENCES mjv.exploitatie,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL
);

CREATE UNIQUE INDEX c_aangifte_exploitatie_categorie_u
    ON mjv.aangifte (exploitatie_id, categorie)
    WHERE status = 'IN_MANDJE';

COMMENT ON TABLE mjv.aangifte IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Aangifte';
COMMENT ON COLUMN mjv.aangifte.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.aangifte.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.aangifte.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.aangifte.uri IS '@id';
COMMENT ON COLUMN mjv.aangifte.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN mjv.aangifte.categorie IS 'Categorie van de aangifte: EXPLOITATIETOESTAND (vaste gegevens) of OPERATIONEEL (operationele gegevens)';
COMMENT ON COLUMN mjv.aangifte.aangiftebundel_id IS 'http://purl.org/dc/terms/isPartOf';
COMMENT ON COLUMN mjv.aangifte.exploitatie_id IS 'http://purl.org/dc/terms/subject';

-- Exploitatie versies
CREATE TABLE mjv.exploitatie_versie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    exploitatie_id          UUID NOT NULL
        CONSTRAINT c_exploitatie_versie_exploitatie_fk
            REFERENCES mjv.exploitatie,
    benaming                TEXT NOT NULL,
    status                  TEXT NOT NULL,
    proces_versie_id        UUID
        CONSTRAINT c_exploitatie_implementeert_proces_fk
            REFERENCES mjv.proces_versie,
    locatie_id              UUID NOT NULL
        CONSTRAINT c_locatie_exploitatielocatie_fk
            REFERENCES mjv.exploitatielocatie,
    aangifte_id             UUID
        CONSTRAINT c_exploitatie_versie_aangifte_fk
            REFERENCES mjv.aangifte,
    geldig_van              DATE NOT NULL,
    geldig_tot              DATE,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    uri                     TEXT NOT NULL,
    CONSTRAINT c_exploitatie_versie_u
        UNIQUE (exploitatie_id, geldig_van, aangemaakt_op),
    CONSTRAINT c_exploitatie_versie_geldigheid_check
        CHECK (geldig_tot IS NULL OR geldig_tot >= geldig_van)
);

COMMENT ON TABLE mjv.exploitatie_versie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN mjv.exploitatie_versie.exploitatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.exploitatie_versie.benaming IS 'http://www.w3.org/2000/01/rdf-schema#label';
COMMENT ON COLUMN mjv.exploitatie_versie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN mjv.exploitatie_versie.proces_versie_id IS 'http://www.w3.org/ns/ssn/implements';
COMMENT ON COLUMN mjv.exploitatie_versie.locatie_id IS 'http://www.w3.org/ns/ssn/deployedOnPlatform';
COMMENT ON COLUMN mjv.exploitatie_versie.aangifte_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#aangifte';
COMMENT ON COLUMN mjv.exploitatie_versie.geldig_van IS 'http://purl.org/dc/terms/issued';
COMMENT ON COLUMN mjv.exploitatie_versie.geldig_tot IS 'http://purl.org/dc/terms/valid';
COMMENT ON COLUMN mjv.exploitatie_versie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.exploitatie_versie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.exploitatie_versie.uri IS '@id';

CREATE TABLE mjv.exploitatie_systeem
(
    exploitatie_id          UUID NOT NULL
        CONSTRAINT c_exploitatie_systeem_exploitatie_fk
            REFERENCES mjv.exploitatie,
    systeem_id              UUID NOT NULL
        CONSTRAINT c_exploitatie_systeem_systeem_fk
            REFERENCES mjv.systeem,
    PRIMARY KEY (exploitatie_id, systeem_id)
);

COMMENT ON TABLE mjv.exploitatie_systeem IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie';
COMMENT ON COLUMN mjv.exploitatie_systeem.exploitatie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.exploitatie_systeem.systeem_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';

-- Transacties
CREATE TABLE mjv.transactie
(
    id                      UUID NOT NULL
        PRIMARY KEY,
    aangemaakt_op           TIMESTAMPTZ NOT NULL DEFAULT now(),
    gewijzigd_op            TIMESTAMPTZ NOT NULL DEFAULT now(),
    status                  mjv.transactie_status NOT NULL,
    ingediend_op            TIMESTAMPTZ,
    persoon_id              TEXT NOT NULL,
    persoon_naam            TEXT NOT NULL,
    organisatie_code_type   mjv.organisatie_code_type NOT NULL,
    organisatie_code        TEXT NOT NULL,
    aangiftebundel_id      UUID NOT NULL
        CONSTRAINT c_transactie_aangiftebundel_fk
            REFERENCES mjv.aangiftebundel
);

COMMENT ON TABLE mjv.transactie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie';
COMMENT ON COLUMN mjv.transactie.id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.transactie.aangemaakt_op IS 'http://purl.org/dc/terms/created';
COMMENT ON COLUMN mjv.transactie.gewijzigd_op IS 'http://purl.org/dc/terms/modified';
COMMENT ON COLUMN mjv.transactie.status IS 'http://www.w3.org/ns/adms#status';
COMMENT ON COLUMN mjv.transactie.ingediend_op IS 'http://purl.org/dc/terms/dateSubmitted';
COMMENT ON COLUMN mjv.transactie.persoon_id IS 'Identificatie van de persoon die de transactie uitvoerde (uit de JWT)';
COMMENT ON COLUMN mjv.transactie.persoon_naam IS 'Naam van de persoon die de transactie uitvoerde (uit de JWT)';
COMMENT ON COLUMN mjv.transactie.organisatie_code_type IS 'Type van organisatie_code: KBO-ondernemingsnummer of OVO-code';
COMMENT ON COLUMN mjv.transactie.organisatie_code IS 'Identificator van de organisatie waarvoor de transactie werd uitgevoerd (audit-snapshot, uit de JWT)';
COMMENT ON COLUMN mjv.transactie.aangiftebundel_id IS 'Aangiftebundel waarvoor deze transactie een indienpoging is';

CREATE TABLE mjv.aangifte_transactie
(
    transactie_id           UUID NOT NULL
        CONSTRAINT c_aangifte_transactie_transactie_fk
            REFERENCES mjv.transactie,
    aangifte_id             UUID NOT NULL
        CONSTRAINT c_aangifte_transactie_aangifte_fk
            REFERENCES mjv.aangifte,
    PRIMARY KEY (transactie_id, aangifte_id)
);

COMMENT ON TABLE mjv.aangifte_transactie IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Transactie';
COMMENT ON COLUMN mjv.aangifte_transactie.transactie_id IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN mjv.aangifte_transactie.aangifte_id IS 'https://data.vlaanderen.be/ns/dossier#genereert';
