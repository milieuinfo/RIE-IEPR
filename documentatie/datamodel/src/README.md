# RIE-IEPR Datamodel
## Transformatie van datamodel naar applicatief datamodel
Deze folder bevat de configuratie van de transformatie van het datamodel naar het applicatief datamodel.

## Gebruik
`java -jar ./oddtoolkit.jar --config-file=config.yml --generator=all`

## Ontologie-bron
`config.yml` wijst naar `src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl`
(de kopie die ook via de `riepr`-Maven-jar gepubliceerd en door `imjvtomjv` geconsumeerd wordt) —
dat is de kanonieke ontologie. De kopie in `./ns/riepr/riepr.ttl` (deze map) is verouderd sinds
2026-07-13 en blijft enkel ter referentie staan; gebruik ze niet als bron voor generatie.