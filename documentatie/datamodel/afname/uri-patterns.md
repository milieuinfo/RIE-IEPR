# URI-patronen en Hydra templates

De RIE-IEPR ontologie definieert URI-patronen voor elke klasse via Hydra `hydra:IriTemplate`. Dit maakt machinaal vindbaar en genereerbaar van resources.

## Algemene principes

- **Identity URI** `{type}/{uuid}` – tijdsloze entiteit
- **Versie URI** `{type}/{uuid}/{issued}/{created}` – specifieke toestand
- **Feature of Interest** – twee segmenten, geen versie
- Relatie `dct:isVersionOf` verbindt versie aan identity

## Hydra templates per klasse

| Klasse | Hydra template | Variabelen |
|---|---|---|
| Exploitant | `https://data.mjv.omgeving.vlaanderen.be/id/exploitant/{ondernemingsnummer}` | `ondernemingsnummer` → `:localId` |
| Contactgegevens | `https://data.mjv.omgeving.vlaanderen.be/id/contactgegevens/{uuid}/{created}` | `uuid` → `:localId`, `issued` → `dct:issued`, `created` → `dct:created` |
| Exploitatie | `https://data.mjv.omgeving.vlaanderen.be/id/exploitatie/{localId}/{issued}/{created}` | `localId`, `issued`, `created` |
| Exploitatielocatie | `https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/{localId}/{issued}/{created}` | `localId`, `issued`, `created` |
| Proces | `https://data.mjv.omgeving.vlaanderen.be/id/proces/{localId}/{issued}/{created}` | `localId`, `issued`, `created` |
| Procesvariabele | `https://data.mjv.omgeving.vlaanderen.be/id/procesvariabele/{uuid}` | `uuid` → `:localId` |
| Installatie | `https://data.mjv.omgeving.vlaanderen.be/id/installatie/{uuid}/{issued}/{created}` | `uuid`, `issued`, `created` |
| Emissiepunt | `https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/{uuid}/{issued}/{created}` | `uuid`, `issued`, `created` |
| Systeemeigenschap | `https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/{uuid}` | `uuid` → `:localId` |
| Onttrekkingspunt | `https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/{uuid}/{issued}/{created}` | `uuid`, `issued`, `created` |
| Uitwisselpunt | `https://data.mjv.omgeving.vlaanderen.be/id/uitwisselpunt/{uuid}/{issued}/{created}` | `uuid`, `issued`, `created` |
| Meetpunt | `https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/{uuid}/{issued}/{created}` | `uuid`, `issued`, `created` |
| Meetinstrument | `https://data.mjv.omgeving.vlaanderen.be/id/meetinstrument/{uuid}/{issued}/{created}` | `uuid`, `issued`, `created` |
| Filter | `https://data.mjv.omgeving.vlaanderen.be/id/filter/{uuid}/{issued}/{created}` | `uuid`, `issued`, `created` |
| Uitwisseling | `https://data.mjv.omgeving.vlaanderen.be/id/uitwisseling/{uuid}` | `uuid` → `:localId` |
| Onttrekking | `https://data.mjv.omgeving.vlaanderen.be/id/onttrekking/{uuid}` | `uuid` → `:localId` |
| Emissie | `https://data.mjv.omgeving.vlaanderen.be/id/emissie/{uuid}` | `uuid` → `:localId` |

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
