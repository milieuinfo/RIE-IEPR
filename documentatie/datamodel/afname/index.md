# Documentatie afname (Linked Open Data)

| | |
|---|---|
| Modelversie | **1.0.1** |
| Documentatie bijgewerkt | 2026-09-02 |
| Ontologie (`riepr.ttl`) | 2026-08-26 |


Deze documentatie beschrijft het RIE-IEPR-datamodel vanuit het perspectief van een data-afnemer die de gegevens raadpleegt via Linked Open Data (LOD). De documentatie behandelt **wat er beschikbaar is** en **hoe u het kunt gebruiken**. Er wordt geen informatie gegeven over databanken, transformatieprocessen of applicatielogica.

Het datamodel kent **twee aparte stromen**, die in deze documentatie consequent uit elkaar gehouden worden. Elke pagina draagt bovenaan een banner die aangeeft tot welke stroom ze behoort.

**Structurele gegevens** omvatten exploitanten, contactpersonen, exploitatielocaties, exploitaties, processen en systemen (installaties, emissiepunten, onttrekkingspunten, uitwisselpunten, meetpunten, filters) met hun eigenschappen. Dit zijn de versioneerbare entiteiten die de organisatie en infrastructuur beschrijven, en de enige die in de applicatie worden ingegeven en beheerd.

**Operationele gegevens** omvatten de gebeurtenissen (emissie, onttrekking, verbruik) die als `sosa:FeatureOfInterest` dienen, plus observaties, observatieverzamelingen en resultaten, aangestuurd door de operationele codelijsten (`operationeel_*`, `thema_type`). Ze worden niet geversioneerd en hangen via drie vaste predicaten aan de structurele stroom.

!!! warning "Analyse nog lopende"
    De analyse van operationele gegevens is nog lopende. De informatie over operationele gegevens kan wijzigen na afronding van de analyse. De structurele stroom is stabiel.

De precieze grens — welke klassen, welke predicaten, en waarom emissies niet in de applicatie bestaan — staat in **[Twee stromen](./datamodel.md)**.

## Inhoud

**Overkoepelend**

- [Twee stromen](./datamodel.md) — de opdeling van het model en de grens ertussen
- [Basisaannames](./basisaanname.md) — de modellen en aannames die aan het datamodel ten grondslag liggen
- [End-to-end voorbeeld](./endtoend.md) — de volledige dataketen, per stroom uit elkaar gehouden
- [Gebruiksscenario's](./gebruiksscenario.md) — concrete voorbeelden van data-afname met SPARQL-query's
- [Aangifte en dossier](./aangifte.md) — het administratieve document waaraan beide stromen kunnen hangen

**Structurele gegevens**

- [Exploitant- en exploitatiemodel](./exploitant.md) — organisaties, locaties en activiteiten
- [Systemen: installaties, emissiepunten en meetpunten](./systemen.md) — systemen, subsystemen en eigenschappen
- [Versiebeheer en tijdsrecht](./versiebeheer.md) — versiebeheer, geldigheid en historische query's
- [Migratie](./migratie.md) — omzetting van de VMM/IMJV-gegevens naar dit model

**Operationele gegevens**

- [Observaties en emissies](./observaties.md) — metingen, gebeurtenissen (emissie, onttrekking) en resultaten

> **Codelijsten**: Een overzicht van alle gecontroleerde vocabulaires (SKOS-concepten) die in dit model worden gebruikt, vindt u hieronder onder "Codelijsten (SKOS-concepten)". Deze codelijsten worden beheerd in de aparte repository [milieuinfo/codelijst-rie-iepr](https://github.com/milieuinfo/codelijst-rie-iepr/).

## Hoe deze documentatie gebruiken

Elk bestand bevat **concrete datavoorbeelden** uit de RIE-IEPR-ontologie, gemodelleerd naar de casus AGC Glass Europe. Het gaat om demonstratiedata, niet om echte aangiftedata. De Turtle-snippets tonen hoe de data er in RDF-formaat uitziet en zijn direct bruikbaar voor LOD-afnemers die SPARQL of RDF-bibliotheken gebruiken.

### URI-patronen

De meeste entiteiten volgen een consistent URI-patroon:

| Entiteitstype | URI-patroon | Voorbeeld |
|---|---|---|
| Exploitant (identity) | `.../exploitant/{uuid}` | `.../exploitant/019e9271-1452-7630-be04-59ea199007a7` |
| Exploitatie (versie) | `.../exploitatie/{uuid}/{issued}/{created}` | `.../exploitatie/019e9271-1454-7b38-9eae-505cace7ca54/2026-01-01/2026-01-01T10:00:00Z` |
| Installatie (versie) | `.../installatie/{uuid}/{issued}/{created}` | `.../installatie/019e9271-1456-7a2f-ac4e-8904bab88f37/2026-01-01/2026-01-01T10:00:00Z` |
| Emissiepunt (versie) | `.../emissiepunt/{uuid}/{issued}/{created}` | `.../emissiepunt/019e9271-145b-75f5-83d9-fe9b0b7e9540/2026-01-01/2026-01-01T10:00:00Z` |
| Observatie | `.../observatie/{uuid}/{created}` | `.../observatie/019edc4a-1a35-7b33-9e4f-1c2d3e4f5a6b/2026-01-01T10:00:00Z` |

Na het entiteitstype dragen versioneerbare entiteiten **drie** URI-segmenten: een unieke identifier, de geldigheidsdatum (`issued`) en de aanmaaktimestamp (`created`). De tijdsloze identity-URI draagt er maar één (de identifier) en is bereikbaar via `dct:isVersionOf`. Observaties en observatieverzamelingen vormen een tussenvorm: identifier + `created`, zonder `issued`.

Zie [URI-patronen & Hydra](./uri-patterns.md) voor het volledige overzicht per klasse, inclusief de klassen die een andere sleutel dan een UUID gebruiken (exploitant, aangifte).

## Externe standaarden

Het RIE-IEPR-datamodel bouwt voort op de volgende externe standaarden:

- **SOSA/SSN** ([Semantic Sensor Network Ontology](https://www.w3.org/TR/vocab-ssn/), W3C) — systemen, observaties, metingen
- **PROV-O** ([Provenance Ontology](https://www.w3.org/TR/prov-o/), W3C) — herkomst en versiebeheer
- **ADMS** ([Asset Description Metadata Schema](https://www.w3.org/TR/vocab-adms/), W3C) — externe identificatoren via `adms:identifier`
- **GeoSPARQL** ([OGC GeoSPARQL](https://docs.ogc.org/is/22-047r1/22-047r1.html), OGC) — geografische objecten
- **P-Plan** ([Plan Ontology](https://www.opmw.org/model/p-plan/)) — processen en stappen; dit is een community-ontologie, geen W3C-standaard

> **Externe identificatoren**: naast de eigen RIE-IEPR-URI bewaart het model externe (bron/migratie) identificatoren via `adms:identifier` (bijv. VMM-migratiecodes en DOMG/INSPIRE-id's). Hoe dit werkt en hoe u ze bevraagt, staat in [Basisaannames §9 — Externe identificatoren](./basisaanname.md#9-externe-identificatoren-admsidentifier).

## Codelijsten (SKOS-concepten)

Het RIE-IEPR-datamodel maakt uitgebreid gebruik van **gecontroleerde vocabulaires** (codelijsten), voorgesteld als [SKOS-concepten](https://www.w3.org/TR/skos-reference/). Deze codelijsten worden beheerd in een aparte repository: **[milieuinfo/codelijst-rie-iepr](https://github.com/milieuinfo/codelijst-rie-iepr/)**.

De codelijsten zijn gepubliceerd als Linked Data op [data.omgeving.vlaanderen.be](https://data.omgeving.vlaanderen.be/id/concept/riepr/) en er wordt in de ontologie naar verwezen via hun volledige URI. Ze vormen de waarden voor `dct:type`, `adms:status` en andere categorisatie-eigenschappen.

### Beschikbare codelijsten

| Codelijst | URI-prefix | Beschrijving |
|---|---|---|
| **installatie_type** | `…/concept/riepr/installatie-type/` | Typen installaties (`installatie`, `stookinstallatie`, `luchtzuivering`, `waterzuivering`, `gpbv`, …) |
| **emissiepunt_type** | `…/concept/riepr/emissiepunt-type/` | Typen emissiepunten (`schoorsteen`, `lozingspunt`, `fakkel`, `gebouw`, …) |
| **onttrekkingspunt_type** | `…/concept/riepr/onttrekkingspunt-type/` | Typen onttrekkingspunten (`pompput`, `opnamepunt`) |
| **uitwisselpunt_type** | `…/concept/riepr/uitwisselpunt-type/` | Typen uitwisselpunten (`uitwisselpunt`) |
| **meetpunt_type** | `…/concept/riepr/meetpunt-type/` | Typen meetpunten (`peilput`, `debietmeter`, `controleinrichting`) |
| **filter_type** | `…/concept/riepr/filter-type/` | Typen filters (`peil`, `pomp`, `injectie`, `omkeerbaar`) |
| **procedure_type** | `…/concept/riepr/procedure-type/` | Procesprocedures (`verwerking`, `emissie`, `onttrekking`, `uitwissel`, `meting`, `transport`, `hoofdactiviteit`) |
| **status_type** | `…/concept/riepr/status-type/` | Statussen (`in_dienst`, `tijdelijk_uit_dienst`, `definitief_uit_dienst`, `ontmanteld`, `voorgesteld`, `verkeerde_registratie`) |
| **rubriek_type** | `…/concept/riepr/rubriek-type/` | Classificaties (`vlarem`, …) |
| **aangifte_type** | `…/concept/riepr/aangifte-type/` | Typen aangiften (`structuur`, `operationeel`) |
| **aangifte_status** | `…/concept/riepr/aangifte-status/` | Statussen van een aangiftebundel (`concept`, `ingediend`, `gefaald`, `ingetrokken`) |
| **installatie_eigenschappen** | `…/concept/riepr/installatie-eigenschappen/` | Eigenschappen van installaties |
| **emissiepunt_eigenschappen** | `…/concept/riepr/emissiepunt-eigenschappen/` | Eigenschappen van emissiepunten |
| **onttrekkingspunt_eigenschappen** | `…/concept/riepr/onttrekkingspunt-eigenschappen/` | Eigenschappen van onttrekkingspunten |
| **meetpunt_eigenschappen** | `…/concept/riepr/meetpunt-eigenschappen/` | Eigenschappen van meetpunten |
| **uitwisselpunt_eigenschappen** | `…/concept/riepr/uitwisselpunt-eigenschappen/` | Eigenschappen van uitwisselpunten |
| **eenheden** | `…/concept/riepr/eenheden/` | Eenheden (verwijzingen naar QUDT) |

> De typering van het **hoofdproces** is geen aparte codelijst: `hoofdactiviteit` is een concept binnen `procedure_type` (`…/concept/riepr/procedure-type/hoofdactiviteit`).

Daarnaast bestaan er operationele codelijsten (`operationeel_lucht`, `operationeel_water`, `operationeel_grondwater`, `operationeel_grondstoffen`, `operationeel_zelfcontrole_lucht`, `operationeel_zelfcontrole_water`, `operationeel_misc`, `thema_type`) voor de rapportagestroom. Zie [Codelijsten beheer](./codelijsten.md).

### Voorbeeld: procedure_type in gebruik

```turtle
@prefix dct: <http://purl.org/dc/terms/> .

# Een emissieproces heeft een procedure_type als dct:type
<.../proces/019eaca0-b8c6-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z>
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> .

# Dit dwingt het proces om een emissiepunt te implementeren (OWL-axioma)
<.../proces/019eaca0-b8c6-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z>
    ssn:implementedBy <.../emissiepunt/019eaca0-b8c6-7096-886c-103c3e21466c/2026-01-01/2026-01-01T10:00:00Z> .
```

### Voorbeeld: status_type in gebruik

```turtle
@prefix adms: <http://www.w3.org/ns/adms#> .

<.../installatie/019e9271-1456-7a2f-ac4e-8904bab88f37/2026-01-01/2026-01-01T10:00:00Z>
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> .
```

### Codelijsten als LOD

De codelijsten zelf zijn gepubliceerd als Linked Open Data en kunnen worden geraadpleegd via SPARQL of directe URI-toegang:

- **Turtle**: `https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type.ttl`
- **JSON-LD**: `https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type.jsonld`
- **Afzonderlijk concept**: `https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/gpbv`

De codelijsten-repository wordt gegenereerd uit CSV-bronbestanden en gepubliceerd in meerdere formaten (Turtle, JSON-LD, N-Triples, JSON, CSV, Parquet, Excel).

## Databronnen

Deze documentatie is gebaseerd op:

- **Ontologie**: `src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl`
- **Datavoorbeeld**: `documentatie/datamodel/datavoorbeelden/agc-glass_MJV_01-07-2026.ttl` (AGC Glass Europe)
- **SHACL-shapes**: `documentatie/datamodel/generated/shacl/schema.ttl`
