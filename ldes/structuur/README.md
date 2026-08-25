# Structuur: mjv-database -> LDES

De structuurgegevens uit de mjv-database (Exploitant, Exploitatielocatie, Exploitatie,
Installatie, Emissiepunt, Meetpunt, Proces, Rubriek, Systeemeigenschap) worden als één
LDES gepubliceerd: de **exploitatie**-stream. Na lid-expansie bevat het exploitatie-document
alle onderdelen (installaties, emissie/meet/onttrekkingspunten, processen,
systeemeigenschappen, locatie, rubrieken, exploitant). De turtle wordt niet statisch
meegeleverd, maar per pipeline-run gegenereerd uit de databasetabellen: kolomcomments in
`db/` definiëren de RDF-properties, waardoor schema en turtle automatisch in sync blijven.

## Bouw

```
postgres-mjv (postgis, schema + testdata uit db/)
   │  pg_catalog (column comments, tab comments, FK's, constraint comments)
   ▼
LDIO (1 pipeline)
   │  Ldio:RdbmsInput        — leest de DB, comment-driven SQL -> RDF (ldio-rdbms-input)
   │                          + schrijft de ruwe turtle naar ./out/doc_exploitatie.ttl
   │  Ldio:SparqlConstructTransformer — datamodeltransformaties uit DATAPLATFORM.md
   │                          (sosa:isHostedBy N3-regel; queries in ldio/queries/)
   │  Ldio:HttpOut           — POST /exploitatie
   ▼
ldes-server      (1 eventstream: exploitatie; by-page + by-time views)
```

De PostgreSQL→RDF-stap zit volledig in de pipeline: het LDIO-inputcomponent
`Ldio:RdbmsInput` (broncode in `ldio-rdbms-input/`) leest de mjv-database en genereert de
turtle. Het is volledig generiek: de component bevat geen hardcoded domeinkennis of defaults.
De streams (`member-tables`), de lid-expansie (`expansion.*.subtables`: subtable + scope-SQL
met `{schema}`/`{uri}`-placeholders) en de extra relaties (`expansion.*.relations`) worden
allemaal in de pipeline-YAML gedeclareerd.

De datamodeltransformaties uit `DATAPLATFORM.md` worden als SPARQL CONSTRUCT-queries in
`ldio/queries/` bewaard en in de LDIO-pipeline uitgevoerd (`SparqlConstructTransformer`,
`infer: true` behoudt de originele triples). Momenteel: de `sosa:isHostedBy`-regel voor
exploitaties (`isHostedBy.rq`). De `dct:isVersionOf`-relatie wordt door de LDES-server zelf
gestempeld (`ldes:createVersions true`); Emissie/Onttrekking/Uitwisseling als
`sosa:FeatureOfInterest` zijn in DATAPLATFORM.md nog TODO.

## Componenten

| Map                 | Inhoud                                                          |
| ------------------- | --------------------------------------------------------------- |
| `db/`               | MJV-schema + kolomcomments (de mappingbron) en testdata         |
| `ldio/`             | `application.yml`, de pipeline in `pipelines/` en de datamodeltransformaties in `queries/` |
| `ldio-rdbms-input/` | Maven-project voor `Ldio:RdbmsInput` (DB -> RDF als LDIO-input) |
| `server/`           | LDES-config, `exploitatie-stream.ttl` (met views)               |
| `out/`              | opgeslagen ruwe turtle (`doc_exploitatie.ttl`, door RdbmsInput) |

De stream-definitie (`*-stream.ttl`) gebruikt `ldes:createVersions true`: de LDES-server
stempelt zelf `dcterms:created`/`dcterms:isVersionOf` per lid, dus die mogen niet in de
ingest-turtle voorkomen. `Ldio:RdbmsInput` slaat daarom de kolommen `aangemaakt_op` en
`gewijzigd_op` over.

## Ports

| Poort | Dienst                       |
| ----- | ---------------------------- |
| 8081  | LDES-server (data + API)     |
| 8091  | LDIO (admin API)             |
| 5434  | LDES-postgres                |
| 5438  | postgis (mjv-structuurdb)    |
| 5439  | LDIO-datasource              |

## Opstarten

```bash
docker compose up -d
```

Volgorde (via depends_on): ldes-server healthy -> 60s -> eventstream + views aanmaken
-> 120s -> LDIO (laadt de pipeline; `Ldio:RdbmsInput` genereert dan uit de DB) ->
eventstream gevuld.

Herstart na wijzigingen aan `ldio-rdbms-input`:

```bash
cd ldio-rdbms-input && mvn -q clean package
cd .. && docker compose up -d --force-recreate --no-deps ldio
```

Opmerking: bij `ldes:createVersions true` creëert elke heringest een nieuwe versie van
elk lid.

## Opvragen

Leden (by-page, paginanummer vanaf 1):

```
GET http://localhost:8081/exploitatie/by-page?pageNumber=1
```

Tijdbomen (year/month/day/hour, maand en dag opgevuld: `month=08`):

```
GET http://localhost:8081/exploitatie/by-time?year=2026
GET http://localhost:8081/exploitatie/by-time?year=2026&month=08&day=19&hour=09&pageNumber=1
```

Streambeschrijving: `GET http://localhost:8081/exploitatie` (lijst prefix + `ldes:EventStream`).

LDIO-pipelines oplijsten: `source functions.sh && get_ldio_pipeline_information`.

## Testen

De testdata in `db/testStructuur.sql` levert 1 exploitatie + alle onderdelen (2
installaties, 1 emissiepunt, 1 meetpunt, 7 processen, 2 rubrieken, 3 systeemeigenschappen,
1 locatie, 1 exploitant), die door de lid-expansie allemaal als lid van de exploitatie-stream
terechtkomen. Verwachting:

```bash
docker exec ldes-postgres psql -U admin -d ldesserver -tAc "SELECT count(*) FROM members;"
```
