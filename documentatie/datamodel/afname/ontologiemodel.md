---
hide:
  - title
---

# Ontologiemodel

Dit diagram toont de [RIE-IEPR-ontologie](https://github.com/milieuinfo/RIE-IEPR/blob/main/src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl) als
ER-diagram: alle klassen met hun ontologie-prefix, de generalisatie-hierarchie
(`rdfs:subClassOf`) en de eigenschappen (object- en data-properties) met hun
cardinaliteit. In tegenstelling tot de applicatie-modeldiagrammen
(`class-diagram` / `er-diagram` onder `documentatie/datamodel/diagrammen/`, met
SQL-tabellen en Nederlandse conceptnamen) documenteert dit diagram de
ontologie zelf.

!!! note "Automatisch gegenereerd"
    Het diagram wordt gegenereerd door ODDToolkit uit `riepr.ttl`
    (`mvn generate-resources` -> `diagrammen/ontology-diagram.mmd`) en bij de
    build in deze pagina geplaatst. Wijzig de ontologie in de TTL, niet dit
    diagram.

## Notatie

| Notatie | Betekenis |
|---|---|
| `Super <|-- Sub` | `Sub` is een subclass van `Super` (`rdfs:subClassOf`) |
| `A --> B : naam (min..max)` | object-property `naam` van `A` naar `B`; `(min..max)` is de cardinaliteit uit de `owl:Restriction`. Zonder label geldt `0..*` |
| attributen in een klasse | data-properties (range is een XSD-datatype, bijv. `Date geldigVan`); `[]` betekent meervoudig |
| `prefix:Naam` | klasse uit de ontologie met de gegeven prefix: `riepr:` (dit model), `ssn:`, `sosa:`, `pplan:`, `prov:`, `ogc:`, `qudt:`, `org:`, ... |

## Diagram

<!--mermaid:diagrammen/ontology-diagram.mmd-->

## Zie ook

- [Ontologie](./ontologie.md) — de volledige door Widoco gegenereerde ontologiedocumentatie
- [Twee stromen](./datamodel.md) — de structurele en operationele stromen in het datamodel
- [Basisaannames](./basisaanname.md) — de modellen en aannames onder het datamodel
