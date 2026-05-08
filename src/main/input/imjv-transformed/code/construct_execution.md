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
# Executielaag → planlaag
<emissie/01787986000160/...>
    pplan:correspondsToVariable
        <variabele/01787986000160_activiteit_19240_rookgas> .

# Executielaag → deploymentlaag
<emissie/01787986000160/...>
    sosa:madeBySystem
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

---

## IRI-patroon

```
https://data.imjv.omgeving.vlaanderen.be/id/observatie/...   # sosa:Observation (massa-emissie)
https://data.imjv.omgeving.vlaanderen.be/id/result/...       # sosa:Result
https://data.imjv.omgeving.vlaanderen.be/id/quantityvalue/...# qudt:QuantityValue
https://data.imjv.omgeving.vlaanderen.be/id/emissie/...      # riepr:Emissie (lucht)
https://data.imjv.omgeving.vlaanderen.be/id/lozing/...       # riepr:Emissie (water)
https://data.imjv.omgeving.vlaanderen.be/id/meetpunt/...     # riepr:Meetpunt
https://data.riepr.omgeving.vlaanderen.be/id/variabele/01787986000160_activiteit_{id}_{medium}
```

Result- en quantityvalue-IRIs worden afgeleid door `id/` te vervangen door `id/result/` of `id/quantityvalue/` in het observatie-IRI.

---

## Gebruikte ontologische predicaten

| Predicaat | Betekenis |
|---|---|
| `pplan:correspondsToVariable` | Emissie is instantie van een planvariabele |
| `sosa:hasFeatureOfInterest` | Observatie meet een eigenschap van de emissie |
| `sosa:observedProperty` | Gemeten stof (chemische stof of sommatiestof) |
| `sosa:hasResult` / `qudt:quantityValue` | Meetresultaat met waarde en eenheid |
| `sosa:usedProcedure` | Bepalingmethode |
| `sosa:madeBySystem` | Emissie uitgestoten via dit emissiepunt |
| `ssn:hasDeployment` | Emissiepunt of meetpunt ingezet in deze exploitatie |

---

## Resultaat

`mjv_execution.ttl` bevat per observatie:

| Resource | Klasse |
|---|---|
| Emissie (lucht of water) | `riepr:Emissie` + `pplan:correspondsToVariable` |
| Emissiepunt / lozingspunt | `riepr:Emissiepunt` |
| Meetpunt | `riepr:Meetpunt` |
| Massa-emissie observatie | `sosa:Observation` |
| Concentratie-observatie (optioneel) | `sosa:Observation` |
| Debiet-observatie (optioneel, lucht) | `sosa:Observation` |
| Emissieduur-observatie (optioneel, lucht) | `sosa:Observation` |
| Meetresultaat | `sosa:Result` + `qudt:QuantityValue` |
| Procesvariabelen | `riepr:ProcesVariabele` |
