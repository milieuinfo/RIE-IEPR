INSERT INTO mjv.exploitant (id, uri, benaming, organisatie_code_type, organisatie_code) VALUES
    ('019dde46-6316-736b-aa41-ed624e0b619e', 'https://data.mjv.omgeving.vlaanderen.be/id/exploitant/019dde46-6316-736b-aa41-ed624e0b619e', '(tijdelijk)', 'ONDERNEMINGSNUMMER', '0111111111');

INSERT INTO mjv.exploitatielocatie (id, uri, benaming, exploitant_id, geldig_van, geldig_tot) VALUES
    ('019dde40-57be-7c1f-b8c2-dce2cbe2769d', 'https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019dde40-57be-7c1f-b8c2-dce2cbe2769d', '(tijdelijk)', '019dde46-6316-736b-aa41-ed624e0b619e', DATE '2026-01-01', DATE '2026-12-31');

INSERT INTO mjv.systeem (id, uri) VALUES
    ('019dde53-2086-7754-80cc-52e0e59ae19a', 'https://data.mjv.omgeving.vlaanderen.be/id/systeem/019dde53-2086-7754-80cc-52e0e59ae19a'),
    ('019dde54-240d-7f0a-b291-ce4bf9712182', 'https://data.mjv.omgeving.vlaanderen.be/id/systeem/019dde54-240d-7f0a-b291-ce4bf9712182'),
    ('019dde55-bae6-799d-8b65-24ec6802fb85', 'https://data.mjv.omgeving.vlaanderen.be/id/systeem/019dde55-bae6-799d-8b65-24ec6802fb85'),
    ('019fb1c5-f57b-776c-a4c0-83fac4c79f6b', 'https://data.mjv.omgeving.vlaanderen.be/id/systeem/019fb1c5-f57b-776c-a4c0-83fac4c79f6b');

INSERT INTO mjv.installatie (systeem_id, uri) VALUES
    ('019dde53-2086-7754-80cc-52e0e59ae19a', 'https://data.mjv.omgeving.vlaanderen.be/id/installatie/019dde53-2086-7754-80cc-52e0e59ae19a'),
    ('019dde55-bae6-799d-8b65-24ec6802fb85', 'https://data.mjv.omgeving.vlaanderen.be/id/installatie/019dde55-bae6-799d-8b65-24ec6802fb85');

INSERT INTO mjv.emissiepunt (systeem_id, uri) VALUES
    ('019dde54-240d-7f0a-b291-ce4bf9712182', 'https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019dde54-240d-7f0a-b291-ce4bf9712182');

INSERT INTO mjv.meetpunt (systeem_id, uri) VALUES
    ('019fb1c5-f57b-776c-a4c0-83fac4c79f6b', 'https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019fb1c5-f57b-776c-a4c0-83fac4c79f6b');

INSERT INTO mjv.installatie_versie (id, installatie_id, uri, benaming, beschrijving, status, type, locatie_id, geldig_van, geldig_tot, aangemaakt_op) VALUES
    ('019eee53-2086-7754-80cc-52e0e59ae19a', '019dde53-2086-7754-80cc-52e0e59ae19a', 'https://data.mjv.omgeving.vlaanderen.be/id/installatie/019dde53-2086-7754-80cc-52e0e59ae19a', 'Directe stookinstallatie 2', NULL, 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/stookinstallatie', '019dde40-57be-7c1f-b8c2-dce2cbe2769d', DATE '2026-02-01', NULL, TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee55-bae6-799d-8b65-24ec6802fb85', '019dde55-bae6-799d-8b65-24ec6802fb85', 'https://data.mjv.omgeving.vlaanderen.be/id/installatie/019dde55-bae6-799d-8b65-24ec6802fb85', 'Directe stookinstallatie 1', NULL, 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/stookinstallatie', '019dde40-57be-7c1f-b8c2-dce2cbe2769d', DATE '2026-02-01', DATE '2026-10-31', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00');

INSERT INTO mjv.emissiepunt_versie (id, emissiepunt_id, uri, benaming, beschrijving, status, type, locatie_id, geldig_van, geldig_tot, aangemaakt_op, geometrie) VALUES
    ('019eee54-240d-7f0a-b291-ce4bf9712182', '019dde54-240d-7f0a-b291-ce4bf9712182', 'https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019dde54-240d-7f0a-b291-ce4bf9712182', 'Schouw 1', NULL, 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen', '019dde40-57be-7c1f-b8c2-dce2cbe2769d', DATE '2026-03-01', DATE '2026-09-30', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00', ST_GeomFromText('POINT(600000 700000)', 3812));

INSERT INTO mjv.meetpunt_versie (id, meetpunt_id, uri, benaming, beschrijving, status, type, locatie_id, geldig_van, geldig_tot, aangemaakt_op) VALUES
    ('019fb1d3-af18-727c-a638-fb26830592f2', '019fb1c5-f57b-776c-a4c0-83fac4c79f6b', 'https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019fb1c5-f57b-776c-a4c0-83fac4c79f6b', 'Peilput 1', NULL, 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/peilput', '019dde40-57be-7c1f-b8c2-dce2cbe2769d', DATE '2026-03-01', DATE '2026-09-30', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00');

INSERT INTO mjv.proces (id, uri) VALUES
    ('019dde42-2333-79e2-9e93-55e061461057', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde42-2333-79e2-9e93-55e061461057'),
    ('019dde56-287b-7401-b4d0-6720791bbcfe', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde56-287b-7401-b4d0-6720791bbcfe'),
    ('019dde57-560a-79f4-9a9a-a35a4f28dd98', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde57-560a-79f4-9a9a-a35a4f28dd98'),
    ('019dde58-a09b-7288-b327-db5a9cae6b72', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde58-a09b-7288-b327-db5a9cae6b72'),
    ('019dde59-bd34-7249-98e4-f3c9abcc822e', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde59-bd34-7249-98e4-f3c9abcc822e'),
    ('019dde5a-fb84-75c5-8bdd-02ac3fb7b549', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde5a-fb84-75c5-8bdd-02ac3fb7b549'),
    ('019fb1c6-611a-7409-92d8-23a5bf86b94f', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019fb1c6-611a-7409-92d8-23a5bf86b94f');

INSERT INTO mjv.rubriek (id, uri, bron_uri, type) VALUES
    ('019df38a-1293-79c9-9a41-3b36c6bdb7f0', 'https://data.mjv.omgeving.vlaanderen.be/id/rubriek/019df38a-1293-79c9-9a41-3b36c6bdb7f0', 'https://data.omgeving.vlaanderen.be/id/vlaremrubriek/7.5.2', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/rubriek-type/vlarem'),
    ('019df38a-9288-7118-a5e7-9f7422649471', 'https://data.mjv.omgeving.vlaanderen.be/id/rubriek/019df38a-9288-7118-a5e7-9f7422649471', 'https://data.omgeving.vlaanderen.be/id/vlaremrubriek/7.5.3', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/rubriek-type/emissiegrenswaarde');

INSERT INTO mjv.proces_versie (id, proces_id, uri, benaming, beschrijving, systeem_id, status, procedure_type, onderdeel_van_proces_versie_id, geldig_van, geldig_tot, aangemaakt_op) VALUES
    ('019eee42-2333-79e2-9e93-55e061461057', '019dde42-2333-79e2-9e93-55e061461057', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde42-2333-79e2-9e93-55e061461057', 'Crematorium Exploitatie', NULL, NULL, 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.riepr.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/hoofdactiviteit', NULL, DATE '2026-01-01', DATE '2026-12-31', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee56-287b-7401-b4d0-6720791bbcfe', '019dde56-287b-7401-b4d0-6720791bbcfe', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde56-287b-7401-b4d0-6720791bbcfe', 'Directe stookinstallatie 2 naar Schouw 1', NULL, NULL, 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.riepr.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/transport', '019eee42-2333-79e2-9e93-55e061461057', DATE '2026-03-01', NULL, TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee57-560a-79f4-9a9a-a35a4f28dd98', '019dde57-560a-79f4-9a9a-a35a4f28dd98', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde57-560a-79f4-9a9a-a35a4f28dd98', 'Schouw 1', NULL, '019dde54-240d-7f0a-b291-ce4bf9712182', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.riepr.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie', '019eee42-2333-79e2-9e93-55e061461057', DATE '2026-03-01', DATE '2026-09-30', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee58-a09b-7288-b327-db5a9cae6b72', '019dde58-a09b-7288-b327-db5a9cae6b72', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde58-a09b-7288-b327-db5a9cae6b72', 'Directe stookinstallatie 2', NULL, '019dde53-2086-7754-80cc-52e0e59ae19a', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.riepr.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking', '019eee59-bd34-7249-98e4-f3c9abcc822e', DATE '2026-02-01', NULL, TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee59-bd34-7249-98e4-f3c9abcc822e', '019dde59-bd34-7249-98e4-f3c9abcc822e', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde59-bd34-7249-98e4-f3c9abcc822e', 'Directe stookinstallatie 1', NULL, '019dde55-bae6-799d-8b65-24ec6802fb85', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.riepr.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking', '019eee42-2333-79e2-9e93-55e061461057', DATE '2026-02-01', DATE '2026-10-31', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee5a-fb84-75c5-8bdd-02ac3fb7b549', '019dde5a-fb84-75c5-8bdd-02ac3fb7b549', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019dde5a-fb84-75c5-8bdd-02ac3fb7b549', 'Directe stookinstallatie 1 naar Schouw 1', NULL, NULL, 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.riepr.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/transport', '019eee42-2333-79e2-9e93-55e061461057', DATE '2026-03-01', DATE '2026-10-31', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019fb1d8-1012-76c0-904b-d9d3ddd60962', '019fb1c6-611a-7409-92d8-23a5bf86b94f', 'https://data.mjv.omgeving.vlaanderen.be/id/proces/019fb1c6-611a-7409-92d8-23a5bf86b94f', 'Peilput 1', NULL, '019fb1c5-f57b-776c-a4c0-83fac4c79f6b', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', 'https://data.riepr.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting', '019eee42-2333-79e2-9e93-55e061461057', DATE '2026-03-01', DATE '2026-09-30', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00');

INSERT INTO mjv.proces_proces_volgt_op
    (id, bron_proces_id, doel_proces_id, geldig_van, geldig_tot, aangemaakt_op) VALUES
    ('019eee60-0001-7000-8000-000000000001', '019dde56-287b-7401-b4d0-6720791bbcfe', '019dde57-560a-79f4-9a9a-a35a4f28dd98', DATE '2026-03-01', DATE '2026-09-30', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee60-0002-7000-8000-000000000002', '019dde58-a09b-7288-b327-db5a9cae6b72', '019dde56-287b-7401-b4d0-6720791bbcfe', DATE '2026-03-01', NULL, TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee60-0003-7000-8000-000000000003', '019dde59-bd34-7249-98e4-f3c9abcc822e', '019dde5a-fb84-75c5-8bdd-02ac3fb7b549', DATE '2026-03-01', DATE '2026-10-31', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00'),
    ('019eee60-0004-7000-8000-000000000004', '019dde5a-fb84-75c5-8bdd-02ac3fb7b549', '019dde57-560a-79f4-9a9a-a35a4f28dd98', DATE '2026-03-01', DATE '2026-09-30', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00');

INSERT INTO mjv.proces_versie_rubriek (proces_versie_id, rubriek_id) VALUES
    ('019eee58-a09b-7288-b327-db5a9cae6b72', '019df38a-1293-79c9-9a41-3b36c6bdb7f0'),
    ('019eee59-bd34-7249-98e4-f3c9abcc822e', '019df38a-1293-79c9-9a41-3b36c6bdb7f0'),
    ('019eee59-bd34-7249-98e4-f3c9abcc822e', '019df38a-9288-7118-a5e7-9f7422649471');

INSERT INTO mjv.exploitatie (id, uri) VALUES
    ('019dde46-a9f5-7852-856f-b9ceb2ed4a2d', 'https://data.mjv.omgeving.vlaanderen.be/id/exploitatie/019dde46-a9f5-7852-856f-b9ceb2ed4a2d');

INSERT INTO mjv.exploitatie_versie (id, exploitatie_id, uri, status, proces_versie_id, locatie_id, benaming, geldig_van, geldig_tot, aangemaakt_op) VALUES
    ('019eee46-a9f5-7852-856f-b9ceb2ed4a2d', '019dde46-a9f5-7852-856f-b9ceb2ed4a2d', 'https://data.mjv.omgeving.vlaanderen.be/id/exploitatie/019dde46-a9f5-7852-856f-b9ceb2ed4a2d', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst', '019eee42-2333-79e2-9e93-55e061461057', '019dde40-57be-7c1f-b8c2-dce2cbe2769d', 'Crematorium Exploitatie', DATE '2026-01-01', DATE '2026-12-31', TIMESTAMPTZ '2026-04-01 10:15:30.123456+00');

INSERT INTO mjv.exploitatie_systeem (exploitatie_id, systeem_id) VALUES
    ('019dde46-a9f5-7852-856f-b9ceb2ed4a2d', '019dde53-2086-7754-80cc-52e0e59ae19a'),
    ('019dde46-a9f5-7852-856f-b9ceb2ed4a2d', '019dde54-240d-7f0a-b291-ce4bf9712182'),
    ('019dde46-a9f5-7852-856f-b9ceb2ed4a2d', '019dde55-bae6-799d-8b65-24ec6802fb85'),
    ('019dde46-a9f5-7852-856f-b9ceb2ed4a2d', '019fb1c5-f57b-776c-a4c0-83fac4c79f6b');

INSERT INTO mjv.systeemeigenschap (id, uri, type, eenheid, datatype, waarde, systeem_id) VALUES
    ('019df40a-1c7f-7a3c-9b21-d4e8a7c1b900', 'https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019df40a-1c7f-7a3c-9b21-d4e8a7c1b900', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerd_vermogen', 'http://qudt.org/vocab/unit/MegaW', 'http://www.w3.org/2001/XMLSchema#double', '0.35', '019dde53-2086-7754-80cc-52e0e59ae19a'),
    ('019df40b-3d8e-7b4d-8c12-e5f9b8d2ca01', 'https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019df40b-3d8e-7b4d-8c12-e5f9b8d2ca01', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/schouw-hoogte', 'http://qudt.org/vocab/unit/M', 'http://www.w3.org/2001/XMLSchema#double', '25.5', '019dde54-240d-7f0a-b291-ce4bf9712182'),
    ('019df40c-5e9d-7c5e-9d03-f6a0c9e3db02', 'https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019df40c-5e9d-7c5e-9d03-f6a0c9e3db02', 'https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/schouw-diameter', 'http://qudt.org/vocab/unit/M', 'http://www.w3.org/2001/XMLSchema#double', '0.6', '019dde54-240d-7f0a-b291-ce4bf9712182');

INSERT INTO mjv.installatie_versie_systeemeigenschap (installatie_versie_id, systeemeigenschap_id) VALUES
    ('019eee53-2086-7754-80cc-52e0e59ae19a', '019df40a-1c7f-7a3c-9b21-d4e8a7c1b900');

INSERT INTO mjv.emissiepunt_versie_systeemeigenschap (emissiepunt_versie_id, systeemeigenschap_id) VALUES
    ('019eee54-240d-7f0a-b291-ce4bf9712182', '019df40b-3d8e-7b4d-8c12-e5f9b8d2ca01'),
    ('019eee54-240d-7f0a-b291-ce4bf9712182', '019df40c-5e9d-7c5e-9d03-f6a0c9e3db02');

INSERT INTO mjv.ui_proces_metadata (id, proces_id, x, y) VALUES
    ('019dde5b-30cb-70e5-9b02-a249cce96cd7', '019dde57-560a-79f4-9a9a-a35a4f28dd98', 100, 100),
    ('019dde5c-705d-720a-bfc3-b6f9950b0987', '019dde58-a09b-7288-b327-db5a9cae6b72', 100, 100),
    ('019dde5d-7e5c-7c72-a835-91e300804955', '019dde59-bd34-7249-98e4-f3c9abcc822e', 100, 100),
    ('019fb1c6-d3e5-7650-95b0-57c670802de6', '019fb1c6-611a-7409-92d8-23a5bf86b94f', 100, 100);
