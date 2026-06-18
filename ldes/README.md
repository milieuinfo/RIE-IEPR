This project contains a small POC with these components:

* `ldes-server`: An LDES server, that is initialized with different LDES streams:
    * resultaat
    * observatie
    * emissieobservatie
    * filters
* `postgres`: The Postgres database for this LDES server
* `create-eventstreams`: A container that creates the event streams. You can find the configuration
  of the event streams in
  the server directory. Every event stream consists of 3 files:
    * an `<event-stream-name>-stream.ttl` file, to create the event stream
    * an `<event-stream-name>-by-page.ttl` file, to create the by-page fragmented view
    * an `<event-stream-name>-by-time.ttl` file, to create the by-time fragmented view
* `ingest-data`: A container that ingests the data in the LDES server. The data can be found in the
  `<event-stream-name>-data.ttl` files, which you can find in the server directory.
* `postgres-ldio-rdb-out`: the Postgres database where the members of the stream will be stored
* `ldio`: the LDIO that will run the pipelines, defined in the config files that you can find under
  the `ldio/pipelines` directory.

|                       | port |
|-----------------------|------|
| ldes-server           | 8080 |
| postgres              | 5434 |
| create-eventstreams   | (x)  |
| ingest-data           | (x)  |
| postgres-ldio-rdb-out | 5432 |
| ldio                  | 8090 |

Start the containers:

```bash
cd ldes
docker compose up
```

> [!WARNING] Because Docker networking works by referencing other containers by its container name,
> we cannot use http://localhost:8080 as the hostname of the LDES server. Therefore, we need to
> specify `http://ldes-server:8080` as the host name (in `server/application.yaml`).
> For practical reasons (when you want to traverse the links of the LDES streams yourself), it's
> best to add this line to your hosts file:
> `127.0.0.1    ldes-server`

Wait some moments (at least 2 minutes, or more), and then you can use these url's to see the
contents of the LDES server:

| URL                                                                                      | description                                                                                                      |
|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| http://localhost:8080/admin/api/v1/eventstreams                                          | Get all the event streams, views, and their configuration                                                        |
| http://localhost:8080/resultaat                                                          | The root of the resultaat event stream                                                                           |
| http://ldes-server:8080/resultaat/by-page                                                | The root of the by-page view on the resultaat event stream                                                       |
| http://ldes-server:8080/resultaat/by-page?pageNumber=1                                   | The first page of the by-page view on the resultaat event stream. This page contains 50 members                  |
| http://ldes-server:8080/resultaat/by-page?pageNumber=2                                   | The second page of the by-page view on the resultaat event stream. This page contains 50 members                 |
| http://ldes-server:8080/resultaat/by-page?pageNumber=3                                   | The third page of the by-page view on the resultaat event stream. Remark: this page contains only 18 members!    |
| http://ldes-server:8080/resultaat/by-time                                                | The root of the by-time view on the resultaat event stream                                                       |
| http://ldes-server:8080/resultaat/by-time?year=2026                                      | The root of the by-time view on the resultaat event stream                                                       |
| http://ldes-server:8080/resultaat/by-time?year=2026&month=05&day=18&hour=17&pageNumber=1 | The first page of the selected fragment. (!) change the year, month, day and hour request parameters accordingly |

You'll have 3 pages with members. The first and second page contain 50 members, the third (and last)
page contains only 18 members. So, we have `118` members in total.

The members in these event streams will be synchronised to the postgres database.

You can connect to this database: `jdbc:postgresql://localhost:5432/ldio-rdb-out`, user=`admin`,
password=`admin`.

```bash
docker exec postgres-ldio-rdb-out psql --username=admin ldio-rdb-out -c "SELECT * FROM RESULTAAT;"
```

You'll see the members of the resultaat LDES stream. At the end, you'll see

```
(118 rows)
```

> [!WARNING] You'll see that the `uuid` column contains the URI of the subject of the member (and
> contains the same as the `url` column). This will be changed in a later phase, to contain a real
> uuid

You can do the same test for the `observation` stream. This stream (and database table `observatie`)
should contain 38 members (/rows)

## Creatie van tussentabellen

Er is een voorbeeld uitgewerkt waarbij iets complexere members worden ingelezen, en waarbij naar 2
verschillende tabellen geschreven wordt:

* filter
* filter_is_feature_of_interest_of

Een volgende member:

```turtle

<https://data.imjv.omgeving.vlaanderen.be/id/peilfilter/2019-099955/jaar/2021>
    rdf:type         sosa:FeatureOfInterest, riepr:Filter, ssn:System ;
    rdfs:label       "PEILFILTER : AGC GLASS EUROPE VESTIGING MOL - 2 (2021)" ;
    dcterms:issued   "2010-01-01T00:00:00Z"^^xsd:dateTime ;
    dcterms:valid    "2030-01-01T00:00:00Z"^^xsd:dateTime ;
    dcterms:modified "2010-01-01T00:00:00Z"^^xsd:dateTime ;
    adms:status      st:in_gebruik ;
    sosa:isFeatureOfInterestOf
                     <https://data.imjv.omgeving.vlaanderen.be/id/peilfilter/2019-099955/jaar/2021/imjv#diepteOnderkant>,
                     <https://data.imjv.omgeving.vlaanderen.be/id/peilfilter/2019-099955/jaar/2021/imjv#lengte> ;
    sosa:isHostedBy  <https://data.imjv.omgeving.vlaanderen.be/id/exploitatie/01787986000160> ;
    ssn:hasDeployment
                     <https://data.imjv.omgeving.vlaanderen.be/id/exploitatie/01787986000160/jaar/2021> ;
    ssn:hasProperty  imjv:diepteOnderkant, imjv:lengte .
```

Heeft een one-to-many relatie naar isFeatureOfInterestOf. De uri's van deze isFeatureOfInterestOf
worden in de `filter_is_feature_of_interest_of`, samen met de uri van de parent member.
Op deze manier is het mogelijk om "koppeltabellen" op te vullen.

Zie `ldes/ldio/pipelines/filter-pipeline.yaml` voor de pipeline die dit verwezenlijkt: hierbij zijn
meerdere `Ldio:LdioRdbOut` outputs gedefinieerd, elk met hun eigen tabelnaam en SPARQL SELECT query.

Je kan dit voorbeeld ook uitvoeren op een grotere dataset, door `ldes/server/filter-data.tar.gz` uit
te pakken en `ldes/server/filter-data.ttl` te overschrijven.
Verwijder alle Docker compose services, verwijder alle volumes, en start docker compose opnieuw.
