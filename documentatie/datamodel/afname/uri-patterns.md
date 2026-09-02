# URI-patronen en Hydra templates

!!! abstract "Beide stromen"
    Deze pagina behandelt structurele **en** operationele gegevens. Ze zijn hieronder per sectie uit elkaar gehouden en als zodanig gemarkeerd; zie [Twee stromen](./datamodel.md) voor de grens.

De RIE-IEPR-ontologie definieert voor elke klasse een URI-patroon via `hydra:IriTemplate`. Daardoor zijn resources machinaal vindbaar en construeerbaar.

## Algemene principes

- **Identity URI** `{type}/{uuid}` – tijdsloze entiteit
- **Versie URI** `{type}/{uuid}/{issued}/{created}` – specifieke toestand
- **Feature of Interest** (emissie, onttrekking, verbruik) – enkel `{type}/{uuid}`, geen versie
- Relatie `dct:isVersionOf` verbindt versie aan identity

## Hydra templates per klasse

De variabelen mappen op de volgende eigenschappen: `uuid` en `ondernemingsnummer` op `:localId`, `vlaanderenId` op `:vlaanderenId`, `issued` op `dct:issued` en `created` op `dct:created`.

De kolom **Tijdsegmenten** telt de segmenten die na de identifier komen: `0` = geen versiebeheer, `1` = enkel `created`, `2` = `issued` + `created` (volwaardig versiebeheer).

### Structurele gegevens

| Klasse | Hydra template | Tijdsegmenten |
|---|---|---|
| Exploitatie | `.../id/exploitatie/{uuid}/{issued}/{created}` | 2 |
| Exploitatielocatie | `.../id/exploitatielocatie/{uuid}/{issued}/{created}` | 2 |
| Proces | `.../id/proces/{uuid}/{issued}/{created}` | 2 |
| Installatie | `.../id/installatie/{uuid}/{issued}/{created}` | 2 |
| Emissiepunt | `.../id/emissiepunt/{uuid}/{issued}/{created}` | 2 |
| Onttrekkingspunt | `.../id/onttrekkingspunt/{uuid}/{issued}/{created}` | 2 |
| Uitwisselpunt | `.../id/uitwisselpunt/{uuid}/{issued}/{created}` | 2 |
| Meetpunt | `.../id/meetpunt/{uuid}/{issued}/{created}` | 2 |
| Filter | `.../id/filter/{uuid}` en `.../id/filter/{uuid}/{issued}/{created}` | 0 en 2 |
| Exploitant | `.../id/exploitant/{ondernemingsnummer}` | 0 |
| Contactpersoon | `.../id/contactpersoon/{uuid}` | 0 |
| Procesvariabele | `.../id/procesvariabele/{uuid}` | 0 |
| Systeemeigenschap | `.../id/systeemeigenschap/{uuid}` | 0 |
| Rubriek | `.../id/rubriek/{uuid}` | 0 |

### Operationele gegevens

!!! warning "Analyse nog lopende"
    De operationele stroom is nog in analyse; deze patronen kunnen wijzigen.

| Klasse | Hydra template | Tijdsegmenten |
|---|---|---|
| Emissie | `.../id/emissie/{uuid}` | 0 (Feature of Interest) |
| Onttrekking | `.../id/onttrekking/{uuid}` | 0 (Feature of Interest) |
| Verbruik | `.../id/verbruik/{uuid}` | 0 (Feature of Interest) |
| Observatie | `.../id/observatie/{uuid}/{created}` | 1 (geen `issued`) |
| ObservatieVerzameling | `.../id/observatieverzameling/{uuid}/{created}` | 1 (geen `issued`) |
| Resultaat | `.../id/resultaat/{uuid}` | 0 |

### Administratief

| Klasse | Hydra template | Tijdsegmenten |
|---|---|---|
| Aangifte | `.../id/aangifte/{vlaanderenId}` | 0 (op `:vlaanderenId`, geen UUID) |
| Aangiftebundel | `.../id/aangifte/{vlaanderenId}` | 0 (zelfde patroon als Aangifte) |

Alle templates beginnen met `https://data.mjv.omgeving.vlaanderen.be`.

!!! note "Bekende afwijkingen tussen ontologie en datavoorbeeld"
    - De ontologie geeft `riepr:Exploitant` de variabele `{ondernemingsnummer}`; in het datavoorbeeld en in de rest van deze documentatie draagt de exploitant een UUID. Beide worden op `:localId` gemapt, maar welke sleutel de productie-URI gebruikt, is nog niet vastgelegd.
    - `riepr:Filter` heeft in de ontologie twee templates (identity én versie). Alleen de versievorm wordt in de data gebruikt.
    - Het template van `riepr:Contactpersoon` bevat wel een mapping voor `issued`, maar geen `{issued}`-variabele; de contactpersoon wordt niet geversioneerd.

## Voorbeeld

```turtle
@prefix :     <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#> .
@prefix hydra: <http://www.w3.org/ns/hydra/core#> .
@prefix dct:  <http://purl.org/dc/terms/> .

:Installatie hydra:search [
    a hydra:IriTemplate ;
    hydra:template "https://data.mjv.omgeving.vlaanderen.be/id/installatie/{uuid}/{issued}/{created}"^^hydra:Rfc6570Template ;
    hydra:mapping [
        hydra:variable "uuid" ; hydra:property :localId ; hydra:required true
    ] , [
        hydra:variable "issued" ; hydra:property dct:issued ; hydra:required true
    ] , [
        hydra:variable "created" ; hydra:property dct:created ; hydra:required true
    ]
] .
```

Zie ook [Basisaannames](basisaanname.md) voor URI-ontwerp en versiebeheer.
