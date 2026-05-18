# IMJV PostgreSQL databank

Lokale PostgreSQL 16-instantie voor de RIE-PR IMJV-data, gegenereerd vanuit `all.ttl`.

Er zijn drie ETL-paden beschikbaar:

| Pad | Script | Tabellen | Geometrie |
|-----|--------|----------|-----------|
| **SQL** | `ttl_to_sql.py` | 55 tabellen conform `schema.sql` | URI-referentie |
| **JSON-LD** | `ttl_to_jsonld.py` | 17 `jsonld_`-tabellen met `jsonb`-kolommen | Ingebed als `{"@id":…,"asWKT":"POINT(…)"}` |
| **Codelijsten** | `codelijsten_to_sql.py` | `property`-tabel (8.283 rijen) | n.v.t. |

## Verbindingsgegevens

| Parameter  | Waarde      |
|------------|-------------|
| Host       | `127.0.0.1` |
| Port       | `5433`      |
| Database   | `riepr`     |
| User       | `gehau`     |
| Password   | `1234`      |

```bash
psql -h 127.0.0.1 -p 5433 -U gehau riepr
# of via Unix-socket (geen wachtwoord nodig):
psql -h /home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/postgress/run -p 5433 -U gehau riepr
```

## Servercommando's

De data directory is `src/main/input/imjv-transformed/postgress/`.

```bash
PGDATA=/home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/postgress

# Starten
/usr/lib/postgresql/16/bin/pg_ctl -D "$PGDATA" -l "$PGDATA/postgresql.log" start

# Stoppen
/usr/lib/postgresql/16/bin/pg_ctl -D "$PGDATA" stop

# Status
/usr/lib/postgresql/16/bin/pg_ctl -D "$PGDATA" status

# Bereikbaarheid controleren
pg_isready -h "$PGDATA/run" -p 5433
```

De server luistert op:
- TCP: `127.0.0.1:5433`
- Unix-socket: `postgress/run/.s.PGSQL.5433`

## Schema

Het schema is gegenereerd door ODDToolkit vanuit de RIE-PR ontologie en staat in:

```
documentatie/datamodel/generated/sql/schema.sql
```

Het schema laden (na aanmaken van een lege database):

```bash
psql -h 127.0.0.1 -p 5433 -U gehau riepr \
  -f /home/gehau/git/RIE-IEPR/documentatie/datamodel/generated/sql/schema.sql
```

### Tabeloverzicht

Het schema bevat 55 tabellen in drie soorten:

| Type | Beschrijving |
|------|-------------|
| **REGULAR** | Hoofdtabellen met entiteitsdata (temporele kolommen: `geldig_van`, `aangemaakt_op`, `geldig_tot`) |
| **IDENTITY** | Stabiele sleuteltabellen met enkel `uuid` (één rij per entiteit, onafhankelijk van versie) |
| **JOIN** | Koppeltabellen voor veel-op-veel-relaties tussen entiteiten |

### Rijenaantallen (na laden)

| Tabel | Rijen | Opmerking |
|-------|------:|-----------|
| `hoeveelheid_waarde` | 18.510 | |
| `observatie` | 18.510 | generieke observaties (sosa:Observation + sosa:Execution) |
| `resultaat` | 18.510 | |
| `systeem` | 15.155 | |
| `proces_identity` | 10.276 | |
| `proces` | 10.276 | |
| `emissie_observatie` | 8.253 | gespecialiseerde subklasse van `observatie` (riepr:EmissieObservatie) |
| `emissiepunt_identity` | 7.708 | |
| `emissiepunt` | 7.708 | incl. jaarvariant (`/jaar/2021`); enkel jaarvariant heeft `locatie` ingevuld |
| `proces_variabele_proces` | 7.046 | |
| `meetpunt_identity` | 4.164 | |
| `meetpunt` | 4.164 | |
| `meetpunt_exploitatie` | 4.164 | |
| `installatie_exploitatie` | 4.023 | |
| `installatie_identity` | 3.983 | |
| `installatie` | 3.983 | |
| `emissiepunt_exploitatie` | 3.854 | |
| `proces_variabele` | 3.447 | |
| `filter_identity` | 1.299 | |
| `filter` | 1.299 | |
| `filter_exploitatie` | 1.299 | |
| `zuiverings_apparaat` | 1.075 | |
| `externe_identificator` | 1.014 | |
| `onttrekkingspunt_identity` | 969 | |
| `onttrekkingspunt` | 969 | |
| `onttrekkingspunt_exploitatie` | 932 | |
| `exploitatielocatie_identity` | 564 | |
| `adres` | 557 | |
| `exploitatie_identity` | 538 | |
| `exploitatie` | 538 | |
| `exploitatielocatie` | 538 | UUID-patroon: `.../id/exploitatie/{kbo}` |
| `exploitatielocatie_exploitatie` | 538 | |
| `exploitant_identity` | 476 | |
| `exploitant` | 476 | |
| `emissie` | 374 | |
| `onttrekkingspunt_filter` | 37 | |
| `onttrekking_observatie` | 0 | |
| Overige tabellen | 0 | |

Tabellen met 0 rijen (`aangifte`, `contactpersoon`, `transactie`, `onttrekking_observatie`, …) bevatten entiteiten die niet aanwezig zijn in de IMJV-brondata.

De `property`-tabel (zie [Codelijsten](#codelijsten-property-tabel)) staat hier niet bij: die wordt niet uit `all.ttl` gegenereerd maar apart geladen vanuit de codelijsten-CSV's.

| Tabel | Rijen | Bron |
|-------|------:|------|
| `property` | 8.283 | `codelijsten/*.csv` via `codelijsten_to_sql.py` |

## URI-structuur en JOIN-patronen

De primaire sleutels (`uuid`) zijn volledige RDF-URI's. De URI-opbouw is bepalend voor de joins.

| Entiteit | URI-patroon | Positie (split `/`) |
|----------|-------------|---------------------|
| `emissie` (lucht) | `.../id/emissie/{kbo}/{ep_nr}/geleideemissies/{obs_id}/{jaar}` | 6 = KBO |
| `emissie` (water) | `.../id/lozing/{kbo}/{mp_nr}/{jaar}` | 6 = KBO |
| `exploitatielocatie` | `.../id/exploitatie/{kbo}` | 6 = KBO |
| `emissiepunt` | `.../id/emissiepunt/{kbo}/{ep_nr}[/jaar/{jaar}]` | 6 = KBO |
| `meetpunt` | `.../id/meetpunt/{kbo}/{ep_nr}/jaar/{jaar}` | 6 = KBO |

**Koppeling `emissie` → `exploitatielocatie`** (geen directe FK; via KBO-extractie):

```sql
JOIN exploitatielocatie el
  ON el.uuid = 'https://data.imjv.omgeving.vlaanderen.be/id/exploitatie/'
               || split_part(em.uuid, '/', 6)
```

**Kernketen voor emissiewaarden:**

```
emissie_observatie.heeft_aandachtspunt → emissie.uuid
emissie_observatie.heeft_resultaat     → resultaat.uuid  (resultaat.waarde, resultaat.eenheid)
```

**Stofidentificatie in `emissie_observatie.observed_property`:**

| Patroon | Voorbeeld (URI-suffix) | Betekenis |
|---------|----------------------|-----------|
| InChIKey chemische stof | `VEXZGXHMUGYJMC-UHFFFAOYSA-M` | chloride (HCl) |
| Sommatiegroep | `n_t`, `zs`, `aox`, `toc` | totaal-N, zwevende stoffen, … |
| IMJV fysicochem. code | `0039`, `0040` | BZV5, CZV |
| Procesgroot­heid | `debiet`, `emissieduur` | geen stofmassa; apart behandelen |

De Nederlandse naam is opvraagbaar via de `property`-tabel:

```sql
LEFT JOIN property p ON p.uri = eo.observed_property
-- → p.naam  : 'chloride', 'Zwevende stoffen', 'Chemisch zuurstofverbruik', …
-- → p.type  : 'chemische_stof' | 'fysico_chemisch' | 'sommatie_stoffen'
-- → p.cas_nummer, p.notation, p.iupac
```

Zoeken op naam (i.p.v. InChIKey):

```sql
JOIN property p ON p.uri = eo.observed_property
WHERE p.naam ILIKE '%stikstof%'
```

**Medium onderscheiden:**

```sql
split_part(em.uuid, '/', 5)  -- 'emissie' = geleide luchtuitstoot, 'lozing' = waterlozing
```

## Voorbeeldqueries

Zie `dump/sql/example-queries.sql` voor 8 uitgewerkte queries met commentaar. Alle queries gebruiken `LEFT JOIN property` zodat stofnamen leesbaar zijn en gezocht kan worden op naam.

**Vereiste:** de `property`-tabel moet geladen zijn (zie [Codelijsten](#codelijsten-property-tabel)).

**Overzicht:**

| # | Vraag |
|---|-------|
| 1 | Totale emissies per exploitatielocatie en stof, met Nederlandse naam |
| 2 | Top 10 locaties voor een stof, gezocht op naam (`ILIKE '%chloride%'`) |
| 3 | Lucht- vs. wateremissies per locatie (kg/jaar) |
| 4 | Aantal emissiepunten en meetpunten per locatie |
| 5 | Exploitant met al zijn locaties en totale stofmassa |
| 6 | Alle gemeten stoffen voor één locatie (via KBO-nummer), met naam |
| 7 | Stof-ranglijst over alle locaties met naam en CAS-nummer |
| 8 | Geometrie van emissiepunten (vereist JSON-LD tabellen via `dump/jsonld/load.sql`) |

**Minimaal werkend voorbeeld** (top 10 chloride-emissies per locatie, op naam):

```sql
SELECT el.benaming AS locatie, p.naam, p.cas_nummer,
       ROUND(SUM(r.waarde)::numeric, 0) AS totaal_kg
FROM emissie_observatie eo
JOIN emissie            em ON em.uuid = eo.heeft_aandachtspunt
JOIN resultaat          r  ON r.uuid  = eo.heeft_resultaat
JOIN exploitatielocatie el ON el.uuid =
        'https://data.imjv.omgeving.vlaanderen.be/id/exploitatie/'
        || split_part(em.uuid, '/', 6)
JOIN property           p  ON p.uri   = eo.observed_property
WHERE p.naam ILIKE '%chloride%'
  AND r.waarde IS NOT NULL
GROUP BY el.benaming, p.naam, p.cas_nummer
ORDER BY totaal_kg DESC
LIMIT 10;
```

## ETL: van TTL naar SQL

### Bronbestand

```
src/main/input/imjv-transformed/dump/all.ttl
```

Gecombineerde Turtle-dump van alle IMJV-data (~780.000 regels, ~57 MB).

### Conversiescript

```
src/main/input/imjv-transformed/code/ttl_to_sql.py
```

Python 3-script dat `all.ttl` inleest via rdflib en SQL INSERT-statements genereert conform `schema.sql`.

```bash
cd /home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/code
python3 ttl_to_sql.py
# Output: ../dump/sql/insert.sql
```

Optioneel met expliciete paden:

```bash
python3 ttl_to_sql.py \
  ../dump/all.ttl \
  ../../../../../documentatie/datamodel/generated/sql/schema.sql \
  ../dump/sql/insert.sql
```

### Gegenereerd INSERT-bestand

```
src/main/input/imjv-transformed/dump/sql/insert.sql
```

~160.000 regels, ~62 MB. Bevat `BEGIN;` / `COMMIT;` en `ON CONFLICT DO NOTHING` per INSERT.

### INSERT-bestand laden

```bash
PGDATA=/home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/postgress

psql -h "$PGDATA/run" -p 5433 -U gehau riepr \
  -v ON_ERROR_STOP=off \
  -c "SET session_replication_role = replica;" \
  -c "\i /home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/dump/sql/insert.sql" \
  -c "SET session_replication_role = DEFAULT;"
```

`session_replication_role = replica` schakelt FK-controles tijdelijk uit. Dit is nodig omdat IMJV-observaties via `sosa:hasFeatureOfInterest` ook naar emissiepunten verwijzen (niet enkel naar meetpunten), wat het schema-FK op `observatie.heeft_aandachtspunt → meetpunt_identity` schendt.

### Mapping: RDF → SQL

Het script leest de kolom-predicaat-koppeling uit `COMMENT ON COLUMN`-regels in `schema.sql`:

| SQL kolom | RDF predicaat |
|-----------|--------------|
| `uri` | *(subject-URI zelf)* |
| `uuid` | *(subject-URI, gebruikt als VARCHAR-sleutel)* |
| `geldig_van` | `dct:issued` |
| `aangemaakt_op` | `dct:created` |
| `geldig_tot` | `dct:valid` |
| `aangepast_op` | `dct:modified` |
| `benaming` | `rdfs:label` (voorkeur `@nl`) |
| `beschrijving` | `rdfs:comment` |
| `status` | `adms:status` (laatste URI-segment → uppercase) |
| `identifier` | `adms:identifier` |
| `type` | `dct:type` |
| `geometrie` | `geo:hasGeometry` (URI van geometrie-node) |
| `locatie` | `sosa:isHostedBy` |
| `aangifte` | `riepr:aangifte` |

Klasse-aliassen die in de IMJV-data voorkomen maar op schema-klassen worden gemapped:

| Data-klasse | Schema-klasse |
|------------|--------------|
| `sosa:Observation` | `riepr:Observatie` |
| `sosa:Execution` | `riepr:Observatie` |
| `qudt:QuantityValue` | `riepr:HoeveelheidWaarde` |
| `ssn:Deployment` | `riepr:Exploitatie` |
| `sosa:Platform` | `riepr:Exploitatielocatie` |

## Volledig herstel van nul

```bash
PGDATA=/home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/postgress
REPO=/home/gehau/git/RIE-IEPR

# 1. Cluster initialiseren (eenmalig)
/usr/lib/postgresql/16/bin/initdb -D "$PGDATA" -E UTF8 --locale=C.UTF-8
echo "port = 5433" >> "$PGDATA/postgresql.conf"
echo "unix_socket_directories = '$PGDATA/run'" >> "$PGDATA/postgresql.conf"
mkdir -p "$PGDATA/run"

# 2. Server starten
/usr/lib/postgresql/16/bin/pg_ctl -D "$PGDATA" -l "$PGDATA/postgresql.log" start

# 3. Gebruiker en database
psql -h "$PGDATA/run" -p 5433 -U gehau postgres -c "ALTER USER gehau WITH PASSWORD '1234';"
# TCP-authenticatie met wachtwoord inschakelen:
sed -i 's|^host\s\+all\s\+all\s\+127.0.0.1/32\s\+trust|host all all 127.0.0.1/32 md5|' "$PGDATA/pg_hba.conf"
/usr/lib/postgresql/16/bin/pg_ctl -D "$PGDATA" reload
/usr/lib/postgresql/16/bin/createdb -h "$PGDATA/run" -p 5433 -U gehau riepr

# 4. Schema laden
psql -h "$PGDATA/run" -p 5433 -U gehau riepr \
  -f "$REPO/documentatie/datamodel/generated/sql/schema.sql"

# 5. TTL → SQL genereren
cd "$REPO/src/main/input/imjv-transformed/code"
python3 ttl_to_sql.py

# 6. INSERT-bestand laden
psql -h "$PGDATA/run" -p 5433 -U gehau riepr \
  -v ON_ERROR_STOP=off \
  -c "SET session_replication_role = replica;" \
  -c "\i $REPO/src/main/input/imjv-transformed/dump/sql/insert.sql" \
  -c "SET session_replication_role = DEFAULT;"

# 7. Codelijsten → property-tabel laden
cd "$REPO/src/main/input/imjv-transformed/code"
python3 codelijsten_to_sql.py
psql -h "$PGDATA/run" -p 5433 -U gehau riepr \
  -f "$REPO/src/main/input/imjv-transformed/dump/sql/property.sql"
```

## ETL: van TTL naar JSON-LD (alternatief pad)

Dit pad gebruikt `frame.json` als contextuele mapping en bedt geometrie volledig in als genest JSON-object. Elke JSON-sleutel wordt een aparte kolom; enkel geneste objecten krijgen het type `jsonb`.

### Conversiescript

```
src/main/input/imjv-transformed/code/ttl_to_jsonld.py
```

```bash
cd /home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/code
python3 ttl_to_jsonld.py
# Output: ../dump/jsonld/*.json + ../dump/jsonld/load.sql
```

Optioneel met expliciete paden:

```bash
python3 ttl_to_jsonld.py \
  ../dump/all.ttl \
  ../../../../../documentatie/datamodel/generated/dataframe/frame.json \
  ../dump/jsonld/
```

### Gegenereerde bestanden

```
src/main/input/imjv-transformed/dump/jsonld/
  {klasse}.json     — JSON-array per entiteitsklasse (leesbaar, voor inspectie)
  load.sql          — DROP/CREATE TABLE + INSERT per klasse
```

### JSON-LD tabellen laden

```bash
PGDATA=/home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/postgress

psql -h "$PGDATA/run" -p 5433 -U gehau riepr \
  -v ON_ERROR_STOP=off \
  -f /home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/dump/jsonld/load.sql
```

### Tabelstructuur

Tabellen krijgen de prefix `jsonld_`. Kolommen worden automatisch afgeleid uit de data:

| Waardetype in JSON | PostgreSQL-type |
|--------------------|----------------|
| Scalaire string of URI | `TEXT` |
| Getal | `NUMERIC` / `BIGINT` |
| Genest object (bv. geometrie) | `JSONB` |
| Array of gemengd (scalar + lijst) | `JSONB` |

`@id` → kolom `id TEXT PRIMARY KEY`  
`@type` → kolom `types JSONB`

### Rijenaantallen (na laden)

> **Let op:** de JSON-LD tabellen zijn niet automatisch geladen bij het laden van `insert.sql`.
> Laad ze apart met `dump/jsonld/load.sql` (zie commando hieronder).

| Tabel | Rijen |
|-------|------:|
| `jsonld_hoeveelheid_waarde` | 18.510 |
| `jsonld_observatie` | 18.510 |
| `jsonld_proces` | 10.267 |
| `jsonld_emissiepunt` | 7.708 |
| `jsonld_meetpunt` | 4.164 |
| `jsonld_installatie` | 3.983 |
| `jsonld_proces_variabele` | 3.446 |
| `jsonld_filter` | 1.299 |
| `jsonld_zuiverings_apparaat` | 1.075 |
| `jsonld_identifier` | 1.014 |
| `jsonld_onttrekkingspunt` | 969 |
| `jsonld_exploitatielocatie` | 564 |
| `jsonld_address` | 557 |
| `jsonld_exploitatie` | 538 |
| `jsonld_exploitant` | 476 |
| `jsonld_emissie` | 374 |
| `jsonld_status` | 1 |

### Geometrie opvragen

```sql
-- WKT-coördinaat direct als tekst
SELECT id, label, "hasGeometry"->>'asWKT' AS wkt
FROM jsonld_exploitatielocatie
WHERE "hasGeometry" IS NOT NULL
LIMIT 5;

-- Volledig ingebed geometrie-object
SELECT id, "hasGeometry"
FROM jsonld_emissiepunt
WHERE "hasGeometry" IS NOT NULL
LIMIT 3;
```

### Mapping: RDF → JSON-LD termnamen

De termnamen komen uit de `@context` van `documentatie/datamodel/generated/dataframe/frame.json`:

| Termnaam | RDF predicaat |
|----------|--------------|
| `label` | `rdfs:label` |
| `issued` | `dct:issued` |
| `created` | `dct:created` |
| `modified` | `dct:modified` |
| `valid` | `dct:valid` |
| `status` | `adms:status` |
| `identifier` | `adms:identifier` |
| `hasGeometry` | `geo:hasGeometry` *(ingebed)* |
| `isHostedBy` | `sosa:isHostedBy` |
| `hasDeployment` | `ssn:hasDeployment` |
| `deployedOnPlatform` | `ssn:deployedOnPlatform` |
| `wasAttributedTo` | `prov:wasAttributedTo` |
| `hasProperty` | `ssn:hasProperty` |
| `hasInputVar` | `pplan:hasInputVar` |
| `numericValue` | `qudt:numericValue` |
| `hasUnit` | `qudt:hasUnit` |

Dezelfde klasse-aliassen als bij het SQL-pad worden toegepast (bv. `sosa:Observation` → `riepr:Observatie`).

## Codelijsten: property-tabel

De `property`-tabel is een opzoektabel die de `observed_property`-URI's uit `emissie_observatie` koppelt aan leesbare Nederlandse stofnamen, CAS-nummers en eenheidscodes. Ze wordt niet uit `all.ttl` gegenereerd maar apart aangemaakt vanuit drie SKOS-codelijst-CSV's.

### Bronbestanden

```
src/main/input/imjv-transformed/codelijsten/
  chemische_stof.csv               → 5.689 rijen  (InChIKey-URI's)
  fysico-chemische-eigenschap.csv  →   321 rijen  (numerieke codes, zero-padded)
  sommatie_stoffen.csv             → 2.273 rijen  (tekstcodes: n_t, zs, aox, …)
```

Enkel rijen waarvan het `id` begint met `https://data.omgeving.vlaanderen.be/id/concept/` worden opgenomen — dat zijn exact de URI's die in `emissie_observatie.observed_property` voorkomen.

**Let op:** de `fysico-chemische-eigenschap`-codelijst gebruikt `/39`, `/40`, … als URI-suffix, maar de data bevat `/0039`, `/0040`, … (4-cijferig, zero-padded). Het script normaliseert dit automatisch.

### Conversiescript

```
src/main/input/imjv-transformed/code/codelijsten_to_sql.py
```

```bash
cd /home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/code
python3 codelijsten_to_sql.py
# Output: ../dump/sql/property.sql
```

Optioneel met expliciete paden:

```bash
python3 codelijsten_to_sql.py \
  ../codelijsten/ \
  ../dump/sql/property.sql
```

### Gegenereerd SQL-bestand

```
src/main/input/imjv-transformed/dump/sql/property.sql
```

Bevat `DROP TABLE IF EXISTS`, `CREATE TABLE` en 8.283 INSERTs met `ON CONFLICT DO NOTHING`.

### property-tabel laden

```bash
PGDATA=/home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/postgress

psql -h "$PGDATA/run" -p 5433 -U gehau riepr \
  -f /home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/dump/sql/property.sql
```

### Tabelstructuur

| Kolom | Type | Inhoud |
|-------|------|--------|
| `uri` | TEXT PK | volledige `observed_property`-URI |
| `type` | TEXT | `chemische_stof` \| `fysico_chemisch` \| `sommatie_stoffen` |
| `naam` | TEXT | Nederlandse voorkeursnaam (`prefLabel`) |
| `naam_en` | TEXT | Engelse naam of alternatief label |
| `iupac` | TEXT | IUPAC-naam (alleen chemische stoffen) |
| `notation` | TEXT | korte code (`Cl`, `BZV5`, `N t`, …) |
| `cas_nummer` | TEXT | CAS-registratienummer |
| `ec_nummer` | TEXT | EC-nummer |

### Rijenaantallen

| type | Rijen |
|------|------:|
| `chemische_stof` | 5.689 |
| `fysico_chemisch` | 321 |
| `sommatie_stoffen` | 2.273 |
| **Totaal** | **8.283** |

### Join-patroon

```sql
-- Namen ophalen (LEFT JOIN: observaties zonder match krijgen NULL)
LEFT JOIN property p ON p.uri = eo.observed_property

-- Zoeken op naam in plaats van InChIKey
JOIN property p ON p.uri = eo.observed_property
WHERE p.naam ILIKE '%stikstof%'

-- Fallback als naam ontbreekt (procesgrootheden als debiet)
COALESCE(p.naam, regexp_replace(eo.observed_property, '.*/([^/]+)$', '\1'))
```

## Bekende beperkingen

- **FK-schendingen in schema.sql**: `ALTER TABLE ... REFERENCES aangifte(uuid)` faalt omdat `aangifte` `vlaanderen_id` als PK heeft. Dit is een bug in het gegenereerde schema; de tabellen worden correct aangemaakt.
- **Geometrie (SQL-pad)**: de kolom `geometrie` bevat de URI van een geometrie-node, niet de WKT-string zelf. Gebruik het JSON-LD-pad (`jsonld_`-tabellen) om geometrie als ingebed object met `asWKT` te bevragen. De JSON-LD tabellen moeten apart geladen worden via `dump/jsonld/load.sql`.
- **Multi-waarden**: kolommen die in RDF meerdere waarden kunnen hebben (bv. `ssn:hasSubSystem`, `ssn:deployedSystem`) bevatten enkel de eerste waarde. De overige waarden zijn zichtbaar in de brondata.
- **Lege tabellen**: `aangifte`, `contactpersoon`, `transactie`, `onttrekking_observatie` en aanverwante JOIN-tabellen bevatten geen data omdat deze entiteiten niet aanwezig zijn in de IMJV-dump.
- **Emissie → exploitatielocatie**: er is geen directe FK tussen `emissie` en `exploitatielocatie`. De koppeling loopt via het KBO-nummer ingebed in de URI (`split_part(emissie.uuid, '/', 6)`). Zie de voorbeeldqueries.
- **Emissiepunt locatie**: alleen emissiepunten met `/jaar/` in de URI hebben de kolom `locatie` ingevuld. De URI-variant zonder jaar (permanente identiteit) heeft geen locatiekoppeling.
