# IMJV PostgreSQL databank

Lokale PostgreSQL 16-instantie voor de RIE-PR IMJV-data, gegenereerd vanuit `all.ttl`.

Er zijn twee ETL-paden beschikbaar:

| Pad | Script | Tabellen | Geometrie |
|-----|--------|----------|-----------|
| **SQL** | `ttl_to_sql.py` | 55 tabellen conform `schema.sql` | URI-referentie |
| **JSON-LD** | `ttl_to_jsonld.py` | 17 `jsonld_`-tabellen met `jsonb`-kolommen | Ingebed als `{"@id":…,"asWKT":"POINT(…)"}` |

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

| Tabel | Rijen |
|-------|------:|
| `hoeveelheid_waarde` | 18.510 |
| `observatie` | 18.510 |
| `resultaat` | 18.510 |
| `systeem` | 15.155 |
| `proces_identity` | 10.267 |
| `proces` | 10.266 |
| `emissiepunt_identity` | 7.708 |
| `emissiepunt` | 7.708 |
| `proces_variabele_proces` | 7.038 |
| `meetpunt_identity` | 4.164 |
| `meetpunt` | 4.164 |
| `meetpunt_exploitatie` | 4.164 |
| `installatie_exploitatie` | 4.023 |
| `installatie_identity` | 3.983 |
| `installatie` | 3.983 |
| `emissiepunt_exploitatie` | 3.854 |
| `proces_variabele` | 3.446 |
| `filter_identity` | 1.299 |
| `filter` | 1.299 |
| `filter_exploitatie` | 1.299 |
| `zuiverings_apparaat` | 1.075 |
| `externe_identificator` | 1.014 |
| `onttrekkingspunt_identity` | 969 |
| `onttrekkingspunt` | 969 |
| `onttrekkingspunt_exploitatie` | 932 |
| `exploitatielocatie_identity` | 564 |
| `adres` | 557 |
| `exploitatie_identity` | 538 |
| `exploitatie` | 538 |
| `exploitatielocatie` | 538 |
| `exploitatielocatie_exploitatie` | 538 |
| `exploitant_identity` | 476 |
| `exploitant` | 476 |
| `emissie` | 374 |
| `onttrekkingspunt_filter` | 37 |
| Overige tabellen | 0 |

Tabellen met 0 rijen (`aangifte`, `contactpersoon`, `transactie`, …) bevatten entiteiten die niet aanwezig zijn in de IMJV-brondata.

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

## Bekende beperkingen

- **FK-schendingen in schema.sql**: `ALTER TABLE ... REFERENCES aangifte(uuid)` faalt omdat `aangifte` `vlaanderen_id` als PK heeft. Dit is een bug in het gegenereerde schema; de tabellen worden correct aangemaakt.
- **Geometrie (SQL-pad)**: de kolom `geometrie` bevat de URI van een geometrie-node, niet de WKT-string zelf. Gebruik het JSON-LD-pad (`jsonld_`-tabellen) om geometrie als ingebed object met `asWKT` te bevragen.
- **Multi-waarden**: kolommen die in RDF meerdere waarden kunnen hebben (bv. `ssn:hasSubSystem`, `ssn:deployedSystem`) bevatten enkel de eerste waarde. De overige waarden zijn zichtbaar in de brondata.
- **Lege tabellen**: `aangifte`, `contactpersoon`, `transactie` en aanverwante JOIN-tabellen bevatten geen data omdat deze entiteiten niet aanwezig zijn in de IMJV-dump.
