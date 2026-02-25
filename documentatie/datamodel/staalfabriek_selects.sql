-- =====================================
-- SELECTS voor scenario-vragen

-- 1. Geeft alle installaties van "exploitatie_0400123123_6851234567_ACTIVITEIT_1" op 10 februari 2024 samen met de geldigheid
SELECT i.uuid, i.benaming, i.geldig_van, i.geldig_tot
FROM installatie i
JOIN exploitatie_locatie el ON i.locatie_uuid = el.uuid
JOIN exploitatie e ON el.uuid = e.locatie_uuid
WHERE e.uuid = 'exploitatie_0400123123_6851234567_ACTIVITEIT_1'
  AND '2024-02-10' >= i.geldig_van
  AND (i.geldig_tot IS NULL OR '2024-02-10' < i.geldig_tot);

-- 1.b. 2002
SELECT i.uuid, i.benaming, i.geldig_van, i.geldig_tot
FROM installatie i
JOIN exploitatie_locatie el ON i.locatie_uuid = el.uuid
JOIN exploitatie e ON el.uuid = e.locatie_uuid
WHERE e.uuid = 'exploitatie_0400123123_6851234567_ACTIVITEIT_1'
  AND '2002-02-10' >= i.geldig_van
  AND (i.geldig_tot IS NULL OR '2002-02-10' < i.geldig_tot);

-- 2. Geeft alle installaties van "exploitatie_0400123123_6851234567_ACTIVITEIT_1" op 10 februari 2024 en alle subsystemen van deze installaties, samen met de geldigheid
SELECT i.uuid AS installatie_uuid, i.benaming AS installatie_benaming, i.geldig_van AS installatie_geldig_van, i.geldig_tot AS installatie_geldig_tot,
       s.uuid AS subsysteem_uuid, s.benaming AS subsysteem_benaming, s.geldig_van AS subsysteem_geldig_van, s.geldig_tot AS subsysteem_geldig_tot
FROM installatie i
JOIN exploitatie_locatie el ON i.locatie_uuid = el.uuid
JOIN exploitatie e ON el.uuid = e.locatie_uuid
LEFT JOIN rel_installatie_systeem ris ON i.uuid = ris.installatie_uuid AND i.geldig_van = ris.installatie_geldig_van AND i.aangemaakt_op = ris.installatie_aangemaakt_op
LEFT JOIN (
  SELECT uuid, benaming, geldig_van, geldig_tot FROM emissiepunt
  UNION ALL
  SELECT uuid, benaming, geldig_van, geldig_tot FROM installatie
  UNION ALL
  SELECT uuid, benaming, geldig_van, geldig_tot FROM installatie
) s ON ris.systeem_uuid = s.uuid
WHERE e.uuid = 'exploitatie_0400123123_6851234567_ACTIVITEIT_1'
  AND '2024-02-10' >= i.geldig_van
  AND (i.geldig_tot IS NULL OR '2024-02-10' < i.geldig_tot);

-- 3. Geef een boomstructuur van een "exploitatie_0400123123_6851234567_ACTIVITEIT_1" met het proces (benaming) en hoe alles aan elkaar hangt
-- (Let op: deze query geeft een overzicht van de hoofdproces en deelprocessen, met hun onderlinge relaties)
SELECT p.uuid AS proces_uuid, p.benaming AS proces_benaming, p.geldig_van, p.geldig_tot, rpop.proces_uuid AS child_proces_uuid, cp.benaming AS child_proces_benaming
FROM proces p
LEFT JOIN rel_proces_onderdeel_van_proces rpop ON p.uuid = rpop.proces_identity_uuid
LEFT JOIN proces cp ON rpop.proces_uuid = cp.uuid
WHERE p.uuid = 'proces_0400123123_6851234567_ACTIVITEIT_1';
