-- =====================================
-- Adres
-- =====================================
INSERT INTO adres (uuid, straat, postcode)
VALUES ('adres_0400123123_6851234567', 'Staalstraat', '1000');



-- =====================================
-- Exploitant
-- =====================================
INSERT INTO exploitant_identity (uuid) VALUES ('exploitant_0400123123');
INSERT INTO exploitant (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming)
VALUES ('exploitant_0400123123', 'https://data.riepr.omgeving.vlaanderen.be/id/exploitant/0400123123', TRUE, '1990-01-01', '2026-01-01', '1990-01-01', NULL, 'Staalfabriek NV');



-- =====================================
-- ExploitatieLocatie
-- =====================================
INSERT INTO exploitatie_locatie_identity (uuid) VALUES ('exploitatielocatie_0400123123_6851234567');
INSERT INTO exploitatie_locatie (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, geometrie, toegewezen_aan_uuid, adres_uuid, same_as)
VALUES ('exploitatielocatie_0400123123_6851234567', 'https://data.riepr.omgeving.vlaanderen.be/id/exploitatielocatie/0400123123_6851234567', TRUE, '1990-01-01', '2026-01-01', '1990-01-01', NULL, 'Hoofdzetel Staalfabriek NV', 'POINT(4.35 51.23)', 'exploitant_0400123123', 'adres_0400123123_6851234567', 'same_as_0400123123_6851234567');


-- =====================================
-- Exploitatie
-- =====================================
INSERT INTO exploitatie_identity (uuid) VALUES
 ('exploitatie_0400123123_6851234567_ACTIVITEIT_1');
INSERT INTO exploitatie (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, locatie_uuid, status)
VALUES
 ('exploitatie_0400123123_6851234567_ACTIVITEIT_1', 'https://data.riepr.omgeving.vlaanderen.be/id/exploitatie/0400123123_6851234567_ACTIVITEIT_1_VERSIE1999', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Exploitatie 1999', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('exploitatie_0400123123_6851234567_ACTIVITEIT_1', 'https://data.riepr.omgeving.vlaanderen.be/id/exploitatie/0400123123_6851234567_ACTIVITEIT_1_VERSIE2020', TRUE, '2020-01-01', '2026-01-01', '2020-01-01', NULL, 'Exploitatie 2020', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('exploitatie_0400123123_6851234567_ACTIVITEIT_1', 'https://data.riepr.omgeving.vlaanderen.be/id/exploitatie/0400123123_6851234567_ACTIVITEIT_1_VERSIE2026', TRUE, '2026-01-01', '2026-01-01', '2026-01-01', NULL, 'Exploitatie 2026', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF');



INSERT INTO installatie_identity (uuid) VALUES
 ('apparaat_0400123123_6851234567_0001'),
 ('apparaat_0400123123_6851234567_0002'),
 ('apparaat_0400123123_6851234567_0003'),
 ('apparaat_0400123123_6851234567_0004'),
 ('apparaat_0400123123_6851234567_0005'),
 ('apparaat_0400123123_6851234567_0006'),
 ('apparaat_0400123123_6851234567_0007'),
 ('apparaat_0400123123_6851234567_0008');
INSERT INTO installatie (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, locatie_uuid, status)
VALUES
 ('apparaat_0400123123_6851234567_0001', 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0001', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Oven 1', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('apparaat_0400123123_6851234567_0002', 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0002', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Oven 2', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('apparaat_0400123123_6851234567_0003', 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0003', TRUE, '2020-01-01', '2026-01-01', '2020-01-01', NULL, 'Filterinstallatie', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('apparaat_0400123123_6851234567_0004', 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0004', TRUE, '2020-01-01', '2026-01-01', '2020-01-01', NULL, 'Argoninstallatie', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('apparaat_0400123123_6851234567_0005', 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0005', TRUE, '2020-01-01', '2026-01-01', '2020-01-01', NULL, 'Zuiveringsinstallatie', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('apparaat_0400123123_6851234567_0006', 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0006', TRUE, '2026-01-01', '2026-01-01', '2026-01-01', NULL, 'Nieuwe oven', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('apparaat_0400123123_6851234567_0007', 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0007', TRUE, '2026-01-01', '2026-01-01', '2026-01-01', NULL, 'Afwerkstand', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF'),
 ('apparaat_0400123123_6851234567_0008', 'https://data.riepr.omgeving.vlaanderen.be/id/apparaat/0400123123_6851234567_0008', TRUE, '2026-01-01', '2026-01-01', '2026-01-01', NULL, 'Zuiveringsapparaat Afwerkstand', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF');

-- =====================================

-- Installatie 1
INSERT INTO installatie_identity (uuid) VALUES ('installatie_0400123123_6851234567_0000001');
INSERT INTO installatie (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, locatie_uuid, status)
VALUES ('installatie_0400123123_6851234567_0000001', 'https://data.riepr.omgeving.vlaanderen.be/id/installatie/0400123123_6851234567_0000001', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Hoofdinstallatie 1', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF');

-- Installatie 2
INSERT INTO installatie_identity (uuid) VALUES ('installatie_0400123123_6851234567_0000002');
INSERT INTO installatie (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, locatie_uuid, status)
VALUES ('installatie_0400123123_6851234567_0000002', 'https://data.riepr.omgeving.vlaanderen.be/id/installatie/0400123123_6851234567_0000002', TRUE, '2020-01-01', '2026-01-01', '2020-01-01', NULL, 'Hoofdinstallatie 2', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF');

-- VOD-installatie (bestaande)
INSERT INTO installatie_identity (uuid) VALUES ('vod_installatie_0400123123_6851234567');
INSERT INTO installatie (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, locatie_uuid, status)
VALUES ('vod_installatie_0400123123_6851234567', 'https://data.riepr.omgeving.vlaanderen.be/id/installatie/0400123123_6851234567_vod', TRUE, '2020-01-01', NULL, '2020-01-01', NULL, 'VOD-installatie', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF');

-- rel_installatie_systeem: koppeling subsystemen
-- Installatie 1 subsystemen: emissiepunt_0000001, emissiepunt_0000002, apparaat_0001
INSERT INTO rel_installatie_systeem (installatie_uuid, installatie_geldig_van, installatie_aangemaakt_op, systeem_uuid)
VALUES ('installatie_0400123123_6851234567_0000001', '1999-01-01', '1999-01-01', 'emissiepunt_0400123123_6851234567_0000001'),
       ('installatie_0400123123_6851234567_0000001', '1999-01-01', '1999-01-01', 'emissiepunt_0400123123_6851234567_0000002'),
       ('installatie_0400123123_6851234567_0000001', '1999-01-01', '1999-01-01', 'apparaat_0400123123_6851234567_0001');

-- Installatie 2 subsystemen: emissiepunt_0000005, apparaat_0002
INSERT INTO rel_installatie_systeem (installatie_uuid, installatie_geldig_van, installatie_aangemaakt_op, systeem_uuid)
VALUES ('installatie_0400123123_6851234567_0000002', '2020-01-01', '2020-01-01', 'emissiepunt_0400123123_6851234567_0000005'),
       ('installatie_0400123123_6851234567_0000002', '2020-01-01', '2020-01-01', 'apparaat_0400123123_6851234567_0002');

-- VOD-installatie subsystemen (bestaande)
INSERT INTO rel_installatie_systeem (installatie_uuid, installatie_geldig_van, installatie_aangemaakt_op, systeem_uuid)
VALUES ('vod_installatie_0400123123_6851234567', '2020-01-01', '2020-01-01', 'apparaat_0400123123_6851234567_0003'),
       ('vod_installatie_0400123123_6851234567', '2020-01-01', '2020-01-01', 'apparaat_0400123123_6851234567_0005'),
       ('vod_installatie_0400123123_6851234567', '2020-01-01', '2020-01-01', 'apparaat_0400123123_6851234567_0007'),
       ('vod_installatie_0400123123_6851234567', '2020-01-01', '2020-01-01', 'apparaat_0400123123_6851234567_0008');



-- =====================================
-- Emissiepunten
-- =====================================
INSERT INTO emissiepunt_identity (uuid) VALUES
 ('emissiepunt_0400123123_6851234567_0000001'),
 ('emissiepunt_0400123123_6851234567_0000002'),
 ('emissiepunt_0400123123_6851234567_0000003'),
 ('emissiepunt_0400123123_6851234567_0000004'),
 ('emissiepunt_0400123123_6851234567_0000005');
INSERT INTO emissiepunt (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, geometrie, locatie_uuid, status, type)
VALUES
 ('emissiepunt_0400123123_6851234567_0000001', 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000001', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Emissiepunt 1', 'POINT(4.35 51.23)', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF', 'lucht'),
 ('emissiepunt_0400123123_6851234567_0000002', 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000002', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Emissiepunt 2', 'POINT(4.36 51.24)', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF', 'lucht'),
 ('emissiepunt_0400123123_6851234567_0000003', 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000003', TRUE, '2020-01-01', '2026-01-01', '2020-01-01', NULL, 'Emissiepunt 3', 'POINT(4.37 51.25)', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF', 'lucht'),
 ('emissiepunt_0400123123_6851234567_0000004', 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000004', TRUE, '2020-01-01', '2026-01-01', '2020-01-01', NULL, 'Emissiepunt 4', 'POINT(4.38 51.26)', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF', 'lucht'),
 ('emissiepunt_0400123123_6851234567_0000005', 'https://data.riepr.omgeving.vlaanderen.be/id/emissiepunt/0400123123_6851234567_0000005', TRUE, '2026-01-01', '2026-01-01', '2026-01-01', NULL, 'Emissiepunt 5', 'POINT(4.39 51.27)', 'exploitatielocatie_0400123123_6851234567', 'ACTIEF', 'lucht');


-- =====================================
-- Processen
-- =====================================
INSERT INTO proces_identity (uuid) VALUES
 ('proces_0400123123_6851234567_ACTIVITEIT_1');
UPDATE exploitatie SET implementeert_uuid = 'proces_0400123123_6851234567_ACTIVITEIT_1' WHERE uuid = 'exploitatie_0400123123_6851234567_ACTIVITEIT_1';

INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status)
VALUES
    -- 1999 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_VERSIE1999', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Staalproductieproces van Staalfabriek NV op 1999', 'STAALPRODUCTIE', 'ACTIEF'),
    -- 2020 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_VERSIE2020', TRUE, '2020-01-01', '2026-01-01', '2020-01-01', NULL, 'Staalproductieproces van Staalfabriek NV op 2020', 'STAALPRODUCTIE', 'ACTIEF'),
    -- 2026 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_VERSIE2026', TRUE, '2026-01-01', '2026-01-01', '2026-01-01', NULL, 'Staalproductieproces van Staalfabriek NV op 2026', 'STAALPRODUCTIE', 'ACTIEF');

-- Toevoeging van grondstoffen (versies)
INSERT INTO proces_identity (uuid) VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0001');
INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status, revisie_van_uuid)
VALUES
	-- 1999 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1_0001', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0001_VERSIE1999', TRUE, '1999-01-01', NULL, '1999-01-01', '2020-01-01', 'Toevoeging van grondstoffen', 'DEELPROCES', 'ACTIEF', NULL),
	-- 2020 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1_0001', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0001_VERSIE2020', TRUE, '2020-01-01', NULL, '2020-01-01', '2026-01-01', 'Toevoeging van grondstoffen', 'DEELPROCES', 'ACTIEF', 'proces_0400123123_6851234567_ACTIVITEIT_1_0001'),
	-- 2026 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1_0001', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0001_VERSIE2026', TRUE, '2026-01-01', NULL, '2026-01-01', NULL, 'Toevoeging van grondstoffen', 'DEELPROCES', 'ACTIEF', 'proces_0400123123_6851234567_ACTIVITEIT_1_0001');


-- Afgassing (rookgas, met versie)
INSERT INTO proces_identity (uuid) VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0002');
INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status, revisie_van_uuid)
VALUES
    -- 1999 versie
	('proces_0400123123_6851234567_ACTIVITEIT_1_0002', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0002_VERSIE1999', TRUE, '1999-01-01', NULL, '1999-01-01', '2020-01-01', 'Afgassing', 'DEELPROCES', 'ACTIEF', NULL),
	-- 2020 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1_0002', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0002_VERSIE2020', TRUE, '2020-01-01', NULL, '2020-01-01', '2026-01-01', 'Afgassing', 'DEELPROCES', 'ACTIEF', 'proces_0400123123_6851234567_ACTIVITEIT_1_0002'),
	-- 2026 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1_0002', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0002_VERSIE2026', TRUE, '2026-01-01', NULL, '2026-01-01', NULL, 'Afgassing', 'DEELPROCES', 'ACTIEF', 'proces_0400123123_6851234567_ACTIVITEIT_1_0002');


-- Schroot toevoegen (met versie)
INSERT INTO proces_identity (uuid) VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0003');
INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status, revisie_van_uuid)
VALUES
    -- 1999 versie
	('proces_0400123123_6851234567_ACTIVITEIT_1_0003', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0003_VERSIE1999', TRUE, '1999-01-01', NULL, '1999-01-01', '2020-01-01', 'Schroot toevoegen', 'DEELPROCES', 'ACTIEF', NULL),
	-- 2020 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1_0003', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0003_VERSIE2020', TRUE, '2020-01-01', NULL, '2020-01-01', '2026-01-01', 'Schroot toevoegen', 'DEELPROCES', 'ACTIEF', 'proces_0400123123_6851234567_ACTIVITEIT_1_0003'),
	-- 2026 versie
    ('proces_0400123123_6851234567_ACTIVITEIT_1_0003', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0003_VERSIE2026', TRUE, '2026-01-01', NULL, '2026-01-01', NULL, 'Schroot toevoegen', 'DEELPROCES', 'ACTIEF', 'proces_0400123123_6851234567_ACTIVITEIT_1_0003');

-- Staalproductie in stroomboogoven
INSERT INTO proces_identity (uuid) VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0004');
INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0004', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0004', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Staalproductie in stroomboogoven', 'DEELPROCES', 'ACTIEF');

-- Argon-zuurstofontkoling
INSERT INTO proces_identity (uuid) VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0007');
INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0007', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0007', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Argon-zuurstofontkoling', 'DEELPROCES', 'ACTIEF');

-- Decarburisatie
INSERT INTO proces_identity (uuid) VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0009');
INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0009', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0009', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Decarburisatie', 'DEELPROCES', 'ACTIEF');

-- Overbrenging vloeibaar staal
INSERT INTO proces_identity (uuid) VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0006');
INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0006', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0006', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Overbrenging vloeibaar staal', 'DEELPROCES', 'ACTIEF');

-- Overbrenging naar decarburisatie
INSERT INTO proces_identity (uuid) VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0008b');
INSERT INTO proces (uuid, uri, ingediend, aangemaakt_op, aangepast_op, geldig_van, geldig_tot, benaming, type, status)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0008b', 'https://data.riepr.omgeving.vlaanderen.be/id/proces/0400123123_6851234567_ACTIVITEIT_1_0008b', TRUE, '1999-01-01', '2026-01-01', '1999-01-01', NULL, 'Overbrenging naar decarburisatie', 'DEELPROCES', 'ACTIEF');

-- rel_proces_onderdeel_van_proces: child-proces (uuid, geldig_van, aangemaakt_op), parent proces_identity_uuid
-- Toevoeging van grondstoffen (onderdeel van hoofdproces)
INSERT INTO rel_proces_onderdeel_van_proces (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0001', '1999-01-01', '1999-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1'),
       ('proces_0400123123_6851234567_ACTIVITEIT_1_0001', '2020-01-01', '2020-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1'),
       ('proces_0400123123_6851234567_ACTIVITEIT_1_0001', '2026-01-01', '2026-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1');

-- Afgassing (onderdeel van hoofdproces)
INSERT INTO rel_proces_onderdeel_van_proces (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0002', '1999-01-01', '1999-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1'),
       ('proces_0400123123_6851234567_ACTIVITEIT_1_0002', '2020-01-01', '2020-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1'),
       ('proces_0400123123_6851234567_ACTIVITEIT_1_0002', '2026-01-01', '2026-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1');

-- Schroot toevoegen (onderdeel van hoofdproces)
INSERT INTO rel_proces_onderdeel_van_proces (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0003', '1999-01-01', '1999-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1'),
       ('proces_0400123123_6851234567_ACTIVITEIT_1_0003', '2020-01-01', '2020-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1'),
       ('proces_0400123123_6851234567_ACTIVITEIT_1_0003', '2026-01-01', '2026-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1');

-- Staalproductie in stroomboogoven (onderdeel van hoofdproces)
INSERT INTO rel_proces_onderdeel_van_proces (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0004', '1999-01-01', '1999-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1');

-- Argon-zuurstofontkoling (onderdeel van hoofdproces)
INSERT INTO rel_proces_onderdeel_van_proces (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0007', '1999-01-01', '1999-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1');

-- Decarburisatie (onderdeel van hoofdproces)
INSERT INTO rel_proces_onderdeel_van_proces (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0009', '1999-01-01', '1999-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1');

-- Overbrenging vloeibaar staal (onderdeel van hoofdproces)
INSERT INTO rel_proces_onderdeel_van_proces (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0006', '1999-01-01', '1999-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1');

-- Overbrenging naar decarburisatie (onderdeel van hoofdproces)
INSERT INTO rel_proces_onderdeel_van_proces (proces_uuid, proces_geldig_van, proces_aangemaakt_op, proces_identity_uuid)
VALUES ('proces_0400123123_6851234567_ACTIVITEIT_1_0008b', '1999-01-01', '1999-01-01', 'proces_0400123123_6851234567_ACTIVITEIT_1');
