# Codelijsten beheer

!!! abstract "Beide stromen"
    Deze pagina behandelt structurele **en** operationele gegevens. Ze zijn hieronder per sectie uit elkaar gehouden en als zodanig gemarkeerd; zie [Twee stromen](./datamodel.md) voor de grens.

Deze pagina beschrijft hoe de gecontroleerde vocabulaires / codelijsten van RIE-IEPR zijn opgebouwd, beheerd en gepubliceerd. De bronbestanden staan in het aparte repository [milieuinfo/codelijst-rie-iepr](https://github.com/milieuinfo/codelijst-rie-iepr) onder `src/source/`. De codelijsten worden als SKOS concepten en concept schemes gepubliceerd op `https://data.omgeving.vlaanderen.be/id/concept/riepr/`.

## Overzicht

Het RIE-IEPR-datamodel maakt gebruik van SKOS-concepten voor structurele en operationele gegevens.

**Structurele codelijsten** typeren de organisatie en infrastructuur:

* typeringen van systemen: `installatie_type`, `emissiepunt_type`, `onttrekkingspunt_type`, `meetpunt_type`, `filter_type`, `uitwisselpunt_type`
* proces- en status-typering: `procedure_type`, `status_type`, `rubriek_type`, `aangifte_type`, `aangifte_status`
* eigenschappen-koppeling: `installatie_eigenschappen`, `emissiepunt_eigenschappen`, `meetpunt_eigenschappen`, `onttrekkingspunt_eigenschappen`, `uitwisselpunt_eigenschappen`
* hulpcodelijst: `eenheden`

**Operationele codelijsten** ondersteunen rapportage en metingen:

* operationele rapportage: `operationeel_lucht`, `operationeel_water`, `operationeel_grondwater`, `operationeel_grondstoffen`, `operationeel_zelfcontrole_lucht`, `operationeel_zelfcontrole_water`, `operationeel_misc`
* operationele hulpcodelijst: `thema_type`

Alle lijsten worden vanuit CSV-bronbestanden gegenereerd naar meerdere RDF-formaten: Turtle, JSON-LD, N-Triples, JSON, CSV, Parquet, Excel.

!!! note "Welke CSV's daadwerkelijk gegenereerd worden"
    Bepalend is de lijst `source.codelijst_csv` in `config.yml`, niet de inhoud van de map `src/source/`. Een paar bestanden staan wel in de map maar (nog) niet in de configuratie, en worden dus niet gepubliceerd: `filter_eigenschappen.csv` (bovendien leeg), `emissie_type.csv`, `operationeel_contextueel.csv` en `algmeen.csv`. Een codelijst voor **bepalingsmethodes** (`sosa:usedProcedure`, zie [Observaties §6](./observaties.md#6-procedures-meetproces-en-bepalingsmethode)) bestaat vandaag nog niet.

## Repository structuur

```
src/source/
  config.yml          # configuratie van paden, prefixen, metadata, SKOS-regels
  context.json        # JSON-LD context voor de CSV-kolommen
  *.csv               # bronbestanden per codelijst
```

`config.yml` definieert:

* `skos.prefixes.concept` en `collectie` – basis URI voor concepten en collecties
* `skos.path` – waar de concept schemes worden uitgezet
* `source.path` – `src/source/`
* `source.codelijst_csv` – lijst van CSV-bestanden die verwerkt worden
* `source.context` – `context.json` die CSV-kolommen mapt naar SKOS / RDF-eigenschappen

`context.json` bevat de JSON-LD mapping. Voorbeeld:

```json
"prefLabel": { "@id": "http://www.w3.org/2004/02/skos/core#prefLabel", "@language": "nl" },
"definition": { "@id": "http://www.w3.org/2004/02/skos/core#definition", "@language": "nl" },
"notation": { "@id": "http://www.w3.org/2004/02/skos/core#notation" },
"broader": { "@id": "http://www.w3.org/2004/02/skos/core#broader", "@type": "@id" },
...
"isVerplicht": { "@id": "https://data.riepr.omgeving.vlaanderen.be/ns/vocab#isVerplicht", "@type": "http://www.w3.org/2001/XMLSchema#boolean" }
```

## Concepts en ConceptScheme

In SKOS:

* Een **ConceptScheme** is de codelijst zelf. Bijvoorbeeld `conceptscheme:installatie_type`.
* Een **Concept** is één waarde in de lijst. Bijvoorbeeld `riepr-installatie-type:stookinstallatie`.

Relaties:

* `skos:inScheme` – concept behoort tot een scheme
* `skos:topConceptOf` – concept is top-level in scheme
* `skos:broader` / `skos:narrower` – hiërarchie
* `skos:prefLabel`, `skos:altLabel`, `skos:notation`, `skos:definition`, `skos:scopeNote`
* `skos:related`, `skos:broaderPartitive`, `skos:narrowerPartitive`

Voorbeeld uit `installatie_type.csv`:

```
_id,_type,topConceptOf,inScheme,prefLabel,altLabel,notation,definition,scopeNote,broader,isOnzichtbaar,isMeetbaar
conceptscheme:installatie_type,skos:ConceptScheme,,,conceptscheme:systeem_type,Installatie types,,,Een typering van verschillende soorten installaties.,,,,
riepr-installatie-type:stookinstallatie,skos:Concept,conceptscheme:installatie_type,conceptscheme:installatie_type,,Stookinstallatie,,INSTALLATIE_STOOKINSTALLATIE,,,,,
riepr-installatie-type:directe_stookinstallatie,skos:Concept,,conceptscheme:installatie_type,,Directe Stookinstallatie,,INSTALLATIE_STOOKINSTALLATIE_DIRECT,,,riepr-installatie-type:stookinstallatie,,
```

* Rij 1 definieert het ConceptScheme.
* Rij 2 definieert een top-concept.
* Rij 3 is een sub-concept met `broader` naar `stookinstallatie`.

Voorbeeld uit `procedure_type.csv`:

```
_id,_type,topConceptOf,inScheme,prefLabel,altLabel,notation,definition,scopeNote,broader,relevantDataType,isMeetbaar
conceptscheme:procedure_type,skos:ConceptScheme,,,Procedure types,,,Een typering van verschillende procedures.,,,,
riepr-procedure-type:emissie,skos:Concept,conceptscheme:procedure_type,conceptscheme:procedure_type,Emissie,,EMISSIE,De procedure emissie via een emissiepunt.,,,http://www.w3.org/ns/sosa/Procedure,
riepr-procedure-type:transport,skos:Concept,conceptscheme:procedure_type,conceptscheme:procedure_type,Transport,,TRANSPORT,De procedure transport tussen twee processen.,,,http://www.w3.org/ns/sosa/Procedure,
```

### Procedure types en transportprocessen

`procedure_type` bevat de typering van processen in een procesplan. Belangrijke concepten:

* `verwerking` – proces geïmplementeerd door een installatie
* `transport` – proces dat de overbrenging van stof/energie tussen twee processen representeert
* `emissie` – proces geïmplementeerd door een emissiepunt
* `onttrekking` – proces geïmplementeerd door een onttrekkingspunt
* `uitwissel` – proces geïmplementeerd door een uitwisselpunt
* `meting` – proces geïmplementeerd door een meetpunt

Transportprocessen worden gebruikt om de keten tussen bron en sink expliciet te maken. In het datamodel is een proces tegelijk een `pplan:Plan`, `pplan:Step` en `sosa:Procedure`. De typering komt uit de codelijst `procedure_type` via `dct:type`.

In het datamodel geldt:

* Elk proces is een stap in een hoger plan: `pplan:isStepOfPlan`
* De volgorde van stappen wordt vastgelegd met `pplan:isPrecededBy`: *stap X is voorafgegaan door stap Y*
* Een proces kan een systeem implementeren: `ssn:implementedBy` / `ssn:implements`

Voor transport. `pplan:isPrecededBy` wijst **tegen de stroomrichting in**: `X isPrecededBy Y` betekent dat Y vóór X komt (zie ook [Migratie §6.2](./migratie.md#62-hoe-je-pplanisprecededby-leest)).

Stroomrichting:

```
PROCES_INSTALLATIE  -->  PROCES_TRANSPORT  -->  PROCES_EMISSIE
```

In RDF staat dus telkens de omgekeerde relatie:

```
PROCES_EMISSIE -- pplan:isPrecededBy --> PROCES_TRANSPORT -- pplan:isPrecededBy --> PROCES_INSTALLATIE
```

In Turtle:

```turtle
@prefix dct: <http://purl.org/dc/terms/> .
@prefix pplan: <http://purl.org/net/p-plan#> .
@prefix ssn: <http://www.w3.org/ns/ssn/> .
@prefix riepr: <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#> .

<.../proces/INSTALLATIE/uuid/2026-01-01/...>
    a riepr:Proces ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <.../installatie/uuid/2026-01-01/...> ;
    pplan:isStepOfPlan <.../proces/PARENT/uuid/2026-01-01/...> .

<.../proces/TRANSPORT/uuid/2026-01-01/...>
    a riepr:Proces ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/transport> ;
    pplan:isStepOfPlan <.../proces/PARENT/uuid/2026-01-01/...> ;
    pplan:isPrecededBy <.../proces/INSTALLATIE/uuid/2026-01-01/...> .

<.../proces/EMISSIE/uuid/2026-01-01/...>
    a riepr:Proces ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <.../emissiepunt/uuid/2026-01-01/...> ;
    pplan:isStepOfPlan <.../proces/PARENT/uuid/2026-01-01/...> ;
    pplan:isPrecededBy <.../proces/TRANSPORT/uuid/2026-01-01/...> .
```

Praktisch voorbeeld uit de applicatieve documentatie `DATASTRUCTUUR.md`:

1. Een proces van type `VERWERKING` implementeert een installatie via `ssn:implementedBy`.
2. Een proces van type `EMISSIE` wordt geïmplementeerd door een emissiepunt via `ssn:implementedBy`.
3. Een nieuw proces van type `TRANSPORT` wordt aangemaakt met benaming bv. "Transport CO2 van Oven naar Schouw".
   * `dct:type = riepr-procedure-type:transport`
   * `pplan:isStepOfPlan` naar het hoofdproces van de exploitatie
4. Volgorde koppeling:
   * `PROCES_EMISSIE --> pplan:isPrecededBy --> PROCES_TRANSPORT`
   * `PROCES_TRANSPORT --> pplan:isPrecededBy --> PROCES_INSTALLATIE`

Hierdoor wordt het transportproces de brug tussen de twee processen. De stof die in het verwerkingsproces vrijkomt, wordt via het transportproces naar het emissieproces geleid. Dit maakt de massabalans en de herkomst van emissies traceerbaar en laat toe om stoffen expliciet te koppelen over processen heen.

Zie ook de applicatieve documentatie `DATASTRUCTUUR.md` sectie "Verbinden van processen" en "Verbinden van een emissiepunt aan een ander proces", en het datamodel [Basisaannames](./basisaanname.md) over P-Plan.

## CSV-kolommen

De CSV-koppen zijn de bron voor RDF-triples. De meest voorkomende kolommen:

* `_id` – lokale identifier, wordt omgezet naar volledige URI via prefixen
* `_type` – `skos:ConceptScheme` of `skos:Concept`
* `topConceptOf` – verwijst naar het scheme waar dit concept top-concept van is
* `inScheme` – scheme waartoe het concept behoort
* `isPartOf` – compositie: concept is onderdeel van een ander concept
* `prefLabel` – voorkeurslabel NL
* `altLabel` – alternatieve labels
* `notation` – code / sleutel
* `definition` – definitie NL
* `scopeNote` – scope note NL
* `broader` / `narrower` – hiërarchie
* `broaderPartitive` / `narrowerPartitive` – partitieve hiërarchie
* `relevantDataType` – XSD-type of URI, bv. `xsd:string`, `xsd:decimal`, `http://www.w3.org/ns/sosa/Procedure`
* `relevantClass` – RDF-klasse waar het concept op gemapt wordt, bv. `sosa:FeatureOfInterest`, `sosa:ObservationCollection`, `riepr:Emissie`
* `relevantRiepr` – selectie van RIEPR-systemen/processen waarop het concept van toepassing is
* `relevantProperty` – eigenschap waarop gemapt wordt
* `relevantUnit` – QUDT-eenheid of ConceptScheme met eenheden
* `relevantCodeList` – verwijzing naar een ander ConceptScheme voor selectie
* `isVerplicht` – boolean, veld verplicht?
* `isMeervoudig` – boolean, meerdere waarden toelaten?
* `isMultiselect` – boolean, multiselect in UI?
* `isOnzichtbaar` – boolean, concept niet tonen in UI
* `conditionPath` / `conditionValue` – conditionele zichtbaarheid: toon concept enkel als pad een bepaalde waarde heeft
* `seeAlso` – volgende stap / gerelateerd scheme (bij `status_type` en `aangifte_status`: de ADMS-status-equivalent)
* `relation` – RDF-predikaat voor koppeling

Voor **eigenschappen-koppeling**, bv. `emissiepunt_eigenschappen.csv`:

```
_id,_type,topConceptOf,inScheme,isPartOf,prefLabel,altLabel,notation,definition,scopeNote,broaderPartitive,relation,relevantDataType,relevantRiepr,relevantProperty,relevantUnit,relevantCodeList
conceptscheme:emissiepunt_eigenschappen,skos:ConceptScheme,,,conceptscheme:systeem_eigenschappen,Emissiepunt eigenschappen,,,Een typering van verschillende eigenschappen voor emissiepunten.,,,,,,,,
riepr-emissiepunt-eigenschappen:schouw-hoogte,skos:Concept,conceptscheme:emissiepunt_eigenschappen,conceptscheme:emissiepunt_eigenschappen,,Hoogte van de schouw,,hoogte,,,,rdfs:value,http://www.w3.org/2001/XMLSchema#decimal,riepr-emissiepunt-type:schoorsteen,http://dbpedia.org/ontology/height,http://qudt.org/vocab/unit/M,
```

Hier wordt `relevantRiepr` gebruikt om de eigenschap te koppelen aan een systeemtype en `relevantProperty`/`relevantUnit` geven datatype en eenheid.

Voor **operationele stromen**, bv. `operationeel_lucht.csv`:

* Top-level `ConceptScheme` per thematische stroom.
* Binnen het scheme staan `Concept`en die `sosa:ObservationCollection` of `sosa:Observation` mappen via `relevantClass`.
* `isPartOf` en `broaderPartitive` modelleren composities.
* `conditionPath`/`conditionValue` sturen conditionele velden.
* `relevantCodeList` verwijst naar een ander scheme voor selectielijsten.
* `seeAlso` definieert de volgende stap in de wizard.

Voorbeeld fragment:

```
riepr-operationeel-lucht:brandstof,skos:Concept,conceptscheme:operationeel_lucht_rapportering,conceptscheme:operationeel_lucht_rapportering,Verbruikte brandstof,Geef de verbruikte brandstoffen op.,,sosa:ObservationCollection,,,,,,,,,,true,,,,true
riepr-operationeel-lucht:brandstof_naam,skos:Concept,,conceptscheme:operationeel_lucht_rapportering,Naam,Naam van de brandstof.,riepr-operationeel-lucht:brandstof,,xsd:string,rdfs:label,,,,,,,true,,,,,true
```

## Extra context / kolommen toevoegen

Nieuwe informatie kan toegevoegd worden door:

1. De CSV-kolom toe te voegen aan de betrokken `*.csv` in `src/source/`.
2. De kolom te mappen in `context.json` met de gewenste `@id` en optioneel `@type` of `@language`.
3. Bij RDF-specifieke eigenschappen de prefix te definiëren in `config.yml` onder `prefixes`.
4. Indien nodig de SKOS-regels uitbreiden in `config.yml > skos.rules`.

Voorbeeld: een nieuwe kolom `normstatus` toevoegen:

In `context.json`:
```json
"normstatus": {
  "@id": "https://data.riepr.omgeving.vlaanderen.be/ns/vocab#normstatus",
  "@language": "nl"
}
```

In de CSV:
```
_id,...,normstatus,...
riepr-concept:x,skos:Concept,...,actief,...
```

Bij het volgende `npm run generate_skos` wordt de kolom automatisch uitgezet naar RDF.

Let op: kolommen die niet in `context.json` staan worden genegeerd. Kolommen die wel in `context.json` staan maar niet in de CSV krijgen geen waarde.

## Genereren van SKOS

De bron-CSV's worden omgezet naar SKOS/RDF via de Node.js pipeline.

**Scripts uit `package.json`:**

```json
"generate_skos": "cd src && node 01_codelijst_skos_from_csv.js"
```

Uitvoeren:

```bash
npm install
npm run generate_skos
```

Wat gebeurt er:

1. `src/01_codelijst_skos_from_csv.js` leest `config.yml`.
2. Voor elk bestand in `source.codelijst_csv` wordt de CSV gelezen met `csv-parser`.
3. Kolommen worden via `context.json` gemapt naar RDF-eigenschappen.
4. Prefixen uit `config.yml` worden toegepast op `_id` waarden om volledige URI's te maken.
5. SKOS-regels uit `config.yml > skos.rules` worden toegepast: `skos_rules.n3`, `dcterms_rules.n3`, `rie-iepr-rules.n3`.
6. Output wordt geschreven naar `skos.path` in de formaten gedefinieerd in config: `.ttl`, `.jsonld`, `.nt`, `.json`, `.csv`, `.parquet`, `.xlsx`.
7. Na generatie worden DCAT-metadata aangemaakt via `npm run create_metadata` (`02_metadata.js`) en kan gepubliceerd worden met `npm run deploy`.

De gegenereerde bestanden worden in het Maven-artifact geplaatst onder `main/resources/be/vlaanderen/omgeving/data/id/conceptscheme/` en kunnen vervolgens via de Maven-metadata-generator worden gepubliceerd naar de triplestore.

## Publicatie

Na generatie:

```bash
npm run create_metadata
npm run deploy
```

`99_deploy_latest.js` leest `.env` voor Virtuoso-credentials en publiceert de Turtle/JSON-LD naar `https://data.omgeving.vlaanderen.be`. De codelijsten zijn dan raadpleegbaar via:

* `https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type.ttl`
* `https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie`

## Tips voor beheerders

* Houd `prefLabel` kort en consistent NL.
* Gebruik `notation` voor stabiele codes die in applicaties gebruikt worden.
* Definieer hiërarchie via `broader` voor navigatie en filtering.
* Voor operationele stromen: modelleer stappen als aparte `ConceptScheme` en koppel ze met `seeAlso`.
* Gebruik `conditionPath`/`conditionValue` voor conditionele velden i.p.v. applicatielogica.
* Test wijzigingen lokaal met `npm run generate_skos` en valideer de Turtle output met een SPARQL-query.
