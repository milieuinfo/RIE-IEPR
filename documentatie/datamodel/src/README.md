# RIE-IEPR Datamodel — generatie-tools

Deze map bevat twee generatie-tools. Elk jar heeft zijn eigen config (naamgeving
`config-<tool>.yml`), zodat duidelijk is welke config bij welk jar hoort:

| Jar              | Config                  | Doel                                                                    |
| ---------------- | ----------------------- | ----------------------------------------------------------------------- |
| `oddtoolkit.jar` | `config-oddtoolkit.yml` | Transformatie van het volledige datamodel (SQL, SHACL, Java, TypeScript, diagrammen) |
| `oddtoolkit.jar` | `config-oddtoolkit-operationeel.yml` | Configuratie voor operationele gegevens met gefilterd ER-diagram |

### owlsda.jar herbuilden

`owlsda.jar` is [milieuinfo/owl-sda](https://github.com/milieuinfo/owl-sda) (commit `fd5ad2a`,
main) mét de lokaal toegepaste patch uit `owlsda.patch` — die voorkomt dat Jena's geneste
`ModelFactory.createUnion`-keten (basisontologie + ~15 externe ontologieën) de run op hangt.

```bash
git clone --depth 1 https://github.com/milieuinfo/owl-sda && cd owl-sda
git apply /pad/naar/RIE-IEPR/documentatie/datamodel/src/owlsda.patch
mvn -DskipTests clean package          # vereist JDK 25
cp target/owlsda.jar /pad/naar/RIE-IEPR/documentatie/datamodel/src/owlsda.jar
```

## ODDToolkit

```bash
java -jar documentatie/datamodel/src/oddtoolkit.jar \
  --config-file=documentatie/datamodel/src/config-oddtoolkit.yml --generator=all
```

Voor de operationele gegevens, vanuit de repo-root:

```bash
for generator in er-diagram sql java typescript; do
  java -jar documentatie/datamodel/src/oddtoolkit.jar \
    --config-file=documentatie/datamodel/src/config-oddtoolkit-operationeel.yml --generator="$generator"
done
```

De uitvoer staat in `documentatie/datamodel/generated/operationeel`. Alleen het ER-diagram is
gefilterd; SQL en klassen omvatten het volledige model. De operationele configuratie laadt geen
externe ontologieën en gebruikt geen reasoner, identiteitstabellen of samengevoegde koppeltabellen.
Het diagram is Mermaid-bron; PNG-export staat uit.

Beide configs genereren bij `Resultaat` een `ResultaatEigenschap` per dynamisch predicaat/object,
met objectsoort (`IRI` of `LITERAL`), optioneel datatype en taal, en een verwijzing naar de
specifieke resultaatversie. De applicatie moet de eigenschaps-ID en verwijzing invullen en zelf
de conversie naar RDF uitvoeren; blank nodes en automatische JSON-LD-expansie worden niet
ondersteund. Namen komen uit de SKOS-concepten. De volledige SQL heeft nog een conflicterende
foreign key voor `proces.systeem`; `resultaattijd` wordt als `DATE` gegenereerd.

## Ontologie-bron
`config-oddtoolkit.yml` en `config-owlsda.yml` wijzen beide naar
`src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl`
(de kopie die ook via de `riepr`-Maven-jar gepubliceerd en door `imjvtomjv` geconsumeerd
wordt) — dat is de kanonieke ontologie. De kopie in `./ns/riepr/riepr.ttl` (deze map) is
verouderd sinds 2026-07-13 en blijft enkel ter referentie staan; gebruik ze niet als bron
voor generatie.

> Beide configs gebruiken relatieve paden t.o.v. de repo-root (de working directory op
> startmoment), dus start de jars vanuit de repo-root.
