# RIE-IEPR Datamodel
## Observaties

[TOC]

### Concepten
**Meetbare systemen**
De metingen en observaties gebeuren op systemen die meetbaar zijn. Algemeen zijn dit alle meetpunten, maar ook andere systemen kunnen meetbaar zijn (bepaalde types emissiepunten).
De logica die bepaald welk systeem meetbaar is zit in de codelijsten van typeringen.

**Processen**
Processen van de structuur beschrijven de samenhang en activiteit van installaties, emissiepunten, etc.
Qua rapportering van operationele gegevens zullen we steeds op een proces rapporteren omdat we bijvoorbeeld
rapporteren op "het rookgas uit schouw 1 afkomstig van de directe stookinstallatie". M.a.w. de pijl van de installatie naar de schouw.


**Emissie, Onttrekking en Uitwisseling**
De meting heeft betrekking tot het meten of observeren van emissie, onttrekking of uitwisseling over een periode (jaar).

**Tijdstip van observatie**
Het tijdstip waarop een observatie plaats heeft gevonden.

**Tijdstip van het fenomeen**
Het tijdstip waarop de emissie, (...) heeft plaatsgevonden. In het geval van jaarvrachten gaat dit om het volledige jaar (range).

### Basis datamodel
Observaties zijn gekoppeld aan Emissie, Onttrekking of Uitwisseling. Dit is de feature of interest voor een specifieke periode en proces waarop gemeten wordt. 
```mermaid
flowchart TB
    Observatie -->|hasFeatureOfInterest| Emissie
    Emissie["**Emissie**<br>periode=2026"] -->|hasFeatureOfInterest| Proces
    Proces["**Proces**<br>type=TRANSPORT"] 
    ProcesEP["**Proces**<br>type=EMISSIE"] -->|implementedBy| Emissiepunt["**Emissiepunt**<br>Schouw 1"]
    ProcesInstallatie["**Proces**<br>type=VERWERKING"] -->|implementedBy| Installatie["**Installatie**<br>Installatie 1"]
    Proces -->|isPrecededBy| ProcesInstallatie
    ProcesEP -->|isPrecededBy| Proces
    Observatie -->|hasResult| Resultaat["**Resultaat**<br>20 pH"]
    Observatie -->|observedProperty| Codelijst(["**Codelijst**<br>parameter pH"])
```

### Versionering
Net zoals structurele gegevens hebben observaties versionering. Dit is nodig om toe te laten dat iemand gegevens kan corrigeren of intrekken.
Anders dan de structurele gegevens is er geen 'geldig vanaf' datum. De observaties zijn gekoppeld aan een aangifte (net zoals structuur) indien ze zijn ingediend.
Wanneer een andere aangifte deze overschrijft dan is de datum van de aangifte bepalend.

### Architecturale flow
De doelstelling van operationele gegevens is om a.h.v. codelijsten een JSON-schema te kunnen aanmaken zonder bijkomende applicatielogica te voorzien die specifiek bepaald waar deze gegevens moeten ophangen.
De codelijst van operationele gegevens zegt **wat** we vragen (label, eenheden,... gelijkaardig als eigenschappen), **waarop** dit bevraagd mag worden (welke types, gelijkaardig als eigenschappen) en bijkomende bepalingen 
voor operationele gegevens om aan te geven wat de datum/range is (**wanneer**).

```mermaid
flowchart TB
    subgraph CL["Codelijsten (Bestanden)"]
        direction TB
        CGW[("operationeel_grondwater")]
        CW[("operationeel_water")]
        CLU[("operationeel_lucht")]
    end

    subgraph TYPES["Referentie-codelijsten (Types)"]
        direction TB
        IT[installatie_types]
        EPT[emissiepunt_types]
        MPT[meetpunt_types]
        OTHER[...]
    end

    subgraph SCHEMA["Generatie"]
        JSONSCHEMA[(JSON-schema)]
    end

    subgraph UI["Interface"]
        FORM[UI-elementen]
    end

    CL -->|"verwijst naar"| TYPES

    CL -->|"converteert naar"| JSONSCHEMA

    TYPES -->|"levert keuzelijsten"| JSONSCHEMA

    JSONSCHEMA -->|"genereert"| FORM

    classDef codelijst fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef types fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef schema fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef ui fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    class CGW,CW,CLU codelijst;
    class IT,EPT,MPT,OTHER types;
    class JSONSCHEMA schema;
    class FORM ui;
```