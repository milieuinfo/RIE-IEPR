-- Voorbeeldqueries op de IMJV PostgreSQL-databank
-- Verbinding: PGHOST=.../postgress/run PGPORT=5433 PGUSER=gehau PGDATABASE=riepr
--
-- URI-conventies:
--   emissie.uuid            = .../id/emissie/{kbo}/{ep_nr}/geleideemissies/{obs_id}/{jaar}
--   emissie.uuid (water)    = .../id/lozing/{kbo}/{mp_nr}/{jaar}
--   exploitatielocatie.uuid = .../id/exploitatie/{kbo}
--   split_part(em.uuid, '/', 5) → 'emissie' (lucht) of 'lozing' (water)
--   split_part(em.uuid, '/', 6) → KBO-nummer van de exploitatielocatie
--
-- Opzoektabel voor stofnamen:
--   JOIN property p ON p.uri = eo.observed_property
--   Laden: psql ... -f dump/sql/property.sql
--   Aanmaken: python3 code/codelijsten_to_sql.py
--
-- Procesgrootheden in observed_property (geen stofmassa, apart behandelen):
--   .../concept/debiet       (Nm³/uur of m³/jaar)
--   .../concept/emissieduur  (uur/jaar)

------------------------------------------------------------------------
-- 1. Totale emissies per exploitatielocatie en stof  (lucht + water)
--    Procesgrootheden (debiet, emissieduur) zijn uitgesloten.
------------------------------------------------------------------------
SELECT
    el.benaming                                              AS locatie,
    COALESCE(p.naam, regexp_replace(
        eo.observed_property, '.*/([^/]+)$', '\1'))          AS stof,
    p.type                                                   AS stof_type,
    p.cas_nummer,
    split_part(em.uuid, '/', 5)                              AS medium,
    SUM(r.waarde)                                            AS totaal_waarde,
    regexp_replace(r.eenheid, '.*/([^/]+)$', '\1')          AS eenheid,
    COUNT(DISTINCT em.uuid)                                  AS n_emissiepunten
FROM emissie_observatie eo
JOIN emissie            em ON em.uuid = eo.heeft_aandachtspunt
JOIN resultaat          r  ON r.uuid  = eo.heeft_resultaat
JOIN exploitatielocatie el ON el.uuid =
        'https://data.imjv.omgeving.vlaanderen.be/id/exploitatie/'
        || split_part(em.uuid, '/', 6)
LEFT JOIN property      p  ON p.uri   = eo.observed_property
WHERE r.waarde IS NOT NULL
  AND eo.observed_property NOT LIKE '%/concept/debiet%'
  AND eo.observed_property NOT LIKE '%emissieduur%'
GROUP BY
    el.benaming,
    eo.observed_property,
    p.naam, p.type, p.cas_nummer,
    split_part(em.uuid, '/', 5),
    r.eenheid
ORDER BY
    el.benaming,
    totaal_waarde DESC;

------------------------------------------------------------------------
-- 2. Top 10 locaties voor een specifieke stof op naam
--    Zoek op Nederlandse naam uit de property-tabel.
------------------------------------------------------------------------
SELECT
    el.benaming                  AS locatie,
    p.naam                       AS stof,
    p.cas_nummer,
    SUM(r.waarde)                AS totaal_kg,
    COUNT(DISTINCT em.uuid)      AS n_emissiepunten
FROM emissie_observatie eo
JOIN emissie            em ON em.uuid = eo.heeft_aandachtspunt
JOIN resultaat          r  ON r.uuid  = eo.heeft_resultaat
JOIN exploitatielocatie el ON el.uuid =
        'https://data.imjv.omgeving.vlaanderen.be/id/exploitatie/'
        || split_part(em.uuid, '/', 6)
JOIN property           p  ON p.uri   = eo.observed_property
WHERE p.naam ILIKE '%chloride%'       -- vervang door de gewenste stofnaam
  AND r.waarde IS NOT NULL
GROUP BY el.benaming, p.naam, p.cas_nummer
ORDER BY totaal_kg DESC
LIMIT 10;

------------------------------------------------------------------------
-- 3. Lucht- vs. wateremissies per locatie (kg/jaar), met stofnamen
------------------------------------------------------------------------
SELECT
    el.benaming                  AS locatie,
    split_part(em.uuid, '/', 5)  AS medium,
    SUM(r.waarde)                AS totaal_kg,
    COUNT(DISTINCT em.uuid)      AS n_punten,
    COUNT(DISTINCT eo.observed_property) AS n_stoffen
FROM emissie_observatie eo
JOIN emissie            em ON em.uuid = eo.heeft_aandachtspunt
JOIN resultaat          r  ON r.uuid  = eo.heeft_resultaat
JOIN exploitatielocatie el ON el.uuid =
        'https://data.imjv.omgeving.vlaanderen.be/id/exploitatie/'
        || split_part(em.uuid, '/', 6)
WHERE r.waarde IS NOT NULL
  AND r.eenheid LIKE '%kg%'
GROUP BY el.benaming, split_part(em.uuid, '/', 5)
ORDER BY el.benaming, medium;

------------------------------------------------------------------------
-- 4. Emissiepunten per exploitatielocatie
------------------------------------------------------------------------
SELECT
    el.benaming                   AS locatie,
    COUNT(DISTINCT ep.uuid)       AS n_emissiepunten,
    COUNT(DISTINCT mp.uuid)       AS n_meetpunten
FROM exploitatielocatie el
LEFT JOIN emissiepunt ep ON ep.locatie = el.uuid
LEFT JOIN meetpunt    mp ON mp.locatie = el.uuid
GROUP BY el.benaming
ORDER BY n_emissiepunten DESC;

------------------------------------------------------------------------
-- 5. Exploitant met al zijn locaties en totale stofemissies
------------------------------------------------------------------------
SELECT
    ext.benaming             AS exploitant,
    el.benaming              AS locatie,
    SUM(r.waarde)            AS totaal_stofmassa_kg,
    COUNT(DISTINCT em.uuid)  AS n_emissies
FROM exploitant             ext
JOIN exploitatielocatie     el  ON el.toegewezen_aan = ext.uuid
JOIN emissie_observatie     eo  ON TRUE
JOIN emissie                em  ON em.uuid = eo.heeft_aandachtspunt
                                AND split_part(em.uuid, '/', 6)
                                    = split_part(el.uuid, '/', 6)
JOIN resultaat              r   ON r.uuid  = eo.heeft_resultaat
WHERE r.waarde IS NOT NULL
  AND r.eenheid LIKE '%kg%'
GROUP BY ext.benaming, el.benaming
ORDER BY totaal_stofmassa_kg DESC;

------------------------------------------------------------------------
-- 6. Alle gemeten stoffen voor één locatie (via KBO-nummer), met naam
------------------------------------------------------------------------
SELECT
    COALESCE(p.naam, regexp_replace(
        eo.observed_property, '.*/([^/]+)$', '\1'))          AS stof,
    p.type                                                   AS stof_type,
    p.cas_nummer,
    split_part(em.uuid, '/', 5)                              AS medium,
    split_part(em.uuid, '/', 7)                              AS emissiepunt_nr,
    r.waarde,
    regexp_replace(r.eenheid, '.*/([^/]+)$', '\1')          AS eenheid
FROM emissie_observatie eo
JOIN emissie            em ON em.uuid = eo.heeft_aandachtspunt
JOIN resultaat          r  ON r.uuid  = eo.heeft_resultaat
LEFT JOIN property      p  ON p.uri   = eo.observed_property
WHERE split_part(em.uuid, '/', 6) = '00080209000108'   -- KBO van de locatie
  AND r.waarde IS NOT NULL
ORDER BY medium, stof, emissiepunt_nr;

------------------------------------------------------------------------
-- 7. Stof-ranglijst over alle locaties, gesorteerd op bereik
------------------------------------------------------------------------
SELECT
    COALESCE(p.naam, regexp_replace(
        eo.observed_property, '.*/([^/]+)$', '\1'))          AS stof,
    p.type                                                   AS stof_type,
    p.cas_nummer,
    COUNT(DISTINCT split_part(em.uuid, '/', 6))              AS n_locaties,
    COUNT(*)                                                 AS n_metingen,
    SUM(r.waarde)                                            AS totaal_waarde,
    regexp_replace(MIN(r.eenheid), '.*/([^/]+)$', '\1')     AS eenheid
FROM emissie_observatie eo
JOIN emissie            em ON em.uuid = eo.heeft_aandachtspunt
JOIN resultaat          r  ON r.uuid  = eo.heeft_resultaat
LEFT JOIN property      p  ON p.uri   = eo.observed_property
WHERE r.waarde IS NOT NULL
  AND eo.observed_property NOT LIKE '%/concept/debiet%'
  AND eo.observed_property NOT LIKE '%emissieduur%'
GROUP BY eo.observed_property, p.naam, p.type, p.cas_nummer
ORDER BY n_locaties DESC, totaal_waarde DESC;

------------------------------------------------------------------------
-- 8. Geometrie van emissiepunten via de JSON-LD tabellen
--    VEREISTE: laad eerst dump/jsonld/load.sql:
--      psql -h .../postgress/run -p 5433 -U gehau riepr \
--        -v ON_ERROR_STOP=off -f dump/jsonld/load.sql
------------------------------------------------------------------------
SELECT
    je.id                          AS emissiepunt,
    je.label                       AS naam,
    je."hasGeometry"->>'asWKT'     AS wkt_coordinaat,
    jl.label                       AS locatie
FROM jsonld_emissiepunt je
JOIN jsonld_exploitatielocatie jl
     ON jl.id = 'https://data.imjv.omgeving.vlaanderen.be/id/exploitatie/'
                || split_part(je.id, '/', 6)
WHERE je."hasGeometry" IS NOT NULL
ORDER BY locatie, naam
LIMIT 20;
