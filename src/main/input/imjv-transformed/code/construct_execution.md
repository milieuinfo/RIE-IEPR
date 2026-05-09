# construct_execution — executielaag IMJV → RIEPR

## Doel

`construct_execution.rq` genereert de executielaag van het RIEPR-datamodel vanuit IMJV-brondata via een SPARQL CONSTRUCT-query op de Virtuoso-triplestore (`virtuoso-imjv-pr-1.vm.cumuli.be`).

Het resultaat (`mjv_execution.ttl`) beschrijft voor één exploitatie en één rapporteringsjaar welke emissies effectief gemeten zijn, welke stoffen daarbij gemeten werden en wat de gemeten waarden zijn.

Huidig voorbeeld: AGC Glass Europe Mol, exploitatie `01787986000160`, rapporteringsjaar 2021.

## Uitvoeren

```bash
cd src/main/input/imjv-transformed/code
bash construct_execution.sh
```

Het script voert twee SPARQL CONSTRUCT-queries uit:

1. `construct_execution.rq` — haalt emissie-observaties op
2. `construct_properties.rq` — haalt dimensionale eigenschappen (hoogte, diameter, diepte, lengte, diepteOnderkant) op van grondwatersystemen en emissiepunten

Beide TTL-resultaten worden samengevoegd via `riot` en geformateerd met de prefix-declaraties uit `source/prefix.ttl`.

---

## Positie in het RIEPR-datamodel

De executielaag is de derde laag in het RIEPR-model:

```
Plan       → mjv_plan.ttl       (welke processen zijn gepland)
Deployment → mjv_deployment.ttl (welke systemen zijn ingezet)
Execution  → mjv_execution.ttl  (wat is er gemeten)
```

De brug tussen de lagen:

```turtle
@prefix prov: <http://www.w3.org/ns/prov#> .
# Executielaag → planlaag
<emissie/01787986000160/...>
    pplan:correspondsToVariable
        <variabele/01787986000160_activiteit_19240_rookgas> .

# Executielaag → deploymentlaag
<emissie/01787986000160/...>
    prov:wasAttributedTo
        <emissiepunt/01787986000160/2269/jaar/2021> .
```

---

## Brondata

De query vertrekt van de **CBB-URI** als anker, bereikt observaties via het emissiepunt:

```
https://data.cbb.omgeving.vlaanderen.be/id/exploitatie/01787986000160
```

```sparql
?emissiepuntToestand imjv:exploitatie <cbb-uri>
?obs imjv:emissiepuntToestand ?emissiepuntToestand
?obs schema:about ?emissie
```

Dit verschilt van `construct.rq` dat op de IMJV-URI (`data.imjv…`) verankert en daar direct `?obs imjv:exploitatie` bevragt.

---

## Agent

De CONSTRUCT-clausule definieert één vaste agent-resource:

```turtle
agent:labo_mens_sensor_x a sosa:Sensor, prov:Agent .
```

Dit is een placeholder voor de sensor, het labo of de persoon die de observaties uitvoert. Alle observaties (massa, concentratie, debiet, emissieduur) hebben `sosa:madeBySensor agent:labo_mens_sensor_x`.

---

## Structuur van de query

### Blok 1 — anker (één rij per massa-observatie)

Vertrekt van `?emissiepuntToestand imjv:exploitatie <cbb-uri>` en haalt `?activiteit` via `imjv:gekoppeldeActiviteit`. Daarna join op `?obs imjv:emissiepuntToestand`.

Optioneel: `dct:type`, `imjv:debiet`, `imjv:emissieDuur` op het emissie-entiteit — deze bestaan niet voor waterlozingen.

### Blok 2 — stofmeting (inner join op `?obs`)

Haalt stof, eenheid, hoeveelheid en bepalingmethode voor elke observatie.

### Blok 3 — concentratie (OPTIONAL)

Haalt de concentratiemeting indien aanwezig (`imjv:concentratie`).

### Blok 4 — debiet (OPTIONAL)

Haalt de debietmeting indien aanwezig (`?emissie imjv:debiet ?debiet`). Alleen voor luchtemissies.

### Blok 5 — emissieduur (OPTIONAL)

Haalt de emissieduurmeting indien aanwezig (`?emissie imjv:emissieDuur`). Alleen voor luchtemissies.

### Blok 6 — procesvar-detectie (OPTIONAL)

Detecteert lozingspunten via `a imjv:LozingspuntStaat` om het medium (`proceswater`/`rookgas`) te bepalen.

### BINDs — afgeleide IRIs en emissievar

```sparql
BIND(IF(BOUND(?procesVar), "proceswater", "rookgas") AS ?medium)
BIND(IRI(CONCAT(
    "https://data.riepr.omgeving.vlaanderen.be/id/variabele/",
    REPLACE(STR(?emissiepuntToestand), "^.../id/[^/]+/([^/]+)/.*", "$1"),
    "_activiteit_",
    REPLACE(STR(?activiteit), "^.*/", ""),
    "_", ?medium)) AS ?emissieVar)
```

`?emissieVar` matcht exact de variabele-IRI uit `mjv_plan.ttl`.

De emissiepunt- en meetpunt-triples (`prov:wasRevisionOf`, `ssn:hasSubSystem ?meetput`, `?meetput a :Meetpunt`) zijn verplaatst naar de deploymentlaag (`construct_deployment.rq`). De bijhorende BINDs (`?emissiepunt`, `?meetput`) komen dus niet voor in `construct_execution.rq`.

---

## IRI-patroon

```
https://data.riepr.omgeving.vlaanderen.be/id/agent/labo_mens_sensor_x   # sosa:Sensor, prov:Agent
https://data.imjv.omgeving.vlaanderen.be/id/observatie/...              # sosa:Observation (massa-emissie)
https://data.imjv.omgeving.vlaanderen.be/id/result/...                  # sosa:Result
https://data.imjv.omgeving.vlaanderen.be/id/quantityvalue/...           # qudt:QuantityValue
https://data.imjv.omgeving.vlaanderen.be/id/emissie/...                 # riepr:Emissie (lucht)
https://data.imjv.omgeving.vlaanderen.be/id/lozing/...                  # riepr:Emissie (water)
https://data.riepr.omgeving.vlaanderen.be/id/variabele/01787986000160_activiteit_{id}_{medium}
```

Result- en quantityvalue-IRIs worden afgeleid door `id/` te vervangen door `id/result/` of `id/quantityvalue/` in het observatie-IRI. Meetpunt-IRIs staan uitsluitend in de deploymentlaag (`mjv_deployment.ttl`).

---

## Gebruikte ontologische predicaten

| Predicaat                               | Betekenis |
|-----------------------------------------|---|
| `pplan:correspondsToVariable`           | Emissie is instantie van een planvariabele |
| `sosa:madeBySensor`                     | Observatie uitgevoerd door de agent (placeholder) |
| `sosa:hasFeatureOfInterest`             | Observatie meet een eigenschap van de emissie |
| `sosa:observedProperty`                 | Gemeten stof (chemische stof of sommatiestof) |
| `sosa:hasResult` / `qudt:quantityValue` | Meetresultaat met waarde en eenheid |
| `sosa:usedProcedure`                    | Bepalingmethode |
| `prov:wasAttributedTo`                  | Emissie uitgestoten via dit emissiepunt |

---

## Resultaat

`mjv_execution.ttl` bevat de uitvoer van zowel `construct_execution.rq` als `construct_properties.rq`:

| Resource | Klasse |
|---|---|
| Agent (sensor/labo/persoon) | `sosa:Sensor`, `prov:Agent` |
| Emissie (lucht of water) | `riepr:Emissie` + `pplan:correspondsToVariable` |
| Massa-emissie observatie | `sosa:Observation` (+ `sosa:madeBySensor`) |
| Concentratie-observatie (optioneel) | `sosa:Observation` (+ `sosa:madeBySensor`) |
| Debiet-observatie (optioneel, lucht) | `sosa:Observation` (+ `sosa:madeBySensor`) |
| Emissieduur-observatie (optioneel, lucht) | `sosa:Observation` (+ `sosa:madeBySensor`) |
| Dimensionale meting (hoogte/diameter/diepte/lengte/diepteOnderkant) | `sosa:Observation` (+ `sosa:madeBySensor`) |
| Meetresultaat | `sosa:Result` + `qudt:QuantityValue` |
| Procesvariabelen | `riepr:ProcesVariabele` |

Emissiepunt- en meetpunt-resources zijn verplaatst naar de deploymentlaag en komen niet meer voor in `mjv_execution.ttl`.
