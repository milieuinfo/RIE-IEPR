# construct_deployment — deploymentlaag IMJV → RIEPR

## Doel

`construct_deployment.rq` genereert de deploymentlaag van het RIEPR-datamodel vanuit IMJV-brondata via een SPARQL CONSTRUCT-query op de Virtuoso-triplestore (`virtuoso-imjv-pr-1.vm.cumuli.be`).

Het resultaat (`mjv_deployment.ttl`) beschrijft voor één exploitatie en één rapporteringsjaar welke systemen actief waren, waar ze stonden en hoe ze aan de exploitatie verbonden zijn — zonder emissiemetingen.

Huidig voorbeeld: AGC Glass Europe Mol, exploitatie `01787986000160`, rapporteringsjaar 2021.

## Uitvoeren

```bash
cd src/main/input/imjv-transformed/code
bash construct_deployment.sh
```

Het script haalt credentials op via SSH, stuurt de query via curl naar het SPARQL-endpoint, en formatteert de turtle via `riot`.

---

## Brondata

De query bevraagt de IMJV-triplestore. De exploitatie wordt geïdentificeerd via de CBB-URI:

```
https://data.cbb.omgeving.vlaanderen.be/id/exploitatie/01787986000160
```

Virtuoso slaat de toestandsresources op als versies per jaar (patroon `/jaar/2021` in het IRI).

### IMJV-types in de bron

| IMJV-klasse | Aantal (2021) | RIEPR-doelklasse |
|---|---|---|
| `imjv:EmissiepuntStaat` | 8 | `:Emissiepunt` |
| `imjv:LozingspuntStaat` | 2 | `:Emissiepunt` |
| `imjv:PompputStaat` | 5 | `:Onttrekkingspunt` |
| `imjv:PeilputStaat` | 1 | `:Meetpunt` |
| `imjv:PompfilterStaat` | 5 | `:Filter` |
| `imjv:PeilfilterStaat` | 3 | `:Filter` |

De CBB-URI is de ankervariabele voor alle lookups (`imjv:exploitatie ?expl`).

---

## Structuur van de query

De WHERE-clausule bestaat uit vijf blokken, elk verankerd met `VALUES ?expl { <cbb-uri> }`.

### Blok 1 — anker (alle systemen)

```sparql
SELECT ?systeem ?type ?expl ?systeem_label WHERE {
    VALUES ?expl { <cbb-uri> }
    ?systeem imjv:exploitatie ?expl ; rdfs:label ?systeem_label ; a ?type .
    FILTER (CONTAINS(STR(?systeem), "/2021"))
}
```

Geeft 27 rijen terug. Levert `?systeem` als gedeelde joinvariabele voor de volgende blokken, en `?expl` voor de BIND die `?exploitatielocatie` afleid.

### Blok 2 — emissiepunten en lozingspunten

```sparql
SELECT ?systeem ?myType ?gekoppeldeActiviteit ?gekoppeldeActiviteit_label WHERE {
    VALUES ?expl { <cbb-uri> }
    VALUES ?type { imjv:EmissiepuntStaat  imjv:LozingspuntStaat }
    VALUES ?myType { :Emissiepunt }
    ?systeem a ?type ; imjv:exploitatie ?expl .
    FILTER (CONTAINS(STR(?systeem), "/2021"))
    OPTIONAL { ?systeem imjv:gekoppeldeActiviteit ?gekoppeldeActiviteit .
               ?gekoppeldeActiviteit rdfs:label ?gekoppeldeActiviteit_label . }
}
```

Inner join op `?systeem` met blok 1 → reduceert tot 10 rijen.

### Blok 3 — zuiveringsapparatuur (OPTIONAL)

Inner join op `?systeem`, links gekoppeld. Geeft `?zuiveringsApparatuur` terug voor systemen met luchtfiltering.

### Blok 4 — geometrie

```sparql
SELECT ?systeem ?systeem_geometrie ?systeem_wkt WHERE {
    VALUES ?expl { <cbb-uri> }
    ?systeem imjv:exploitatie ?expl ; locn:geometry ?systeem_wkt .
    FILTER (CONTAINS(STR(?systeem), "/2021"))
    BIND(IRI(REPLACE(STR(?systeem), ".../id/", ".../id/geometry/")) AS ?systeem_geometrie)
}
```

Inner join op `?systeem`. Splitst de WKT-literal af naar een aparte geometrie-node conform GeoSPARQL.

### Blok 5 — grondwatersystemen (OPTIONAL UNION)

Één OPTIONAL sub-select met vier UNION-branches voor pompputten, pompfilters, peilputten en peilfilters. Elke branch is onafhankelijk verankerd.

```sparql
OPTIONAL {
    SELECT ?pompput ... ?pompfilter ... ?peilput ... ?peilfilter ... WHERE {
        { VALUES ?expl { <cbb-uri> }
          ?pompput a imjv:PompputStaat ; imjv:exploitatie ?expl ; ... }
        UNION
        { VALUES ?expl { <cbb-uri> }
          ?pompfilter a imjv:PompfilterStaat ; imjv:exploitatie ?expl ; ... }
        UNION { ... peilput ... }
        UNION { ... peilfilter ... }
    }
}
```

---

## Queryoptimalisatie — het cross-productprobleem

### Probleem: Cartesiaans product bij OPTIONAL zonder gedeelde variabele

OPTIONAL sub-selects zonder gedeelde variabele met het hoofdresultaat produceren in SPARQL een links Cartesiaans product. Virtuoso schat de uitvoeringstijd op basis van het product van de kardinaliteiten van alle deelresultaten.

Met vier afzonderlijke OPTIONAL sub-selects (originele structuur):

```
hoofdresultaat  × pompput × pompfilter × peilput × peilfilter
     12         ×    5    ×     5      ×    1     ×    3      = 900 rijen
```

Virtuoso schatte dit als acceptabel (~45 seconden). Zodra de kardinaliteitsschatting van één deelresultaat opliep (bij eerdere optimalisatiepogingen waarbij sub-selects werden samengevoegd), explodeerde de tijdschatting:

| Versie | Geschatte rijen | Tijdschatting Virtuoso |
|---|---|---|
| Origineel (4 aparte OPTIONAL) | 12 × 5 × 5 × 1 × 3 = 900 | 45 seconden (uitgevoerd) |
| Gecombineerde sub-select (fout) | 33 × 5 × 5 × 1 × 3 ≈ 2475 | 2496 seconden (geblokkeerd) |
| UNION-aanpak (huidig) | 12 × 14 = 168 | 5 seconden (uitgevoerd) |

### Oplossing: UNION vervangt vier afzonderlijke OPTIONAL sub-selects

Door de vier OPTIONAL sub-selects samen te voegen in één UNION levert het OPTIONAL-blok 14 rijen (5 + 5 + 1 + 3), elk met één type gebonden en de overige ongebonden. Het cross-product daalt van 900 naar 168 rijen.

De CONSTRUCT-clausule genereert correct triples per rij: een rij met gebonden `?pompput` en ongebonden `?pompfilter` produceert pompput-triples maar geen pompfilter-triples.

### Virtuoso-specifieke vuistregels

- Elke sub-select moet een `VALUES ?expl { <ankervariabele> }` bevatten zodat Virtuoso de index op `imjv:exploitatie` kan gebruiken. Zonder dit anker schat Virtuoso een full-graph-scan en weigert de query.
- Sub-selects vormen een barrière voor de query-optimizer: Virtuoso kan predicaten niet over sub-select-grenzen heen optimaliseren. Dit is nadelig voor samenvoegen, maar voordelig voor het dwingen van een goede joinvolgorde.
- `OPTIONAL { SELECT ... }` met geen gedeelde variabele produceert altijd een Cartesiaans product. Beperk het aantal zulke sub-selects of voeg ze samen met UNION.

---

## Resultaat

`mjv_deployment.ttl` bevat 58 subjects:

| Resource | Klasse | Aantal |
|---|--|---|
| emissiepunten / lozingspunten | `:Emissiepunt`, `ssn:System` | 10 |
| pompputten | `:Onttrekkingspunt`, `ssn:System` | 5 |
| peilput | `:Meetpunt`, `ssn:System` | 1 |
| pompfilters + peilfilters | `:Filter`, `ssn:System` | 8 |
| zuiveringsapparaten | `ssn:System` | 5 |
| installaties | `:Installatie` | 9 |
| exploitatielocatie | `:Exploitatielocatie`, `sosa:Platform` | 1 |
| exploitatie | `:Exploitatie`, `ssn:Deployment` | 1 |
| geometrie-nodes | `geo:Geometry` | 17 |
| identifier-node | `adms:Identifier` | 1 |

Elke resource met locatiedata heeft een `geo:hasGeometry`-node met `geo:asWKT`. Filters hebben geen geometrie (niet aanwezig in de IMJV-bron). De exploitatie heeft `ssn:deployedSystem` voor emissiepunten, pompputten en de peilput; `ssn:deployedOnPlatform` naar de exploitatielocatie.
