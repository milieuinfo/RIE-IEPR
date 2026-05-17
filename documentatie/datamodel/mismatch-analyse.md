# Mismatch-analyse: turtle-voorbeeldbestanden → PostgreSQL (schema.sql)

## Generatie-pipeline

```
riepr.ttl  ──► ODDToolkit ──► schema.sql   ← nooit handmatig bewerken
                           └► frame.json
                           └► Java / TypeScript / diagrammen
```

`schema.sql` is een gegenereerd artefact van **ODDToolkit** op basis van de ontologie `riepr.ttl`. Alle SQL-aanpassingen verlopen via `riepr.ttl` waarna ODDToolkit opnieuw gedraaid wordt. Alleen mismatches in construct-queries worden buiten de ontologie opgelost.

### Betrokken bestanden

| Rol | Bestand |
|---|---|
| Bron-ontologie | `src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl` |
| Gegenereerd SQL-schema | `documentatie/datamodel/generated/sql/schema.sql` |
| Gegenereerd JSON-LD frame | `documentatie/datamodel/generated/dataframe/frame.json` |
| Turtle-voorbeeldbestand (deployment) | `src/main/output/turtle/imjv-transformed/mjv_deployment.ttl` |
| Turtle-voorbeeldbestand (execution) | `src/main/output/turtle/imjv-transformed/mjv_execution.ttl` |
| Turtle-voorbeeldbestand (plan) | `src/main/output/turtle/imjv-transformed/mjv_plan.ttl` |
| Construct-query deployment | `src/main/input/imjv-transformed/code/construct_deployment.rq` |
| Construct-query execution | `src/main/input/imjv-transformed/code/construct_execution.rq` |
| Construct-query properties | `src/main/input/imjv-transformed/code/construct_properties.rq` |

---

## Mismatches

### M1 — Ontbrekende tabellen voor execution-data

**Prioriteit:** KRITIEK

**Probleem:**  
`mjv_execution.ttl` (3816 regels) bevat observaties, resultaten en hoeveelheidswaarden die geen corresponderende SQL-tabellen hebben. De klassen `riepr:Observatie`, `riepr:Emissie`, `riepr:Onttrekking` en `riepr:Productievolume` bestaan al in de ontologie maar hebben te weinig property-restricties — ODDToolkit genereerde daarvoor geen kolommen. Er bestaat geen riepr-klasse voor `qudt:QuantityValue`.

Concrete lacunes:
- `riepr:Observatie` heeft slechts twee restricties (`sosa:hasFeatureOfInterest`, `sosa:hasResult`). Geen kolommen voor `sosa:resultTime`, `sosa:phenomenonTime`, `sosa:observedProperty`, `sosa:usedProcedure`, `sosa:madeBySensor`, labels en tijdstempels.
- `riepr:Emissie`, `riepr:Onttrekking`, `riepr:Productievolume` missen `qudt:quantityValue`-restrictie.
- Geen `riepr:HoeveelheidWaarde`-klasse voor de numerieke waarde + eenheid (`qudt:QuantityValue`).

**Waar aan te passen:** `riepr.ttl`

---

### M2 — Geometry: Virtuoso-specifiek datatype en indirectie

**Prioriteit:** GROOT

**Probleem:**  
De SQL-kolom `geometrie` verwacht een WKT-string. De turtle-data heeft echter een aparte geometry-node via `geo:hasGeometry` → `geo:asWKT`. Bovendien gebruikt de construct-query het Virtuoso-specifieke datatype `<http://www.openlinksw.com/schemas/virtrdf#Geometry>` in plaats van het standaard `geo:wktLiteral`.

Voorbeeld uit `mjv_deployment.ttl`:
```turtle
<emissiepunt/.../jaar/2021>  geo:hasGeometry  <geometry/emissiepunt/.../jaar/2021> .
<geometry/.../jaar/2021>     geo:asWKT  "POINT(5.15 51.18)"^^<virtrdf:Geometry> .
```

Bij ETL-laden naar PostGIS moet de indirectie gevolgd worden en het datatype genormaliseerd.

**Waar aan te passen:** `construct_deployment.rq` — WKT-waarden hertypen naar `geo:wktLiteral` via `STRDT(STR(?wkt), geo:wktLiteral)`.

---

### M3 — Status: foutieve range-declaratie in ontologie

**Prioriteit:** GROOT

**Probleem:**  
De ontologie gebruikt `adms:Status` als range voor `adms:status`-restricties. In de ADMS-specificatie is een status echter een `skos:Concept`, niet een instantie van `adms:Status`. ODDToolkit genereerde daarom een SQL `ENUM`-type (`status`) dat echter nergens als kolomtype wordt toegepast — alle kolommen zijn `VARCHAR`. De turtle-data gebruikt concept-IRIs (bijv. `https://data.imjv.omgeving.vlaanderen.be/id/concept/status/in_gebruik`).

*Git-opmerking: "Je gebruikt adms:Status als range, maar het is skos:Concept"*

**Waar aan te passen:** `riepr.ttl` — range corrigeren van `adms:Status` naar `skos:Concept` in alle `adms:status`-restricties.

---

### M4 — Procedure ENUM stemt niet overeen met data

**Prioriteit:** MIDDEL

**Probleem:**  
ODDToolkit genereerde een SQL `ENUM` `procedure` (`EMISSIE`, `MEET`, `ONTTREKKING`, `TRANSPORT`, `VERWERKING`) vanuit de procedure-subklassen in de ontologie. Maar:
1. Het ENUM-type wordt nergens als kolomtype gebruikt — `proces.type` is `VARCHAR`.
2. De turtle-data gebruikt named IRIs als `dct:type` op processen (`riepr:uitstootProces`, `riepr:zuiveringsProces`, etc.), geen instanties van de procedure-subklassen.
3. De ontologie-voorbeelden gebruiken blank-node instances (`dct:type [ a :VerwerkingProcedure ]`), niet named concepts.

**Waar aan te passen:** `riepr.ttl` — voorbeeld-annotaties vervangen door named concept-IRIs zodat ODDToolkit het ENUM-patroon niet meer genereert.

---

### M5 — `externe_identificator`: dubbele COMMENT op datatype en notatie

**Prioriteit:** MIDDEL

**Probleem:**  
`skos:notation` is in RDF een typed literal: zowel de string-waarde als het datatype-IRI zijn relevant. ODDToolkit genereerde twee kolommen (`datatype` en `notatie`) maar gaf ze identieke SQL COMMENTs (`skos:notation`):

```sql
COMMENT ON COLUMN externe_identificator.datatype IS 'http://www.w3.org/2004/02/skos/core#notation';
COMMENT ON COLUMN externe_identificator.notatie   IS 'http://www.w3.org/2004/02/skos/core#notation';
```

Correct onderscheid: `notatie` = de string-waarde, `datatype` = de datatype-IRI (bijv. `riepr:KboVestigingsnummer`).

Voorbeeld uit `mjv_deployment.ttl`:
```turtle
<identifier/2142813934>  skos:notation  "2142813934"^^riepr:KboVestigingsnummer .
```

**Waar aan te passen:** `riepr.ttl` — het onderscheid tussen notatie-waarde en datatype-IRI expliciet modelleren (bijv. via een custom property `riepr:notatietype`).

---

### M6 — `adres`-tabel mist velden

**Prioriteit:** MIDDEL

**Probleem:**  
SQL `adres` heeft: `postcode`, `stad`, `straat`. De turtle-data gebruikt ook `locn:fullAddress` (volledig adresstring) en `locn:locatorDesignator` (huisnummer), die niet in de ontologie gemodelleerd zijn.

**Waar aan te passen:** `riepr.ttl` — `locn:fullAddress` en `locn:locatorDesignator` als property-restricties toevoegen aan de adres-gerelateerde klassen.

---

### M7 — `filter` en `meet_instrument`: ontbrekende temporele versioning

**Prioriteit:** MIDDEL

**Probleem:**  
Alle hoofdklassen met temporele versioning (`Emissiepunt`, `Installatie`, `Meetpunt`, `Onttrekkingspunt`) hebben:
- een `_identity`-tabel
- een samengestelde PK met `aangemaakt_op` en `geldig_van`
- temporele restricties (`dct:issued`, `dct:valid`, `dct:created`, `dct:modified`)

`riepr:Filter` en `riepr:MeetInstrument` missen deze restricties in de ontologie. ODDToolkit genereerde daarom geen `_identity`-tabel en een enkelvoudige PK. De turtle-data heeft filters wél versioned (`/jaar/2021`).

**Waar aan te passen:** `riepr.ttl` — dezelfde temporele restricties toevoegen als bij `riepr:Emissiepunt`.

---

### M8 — `sosa:isHostedBy` ontbreekt in ontologie

**Prioriteit:** MIDDEL

**Probleem:**  
In de turtle-data hebben alle systemen (Emissiepunt, Installatie, etc.) een `sosa:isHostedBy`-triple die verwijst naar de basis-Exploitatielocatie (de permanente locatie-link, zonder jaarsuffix). Deze relatie is niet als property-restrictie gemodelleerd in de ontologie. ODDToolkit genereerde er dus geen SQL-kolom voor.

**Waar aan te passen:** `riepr.ttl` — `sosa:isHostedBy` toevoegen als property-restrictie op de systeem-subklassen met range `:Exploitatielocatie`.

---

### M9 — `prov:wasDerivedFrom` en `prov:wasInfluencedBy`: geen actie nodig

**Prioriteit:** geen

**Bevinding:**  
Deze triples staan in `mjv_deployment.ttl` maar zijn **niet** geconstrueerd door `construct_deployment.rq` (die genereert alleen `prov:wasRevisionOf`). Ze zijn **Virtuoso-inferentie-artefacten**: in PROV-O is `prov:wasRevisionOf` een subproperty van `prov:wasDerivedFrom`, dat zelf subproperty is van `prov:wasInfluencedBy`. De Virtuoso SPARQL-endpoint materialiseert deze afgeleide triples automatisch in de CONSTRUCT-output. Ze bevatten geen extra informatie.

Ook de extra `rdf:type`-waarden (`geo:SpatialObject`, `prov:Entity`, `geo:Feature`) op systemen hebben dezelfde oorzaak: SSN- en PROV-subclass-inferentie in Virtuoso.

**Actie:** bij ETL-laden negeren.

---

### M10 — `zuiveringsapparaat` zonder riepr-type

**Prioriteit:** KLEIN

**Probleem:**  
`construct_deployment.rq` (regel 80) kent alleen `ssn:System` toe aan zuiveringsapparaten, geen riepr-klasse. Er bestaat geen `riepr:ZuiveringsApparaat`-klasse in de ontologie. Zuiveringsapparaten worden daardoor alleen opgeslagen in de generieke `systeem`-tabel (uuid/uri/ingediend), zonder benaming, status of tijdstempels.

**Waar aan te passen:**
1. `riepr.ttl` — klasse `riepr:ZuiveringsApparaat` toevoegen
2. `construct_deployment.rq` regel 80 — type toevoegen: `a ssn:System , riepr:ZuiveringsApparaat`

---

### M11 — `.well-known/genid/`-IRIs als subjecten

**Prioriteit:** KLEIN

**Oorzaak:**  
Blank nodes in de IMJV-brondata (Virtuoso) worden geserialiseerd als `.well-known/genid/`-IRIs. Wanneer de construct-query die blank-node-IRI direct als subject gebruikt, belandt de `genid`-IRI in de output-TTL. Dit maakt consistente `uuid`-extractie onmogelijk.

**Getroffen queries:**

1. **`construct_execution.rq`** — `?concentratie` is gebonden via `?obs imjv:concentratie ?concentratie`. Als `?concentratie` een blank node is, krijgt de concentratie-observatie een `genid`-IRI als subject.

2. **`construct_properties.rq`** — `?waarde` is gebonden via `?parent imjv:hoogte ?waarde` (en diameter/diepte/lengte/diepteOnderkant). Als `?waarde` een blank node is in Virtuoso, krijgt de gegenereerde observatie een `genid`-IRI.

**Waar aan te passen:**

`construct_execution.rq` — stabiele IRI voor concentratie-observatie genereren op basis van `?obs`:
```sparql
BIND(IRI(CONCAT(STR(?obs), "/concentratie")) AS ?concentratie_iri)
```

`construct_properties.rq` — stabiele IRI voor waarde-observatie genereren op basis van `?parent` + property-naam:
```sparql
BIND(IRI(CONCAT(STR(?parent), "/", REPLACE(STR(?property), "^.*/", ""))) AS ?waarde_iri)
```

---

## Overzichtstabel

| # | Mismatch | Prioriteit | Aan te passen |
|---|---|---|---|
| M1 | Observatie/HoeveelheidWaarde/Emissie: ontbrekende property-restricties | **KRITIEK** | `riepr.ttl` |
| M2 | Geometry: Virtuoso-datatype + indirectie | **GROOT** | `construct_deployment.rq` |
| M3 | Status: foutieve range (`adms:Status` i.p.v. `skos:Concept`) | **GROOT** | `riepr.ttl` |
| M4 | Procedure ENUM: blank-node examples vervangen door named concepts | MIDDEL | `riepr.ttl` |
| M5 | `externe_identificator`: identieke COMMENT op datatype en notatie | MIDDEL | `riepr.ttl` |
| M6 | `adres`: `locn:fullAddress` en `locn:locatorDesignator` ontbreken | MIDDEL | `riepr.ttl` |
| M7 | `filter`/`meet_instrument`: temporele versioning ontbreekt | MIDDEL | `riepr.ttl` |
| M8 | `sosa:isHostedBy`: ontbrekende property-restrictie | MIDDEL | `riepr.ttl` |
| M9 | `wasDerivedFrom`/`wasInfluencedBy` | — | geen (Virtuoso-inferentie, negeren) |
| M10 | `zuiveringsapparaat`: ontbrekende klasse `riepr:ZuiveringsApparaat` | KLEIN | `riepr.ttl` + `construct_deployment.rq` r.80 |
| M11 | `.well-known/genid/`-IRIs als subjecten | KLEIN | `construct_execution.rq` + `construct_properties.rq` |
| M12 | SOSA-semantiek: Emissie/Onttrekking/Productievolume incorrecte superklassen + ontbrekende :Resultaat | **KRITIEK** | `riepr.ttl` |

---

## Aanpak

Alle M1/M3/M4/M5/M6/M7/M8/M10-aanpassingen verlopen via **`riepr.ttl`** → ODDToolkit-regeneratie van `schema.sql`.  
M2 en M11 zijn aanpassingen in de **construct-queries**.  
M9 vereist geen actie.

---

### M12 — SOSA-semantiek: Emissie/Onttrekking/Productievolume incorrecte superklassen

**Prioriteit:** KRITIEK

**Probleem:**  
`riepr:Emissie`, `riepr:Onttrekking` en `riepr:Productievolume` waren gedefinieerd als `rdfs:subClassOf sosa:Result`. Maar:
- In de construct-query en data wordt `riepr:Emissie` getypeerd als `sosa:FeatureOfInterest` (het object dat geobserveerd wordt, niet de meetwaarde).
- `riepr:Onttrekking` heeft dezelfde rol — het is een onttrekkingsevent, geen meetresultaat.
- `riepr:Productievolume` beschrijft een *type eigenschap* (hoeveel werd er geproduceerd) — dat is een `ssn:Property`, niet een meetwaarde.
- Er ontbrak een `:Resultaat rdfs:subClassOf sosa:Result`-klasse voor de werkelijke meetwaarde.
- `riepr:Observatie` had `hasFeatureOfInterest some :Meetpunt` — het meetpunt is echter de meetplaats (subsysteem van Emissiepunt), niet het onderwerp van meting. De emissie is het onderwerp.
- Het meetpunt was incorrect gelinkt als `sosa:isHostedBy :Exploitatielocatie`; het is een subsysteem van het Emissiepunt of Onttrekkingspunt zelf.

**Gemaakte ontwerpbeslissingen:**
- `Emissie`, `Onttrekking` → `sosa:FeatureOfInterest` (+ `prov:Entity`)
- `Productievolume` → `ssn:Property` (het type eigenschap "hoeveel werd geproduceerd")
- Nieuwe klasse `:Productie` → `sosa:FeatureOfInterest` (het productie-event)
- Nieuwe klasse `:Resultaat` → `sosa:Result` met inline `qudt:numericValue` + `qudt:hasUnit` (geen indirectie via `qudt:quantityValue` omdat dat in definitieve data een blank node wordt)
- `sosa:isResultOf` op Emissie/Onttrekking vervangen door `sosa:isFeatureOfInterestOf`
- `qudt:quantityValue`-restricties verwijderd van Emissie/Onttrekking (die horen op Resultaat)
- Nieuwe observatie-subklassen: `:EmissieObservatie`, `:OnttrekkingObservatie`, `:ProductieObservatie` (platte hiërarchie, erven direct van `sosa:Observation`)
- `:Observatie`: `hasFeatureOfInterest` gewijzigd van `:Meetpunt` → `:Emissie`; `madeBySensor some :MeetInstrument` toegevoegd
- `Meetpunt sosa:isHostedBy` gewijzigd van `:Exploitatielocatie` → `ssn:System`
- Typefout `rdf:subClassOf` op `:Proces` hersteld naar `rdfs:subClassOf`

**Waar aan te passen:** `riepr.ttl`

---

## Implementatiestatus (2026-05-16)

Alle fixes zijn geïmplementeerd:

| # | Bestand | Status |
|---|---|---|
| M1/M3/M4/M5/M6/M7/M8/M10 | `riepr.ttl` | ✓ gedaan |
| M2 | `construct_deployment.rq` (WKT via `STRDT`) | ✓ gedaan |
| M10 | `construct_deployment.rq` r.80 (`:ZuiveringsApparaat`) | ✓ gedaan |
| M11 | `construct_execution.rq` (`?concentratie_iri`) | ✓ gedaan |
| M11 | `construct_properties.rq` (`?waarde_iri`) | ✓ gedaan |
| M12 | `riepr.ttl` (SOSA-semantiek: Emissie/Onttrekking/Productievolume/Observatie/Resultaat) | ✓ gedaan |

**ODDToolkit** is opnieuw gedraaid (SQL-generator). Nieuwe `schema.sql` gegenereerd op 2026-05-15.

### Verificatie gegenereerd schema

| Tabel/Kolom | Verwacht | Aanwezig |
|---|---|---|
| `observatie.result_time` | TIMESTAMP | ✓ |
| `observatie.phenomenon_time` | VARCHAR | ✓ |
| `hoeveelheid_waarde` | tabel met `waarde` + `eenheid` | ✓ |
| `emissie.quantity_value` | VARCHAR (FK) | ✓ |
| `adres.full_address` | VARCHAR | ✓ |
| `adres.locator_designator` | VARCHAR | ✓ |
| `externe_identificator.notatietype` | VARCHAR | ✓ |
| `filter_identity` | tabel aanwezig | ✓ |
| `meet_instrument_identity` | tabel aanwezig | ✓ |
| `zuiverings_apparaat` | tabel aanwezig | ✓ |
| `status` ENUM kolommen | VARCHAR (concept-IRI) | ✓ |

### Verwachte nieuwe tabellen na M12-regeneratie

| Tabel/Kolom | Verwacht |
|---|---|
| `emissie_observatie` | tabel aanwezig, `feature_of_interest_id → emissie(id)` |
| `onttrekking_observatie` | tabel aanwezig, `feature_of_interest_id → onttrekking(id)` |
| `productie_observatie` | tabel aanwezig, `feature_of_interest_id → productie(id)` |
| `productie` | tabel aanwezig |
| `productievolume` | tabel aanwezig (als ssn:Property subklasse) |
| `resultaat` | tabel aanwezig met `numeric_value` DECIMAL + `has_unit` VARCHAR |
| `observatie.feature_of_interest_id` | FK → `emissie(id)` (niet meer meetpunt) |
| `observatie.made_by_sensor_id` | FK → `meet_instrument(id)` |

### ODDToolkit-fixes

Drie bugs gepatcht in ODDToolkit (OWL-reasoner uitgeschakeld vereist):

1. **`ConceptClassExtractAdapter`**: fallback naar base model wanneer `inferredModel` null is; class resource nu van de actual equivalent class (niet het concept-resource) zodat OWL-restricties worden opgepikt.
2. **`OntologyPropertyExtractAdapter`**: fallback naar base model voor inverse-property lookup.
3. **`ClassGenerator`**: extra sluitende accolade verwijderd die de klasse vroegtijdig afsloot.
