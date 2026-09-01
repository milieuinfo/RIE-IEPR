# RIE-IEPR Datamodel — generatie-tools

Deze map bevat twee generatie-tools. Elk jar heeft zijn eigen config (naamgeving
`config-<tool>.yml`), zodat duidelijk is welke config bij welk jar hoort:

| Jar              | Config                  | Doel                                                                    |
| ---------------- | ----------------------- | ----------------------------------------------------------------------- |
| `oddtoolkit.jar` | `config-oddtoolkit.yml` | Transformatie van het datamodel naar het applicatief datamodel (SQL, SHACL, Java, TypeScript, diagrammen) |

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
java -jar ./oddtoolkit.jar --config-file=config-oddtoolkit.yml --generator=all
```



## Ontologie-bron
`config-oddtoolkit.yml` en `config-owlsda.yml` wijzen beide naar
`src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl`
(de kopie die ook via de `riepr`-Maven-jar gepubliceerd en door `imjvtomjv` geconsumeerd
wordt) — dat is de kanonieke ontologie. De kopie in `./ns/riepr/riepr.ttl` (deze map) is
verouderd sinds 2026-07-13 en blijft enkel ter referentie staan; gebruik ze niet als bron
voor generatie.

> Beide configs gebruiken relatieve paden t.o.v. de repo-root (de working directory op
> startmoment), dus start de jars vanuit de repo-root.
