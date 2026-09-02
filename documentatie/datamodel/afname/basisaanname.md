# Basisaannames

!!! abstract "Beide stromen"
    Deze pagina behandelt structurele **en** operationele gegevens. Ze zijn hieronder per sectie uit elkaar gehouden en als zodanig gemarkeerd; zie [Twee stromen](./datamodel.md) voor de grens.

Dit document beschrijft de fundamentele aannames en modellen die ten grondslag liggen aan het RIE-IEPR-datamodel, vanuit het perspectief van Linked Open Data (LOD).

## 1. Processen als centraal skelet

Processen vormen het organisatieprincipe van het hele datamodel. **Alles hangt aan het hoofdproces van een exploitatie.** Dit betekent:

- Elke exploitatie implementeert precies één hoofdproces (`ssn:implements`)
- Subprocessen zijn gerelateerd via `pplan:isStepOfPlan`
- Emissie-, onttrekkings-, verwerkings- en meetprocessen zijn subprocessen van het hoofdproces
- Systemen (installaties, emissiepunten, ...) worden geïmplementeerd door processen (`ssn:implementedBy`)

```turtle
@prefix ssn:  <http://www.w3.org/ns/ssn/> .
@prefix pplan: <http://purl.org/net/p-plan#> .

# Exploitatie → hoofdproces
<.../exploitatie/019e9271-1454-7b38-9eae-505cace7ca54/2026-01-01/2026-01-01T10:00:00Z>
    ssn:implements <.../proces/019e9271-1455-78f7-94b6-becb88019f89/2026-01-01/2026-01-01T10:00:00Z> .

# Subproces → hoofdproces
<.../proces/019eaca0-b8c6-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z>
    pplan:isStepOfPlan <.../proces/019e9271-1455-78f7-94b6-becb88019f89/2026-01-01/2026-01-01T10:00:00Z> .

# Proces → systeem
<.../proces/019eaca0-b8c6-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z>
    ssn:implementedBy <.../emissiepunt/019eaca0-b8c6-7096-886c-103c3e21466c/2026-01-01/2026-01-01T10:00:00Z> .
```

### Wat is P-Plan?

[P-Plan](https://www.opmw.org/model/p-plan/) is een community-ontologie (Ontology Engineering Group, een uitbreiding op PROV-O) voor het modelleren van processen als geordende plannen. Ze is geen W3C-aanbeveling. De kernbegrippen:

- Een **`pplan:Plan`** is een (samengesteld) plan van stappen.
- Een **`pplan:Step`** is een individuele stap; `pplan:isStepOfPlan` legt een stap onder een hoger niveau (plan of stap).
- **`pplan:isPrecededBy`** geeft de volgorde aan: welke stap vóór een andere moet plaatsvinden.

In RIE-IEPR is elk `riepr:Proces` tegelijk een `pplan:Plan`, een `pplan:Step` en een `sosa:Procedure`. Het hoofdproces van een exploitatie is het bovenste niveau; alle emissie-, onttrekkings-, verwerkings-, meet- en uitwisselprocessen zijn stappen daaronder (`pplan:isStepOfPlan`) en kunnen met `pplan:isPrecededBy` onderling geordend worden.

## 2. URI-ontwerp en versiebeheer

Het model maakt onderscheid tussen **identity-URI's** (tijdsloos) en **versie-URI's** (met tijd).

### Identity-URI versus versie-URI

| Type | URI-patroon | Voorbeeld | Doel |
|---|---|---|---|
| Identity | `{type}/{uuid}` | `.../exploitatie/019e9271-1454-7b38-9eae-505cace7ca54` | Tijdsloze entiteit, unieke referentie |
| Versie | `{type}/{uuid}/{issued}/{created}` | `.../exploitatie/.../2026-01-01/2026-01-01T10:00:00Z` | Specifieke toestand op een moment |

De relatie tussen versie en identity wordt gelegd via `dct:isVersionOf`:

```turtle
<.../installatie/019e9271-1456-7a2f-ac4e-8904bab88f37/2026-01-01/2026-01-01T10:00:00Z>
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1456-7a2f-ac4e-8904bab88f37> .
```

### Versiebeheer volgt de stroom

Of een entiteit geversioneerd wordt, hangt af van de stroom waartoe ze behoort:

| Stroom | URI | Versiebeheer |
|---|---|---|
| **Structureel**, versioneerbaar (exploitatie, exploitatielocatie, proces, systemen) | `{type}/{uuid}/{issued}/{created}` | ja, met `dct:isVersionOf` |
| **Structureel**, niet-versioneerbaar (exploitant, contactpersoon, systeemeigenschap, rubriek, procesvariabele) | `{type}/{uuid}` | nee |
| **Operationeel** (emissie, onttrekking, verbruik, observatie, verzameling, resultaat) | `{type}/{uuid}` of `{type}/{uuid}/{created}` | nee |

Zie [Versiebeheer en tijdsrecht](./versiebeheer.md) voor het structurele versiebeheer, en [Twee stromen](./datamodel.md) voor de grens tussen beide stromen.

## 3. Exploitatie: twee lagen

Een exploitatie bestaat uit **twee lagen**:

1. **De tijdsloze exploitatie** (identity-URI) — het abstracte concept van de exploitatie
2. **De versies of toestanden** (versie-URI) — elk een specifieke toestand met geldigheid, status en inhoud

```turtle
# Laag 1: tijdsloze exploitatie (identity)
<.../exploitatie/019e9271-1454-7b38-9eae-505cace7ca54>
    a riepr:Exploitatie ;
    prov:hadPrimarySource <https://data.vim.omgeving.vlaanderen.be/TBDTBD> .

# Laag 2: versie/toestand van de exploitatie
<.../exploitatie/019e9271-1454-7b38-9eae-505cace7ca54/2026-01-01/2026-01-01T10:00:00Z>
    a riepr:Exploitatie ;
    dct:isVersionOf <.../exploitatie/019e9271-1454-7b38-9eae-505cace7ca54> ;
    dct:issued "2026-01-01"^^xsd:date ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> .
```

## 4. Proces-procedure koppels (OWL-axioma's)

Het model bevat **OWL-axioma's** die een proces van een bepaald type verplichten om aan een bepaald systeem gekoppeld te zijn. De procestypes komen uit de codelijst **`procedure_type`** ([beheerd in milieuinfo/codelijst-rie-iepr](https://github.com/milieuinfo/codelijst-rie-iepr/)):

| Proces type (`dct:type`) | URI | Moet implementeren (`ssn:implementedBy`) |
|---|---|---|
| Verwerking | `…/procedure-type/verwerking` | `riepr:Installatie` |
| Emissie | `…/procedure-type/emissie` | `riepr:Emissiepunt` |
| Onttrekking | `…/procedure-type/onttrekking` | `riepr:Onttrekkingspunt` |
| Uitwissel | `…/procedure-type/uitwissel` | `riepr:Uitwisselpunt` |
| Meting | `…/procedure-type/meting` | `riepr:Meetpunt` |
| Hoofdactiviteit | `…/procedure-type/hoofdactiviteit` | `riepr:Exploitatie` |
| Transport | `…/procedure-type/transport` | — (geen axioma; verbindt twee processen) |

Dit betekent dat als een proces het type "emissie" heeft, het **per definitie** een emissiepunt moet implementeren. Deze axioma's zijn vastgelegd in de ontologie (`riepr.ttl`) en garanderen dataconsistentie.

!!! warning "Afwijking in de ontologie"
    Het axioma voor het meetproces verwijst in `riepr.ttl` naar `…/procedure-type/meet`, terwijl de codelijst `procedure_type` en het datavoorbeeld `…/procedure-type/meting` gebruiken. De **codelijst is leidend**; het axioma moet nog bijgewerkt worden.

De volledige URI's van de procedure types verwijzen naar [data.omgeving.vlaanderen.be](https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie), waar ze als SKOS-concepten gepubliceerd zijn.

## 5. Disjuncte klassen

Een **meetpunt** is per definitie geen emissiepunt of onttrekkingspunt: `riepr:Meetpunt` staat `owl:disjointWith` `riepr:Emissiepunt` én `riepr:Onttrekkingspunt`.

Een **uitwisselpunt** daarentegen is wél zowel emissiepunt als onttrekkingspunt: `riepr:Uitwisselpunt` is gedefinieerd als equivalent met de doorsnede `Emissiepunt ∩ Onttrekkingspunt` — een bidirectioneel punt waar stoffen zowel kunnen worden uitgestoten als onttrokken (bijv. grondwater: onttrekken en herinfiltreren). Emissiepunt en Onttrekkingspunt zijn daarom onderling níet disjoint; een entiteit kan beide zijn, en dan is het per definitie een uitwisselpunt.

## 6. De grens met de operationele stroom

Het procesplan uit §1 is het **einde** van de structurele stroom. Alles wat gemeten wordt, hangt eraan via precies drie predicaten:

| Predicaat | Van (operationeel) | Naar |
|---|---|---|
| `prov:wasDerivedFrom` | `Emissie`, `Onttrekking`, `Verbruik` | `Proces` (structureel, verplicht) |
| `sosa:madeBySensor` | `Observatie` | het meetpunt (`ssn:System`, optioneel) |
| `riepr:aangifte` | `Observatie`, `ObservatieVerzameling` | `Aangifte` (administratief, optioneel) |

Emissie, onttrekking en verbruik zijn **gebeurtenissen** die als `sosa:FeatureOfInterest` dienen: ze worden niet zelf gemeten, ze zijn het *onderwerp* van de meting.

Het volledige SOSA/SSN-observatiepatroon staat in [Observaties en emissies](./observaties.md); de grens zelf in [Twee stromen](./datamodel.md).

!!! warning "Analyse nog lopende"
    De operationele stroom is nog in analyse en kan na afronding wijzigen.

## 7. Systeemeigenschappen

Systeemeigenschappen (`riepr:Systeemeigenschap`) zijn eigenschappen die betrekking hebben op een systeem (installatie, emissiepunt, meetpunt, ...). Ze worden gekoppeld via `ssn:hasProperty`.

Een systeemeigenschap draagt:

| Eigenschap | Cardinaliteit | Beschrijving |
|---|---|---|
| `dct:type` | 1..1 (verplicht) | Het eigenschapsconcept uit een `*_eigenschappen`-codelijst; dit bepaalt **wat** de eigenschap is |
| `rdfs:value` | 0..1 | De waarde zelf |
| `qudt:hasUnit` | 0..1 | De QUDT-eenheid (bijv. `http://qudt.org/vocab/unit/M`) |
| `riepr:parameter` | 0..1 | Objectproperty naar een concept waar de waarde over gaat (bijv. de chemische stof bij een verwijderingsrendement) |
| `riepr:datatype` | 0..1 | Objectproperty naar het datatype-IRI van de waarde (bijv. `xsd:decimal`) |
| `rdfs:label` | 0..n | Optionele benaming |

`riepr:parameter` en `riepr:datatype` zijn **objectproperties**: hun waarde is altijd een IRI, nooit een tekstliteral.

```turtle
<.../systeemeigenschap/019ecf80-eae8-730f-8fc4-c09b55661a9f>
    a riepr:Systeemeigenschap ;
    # wat: verwijderingsrendement
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/verwijderingsrendement> ;
    # waarvoor: de chemische stof (chloride)
    riepr:parameter <https://data.omgeving.vlaanderen.be/id/concept/chemische_stof/VEXZGXHMUGYJMC-UHFFFAOYSA-M> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:PERCENT .
```

## 8. Provenance en herkomst

Elke entiteit kan een primaire bron hebben via `prov:hadPrimarySource`. Dit traceert waar de data vandaan komt:

- **Exploitanten** → VKBO-onderneming (`org:Organization`)
- **Exploitatielocaties** → VKBO-vestiging (`org:Site`)
- **Exploitaties** → VIM-activiteit

```turtle
<.../exploitant/019e9271-1452-7630-be04-59ea199007a7>
    prov:hadPrimarySource <https://data.vlaanderen.be/id/onderneming/0413638187> .

<.../exploitatielocatie/.../2026-01-01/2026-01-01T10:00:00Z>
    prov:hadPrimarySource <https://data.vlaanderen.be/id/vestiging/2081766488> .
```

## 9. Externe identificatoren (`adms:identifier`)

RIE-IEPR kent twee vormen van identificatie:

- De **URI** (UUID-gebaseerd) is de eigen identity van RIE-IEPR (zie [URI-ontwerp](#2-uri-ontwerp-en-versiebeheer)).
- Een **externe identificator** (`adms:Identifier`) bewaart een code die afkomstig is uit een **bovenliggend of voorgaand bron-systeem**.

`adms:identifier` is dus geen duplicaat van de URI: het is de bewaarde **bron-identificatie**. Zo blijft de data:

- traceerbaar naar de bovenliggende systemen (migratie VMM → RIE-IEPR),
- kruisreferentieerbaar met andere Vlaamse datasets (bijv. INSPIRE/DOMG),
- herkenbaar in herkomst, naast `prov:hadPrimarySource` (zie [Provenance](#8-provenance-en-herkomst)).

### Structuur

Elke externe identificator is een anonieme node met twee onderdelen:

| Onderdeel | Property | Omschrijving |
|---|---|---|
| Bron/systeem | `adms:schemaAgency` | Naam van het systeem waar de code vandaan komt, bijv. `"VMM"`, `"DOMG"` |
| Waarde | `skos:notation` | De code zelf; kan een **datatype** krijgen dat aangeeft welk bron-veld het vertegenwoordigt |

`adms:identifier` is **optioneel** (`minCardinality 0`) en **meervoudig**: een entiteit kan meerdere externe identificatoren tegelijk hebben.

### Schema's (bronnen)

| `adms:schemaAgency` | Bron | Soort code | Voorbeeld `skos:notation` |
|---|---|---|---|
| `VMM` | Voorgaand VMM/MJV-systeem (migratie) | CBB-nummer, apparaat-id, emissiepunt-id, put-id, vergunning-id, ... | `"01787986000160"^^vmm:cbbNummer` |
| `DOMG` | Vlaamse databron / INSPIRE | INSPIRE-identifier | `"BE.VL.000000034.SITE"^^riepr:inspireId` |

> **Let op:** In het datavoorbeeld krijgen `skos:notation`-waarden een datatype uit de dummy-namespace `vmm:` (bijv. `^^vmm:cbbNummer`) óf `riepr:inspireId`. Dit datatype is **illustratief**: het markeert enkel welk bron-veld de code vertegenwoordigt. De code zelf is gewoon een string. De namespace `vmm:` (`<http://vmm.be#>`) dient enkel als placeholder in het voorbeeld.

### Klassen die `adms:identifier` ondersteunen

In de ontologie is `adms:identifier` (0..n) toegestaan op de volgende klassen (in de SHACL-shapes verschijnt dit als `sh:property` met `sh:class adms:Identifier`, `sh:minCount 0`):

| Klasse | Ook in het datavoorbeeld? |
|---|---|
| `riepr:Exploitatie` | ja (VMM/CBB) |
| `riepr:Exploitatielocatie` | ja (DOMG/INSPIRE) |
| `riepr:Proces` | ja (VMM) |
| `riepr:Installatie` | ja (VMM/apparaat, DOMG-INSPIRE) |
| `riepr:Emissiepunt` | ja (VMM/emissiepunt) |
| `riepr:Onttrekkingspunt` | ja (VMM/meerdere) |
| `riepr:Uitwisselpunt` | nee (nog geen transferpunten in het voorbeeld) |
| `riepr:Meetpunt` | ja (VMM/lozings- en onttrekkingspunt) |
| `riepr:Filter` | ja (VMM/filter) |

### Voorbeelden (uit `datavoorbeelden/`)

**Enkele** externe identificatoren op een exploitatielocatie (INSPIRE/DOMG) en een exploitatie (VMM-migratie):

```turtle
@prefix adms:  <http://www.w3.org/ns/adms#> .
@prefix skos:  <http://www.w3.org/2004/02/skos/core#> .
@prefix vmm:   <http://vmm.be#> .
@prefix riepr: <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#> .

# Exploitatielocatie: INSPIRE-identifier uit DOMG
<.../exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z>
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "DOMG" ;
        skos:notation "BE.VL.000000034.SITE"^^riepr:inspireId ] .

# Exploitatie: CBB-nummer uit VMM (migratie)
<.../exploitatie/019e9271-1454-7b38-9eae-505cace7ca54/2026-01-01/2026-01-01T10:00:00Z>
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "01787986000160"^^vmm:cbbNummer ] .
```

**Meerdere** identificatoren op één onttrekkingspunt (elk een ander VMM-bron-veld):

```turtle
<.../onttrekkingspunt/019e9271-1463-719b-948f-22a102653d02/2026-01-01/2026-01-01T10:00:00Z>
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46769"^^vmm:onttrekkingspuntCode
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-010762"^^vmm:exploitantID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-052596"^^vmm:vergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-043747"^^vmm:putID ] .
```

### Afname (SPARQL)

Externe identificatoren laten zich filteren op schema-agentschap en notatie. Let daarbij op de anonieme nodes (`adms:Identifier`):

```sparql
PREFIX adms:  <http://www.w3.org/ns/adms#>
PREFIX skos:  <http://www.w3.org/2004/02/skos/core#>
PREFIX riepr: <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#>

# Onttrekkingspunten met een specifieke VMM-put-id
SELECT ?put WHERE {
    ?put a riepr:Onttrekkingspunt ;
         adms:identifier ?id .
    ?id adms:schemaAgency "VMM" ;
        skos:notation ?notatie .
    FILTER(STR(?notatie) = "2019-043747")
}
```

!!! warning "Vergelijk op `STR()`, niet op de literal zelf"
    De `skos:notation`-waarden dragen een **datatype** (bijv. `^^vmm:putID`). Een SPARQL-vergelijking met een gewone string (`skos:notation "2019-043747"`) levert daarom **geen** resultaten op: `"2019-043747"^^xsd:string` en `"2019-043747"^^vmm:putID` zijn verschillende RDF-termen. Gebruik `STR(?notatie)` of vermeld het exacte datatype.

Zie ook [Gebruiksscenario's](./gebruiksscenario.md) voor bredere afname-voorbeelden.

## Referenties

- [Gebruiksscenario's](./gebruiksscenario.md) — concrete voorbeelden van data-afname
- [Exploitant- en exploitatiemodel](./exploitant.md) — organisaties, locaties, activiteiten
- [Versiebeheer en tijdsrecht](./versiebeheer.md) — versies, geldigheid, historische query's
