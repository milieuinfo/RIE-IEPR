# construct_plan — planlaag IMJV → RIEPR

## Doel

`mjv_plan.ttl` beschrijft de **planlaag** van het RIEPR-datamodel voor AGC Glass Europe Mol (exploitatie `01787986000160`, rapporteringsjaar 2021).

De planlaag modelleert *welk industrieel proces* de deployment uitvoert — zonder metingen, coördinaten of jaarinformatie. Die zit in de deploymentlaag (`mjv_deployment.ttl`).

Huidig voorbeeld volgt hetzelfde `riepr:Proces`-patroon als `src/main/input/activiteit/03-staalfabriek.ttl`.

---

## Relatie tot de deploymentlaag

De planlaag is **niet** uit de IMJV-triplestore op te halen (die bevat geen procesmodellering). Ze wordt handmatig afgeleid van de deploymentlaag door de concrete installaties en emissiepunten te vertalen naar abstracte processtappen.

De brug tussen de twee lagen staat in `mjv_deployment.ttl`:

```turtle
<exploitatie/01787986000160/jaar/2021>
    ssn:implements  <proces/01787986000160_2021> .
```

En omgekeerd, in `mjv_plan.ttl` per processtap:

```turtle
proces:01787986000160_uitstoot_2269
    sosa:implementedBy  <emissiepunt/.../2269/jaar/2021> .
```

---

## Structuur van het planbestand

### Laagvolgorde

```
Hoofdproces (1)
├── Activiteits-sub-processen (9)  — één per ns1:Installatie
│   └── Uitstoot-/lozing-sub-processen  — één per emissiepunt/lozingspunt
└── Grondwaterproces (1)
    ├── Onttrekkings-sub-processen (5)  — één per pompput
    └── Monitorings-sub-proces (1)      — peilput
```

### Activiteiten en hun emissiepunten

| activiteit-IRI | Label | sub-proces type | emissiepunt/lozingspunt |
|---|---|---|---|
| `activiteit/19240` | GLASOVEN | uitstoot lucht | `emissiepunt/.../2269` |
| `activiteit/19242` | Steam reformer rechts | uitstoot lucht | `emissiepunt/.../13144` |
| `activiteit/19241` | Steam reformer links | uitstoot lucht | `emissiepunt/.../13143` |
| `activiteit/13239` | STOOKINSTALLATIES EN STOOMKETELS | uitstoot lucht | `emissiepunt/.../8059` |
| `activiteit/10581` | ELEKTRISCHE DROOGOVEN MET NAVERBRANDER | uitstoot lucht | `emissiepunt/.../8058` |
| `activiteit/1178` | ETSLIJN 1 etsafdeling | uitstoot lucht | `emissiepunt/.../2271` |
| `activiteit/19105` | ETSLIJN 2 etsafdeling | uitstoot lucht | `emissiepunt/.../13005` |
| `activiteit/13241` | VACUUMPOMPEN | uitstoot lucht | `emissiepunt/.../6295` |
| `activiteit/323` | Vormen en bewerken van vlakglas | lozing water | `lozingspunt/.../2400007`, `lozingspunt/.../2400006` |

### IRI-patroon

```
https://data.riepr.omgeving.vlaanderen.be/id/proces/01787986000160_2021           # hoofdproces
https://data.riepr.omgeving.vlaanderen.be/id/proces/01787986000160_activiteit_323  # activiteits-sub-proces
https://data.riepr.omgeving.vlaanderen.be/id/proces/01787986000160_uitstoot_2269   # uitstoot-sub-proces
https://data.riepr.omgeving.vlaanderen.be/id/proces/01787986000160_lozing_2400006  # lozing-sub-proces
https://data.riepr.omgeving.vlaanderen.be/id/proces/01787986000160_grondwater      # grondwaterproces
https://data.riepr.omgeving.vlaanderen.be/id/proces/01787986000160_onttrekking_2019-043747  # pompput-sub-proces
https://data.riepr.omgeving.vlaanderen.be/id/proces/01787986000160_monitoring_peilput       # peilput-sub-proces
https://data.riepr.omgeving.vlaanderen.be/id/stof/rookgas                          # procesvariabele
```

---

## Gebruikte ontologische predicaten

| Predicaat | Betekenis |
|---|---|
| `pplan:isStepOfPlan` | Sub-proces behoort tot ouderproces |
| `pplan:hasInputVar` / `pplan:hasOutputVar` | In-/uitvoerstof van het proces |
| `sosa:implementedBy` | Abstracte processtap wordt uitgevoerd door concrete resource |
| `dct:type riepr:uitstootProces` | Emissie of lozing naar lucht/water |
| `dct:type riepr:onttrekkingsProces` | Grondwateronttrekking |
| `dct:type riepr:meetProces` | Grondwaterstandmonitoring |

---

## Resultaat

`mjv_plan.ttl` bevat:

| Klasse | Aantal |
|---|---|
| `riepr:Proces` (hoofdproces) | 1 |
| `riepr:Proces` (activiteits-sub-processen) | 9 |
| `riepr:Proces` (uitstoot lucht) | 8 |
| `riepr:Proces` (lozing water) | 2 |
| `riepr:Proces` (grondwater) | 1 |
| `riepr:Proces` (pompput-onttrekking) | 5 |
| `riepr:Proces` (peilput-monitoring) | 1 |
| `riepr:ProcesVariabele` | 3 |
| **Totaal subjects** | **30** |
