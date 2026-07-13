# Aangifte en dossier


Dit document beschrijft hoe aangiften, dossiers en transacties gekoppeld zijn aan de RIE-IEPR-data. Het gebruikt de **Dossier**-ontologie van Vlaanderen voor documentbeheer.

## 1. Aangifte

Een **aangifte** is een document ingediend bij de overheid. In de ontologie is het een subklasse van `dossier:Stuk`.

```turtle
@prefix dossier: <https://data.vlaanderen.be/ns/dossier#> .
@prefix dct:     <http://purl.org/dc/terms/> .

<https://data.mjv.omgeving.vlaanderen.be/id/aangifte/019edc4a-1a39-7fr7-mq8j-r3soo1okok8>
    a dossier:Stuk ;
    dct:title "RIE-IEPR aangifte 2026"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime .
```

## 2. Aangiftebundel

Een **aangiftebundel** is een verzameling van aangiften. Het is eveneens een subklasse van `dossier:Stuk`.

```turtle
<https://data.mjv.omgeving.vlaanderen.be/id/aangiftebundel/019edc4a-1a3a-7gs8-nr9k-s4tpp2plpl9>
    a dossier:Stuk ;
    dct:title "Bundel RIE-IEPR aangiften 2026"@nl .
```

Een bundel kan meerdere aangiften bevatten via `dossier:hasPart`:

```turtle
<.../aangiftebundel/019edc4a-1a3a-7gs8-nr9k-s4tpp2plpl9>
    dossier:hasPart <.../aangifte/019edc4a-1a39-7fr7-mq8j-r3soo1okok8> .
```

## 3. Transactie

Een **transactie** is het proces van indienen, verwerken en goedkeuren van een aangifte. Het is een subklasse van `prov:Activity`.

```turtle
@prefix prov: <http://www.w3.org/ns/prov#> .

<https://data.mjv.omgeving.vlaanderen.be/id/transactie/019edc4a-1a3b-7ht9-os0l-t5uqq3qmrm0>
    a prov:Activity ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime .
```

Een transactie kan meerdere fasen hebben:
- **Indienen** — de plichtige dient de aangifte in
- **Verwerken** — de overheid verwerkt de aangifte
- **Goedkeuren** — de aangifte wordt goedgekeurd

## 4. Relaties tussen entiteiten

```
Transactie (prov:Activity)
  ├── used → Aangifte (dossier:Stuk)
  └── wasAssociatedWith → Exploitant (riepr:Exploitant)

Aangiftebundel (dossier:Stuk)
  └── hasPart → Aangifte (dossier:Stuk)
```

## 5. Integratie met data

Aangiften zijn gekoppeld aan de RIE-IEPR-data — ze betreffen specifieke exploitaties, installaties of emissies. De koppeling gebeurt via URI-referenties naar de betreffende entiteiten in het datamodel.

## Referenties

- [Basisaannames](./BASISAANNAME.md) — PROV-O provenance patroon
- [Versiebeheer en tijdsrecht](./VERSIEBEHEER.md) — relatie tussen indienen en versies
