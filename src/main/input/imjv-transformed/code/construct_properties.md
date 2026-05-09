# construct_properties — dimensionale eigenschappen IMJV → RIEPR

## Doel

`construct_properties.rq` haalt dimensionale eigenschappen op van grondwatersystemen en emissiepunten voor één exploitatie en één rapporteringsjaar. Het resultaat wordt samengevoegd met `mjv_execution.ttl` door het `construct_execution.sh`-script.

Huidig voorbeeld: AGC Glass Europe Mol, exploitatie `01787986000160`, rapporteringsjaar 2021.

## Uitvoeren

```bash
cd src/main/input/imjv-transformed/code
bash construct_execution.sh
```

`construct_properties.rq` wordt niet zelfstandig uitgevoerd — `construct_execution.sh` voert beide queries uit en voegt de resultaten samen.

---

## Positie in het RIEPR-datamodel

Deze query vult de executielaag aan met metingen van structurele eigenschappen die los staan van emissies:

```
Execution → mjv_execution.ttl (emissie-observaties + structurele eigenschappen)
```

De structurele eigenschappen beschrijven het fysieke systeem (diepte van filters, diameter van putten, …) en worden als `sosa:Observation` gemodelleerd op dezelfde manier als emissiemetingen.

---

## Brondata

De query vertrekt van de **CBB-URI** als anker:

```
https://data.cbb.omgeving.vlaanderen.be/id/exploitatie/01787986000160
```

Via `?parent imjv:exploitatie ?cbb` worden alle gerelateerde systemen (emissiepunten, pompputten, peilputten, pompfilters, peilfilters) als ouder opgehaald. Per ouder worden de properties gehaald die aanwezig zijn:

| Eigenschap | Predicaat |
|---|---|
| Hoogte | `imjv:hoogte` |
| Diameter | `imjv:diameter` |
| Diepte | `imjv:diepte` |
| Lengte | `imjv:lengte` |
| Diepte onderkant | `imjv:diepteOnderkant` |

---

## Structuur van de query

De WHERE-clausule bevat één UNION met vijf branches, één per eigenschap. Elke branch volgt hetzelfde patroon:

```sparql
{ ?parent imjv:exploitatie ?cbb ; imjv:hoogte ?waarde .
  BIND(imjv:hoogte AS ?property) }
UNION
{ ?parent imjv:exploitatie ?cbb ; imjv:diameter ?waarde .
  BIND(imjv:diameter AS ?property) }
...
```

Per rij bindt de query:
- `?waarde` — de IMJV-resource die de meetwaarde draagt (IRI afkomstig uit de triplestore)
- `?property` — het predicaat als concept-IRI (gebruikt als `sosa:observedProperty`)
- `?value` — de numerieke waarde (`rdf:value`)
- `?unit` — de eenheid (`sdmxa:unitMeasure`)
- `?result` = `IRI(CONCAT(STR(?waarde), "/result"))`
- `?qv` = `IRI(CONCAT(STR(?waarde), "/qv"))`

---

## IRI-patroon

```
https://data.imjv.omgeving.vlaanderen.be/id/{type}/{id}/jaar/2021/{eigenschap}   # sosa:Observation
https://data.imjv.omgeving.vlaanderen.be/id/{type}/{id}/jaar/2021/{eigenschap}/result  # sosa:Result
https://data.imjv.omgeving.vlaanderen.be/id/{type}/{id}/jaar/2021/{eigenschap}/qv     # qudt:QuantityValue
https://data.imjv.omgeving.vlaanderen.be/ns/imjv#hoogte (en andere)                  # sosa:Property
```

Waarbij `{type}` het systeemtype is (`pompfilter`, `peilfilter`, `pompput`, `peilput`, `emissiepunt`) en `{eigenschap}` het IMJV-predicaat zonder namespace-prefix.

---

## Gebruikte ontologische predicaten

| Predicaat | Betekenis |
|---|---|
| `sosa:madeBySensor` | Observatie uitgevoerd door de agent (placeholder) |
| `sosa:hasFeatureOfInterest` | Systeem waarvan de eigenschap gemeten werd |
| `sosa:observedProperty` | Eigenschap (hoogte, diameter, …) als concept-IRI |
| `sosa:hasResult` / `qudt:quantityValue` | Meetresultaat met waarde en eenheid |

---

## Resultaat

Per meting worden drie resources aangemaakt:

| Resource | Klasse | Opmerking |
|---|---|---|
| Observatie | `sosa:Observation` | IRI afkomstig uit IMJV |
| Meetresultaat | `sosa:Result` | Afgeleid via `+"/result"` |
| Meetwaarde | `qudt:QuantityValue` | Afgeleid via `+"/qv"` |
| Eigenschap | `sosa:Property`, `sosa:ObservableProperty` | Concept-IRI uit IMJV namespace |
