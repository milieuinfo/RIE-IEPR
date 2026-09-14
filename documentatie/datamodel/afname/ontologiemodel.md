---
hide:
  - title
---

# Ontologiemodel

Dit diagram toont de [RIE-IEPR-ontologie](https://github.com/milieuinfo/RIE-IEPR/blob/main/src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl) als
ER-diagram: alle klassen met hun ontologie-prefix, de generalisatie-hierarchie
(`rdfs:subClassOf`) en de object-properties tussen klassen. In tegenstelling
tot de applicatie-modeldiagrammen
(`class-diagram` / `er-diagram` onder `documentatie/datamodel/diagrammen/`, met
SQL-tabellen en Nederlandse conceptnamen) documenteert dit diagram de
ontologie zelf.

!!! note "Automatisch gegenereerd"
    Het diagram wordt gegenereerd door ODDToolkit uit `riepr.ttl`
    (`mvn generate-resources` -> `diagrammen/ontology-diagram.mmd` en
    `diagrammen/ontology-diagram.png`) en bij de build in deze pagina
    geplaatst. Wijzig de ontologie in de TTL, niet dit diagram.

## Notatie

| Notatie | Betekenis |
|---|---|
| `Sub -.-> Super` | `Sub` is een subclass van `Super` (`rdfs:subClassOf`), **rode stippellijn** |
| `A -->|naam| B` | object-property `naam` van `A` naar `B`, zwarte vol lijn met label |
| `prefix.Naam` | klasse uit de ontologie met de gegeven prefix: `riepr.` (dit model), `ssn.`, `sosa.`, `pplan.`, `prov.`, `ogc.`, `qudt.`, `org.`, ... |

| Kleur | Namespace |
|---|---|
| groen | `ssn.` — SSN (Semantic Sensor Network) |
| lichtgroen | `sosa.` — SOSA (Sensor Observation SAmpling) |
| lichtblauw | `pplan.` — P-PLAN (planning) |
| geel | `riepr.` — dit model |

## Diagram

<!--mermaid:diagrammen/ontology-diagram.mmd-->

## Zie ook

- [Ontologie](./ontologie.md) — de volledige door Widoco gegenereerde ontologiedocumentatie
- [Twee stromen](./datamodel.md) — de structurele en operationele stromen in het datamodel
- [Basisaannames](./basisaanname.md) — de modellen en aannames onder het datamodel
