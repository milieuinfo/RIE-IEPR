# URI-patronen en Hydra templates

De RIE-IEPR ontologie definieert URI-patronen voor elke klasse via Hydra `hydra:IriTemplate`. Dit maakt machinaal vindbaar en genereerbaar van resources.

## Algemene principes

- **Identity URI** `{type}/{uuid}` – tijdsloze entiteit
- **Versie URI** `{type}/{uuid}/{issued}/{created}` – specifieke toestand
- **Feature of Interest** – twee segmenten, geen versie
- Relatie `dct:isVersionOf` verbindt versie aan identity

## Hydra templates per klasse

De variabele `uuid` mapt altijd op `:localId` (de UUID); `issued` op `dct:issued` en `created` op `dct:created`.

| Klasse | Hydra template | Segments |
|---|---|---|
| Exploitant | `.../id/exploitant/{ondernemingsnummer}` | 2 |
| Contactpersoon | `.../id/contactpersoon/{uuid}` | 2 (geen versie) |
| Exploitatie | `.../id/exploitatie/{uuid}/{issued}/{created}` | 3 (versie) |
| Exploitatielocatie | `.../id/exploitatielocatie/{uuid}/{issued}/{created}` | 3 (versie) |
| Proces | `.../id/proces/{uuid}/{issued}/{created}` | 3 (versie) |
| Procesvariabele | `.../id/procesvariabele/{uuid}` | 2 |
| Installatie | `.../id/installatie/{uuid}/{issued}/{created}` | 3 (versie) |
| Emissiepunt | `.../id/emissiepunt/{uuid}/{issued}/{created}` | 3 (versie) |
| Systeemeigenschap | `.../id/systeemeigenschap/{uuid}` | 2 |
| Onttrekkingspunt | `.../id/onttrekkingspunt/{uuid}/{issued}/{created}` | 3 (versie) |
| Uitwisselpunt | `.../id/uitwisselpunt/{uuid}/{issued}/{created}` | 3 (versie) |
| Meetpunt | `.../id/meetpunt/{uuid}/{issued}/{created}` | 3 (versie) |
| Filter | `.../id/filter/{uuid}/{issued}/{created}` | 3 (versie) |
| Rubriek | `.../id/rubriek/{uuid}` | 2 |
| Emissie | `.../id/emissie/{uuid}` | 2 (Feature of Interest, geen versie) |
| Onttrekking | `.../id/onttrekking/{uuid}` | 2 (Feature of Interest, geen versie) |
| Observatie | `.../id/observatie/{uuid}/{created}` | 2 (met aanmaaktimestamp, geen `issued`) |
| ObservatieVerzameling | `.../id/observatieverzameling/{uuid}/{created}` | 2 (met aanmaaktimestamp, geen `issued`) |
| Resultaat | `.../id/resultaat/{uuid}` | 2 |
| Aangifte | `.../id/aangifte/{vlaanderenId}` | 2 (op `:vlaanderenId`, geen UUID) |
| Aangiftebundel | `.../id/aangifte/{vlaanderenId}` | 2 (zelfde patroon als Aangifte) |

Alle templates beginnen met `https://data.mjv.omgeving.vlaanderen.be`.

## Voorbeeld

```turtle
@prefix hydra: <http://www.w3.org/ns/hydra/core#> .
@prefix dct: <http://purl.org/dc/terms/> .

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
