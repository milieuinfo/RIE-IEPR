# Datavoorbeelden

Datavoorbeelden illustreren hoe gegevens in het RIE-IEPR datamodel concreet worden
uitgedrukt als RDF (Turtle). Alle data in deze voorbeelden is **fictief** en dient
uitsluitend om het datamodel te verhelderen.

## Beschikbare voorbeelden

| Voorbeeld | Bron |
|---|---|
| [AGC Glass Europe (referentie)](agc-glass.md) | handgeschreven door de MJV |
| [AGC Glass Europe (synthetisch)](agc-glass-synthetisch.md) | automatisch gegenereerd met OWL-SDA |

## Synthetische datavoorbeelden genereren (OWL-SDA)

Het synthetische voorbeeld wordt gegenereerd door
[OWL-SDA](https://github.com/milieuinfo/owl-sda) — een multi-agentsysteem dat van de
RIE-IEPR-ontologie SHACL-shapes afleidt en met een team van LLM-agents (supervisor,
workers, reviewer) RDF-gegevens genereert die tegen die shapes gevalideerd worden.

De tooling staat in `documentatie/datamodel/src/`, op dezelfde manier als ODDToolkit:

| Bestand | Doel |
|---|---|
| `src/owlsda.jar` | OWL-SDA-executable |
| `src/config-owlsda.yml` | OWL-SDA-configuratie (ontologie, LLM, SHACL, reasoner, externe ontologieën) |
| `build-datavoorbeelden.sh` | Pipeline: genereert het voorbeeld én vernieuwt deze mkdocs-pagina's |

### Pipeline uitvoeren

```bash
bash documentatie/datamodel/build-datavoorbeelden.sh
```

Vereisten:

- **JDK 25** (OWL-SDA bouwt en draait op JDK 25)
- **Lokale LLM**: het model `muse-glimmer:30b` via het interne OpenAI-compatible
  endpoint (zelfde endpoint en modellen als in `~/.config/opencode/opencode.jsonc`).
  De API-key hoeft niet gezet te zijn: het script leest hem uit
  `~/.config/opencode/opencode.jsonc` (of uit `OPENAI_API_KEY` als die staat).

De run duurt enkele tientallen minuten (lokale 30B-model). De log staat in
`.cache/owlsda/owlsda.log`; caches (externe ontologieën, SHACL, inferred model) zitten in
`.cache/` en versnellen herhaalde runs. Na een wijziging van de ontologie:
`rm -rf .cache/owlsda`.

### Hoe het werkt

1. **Ontologie laden** — de kanonieke `riepr.ttl` plus extern geïmporteerde
   ontologieën (prov, p-plan, sosa, ssn, qudt, ...), gedeeld met de ODDToolkit-cache.
2. **SHACL afleiden** — shapes uit de ontologie (default en RDFS-geïnfereerd), gecachet.
3. **Genereren** — de supervisor deelt SHACL-shapes uit aan worker-sessies; elke worker
   schrijft RDF-triples voor zijn shapes in de triplestore, conform de ontologie en de
   URI-patronen. De volledige AGC-referentie wordt als user-context meegegeven zodat de
   stijl en conventies gevolgd worden.
4. **Reviewen** — de reviewer valideert de output tegen de SHACL-shapes; bij overtredingen
   krijgen de workers revisie-instructies (max. 3 ronden).
5. **Publiceren** — de gevalideerde Turtle wordt naar
   `datavoorbeelden/agc-glass_synthetisch.ttl` geschreven en de mkdocs-pagina's
   vernieuwd (herbouwen van de site: `bash documentatie/datamodel/build-mkdocs.sh`).
