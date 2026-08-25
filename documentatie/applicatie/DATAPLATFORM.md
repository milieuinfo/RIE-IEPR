# RIE-IEPR Datamodel
## Dataplatform Transformaties
Het applicatief datamodel wordt automatisch gegenereerd op basis van de ontologie. Echter zijn bepaalde 'shortcuts' genomen die applicatief niet nodig zijn om te capteren, maar wel in het afname datamodel
moeten zitten. Deze lijst bestaat uit alle transformatie die noodzakelijk zijn om aan het afnamemodel te voldoen en moeten op het dataplatform uitgevoerd worden.

### `sosa:isHostedBy` relaties vervolledigen voor exploitaties
> Alle onderdelen van een exploitatie hangen op een platform (exploitatielocatie). Mits het geen MVP meer is om onderdelen uitwisselbaar tussen locaties te maken en er momenteel geen UCs zijn zullen we deze relatie in de applicatie niet maken.

In de transformatie op het datamodel voorzien we een N3 regel (Apache Jena) die deze transformatie uitvoert.

```turtle
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix sosa: <http://www.w3.org/ns/sosa/> .
@prefix ssn:    <http://www.w3.org/ns/ssn/> .
@prefix pplan: <http://www.w3.org/ns/p-plan#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix riepr: <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#> .

{
    ?exploitatie a riepr:Exploitatie .
    ?exploitatie ssn:deployedOnPlatform ?exploitatielocatie .
    ?exploitatie ssn:deployedSystem ?system .
} => {
    ?system sosa:isHostedBy ?exploitatielocatie .
} .
```

### `dct:isVersionOf` relaties vervolledigen
In het applicatief model hebben we identity tabellen en tabellen voor de entiteiten zelf (met surrogate keys). In de afname moeten we een `dct:isVersionOf` naar de URI naar de identity table (i.e. identity URI) voorzien.

### `Emissie` als `sosa:FeatureOfInterest`
> Een schouw (Emissiepunt) stoot emissie uit. Wanneer we een meting uitvoeren dan meten we deze emissie en niet het emissiepunt of meetpunt. Functioneel hangt er niets op het concept emissie.

In de transformatie op het datamodel voorzien we een SPARQL construct query die als UUID de UUID van het emissiepunt overneemt, alsook zijn versionering. Voor elk resultaat zorgen we dat er een referentie
is naar deze emissie en we zorgen ook dat meetpunten en systemen waar deze emissie deel van uitmaakt ook een referentie hebben naar de emissie.

> :information: TODO: SPARQL construct query bepalen en schrijven

### `Onttrekking` als `sosa:FeatureOfInterest`
> Een pompput (Onttrekkingspunt) helpt met het onttrekken van grondwater. Wanneer we op een meetinrichting een meting uitvoeren dan meten we deze onttrekking en niet het onttrekkingspunt of meetpunt. Functioneel hangt er niets op het concept onttrekking.

Gelijkaardig als emissie voorzien we een SPARQL construct query.

### `Uitwisseling` als `sosa:FeatureOfInterest`
Gelijkaardig als emissie voorzien we een SPARQL construct query.