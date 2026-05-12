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
| `imjv:LozingspuntStaat` met `meetputType = oppompend` | 1 | `:Onttrekkingspunt` |
| `imjv:LozingspuntStaat` overige | 3 | `:Emissiepunt` |
| `imjv:PompputStaat` | 5 | `:Onttrekkingspunt` |
| `imjv:PeilputStaat` | 1 | `:Meetpunt` |
| `imjv:PompfilterStaat` | 5 | `:Filter` |
| `imjv:PeilfilterStaat` | 3 | `:Filter` |

Lozingspunt 2400019 ("OPGENOMEN KANAALWATER") heeft `imjv:meetputType = oppompend` en wordt daarom geclassificeerd als `:Onttrekkingspunt`. De overige drie lozingspunten (2400006, 2400007, 9991095) krijgen `:Emissiepunt`.

Twee lozingspunten (2400019 "OPGENOMEN KANAALWATER" en 9991095 "LP07 INDUSTRIEEL COATER") hebben geen geometrie in IMJV. Ze verschijnen wel als `ssn:deployedSystem` maar krijgen geen `geo:hasGeometry`-triple.

De CBB-URI is de ankervariabele voor alle lookups (`imjv:exploitatie ?expl`).

Elk emissiepunt- of lozingspunt-subject is een jaarversie (`/jaar/2021`). Via `prov:wasRevisionOf` wordt de tijdloze basis-IRI gelinkt zodat meerdere jaarsversies te vergelijken zijn (die basis-IRI is zelf ook een volwaardig subject in het resultaatbestand). Via `ssn:hasSubSystem` wordt een afgeleid meetpunt-resource aangemaakt waarvan de IRI het type-segment (`emissiepunt`/`lozingspunt`) vervangt door `meetpunt`. Dit meetpunt-resource krijgt type `:Meetpunt` voor gewone emissie-/lozingspunten, maar type `:Filter` voor het lozingspunt dat als `:Onttrekkingspunt` geclassificeerd is (lozingspunt 2400019).

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
SELECT ?systeem ?gekoppeldeActiviteit ?myType ?gekoppeldeActiviteit_label WHERE {
    VALUES ?expl { <cbb-uri> }
    VALUES ?type { imjv:EmissiepuntStaat  imjv:LozingspuntStaat }
    ?systeem a ?type ; imjv:exploitatie ?expl .
    FILTER (CONTAINS(STR(?systeem), "/2021"))
    OPTIONAL { ?systeem imjv:meetputType ?meetputType }
    BIND(IF(?type = imjv:EmissiepuntStaat,
            :Emissiepunt,
            IF(?meetputType = <.../concept/oppompend>,
               :Onttrekkingspunt,
               :Emissiepunt)) AS ?myType)
    OPTIONAL { ?systeem imjv:gekoppeldeActiviteit ?gekoppeldeActiviteit .
               ?gekoppeldeActiviteit rdfs:label ?gekoppeldeActiviteit_label . }
}
```

Inner join op `?systeem` met blok 1. `EmissiepuntStaat` → altijd `:Emissiepunt`. `LozingspuntStaat` → `:Onttrekkingspunt` als `meetputType = oppompend`, anders `:Emissiepunt`.

Na blok 2 berekent de query twee bijkomende bindingen:

```sparql
BIND(IRI(REPLACE(STR(?systeem), "/jaar/[0-9]+$", "")) AS ?systeem_base)
BIND(IRI(REPLACE(STR(?systeem), "/id/lozingspunt/|/id/emissiepunt/", "/id/meetpunt/")) AS ?meetput)
```

- `?systeem_base`: de tijdloze basis-IRI van de toestand (zonder `/jaar/2021`), wordt gebruikt voor `prov:wasRevisionOf`.
- `?meetput`: een afgeleid meetpunt-IRI waarbij het type-segment (`emissiepunt` of `lozingspunt`) vervangen wordt door `meetpunt`. Elk emissiepunt en lozingspunt krijgt zo een bijhorend `:Meetpunt`-resource via `ssn:hasSubSystem`.

### Blok 3 — zuiveringsapparatuur (OPTIONAL)

Inner join op `?systeem`, links gekoppeld. Geeft `?zuiveringsApparatuur` terug voor systemen met luchtfiltering.

### Blok 4 — geometrie (OPTIONAL)

```sparql
OPTIONAL {
    SELECT ?systeem ?systeem_geometrie ?systeem_wkt WHERE {
        VALUES ?expl { <cbb-uri> }
        ?systeem imjv:exploitatie ?expl ; locn:geometry ?systeem_wkt .
        FILTER (CONTAINS(STR(?systeem), "/2021"))
        BIND(IRI(REPLACE(STR(?systeem), ".../id/", ".../id/geometry/")) AS ?systeem_geometrie)
    }
}
```

OPTIONAL join op `?systeem`. Systemen zonder `locn:geometry` in IMJV (lozingspunten 2400019 en 9991095) verschijnen toch als `ssn:deployedSystem`; ze krijgen simpelweg geen `geo:hasGeometry`-triple omdat `?systeem_geometrie` ongebonden blijft.

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

`mjv_deployment.ttl` bevat 84 CONSTRUCT-gegenereerde subjects (plus extra subjects door OWL-inferentie in de Scala-pijplijn):

| Resource | Klasse | Aantal |
|---|--|---|
| emissiepunten (toestand `/jaar/2021`) | `:Emissiepunt`, `ssn:System` | 8 |
| lozingspunten (toestand `/jaar/2021`) | `:Emissiepunt` of `:Onttrekkingspunt`, `ssn:System` | 4 (3 + 1) |
| emissiepunten + lozingspunten (tijdloos, basis-IRI) | `:Emissiepunt`/`:Onttrekkingspunt`, `ssn:System` | 12 |
| meetpunten (afgeleid van emissiepunten en `:Emissiepunt`-lozingspunten) | `:Meetpunt`, `ssn:System` | 11 |
| meetpunt (afgeleid van het `:Onttrekkingspunt`-lozingspunt 2400019) | `:Filter`, `ssn:System` | 1 |
| pompputten | `:Onttrekkingspunt`, `ssn:System` | 5 |
| peilput | `:Meetpunt`, `ssn:System` | 1 |
| pompfilters + peilfilters | `:Filter`, `ssn:System` | 8 |
| zuiveringsapparaten | `ssn:System` | 5 |
| installaties | `:Installatie` | 9 |
| exploitatielocatie | `:Exploitatielocatie`, `sosa:Platform` | 1 |
| exploitatie | `:Exploitatie`, `ssn:Deployment` | 1 |
| geometrie-nodes | `geo:Geometry` | 17 |
| identifier-node | `adms:Identifier` | 1 |

Resources met locatiedata hebben een `geo:hasGeometry`-node met `geo:asWKT`. Lozingspunten 2400019 en 9991095 hebben geen geometrie in IMJV en krijgen dus geen geometrie-node. Filters hebben ook geen geometrie. De exploitatie heeft `ssn:deployedSystem` voor alle emissiepunten/lozingspunten/pompputten/peilput; `ssn:deployedOnPlatform` naar de exploitatielocatie.

Elk emissiepunt en lozingspunt heeft nu ook:
- `prov:wasRevisionOf` naar de tijdloze basis-IRI (zonder `/jaar/2021`). Die basis-IRI is zelf ook een volwaardig subject met `rdf:type`, `adms:status` en `dct:created/modified`.
- `ssn:hasSubSystem` naar een afgeleid meetpunt-resource met IRI-patroon `/id/meetpunt/…`. Het type van deze resource is `:Meetpunt` voor gewone emissie-/lozingspunten, maar `:Filter` voor het lozingspunt dat als `:Onttrekkingspunt` geclassificeerd is (lozingspunt 2400019 "OPGENOMEN KANAALWATER").
