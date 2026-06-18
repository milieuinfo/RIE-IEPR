-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat
CREATE TABLE resultaat (
                           uuid VARCHAR,
                           uri VARCHAR,
                           eenheid VARCHAR,
                           waarde DECIMAL,
                           is_result_of VARCHAR,
                           PRIMARY KEY (uuid)
);

COMMENT ON TABLE resultaat IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat';
COMMENT ON COLUMN resultaat.uuid IS 'https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId';
COMMENT ON COLUMN resultaat.uri IS 'http://example.org/vocab/uri';
COMMENT ON COLUMN resultaat.eenheid IS 'http://qudt.org/schema/qudt/hasUnit';
COMMENT ON COLUMN resultaat.waarde IS 'http://qudt.org/schema/qudt/numericValue';
COMMENT ON COLUMN resultaat.is_result_of IS 'http://www.w3.org/ns/sosa/isResultOf';



-- https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie
CREATE TABLE observatie (
                            uuid VARCHAR,
                            uri VARCHAR,
                            aangemaakt_op TIMESTAMP,
                            geldig_van DATE,
                            aangepast_op TIMESTAMP,
                            benaming VARCHAR,
                            heeft_aandachtspunt VARCHAR,
    -- Foreign key referencing resultaat(uuid)
                            heeft_resultaat VARCHAR,
    -- Foreign key referencing meet_instrument_identity(uuid)
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


-- Filter table with JSONB for multi-values
CREATE TABLE filter_jsonb (
    id TEXT PRIMARY KEY,
    types JSONB,
    "label" JSONB,
    "created" TEXT,
    "issued" TEXT,
    "modified" TEXT,
    "status" TEXT,
    "hasDeployment" TEXT,
    "isFeatureOfInterestOf" JSONB,
    "isHostedBy" TEXT,
    "hasProperty" JSONB
);
