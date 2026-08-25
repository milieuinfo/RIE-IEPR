# Observaties en emissies


Dit document beschrijft hoe metingen, observaties en gebeurtenissen (emissie, onttrekking) worden voorgesteld in het RIE-IEPR-datamodel. Het volgt het **SOSA/SSN**-patroon van de W3C ([vocab-ssn](https://www.w3.org/TR/vocab-ssn/)).

## 1. Het SOSA/SSN observatiepatroon

Het model gebruikt het standaard SOSA-patroon voor observaties:

```
Observatie (sosa:Observation)
  ├── hasFeatureOfInterest → Emissie / Onttrekking   (verplicht, exact 1)
  ├── observedProperty     → wat werd gemeten (concept)
  ├── madeBySensor         → meetpunt / systeem
  ├── usedProcedure        → bepalingsmethode (concept)
  ├── resultTime           → wanneer werd het resultaat vastgelegd
  ├── phenomenonTime       → tijdstip of interval van het verschijnsel
  ├── hasResult            → Resultaat (verplicht, exact 1)
  │     └── qudt:numericValue + qudt:hasUnit (of rdfs:comment als tekst)
  └── isMemberOf           → ObservatieVerzameling (optioneel)
```

## 2. Gebeurtenissen: Emissie, Onttrekking

Emissie en onttrekking zijn **gebeurtenissen** en fungeren als `sosa:FeatureOfInterest`. Ze vertegenwoordigen een tijdsloos concept: de gebeurtenis zelf heeft geen timestamp, de tijd zit in de observaties.

### Emissie

Een **emissie** is een gebeurtenis waarbij stoffen de installatie verlaten (aan een emissiepunt). Ze is een subklasse van `prov:Entity` en `sosa:FeatureOfInterest` en wordt **afgeleid** (`prov:wasDerivedFrom`) van het emissieproces waaruit ze voortkomt (verplicht, minstens één):

```turtle
@prefix riepr: <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#> .
@prefix sosa:  <http://www.w3.org/ns/sosa/> .
@prefix prov:  <http://www.w3.org/ns/prov#> .

# De gebeurtenis (twee-segment URI, niet geversioneerd)
<https://data.mjv.omgeving.vlaanderen.be/id/emissie/019eaca0-b8c6-7096-886c-103c3e21466c>
    a riepr:Emissie, sosa:FeatureOfInterest, prov:Entity ;
    rdfs:label "Uitstoot schoorsteen 1"@nl ;
    # De emissie is afgeleid van het emissieproces (verplicht, min 1)
    prov:wasDerivedFrom <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-b8c6-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z> .

# Enkele emissie, meerdere observaties:
# de emissie is het feature-of-interest van al die observaties (of verzamelingen)
```

### Onttrekking

Een **onttrekking** is een gebeurtenis waarbij grondstoffen worden gewonnen of gebonsterd (aan een onttrekkingspunt), analoog aan de emissie maar dan afgeleid van een onttrekkingsproces:

```turtle
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekking/019eaca0-b8c6-7096-886c-103c3e21466d>
    a riepr:Onttrekking, sosa:FeatureOfInterest, prov:Entity ;
    rdfs:label "Grondwaterwinning put 1"@nl ;
    prov:wasDerivedFrom <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-b8c6-7241-ac66-b7831d1b3624/2026-01-01/2026-01-01T10:00:00Z> .
```

> **Opmerking**: De klasse `Uitwisseling` is niet apart gemodelleerd. Een uitwisselpunt is per definitie zowel emissiepunt als onttrekkingspunt (zie [Basisaannames §5](./basisaanname.md#5-disjoint-classes)); er bestaan dus zowel emissie- als onttrekkingsgebeurtenissen voor.

### Relatie tussen punt en gebeurtenis

Een **emissiepunt** (het fysieke systeem) is niet hetzelfde als een **emissie** (de gebeurtenis). De keten loopt via het proces:

```turtle
# Emissiepunt = fysiek systeem (gehost op de locatie)
<.../emissiepunt/019e9271-145b-75f5-83d9-fe9b0b7e9540/2026-01-01/2026-01-01T10:00:00Z>
    a riepr:Emissiepunt, ssn:System ;
    sosa:isHostedBy <.../exploitatielocatie/...> .

# Emissieproces: type emissie, implementeert het emissiepunt (OWL-axioma)
<.../proces/019eaca0-b8c6-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z>
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <.../emissiepunt/019e9271-145b-75f5-83d9-fe9b0b7e9540/2026-01-01/2026-01-01T10:00:00Z> .

# Emissie = gebeurtenis, afgeleid van dat proces
<.../emissie/019eaca0-b8c6-7096-886c-103c3e21466c>
    a riepr:Emissie, sosa:FeatureOfInterest ;
    prov:wasDerivedFrom <.../proces/019eaca0-b8c6-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z> .

# Observatie koppelt aan de emissie (niet aan het emissiepunt!)
<.../observatie/.../2026-01-01T10:00:00Z>
    sosa:hasFeatureOfInterest <.../emissie/019eaca0-b8c6-7096-886c-103c3e21466c> .
```

## 3. Observaties

Een **observatie** is een waarneming of meting. Het is een instantie van `sosa:Observation`.

### Kenmerken van een observatie

| Eigenschap | Type | Verplicht | Beschrijving |
|---|---|---|---|
| `sosa:hasFeatureOfInterest` | Emissie/Onttrekking | Ja (exact 1) | De gebeurtenis die wordt waargenomen |
| `sosa:hasResult` | riepr:Resultaat | Ja (exact 1) | Het resultaat van de meting |
| `dct:created` | dateTime | Ja (exact 1) | Aanmaaktimestamp (ook in de URI) |
| `sosa:observedProperty` | concept | Nee | Wat werd gemeten (stof, parameter) |
| `sosa:madeBySensor` | ssn:System | Nee | Het meetpunt/systeem dat de meting uitvoerde |
| `sosa:usedProcedure` | concept | Nee | De bepalingsmethode |
| `sosa:resultTime` | dateTime | Nee | Wanneer het resultaat werd vastgelegd |
| `sosa:phenomenonTime` | dateTime/interval | Nee | Tijdstip of interval van het verschijnsel |
| `sosa-2023:isMemberOf` | riepr:ObservatieVerzameling | Nee | De verzameling waartoe de observatie behoort |
| `riepr:aangifte` | riepr:Aangifte | Nee | De aangifte waaraan de observatie gerelateerd is |

### `sosa:madeBySensor`

`madeBySensor` is een standaard SOSA-property ([SOSAmadeBySensor](https://www.w3.org/TR/vocab-ssn/#SOSAmadeBySensor)): "het sensorapparaat dat de observatie heeft gemaakt". In de 2017 REC is de range `sosa:Sensor`; in het RIE-IEPR-model draagt het meetpunt die rol, en is het model daar `ssn:System`. De range is daarom in de ontologie `ssn:System`.

### URI-patroon

Observaties zijn **versioneerbaar** met een twee-segment patroon (`{uuid}/{created}`; er is geen `issued`-segment, de geldigheid zit in de gekoppelde entiteiten):

```turtle
@prefix sosa:  <http://www.w3.org/ns/sosa/> .
@prefix qudt:  <http://qudt.org/schema/qudt/> .
@prefix unit:  <http://qudt.org/vocab/unit/> .
@prefix dct:   <http://purl.org/dc/terms/> .

<https://data.mjv.omgeving.vlaanderen.be/id/observatie/019edc4a-1a35-7b33-im4f-n9ojk7kgkf4/2026-01-01T10:00:00Z>
    a sosa:Observation ;
    sosa:hasFeatureOfInterest <https://data.mjv.omgeving.vlaanderen.be/id/emissie/019eaca0-b8c6-7096-886c-103c3e21466c> ;
    sosa:observedProperty <https://data.omgeving.vlaanderen.be/id/concept/riepr/observed-property/NOx> ;
    sosa:resultTime "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    sosa:hasResult <https://data.mjv.omgeving.vlaanderen.be/id/resultaat/019edc4a-1a40-7b33-im4f-n9ojk7kgkf9> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime .
```

## 4. Resultaten en waarden

Het resultaat van een observatie is een `riepr:Resultaat` (`sosa:Result` + `prov:Entity`) met een **eigen URI** (twee segmenten: `resultaat/{uuid}`), geen anonieme node:

```turtle
@prefix qudt: <http://qudt.org/schema/qudt/> .
@prefix unit:  <http://qudt.org/vocab/unit/> .

# Numeriek resultaat
<https://data.mjv.omgeving.vlaanderen.be/id/resultaat/019edc4a-1a40-7b33-im4f-n9ojk7kgkf9>
    a sosa:Result, prov:Entity ;
    qudt:numericValue "45.2"^^xsd:decimal ;
    qudt:hasUnit unit:MG-PER-M3 .

# Tekstueel resultaat (vrije waarde, bijvoorbeeld een kwalificatie)
<https://data.mjv.omgeving.vlaanderen.be/id/resultaat/019edc4a-1a41-7b33-im4f-n9ojk7kgkfa>
    a sosa:Result, prov:Entity ;
    rdfs:comment "Kleurafwijking geconstateerd, hermeting ingepland"@nl .
```

QUDT (Quantities, Units, Types and Dimensions) biedt een gestandaardiseerd systeem voor eenheden:

- `unit:MG-PER-M3` milligram per kubieke meter
- `unit:LITER-PER-SEC` liter per seconde
- `unit:M` meter
- `unit:PERCENT` percentage
- etc.

## 5. Geobserveerde eigenschappen (observedProperty)

De `sosa:observedProperty` geeft aan **wat** er werd gemeten. In het RIE-IEPR-model zijn dit concepten (bijv. stoffen) uit de codelijsten:

```turtle
# Voorbeeld: NOx-meting
<.../observatie/...> sosa:observedProperty <https://data.omgeving.vlaanderen.be/id/concept/chemische_stof/...> .

# Voorbeeld: zuurstofgehalte
<.../observatie/...> sosa:observedProperty <https://data.omgeving.vlaanderen.be/id/concept/riepr/observed-property/O2> .
```

## 6. Procedures: meetproces en bepalingsmethode

Het model kent twee verschillende vormen van "procedure", die niet verward moeten worden:

1. **Het meetproces** — een `riepr:Proces` zoals elk ander proces in het plan. Het heeft `dct:type` = [`procedure-type/meet`](https://github.com/milieuinfo/codelijst-rie-iepr/blob/main/src/source/procedure_type.csv) (dezelfde codelijst als emissie, onttrekking, verwerking, uitwissel) en **implementeert per OWL-axioma een `riepr:Meetpunt`**:

    ```turtle
    <.../proces/019e9271-1470-739e-b93b-ba3f6f75feb4/2026-01-01/2026-01-01T10:00:00Z>
        dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meet> ;
        ssn:implementedBy <.../meetpunt/019e9271-1465-72f2-8291-c289676c3ded/2026-01-01/2026-01-01T10:00:00Z> ;
        pplan:isStepOfPlan <.../hoofdproces/...> .
    ```

2. **De bepalingsmethode** — de methodologie van de meting zelf (bijv. een norm als EN 1948). Die staat op de observatie via `sosa:usedProcedure` en verwijst naar een concept uit de codelijst [`operationeel_bepalingsmethode`](https://github.com/milieuinfo/codelijst-rie-iepr/tree/main/src/source):

    ```turtle
    <.../observatie/...>
        sosa:usedProcedure <https://data.omgeving.vlaanderen.be/id/concept/riepr/bepalingsmethode/EN1948> .
    ```

## 7. Observatieverzamelingen

Eén meting of bemonstering levert doorgaans **meerdere individuele observaties** op (bijv. één per gemeten stof). Die observaties delen een gemeenschappelijke context: dezelfde emissie, hetzelfde meetpunt, hetzelfde moment. Die gedeelde context is de **observatieverzameling** (`riepr:ObservatieVerzameling`, subklasse van `sosa-2023:ObservationCollection`):

```turtle
@prefix sosa-2023: <http://www.w3.org/ns/sosa/> .

# De verzameling (twee segmenten: {uuid}/{created})
<https://data.mjv.omgeving.vlaanderen.be/id/observatieverzameling/019edc4a-1a30-7b33-9e4f-aabbccddeeff/2026-01-01T10:00:00Z>
    a riepr:ObservatieVerzameling ;
    rdfs:label "Meting schoorsteen 1, 1 januari 2026"@nl ;
    # De verzameling zelf wijst naar het feature of interest (exact 1)
    sosa:hasFeatureOfInterest <https://data.mjv.omgeving.vlaanderen.be/id/emissie/019eaca0-b8c6-7096-886c-103c3e21466c> ;
    # en bevat minstens één observatie
    sosa-2023:hasMember <https://data.mjv.omgeving.vlaanderen.be/id/observatie/019edc4a-1a35-7b33-im4f-n9ojk7kgkf4/2026-01-01T10:00:00Z> ,
                       <https://data.mjv.omgeving.vlaanderen.be/id/observatie/019edc4a-1a36-7b33-im4f-n9ojk7kgkf5/2026-01-01T10:00:00Z> ;
    # optioneel: de aangifte waaraan de meting gerelateerd is
    riepr:aangifte <https://data.mjv.omgeving.vlaanderen.be/id/aangifte/019edc4a-1a39-7fr7-mq8j-r3soo1okok8> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime .
```

Elke individuele observatie wijst omgekeerd naar de verzameling via `sosa-2023:isMemberOf` (max 1). Een observatie kan ook **zonder** verzameling bestaan (`isMemberOf` is optioneel).

## 8. Volledig voorbeeld: emissie-observatie

Hieronder volgt een compleet voorbeeld van een emissie-observatie, van gebeurtenis tot resultaat:

```turtle
@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix riepr:   <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#> .
@prefix sosa:    <http://www.w3.org/ns/sosa/> .
@prefix ssn:     <http://www.w3.org/ns/ssn/> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix qudt:    <http://qudt.org/schema/qudt/> .
@prefix unit:    <http://qudt.org/vocab/unit/> .
@prefix dct:     <http://purl.org/dc/terms/> .

# --- Gebeurtenis (Feature of Interest), afgeleid van het emissieproces ---
<https://data.mjv.omgeving.vlaanderen.be/id/emissie/019eaca0-b8c6-7096-886c-103c3e21466c>
    a riepr:Emissie, sosa:FeatureOfInterest, prov:Entity ;
    prov:wasDerivedFrom <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-b8c6-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z> .

# --- Meetpunt (systeem) ---
<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1465-72f2-8291-c289676c3ded/2026-01-01/2026-01-01T10:00:00Z>
    a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1465-72f2-8291-c289676c3ded> .

# --- Observatie ---
<https://data.mjv.omgeving.vlaanderen.be/id/observatie/019edc4a-1a35-7b33-im4f-n9ojk7kgkf4/2026-01-01T10:00:00Z>
    a sosa:Observation ;
    sosa:hasFeatureOfInterest <https://data.mjv.omgeving.vlaanderen.be/id/emissie/019eaca0-b8c6-7096-886c-103c3e21466c> ;
    sosa:observedProperty <https://data.omgeving.vlaanderen.be/id/concept/riepr/observed-property/NOx> ;
    sosa:madeBySensor <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1465-72f2-8291-c289676c3ded/2026-01-01/2026-01-01T10:00:00Z> ;
    sosa:phenomenonTime "2026-01-01T08:00:00Z/2026-01-01T12:00:00Z"^^xsd:dateTimeInterval ;
    sosa:resultTime "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    sosa:hasResult <https://data.mjv.omgeving.vlaanderen.be/id/resultaat/019edc4a-1a40-7b33-im4f-n9ojk7kgkf9> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime .

# --- Resultaat (eigen URI) ---
<https://data.mjv.omgeving.vlaanderen.be/id/resultaat/019edc4a-1a40-7b33-im4f-n9ojk7kgkf9>
    a sosa:Result, prov:Entity ;
    qudt:numericValue "45.2"^^xsd:decimal ;
    qudt:hasUnit unit:MG-PER-M3 .
```

## 9. Volledig observatiepatroon

Hieronder een overzicht van het volledige SOSA/SSN-observatiepatroon met alle gekoppelde entiteiten:

```mermaid
classDiagram
    %% System classes
    class Installatie {
      +String uuid
      String uri
    }
    class Emissiepunt {
      +String uuid
      String uri
    }
    class Meetpunt {
      +String uuid
      String uri
    }

    %% Process classes
    class Proces {
      +String uuid
      String uri
    }

    %% Feature of Interest classes
    class Emissie {
      +String uuid
      String uri
    }
    class Onttrekking {
      +String uuid
      String uri
    }

    %% Observation classes
    class Observatie {
      +String uuid
      +String resultTime
      String uri
    }
    class ObservatieVerzameling {
      +String uuid
      String uri
    }
    class Resultaat {
      +String uuid
      +qudt numericValue
      +qudt hasUnit
      String uri
    }

    %% Process links
    Proces --> Emissiepunt : implementedBy
    Proces --> Meetpunt : implementedBy
    Emissie --> Proces : wasDerivedFrom
    Onttrekking --> Proces : wasDerivedFrom

    %% Observation links
    Observatie --> Emissie : hasFeatureOfInterest
    Observatie --> Onttrekking : hasFeatureOfInterest
    Observatie --> Resultaat : hasResult
    Observatie --> Meetpunt : madeBySensor
    ObservatieVerzameling --> Emissie : hasFeatureOfInterest
    ObservatieVerzameling --> Onttrekking : hasFeatureOfInterest
    Observatie --> ObservatieVerzameling : isMemberOf

    %% System location links
    Emissiepunt --> Exploitatielocatie : isHostedBy
    Meetpunt --> Exploitatielocatie : isHostedBy

    classDef system fill:#e6f4f5,stroke:#007A87,stroke-width:2px
    classDef process fill:#b2e0e3,stroke:#007A87,stroke-width:2px
    classDef foi fill:#007A87,stroke:#005f6a,stroke-width:2px,color:#fff
    classDef observation fill:#fff3cd,stroke:#b8860b,stroke-width:2px

    class Installatie system
    class Emissiepunt system
    class Meetpunt system
    class Proces process
    class Emissie foi
    class Onttrekking foi
    class Observatie observation
    class ObservatieVerzameling observation
    class Resultaat observation
```

## Referenties

- [End-to-end voorbeeld](./endtoend.md) — de volledige keten van exploitant tot gemeten waarde
- [Basisaannames](./basisaanname.md) — Feature of Interest, SOSA/SSN patroon
- [Installaties en emissiepunten](./systemen.md) — fysieke systemen
- [Gebruiksscenario's](./gebruiksscenario.md) — SPARQL-query's voor observaties
- **Codelijsten**: De `observedProperty`-waarden, procedure-types en bepalingsmethodes verwijzen naar SKOS-concepten uit [milieuinfo/codelijst-rie-iepr](https://github.com/milieuinfo/codelijst-rie-iepr/).
