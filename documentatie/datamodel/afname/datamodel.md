---
hide:
  - title
---

# Datamodel

Deze sectie beschrijft het RIE-IEPR-datamodel in detail. Het datamodel is opgebouwd uit twee aparte stromen:

**Structurele gegevens** beschrijven de statische organisatie van de exploitatie: exploitanten, locaties, systemen (installaties, emissiepunten, meetpunten, filters), processen en hun onderlinge relaties. Deze gegevens zijn versioneerbaar en vormen het skelet van de data.

**Operationele gegevens** beschrijven wat er gebeurt: metingen, observaties, gebeurtenissen (emissie, onttrekking) en observatieverzamelingen, evenals de operationele rapportage-codelijsten. Operationele gegevens linken altijd naar structurele gegevens maar vormen een aparte stroom.

U vindt hier de modellen en aannames die ten grondslag liggen aan de data, evenals de belangrijkste entiteiten.

## Structurele gegevens

- [Basisaannames](./basisaanname.md) - de modellen en aannames die ten grondslag liggen aan het datamodel
- [Exploitant- en exploitatiemodel](./exploitant.md) - organisaties, locaties en activiteiten
- [Systemen: installaties, emissiepunten en meetpunten](./systemen.md) - systemen, subsystemen en eigenschappen

## Operationele gegevens

!!! warning "Analyse nog lopende"
    De analyse van operationele gegevens is nog lopende. De informatie in deze sectie kan wijzigen na afronding van de analyse.

- [Observaties en emissies](./observaties.md) - metingen, observaties en gebeurtenissen (emissie, onttrekking)
- [Aangifte en dossier](./aangifte.md) - documenten gekoppeld aan de data
