# Datavoorbeeld: AGC Glass Europe (referentie)

Handgeschreven referentie-voorbeeld van de MJV, gebruikt als voorbeeld van de gewenste structuur, URI-conventies en commentaarstijl.

```{note}
Dit is een **datavoorbeeld**: de data is fictief en dient uitsluitend om het datamodel te illustreren.
```

| | |
|---|---|
| Bestand | `documentatie/datamodel/datavoorbeelden/agc-glass_MJV_01-07-2026.ttl` |
| Bron | handgeschreven (MJV, 01-07-2026) |
| Laatst gegenereerd | 2026-08-26 06:30 UTC |
| Grootte | 174 KB |

## TTL

```turtle
#################################
##   AGC Glass Europe
##   Datavoorbeeld - DIT IS GEEN ECHTE DATA
##   Versie: 01/07/2026
#################################

@prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix adms:    <http://www.w3.org/ns/adms#> .
@prefix dct:     <http://purl.org/dc/terms/> .
@prefix dossier: <https://data.vlaanderen.be/ns/dossier#> .
@prefix foaf:    <http://xmlns.com/foaf/0.1/> .
@prefix locn:    <http://www.w3.org/ns/locn#> .
@prefix ogc:     <http://www.opengis.net/ont/geosparql#> .
@prefix org:     <http://www.w3.org/ns/org#> .
@prefix pplan:   <http://purl.org/net/p-plan#> .
@prefix prov:    <http://www.w3.org/ns/prov#> .
@prefix qudt:    <http://qudt.org/schema/qudt/> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix sosa:    <http://www.w3.org/ns/sosa/> .
@prefix ssn:     <http://www.w3.org/ns/ssn/> .
@prefix unit:    <http://qudt.org/vocab/unit/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix oa:      <http://www.w3.org/ns/oa#> .

# Ontologie van RIE-IEPR
@prefix riepr:   <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#> .

# URI voor individuals (niet finaal)
@prefix installatie: <https://data.mjv.omgeving.vlaanderen.be/id/installatie/> .
@prefix emissiepunt: <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/> .
@prefix proces: <https://data.mjv.omgeving.vlaanderen.be/id/proces/> .
@prefix exploitant: <https://data.mjv.omgeving.vlaanderen.be/id/exploitant/> .
@prefix exploitatie: <https://data.mjv.omgeving.vlaanderen.be/id/exploitatie/> .
@prefix locatie: <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/> .
@prefix onttrekkingspunt: <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/> .
@prefix meetpunt: <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/> .

# Dummy URI voor concepten van VMM. Dit moet niet echt bestaan maar is nodig om aan te geven dat iets eigendom is van VMM
@prefix vmm: <http://vmm.be#> .

# Minimale type-asserties voor externe referenties die door SHACL als klasse verwacht worden.
<https://data.vlaanderen.be/id/onderneming/0413638187> a org:Organization .
<https://data.vlaanderen.be/id/vestiging/2081766488> a org:Site .

## ---------------------------------------- ##
## Exploitatiegegevens AGC Glass Europe     ##
## ---------------------------------------- ##

<https://data.mjv.omgeving.vlaanderen.be/id/exploitant/019e9271-1452-7630-be04-59ea199007a7> a riepr:Exploitant ;
    rdfs:label "AGC Glass Europe NV"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    # De primare bron waar wij onze gegevens afhalen
    # NOTA 3/06/2026: Voorlopig werkt deze URI niet omdat de hoofdzetel niet in Vlaanderen ligt (aangekaart bij DV)
    prov:hadPrimarySource <https://data.vlaanderen.be/id/onderneming/0413638187> .

<https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> a riepr:Exploitatielocatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    prov:wasAttributedTo <https://data.mjv.omgeving.vlaanderen.be/id/exploitant/019e9271-1452-7630-be04-59ea199007a7> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    # De exploitatielocatie is gebaseerd op een vestiging
    prov:hadPrimarySource <https://data.vlaanderen.be/id/vestiging/2081766488> ;
    # Adresgegevens zouden in principe opgehaald moeten worden van de primary source en niet dOMG
    # Echter, bij niet-vestigingen is dOMG de primaire bron
    locn:address [ a locn:Address ;
        locn:streetAddress "Voortstraat 27" ;
        locn:postalCode "2400" ;
        locn:addressLocality "Mol" ;
        locn:addressCountry "BE"
    ] ;
    ogc:hasGeometry [
        a ogc:Point ;
        ogc:asWKT "POINT (205700 209700)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "DOMG" ;
        skos:notation "BE.VL.000000034.SITE"^^riepr:inspireId
    ] .

# Exploitaties komen primair van het VIM maar de toestanden zelf zijn ingegeven in het MJV
<https://data.mjv.omgeving.vlaanderen.be/id/exploitatie/019e9271-1454-7b38-9eae-505cace7ca54> a riepr:Exploitatie ;
    prov:hadPrimarySource <https://data.vim.omgeving.vlaanderen.be/TBDTBD> .

# Een 'versie' van een exploitatie beschrijft een toestand
<https://data.mjv.omgeving.vlaanderen.be/id/exploitatie/019e9271-1454-7b38-9eae-505cace7ca54/2026-01-01/2026-01-01T10:00:00Z> a riepr:Exploitatie ;
    # ... en is een versie/toestand van de tijdsloze exploitatie
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/exploitatie/019e9271-1454-7b38-9eae-505cace7ca54> ;
    rdfs:label "Een naam gekozen door de exploitant"@nl ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    # De primaire bron van de exploitant geeft een lijst van alle activiteiten (NACE codes). In MJV kunnen ze hun hoofdactiviteit selecteren
    org:classification <http://data.europa.eu/ux2/nace2.1/231> ;
    # De exploitatie implementeert 1 proces (hoofdproces of ook wel activiteit genoemd)
    ssn:implements <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1455-78f7-94b6-becb88019f89/2026-01-01/2026-01-01T10:00:00Z> ;
    ssn:deployedOnPlatform <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        # Migratiegegevens van IMJV (VOORBEELD)
        adms:schemaAgency "VMM" ;
        skos:notation "01787986000160"^^vmm:cbbNummer
    ] ;
    ssn:deployedSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1456-7a2f-ac4e-8904bab88f37/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1457-7564-86c0-e28e802b8fa2/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1458-7b1f-bc81-76e221cdb630/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1459-714c-a5bc-ed1889914c81/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-145a-7a7e-b483-954bb6b31bb9/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145b-75f5-83d9-fe9b0b7e9540/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145c-7c92-9099-59b4286bc121/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145d-7a81-bc94-32c5eae624ad/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-145e-7f05-8a58-f670d6672c99/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-145f-75f2-8222-342e7028bb37/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1460-7f57-81d2-d483a58d2439/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1461-7f34-b276-0b3c1bee1186/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1462-7a6b-a750-ee0ec6f63870/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1463-719b-948f-22a102653d02/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1464-79bc-843b-87ccd701edea/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1465-72f2-8291-c289676c3ded/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1466-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z> ,
        <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1467-70da-9ee3-84dd0066573f/2026-01-01/2026-01-01T10:00:00Z> , <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1468-7c83-bfd9-dc30667ab9a1/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1469-7d16-975e-2b00841913e6/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146a-7933-a3fa-3e66af90b82b/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146b-71c7-878c-20d0e9c8aea9/2026-01-01/2026-01-01T10:00:00Z>,
        <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146c-739e-af4f-7b3af72b9b4d/2026-01-01/2026-01-01T10:00:00Z> .

# Het hoofdproces van de exploitatie
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1455-78f7-94b6-becb88019f89/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1455-78f7-94b6-becb88019f89> ;
    rdfs:label "Vormen en bewerken van vlakglas"@nl ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "323"^^vmm:activiteitCode
    ] .
    
## Contactpersoon van de exploitatie
<https://data.mjv.omgeving.vlaanderen.be/id/contactpersoon/019ed475-eb52-76ad-9c36-96ef45d889d0> a riepr:Contactpersoon ;
    # Contactpersoon annoteren de exploitatie in zijn geheel, niet een specifieke toestand
    oa:hasTarget <https://data.mjv.omgeving.vlaanderen.be/id/exploitatie/019e9271-1454-7b38-9eae-505cace7ca54> ;
    dct:type <https://data.riepr.omgeving.vlaanderen.be/id/concept/milieucoordinator> ;
    rdfs:comment "Voorbeeld persoon met voorbeeld functie, vrije invoer beschrijving"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    foaf:name "John Doe"@nl ;
    foaf:mbox <mailto:info@example.com> .

## ---------------------------------------- ##
## Systemen van de exploitatie              ##
## ---------------------------------------- ##

# Installaties
#  Op basis van IMJV VMM data beschouwen we een installatie als een apparaat. Op basis van de data bepalen we het type.
#  XML Water + Apparaat + "Zuivering" => Waterzuiveringsinstallatie
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1456-7a2f-ac4e-8904bab88f37/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1456-7a2f-ac4e-8904bab88f37> ;
    rdfs:label "waterzuiveringsinstallatie"@nl ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/waterzuivering> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "1970-01-01"^^xsd:date ; # afgeleid: JaarIngebruikname in bron water XML voor apparaatID 699 (technieken starten in 1970)
    # Elke installatie, emissiepunt, ... (systeem) is verbonden met de locatie. Onrechtstreeks lijkt dit overbodig mits je ook de exploitatie -> exploitatielocatie verbinding hebt,
    # maar op deze manier kunnen we een vestiging/locatie later makkelijker verkopen/linken aan een nieuwe exploitatie.
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "699"^^vmm:apparaatId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-730f-8fc4-c09b55661a9f>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7fc8-a1ea-2e029966f763>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7bf2-b175-a3a609e6f04b>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b3b-b30d-9009ac3ad4a1>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2b-71f3-8c45-d9e8f7a6b5c4>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2c-72e4-9d56-e0f9g8b7c6d5>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2d-73f5-ae67-f1gad9c8d7e6>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2e-74g6-bf78-g2hbe0d9e8f7> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1457-7564-86c0-e28e802b8fa2/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1457-7564-86c0-e28e802b8fa2> ;
    rdfs:label "demi-installatie glasfabriek"@nl ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "1989-01-01"^^xsd:date ; # afgeleid: minimum JaarIngebruikname in bron water XML voor apparaatID 700 (1989, 1998)
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "700"^^vmm:apparaatId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2f-75h7-cg89-h3icf1eaf9g8>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a30-76i8-dh9a-i4jdg2fbga9> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1458-7b1f-bc81-76e221cdb630/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie, ssn:System ;
    rdfs:label "demi-installaties coater"@nl ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2000-01-01"^^xsd:date ; # afgeleid: minimum JaarIngebruikname in bron water XML voor apparaatID 703 (2000, 2002)
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "703"^^vmm:apparaatId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a31-77j9-ei0b-j5keh3gcgb0>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a32-78k0-fj1c-k6lfh4hdhc1> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1459-714c-a5bc-ed1889914c81/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1459-714c-a5bc-ed1889914c81> ;
    rdfs:label "ultrafiltratie en recuperatie coater"@nl ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2002-01-01"^^xsd:date ; # afgeleid: JaarIngebruikname in bron water XML voor apparaatID 704 (techniek start in 2002)
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "704"^^vmm:apparaatId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a33-79l1-gk2d-l7mgi5ieid2> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-145a-7a7e-b483-954bb6b31bb9/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-145a-7a7e-b483-954bb6b31bb9> ;
    rdfs:label "Centrifuge"@nl ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2017-01-01"^^xsd:date ; # afgeleid: JaarIngebruikname in bron water XML voor apparaatID 4876 (techniek start in 2017)
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "4876"^^vmm:apparaatId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a34-7am2-hl3e-m8nhj6jfje3> .


# Een GPBV installatie heeft geen random UUID omdat we deze identifier uit het GPBV register kunnen halen
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION> ;
    rdfs:label "AGC Glass Mol"@nl ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/gpbv-installatie> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld lozingspunt 019e9271-145b-75f5-83d9-fe9b0b7e9540
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "DOMG" ;
        skos:notation "20171122-0011" 
    ], [
        a adms:Identifier ;
        adms:schemaAgency "DOMG" ;
        skos:notation "BE.VL.000000002.INSTALLATION"^^riepr:inspireId
    ] ;
    ogc:hasGeometry [ 
        a ogc:MultiPolygon ;
        ogc:asWKT "MULTIPOLYGON (((205744.10052978 209746.70017958, 205656.07300972 209761.6091716, 205658.24593773 209840.19246765, 205658.84555373 209861.87624366, 205658.87761772 209863.03534766, 205659.23288172 209875.88309167, 205661.77393772 209877.84552367, 205670.71198573 209884.74869168, 205654.61521772 209901.53729969, 205646.56606571 209909.9323717, 205639.67358571 209917.1210437, 205638.93700971 209917.8892997, 205637.06244971 209917.5887557, 205633.63876971 209917.0398277, 205529.16120163 209900.28942769, 205439.37848157 209883.71688368, 205431.80491357 209882.31886768, 205104.89464134 209821.97646764, 205100.52216134 209788.75829161, 205086.93476933 209685.53441954, 205084.36113733 209665.98222753, 205074.76126532 209593.05121948, 205074.60849732 209591.89109148, 205074.43761732 209590.59291548, 205074.42564932 209590.50222747, 205074.65630532 209590.47291547, 205144.13105737 209581.64264347, 205148.71646537 209581.05979547, 205159.57681738 209579.67950747, 205238.06244943 209569.70401946, 205253.17700944 209567.78305946, 205266.63108946 209566.07297946, 205274.07102546 209562.88206746, 205287.21400147 209561.26094745, 205289.28062547 209560.59445145, 205292.82980947 209559.44981145, 205298.76990548 209557.53397145, 205321.4620015 209552.02299545, 205321.50040149 209552.18133145, 205421.82776156 209527.53249943, 205424.23979356 209526.93985943, 205436.56190557 209523.94389143, 205466.80811359 209516.58990743, 205539.70916964 209498.86491541, 205548.78334565 209496.65864341, 205595.04036968 209485.4118594, 205612.77560169 209481.0997954, 205766.3078898 209443.77038737, 205778.15569781 209440.88974737, 205778.89508981 209440.70997137, 205782.02315381 209464.59733139, 205783.50289781 209475.8970434, 205784.23006582 209480.7600834, 205785.72996981 209493.74997141, 205787.23998582 209505.64001942, 205789.82987382 209512.75995542, 205794.35998582 209518.13998742, 205829.19339384 209555.87963545, 205832.35320184 209562.38241946, 205833.71998584 209565.19496346, 205838.19416185 209574.40238747, 205839.04977785 209576.16309147, 205839.07108985 209576.25057947, 205839.46814585 209577.88078747, 205840.38110585 209581.62811547, 205843.04555386 209592.56539548, 205845.18424185 209599.10331548, 205848.09560186 209608.00321949, 205851.90961786 209616.77013149, 205853.28932986 209618.3323715, 205854.74315386 209619.97851549, 205856.54270586 209622.0160835, 205856.99480186 209622.1893955, 205861.35704187 209623.8619075, 205864.39160187 209624.2220995, 205867.92574587 209624.6450755, 205868.53636987 209624.5329475, 205875.65361787 209623.2261955, 205877.47371387 209622.8919875, 205871.76209787 209627.3856835, 205871.28670587 209627.7596995, 205867.15563387 209631.0098755, 205864.61624186 209633.00776351, 205863.36228987 209633.99432351, 205860.93873786 209635.90107551, 205859.44600186 209637.21422751, 205853.20772986 209642.70203551, 205848.23569786 209646.97710751, 205845.63838585 209652.55662752, 205843.84171385 209656.41608352, 205843.83275385 209656.83099552, 205843.65803386 209664.90952353, 205843.61630585 209666.84027553, 205843.48670585 209672.83105953, 205843.50443386 209672.91406753, 205845.74372985 209683.39105954, 205786.87480181 209751.34331559, 205777.5867378 209743.44193958, 205775.22104181 209741.42939558, 205744.10052978 209746.70017958), (205753.04574579 209658.40808352, 205755.9740018 209680.70875554, 205770.0163058 209678.92392354, 205768.2971378 209665.39809953, 205767.7309938 209665.47009953, 205766.6141938 209656.68341152, 205753.04574579 209658.40808352)))"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

# Subsystemen van de GPBV installatie zijn niet gekend en moeten door de rapporteringsplichtige zelf worden ingevuld.
# Ik ga er hier van uit dat alle systemen onderdeel zijn van de GPBV installatie.
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1456-7a2f-ac4e-8904bab88f37/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1457-7564-86c0-e28e802b8fa2/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1458-7b1f-bc81-76e221cdb630/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1459-714c-a5bc-ed1889914c81/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-145a-7a7e-b483-954bb6b31bb9/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac20-56eb-770d-bbb4-a099f0a90061/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac24-9c91-7338-a285-c660a5b88d11/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac67-c259-746e-9dd6-86e632fbc5cb/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac7b-b761-73fb-aac9-deea610bf316/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-13eb-716d-a64e-daccacb9eaee/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1581-763d-b48b-262afdcf970b/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1702-73bb-81a3-61f3c446dfae/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-189b-735e-b875-c17c55aa0f04/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1a2d-714b-9951-c87409bbc77e/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1bc8-70ed-a287-c035b8c37909/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb679-42b9-77df-bdc8-47ea9b612a9d/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-adf1-735c-8bdb-bdf806a3ab25/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-af83-728f-99cc-fd2689c6f6a6/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-b109-76bd-824f-5373fd2495e3/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-b296-7358-966d-7a491c9fb7db/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145b-75f5-83d9-fe9b0b7e9540/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145c-7c92-9099-59b4286bc121/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145d-7a81-bc94-32c5eae624ad/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-b8c6-7096-886c-103c3e21466c/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-ba55-72ab-979c-843563bcb58e/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bbf3-7009-8da2-c864d3860720/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bd81-7695-9a2b-2ded5be22aa0/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bf2c-7592-bd64-f5bb8ce8376e/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c0d0-7099-9a43-76e69454dc63/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c262-75cb-8019-85ebb5792237/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c3fe-77db-b321-7d13bfb958de/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c589-72bc-a42c-b7140527c79f/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-145e-7f05-8a58-f670d6672c99/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-145f-75f2-8222-342e7028bb37/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1460-7f57-81d2-d483a58d2439/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1463-719b-948f-22a102653d02/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1464-79bc-843b-87ccd701edea/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1465-72f2-8291-c289676c3ded/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1466-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1467-70da-9ee3-84dd0066573f/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1469-7d16-975e-2b00841913e6/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146a-7933-a3fa-3e66af90b82b/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146b-71c7-878c-20d0e9c8aea9/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146c-739e-af4f-7b3af72b9b4d/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146d-7e15-8388-676b085f663f/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146e-737d-b305-650c48295731/2026-01-01/2026-01-01T10:00:00Z> .

# Lozingspunten
#  Op basis van IMJV VMM data beschouwen we emissiepunten van het type lozingspunt wanneer ze in de XML als "lozingspunt" met 
#  meetputtype "lozend" voorkomen.
<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145b-75f5-83d9-fe9b0b7e9540/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145b-75f5-83d9-fe9b0b7e9540> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/lozingspunt> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld lozingspunt 019e9271-145c-7c92-9099-59b4286bc121
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    rdfs:label "LP01 Industrieel glasfabriek"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145c-7c92-9099-59b4286bc121/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145c-7c92-9099-59b4286bc121> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/lozingspunt> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld lozingspunt 019e9271-145d-7a81-bc94-32c5eae624ad
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    rdfs:label "LP02 Industrieel Kempenglas"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145d-7a81-bc94-32c5eae624ad/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145d-7a81-bc94-32c5eae624ad> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/lozingspunt> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld onttrekkingspunt 019e9271-145e-7f05-8a58-f670d6672c99
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    rdfs:label "LP07 Industrieel Coater"@nl .

# Emissiepunten (lucht)
<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-b8c6-7096-886c-103c3e21466c/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-b8c6-7096-886c-103c3e21466c> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen_verticale_uitstroom> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2020-03-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2269"^^vmm:emissiepuntId
    ] ;
    rdfs:label "SCHOUW GLASOVEN"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7a2f-a407-9e4892c4debd>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7f51-881b-55d6b3278a90>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-78e1-aeb9-c19e6918e530> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205180.0 209700.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-ba55-72ab-979c-843563bcb58e/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-ba55-72ab-979c-843563bcb58e> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen_verticale_uitstroom> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "1980-01-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2271"^^vmm:emissiepuntId
    ] ;
    rdfs:label "ETSLIJN 1etsafdeling"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b18-830e-9ec04686a339>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7405-88ed-011584565213>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7ef6-a1b0-b45096c5d67e> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205102.0 209758.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bbf3-7009-8da2-c864d3860720/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bbf3-7009-8da2-c864d3860720> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/emissiepunt> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "8059"^^vmm:emissiepuntId
    ] ;
    rdfs:label "STOOKINSTALLATIES"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-766c-9dcb-330766769529>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7195-ab0d-a841dc8a270a>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-79c0-9cbd-65234e23228b> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205000.0 209000.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bd81-7695-9a2b-2ded5be22aa0/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bd81-7695-9a2b-2ded5be22aa0> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen_verticale_uitstroom> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2003-01-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "8058"^^vmm:emissiepuntId
    ] ;
    rdfs:label "SCHOUW NAVERBRANDER"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7256-9995-dd4d7afe8c83>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7f1a-aef0-87b093d545ca>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-747a-bb53-9177eeac43ac> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205770.0 209580.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bf2c-7592-bd64-f5bb8ce8376e/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bf2c-7592-bd64-f5bb8ce8376e> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen_verticale_uitstroom> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2001-01-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "6295"^^vmm:emissiepuntId
    ] ;
    rdfs:label "VACUUMPOMPEN"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-729e-9f0e-28f6c9263b7a>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-72e5-a751-3697982ba05e>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7409-9d44-2f23b8eab79f> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205780.0 209485.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c0d0-7099-9a43-76e69454dc63/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c0d0-7099-9a43-76e69454dc63> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen_verticale_uitstroom> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2019-05-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "13005"^^vmm:emissiepuntId
    ] ;
    rdfs:label "ETSLIJN 2 etsafdeling"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b1a-bbbe-521166ae2986>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7bb0-8eb5-0ab162782600>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-751f-8deb-2582305d7782> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205000.0 209000.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c262-75cb-8019-85ebb5792237/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c262-75cb-8019-85ebb5792237> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen_verticale_uitstroom> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2019-12-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "13143"^^vmm:emissiepuntId
    ] ;
    rdfs:label "Steam reformer links"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-769e-81e8-a07592609129>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7dbe-892f-20edf9e9117c>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7bc0-a45e-ae8ba382dc53> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205000.0 209000.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c3fe-77db-b321-7d13bfb958de/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c3fe-77db-b321-7d13bfb958de> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen_verticale_uitstroom> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2019-12-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "13144"^^vmm:emissiepuntId
    ] ;
    rdfs:label "Steam reformer rechts"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7692-8056-f66dc56e67dc>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-788e-ab7c-015d6910ccd1>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7976-a21f-ec2bf56eb420> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205000.0 209000.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c589-72bc-a42c-b7140527c79f/2026-01-01/2026-01-01T10:00:00Z> a riepr:Emissiepunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c589-72bc-a42c-b7140527c79f> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-type/schoorsteen_verticale_uitstroom> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2022-07-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "13549"^^vmm:emissiepuntId
    ] ;
    rdfs:label "Steam reformer Hygen 3"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-71de-aa4a-2a574c159729>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-710b-8b9f-5654b501a5fc>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-795f-90a4-c70e76112e84> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205000.0 209000.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

# Onttrekkingspunten (migratie water)
#  Op basis van IMJV VMM data beschouwen we emissiepunten van het type onttrekkingspunt wanneer ze in de XML als "lozingspunt" met
#  meetputtype "Oppompend" voorkomen.
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-145e-7f05-8a58-f670d6672c99/2026-01-01/2026-01-01T10:00:00Z> a riepr:Onttrekkingspunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-145e-7f05-8a58-f670d6672c99> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-type/onttrekkingspunt> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # verzonnen mockdatum: geen ondubbelzinnige ingebruiknamedatum gevonden in brondata
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    rdfs:label "Opgenomen oppervlaktewater"@nl .

## Onttrekkingspunten (migratie grondwater)
## Op basis van VMM data type "GRONDWATERWINNING" voor grondwaterput
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1463-719b-948f-22a102653d02/2026-01-01/2026-01-01T10:00:00Z> a riepr:Onttrekkingspunt ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1463-719b-948f-22a102653d02> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-type/pompput> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # verzonnen mockdatum: geen ondubbelzinnige ingebruiknamedatum gevonden in brondata
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46769"^^vmm:onttrekkingspuntCode
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-010762"^^vmm:exploitantID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "ANT-00151-A"^^vmm:watnr
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-052596"^^vmm:vergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "54633"^^vmm:installatieVergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "52596"^^vmm:vergundeRubriekID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-058039"^^vmm:installatieID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-001882"^^vmm:iioaID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-043747"^^vmm:putID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "paleo-putdov84834"^^vmm:putKey
    ] ;
    rdfs:label "4 (KG atelier)"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7c21-b0a0-1a798becf2f9> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205583.0 209510.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1464-79bc-843b-87ccd701edea/2026-01-01/2026-01-01T10:00:00Z> a riepr:Onttrekkingspunt ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1464-79bc-843b-87ccd701edea> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-type/pompput> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # verzonnen mockdatum: geen ondubbelzinnige ingebruiknamedatum gevonden in brondata
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46772"^^vmm:onttrekkingspuntCode
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-010762"^^vmm:exploitantID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "ANT-00151-A"^^vmm:watnr
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-052596"^^vmm:vergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "54633"^^vmm:installatieVergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "52596"^^vmm:vergundeRubriekID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-058039"^^vmm:installatieID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-001882"^^vmm:iioaID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-043750"^^vmm:putID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "paleo-putdov84837"^^vmm:putKey
    ] ;
    rdfs:label "2 (onderhoud)"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-70c0-99ae-423d2e7c5501> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205359.0 209631.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1465-72f2-8291-c289676c3ded/2026-01-01/2026-01-01T10:00:00Z> a riepr:Onttrekkingspunt ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1465-72f2-8291-c289676c3ded> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-type/pompput> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # verzonnen mockdatum: geen ondubbelzinnige ingebruiknamedatum gevonden in brondata
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46771"^^vmm:onttrekkingspuntCode
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-010762"^^vmm:exploitantID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "ANT-00151-A"^^vmm:watnr
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-052596"^^vmm:vergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "54633"^^vmm:installatieVergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "52596"^^vmm:vergundeRubriekID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-058039"^^vmm:installatieID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-001882"^^vmm:iioaID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-043749"^^vmm:putID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "paleo-putdov84836"^^vmm:putKey
    ] ;
    rdfs:label "1 (FL koeltoren)"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7922-814d-2db735c083eb> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205229.0 209786.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1466-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z> a riepr:Onttrekkingspunt ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1466-7240-ac66-b7831d1b3623> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-type/pompput> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # verzonnen mockdatum: geen ondubbelzinnige ingebruiknamedatum gevonden in brondata
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46773"^^vmm:onttrekkingspuntCode
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-010762"^^vmm:exploitantID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "ANT-00151-A"^^vmm:watnr
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-052596"^^vmm:vergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "54633"^^vmm:installatieVergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "52596"^^vmm:vergundeRubriekID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-058039"^^vmm:installatieID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-001882"^^vmm:iioaID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-043751"^^vmm:putID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "paleo-putdov84838"^^vmm:putKey
    ] ;
    rdfs:label "3 (VT verzending)"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7304-956b-b2509b0fdcc7> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205503.0 209812.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1467-70da-9ee3-84dd0066573f/2026-01-01/2026-01-01T10:00:00Z> a riepr:Onttrekkingspunt ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1467-70da-9ee3-84dd0066573f> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-type/pompput> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # verzonnen mockdatum: geen ondubbelzinnige ingebruiknamedatum gevonden in brondata
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46770"^^vmm:onttrekkingspuntCode
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-010762"^^vmm:exploitantID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "ANT-00151-A"^^vmm:watnr
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-052596"^^vmm:vergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "54633"^^vmm:installatieVergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "52596"^^vmm:vergundeRubriekID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-058039"^^vmm:installatieID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-001882"^^vmm:iioaID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-043748"^^vmm:putID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "paleo-putdov84835"^^vmm:putKey
    ] ;
    rdfs:label "5 (KG verzending)"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7a3d-8d0a-fd5a5f9fe433> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205755.0 209651.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

# Filters voor onttrekkingspunten (migratie grondwater)
# Peilfilters (Type PEIL)
<https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-711a-b032-2a0aea8fcdcb/2026-01-01/2026-01-01T10:00:00Z> a riepr:Filter ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-711a-b032-2a0aea8fcdcb> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-type/filter> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-099954"^^vmm:filterId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7511-b394-11b36f0d8374>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-70c9-a2ed-258f21b11a8e>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-731a-854f-7cdb6c878196> ;
    rdfs:label "1"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7674-8785-3698855d62cb/2026-01-01/2026-01-01T10:00:00Z> a riepr:Filter ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7674-8785-3698855d62cb> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-type/filter> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-099955"^^vmm:filterId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7106-ab58-fb7650ab5daa>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7161-9493-f0f15743dd24>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7e13-b8d5-7f7a74085072> ;
    rdfs:label "2"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-71bb-b7ef-1e2048da7fa4/2026-01-01/2026-01-01T10:00:00Z> a riepr:Filter ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-71bb-b7ef-1e2048da7fa4> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-type/filter> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-099956"^^vmm:filterId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7bd1-b713-0373d720f8d4>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-761c-b018-31c9df52ad8d>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-761a-b36b-c04ab92595c1> ;
    rdfs:label "3"@nl .

# Pompfilters (Type GRONDWATERWINNING)
<https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7edf-b3c1-487ce3d798f5/2026-01-01/2026-01-01T10:00:00Z> a riepr:Filter ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7edf-b3c1-487ce3d798f5> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-type/pomp> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "1990-083958"^^vmm:filterId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7896-89e8-346b388b7894>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-785c-b8e1-969dcac91749>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7065-8953-765dc937b866> ;
    rdfs:label "1"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-783c-8c2e-fe459ade9731/2026-01-01/2026-01-01T10:00:00Z> a riepr:Filter ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-783c-8c2e-fe459ade9731> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-type/pomp> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "1989-083961"^^vmm:filterId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7ad6-aa26-614815274c25>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7e7b-8288-e8ca1fe01021>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7641-92d0-506f90e71e48> ;
    rdfs:label "2"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7a74-bc5c-22d1dd45dce9/2026-01-01/2026-01-01T10:00:00Z> a riepr:Filter ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7a74-bc5c-22d1dd45dce9> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-type/pomp> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "1988-083960"^^vmm:filterId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7525-b7cd-1a260d9e4bd4>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-79e7-b257-5a12b78deb00>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7fa2-9df8-23dee3625403> ;
    rdfs:label "1"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7b0d-83a3-1904844249d1/2026-01-01/2026-01-01T10:00:00Z> a riepr:Filter ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7b0d-83a3-1904844249d1> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-type/pomp> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "1990-083962"^^vmm:filterId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-76c7-b72e-5b4f237a7d25>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7ec4-948c-6d7ee4dec799>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b24-8bfb-e1f1b108efaa> ;
    rdfs:label "3"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-77ec-b9a8-a16a5664e0f4/2026-01-01/2026-01-01T10:00:00Z> a riepr:Filter ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-77ec-b9a8-a16a5664e0f4> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-type/pomp> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "1990-083959"^^vmm:filterId
    ] ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7072-91da-219f80feab31>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7059-b375-1386ee8298d7>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-73b5-8270-1a05bc5046f0> ;
    rdfs:label "1"@nl .

# Filters gekoppeld aan onttrekkingspunten
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1468-7c83-bfd9-dc30667ab9a1/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-711a-b032-2a0aea8fcdcb/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1468-7c83-bfd9-dc30667ab9a1/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7674-8785-3698855d62cb/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1468-7c83-bfd9-dc30667ab9a1/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-71bb-b7ef-1e2048da7fa4/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1463-719b-948f-22a102653d02/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7edf-b3c1-487ce3d798f5/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1464-79bc-843b-87ccd701edea/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-783c-8c2e-fe459ade9731/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1465-72f2-8291-c289676c3ded/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7a74-bc5c-22d1dd45dce9/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1466-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-7b0d-83a3-1904844249d1/2026-01-01/2026-01-01T10:00:00Z> .
<https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1467-70da-9ee3-84dd0066573f/2026-01-01/2026-01-01T10:00:00Z> ssn:hasSubSystem <https://data.mjv.omgeving.vlaanderen.be/id/filter/019e9682-6644-77ec-b9a8-a16a5664e0f4/2026-01-01/2026-01-01T10:00:00Z> .

# Meetpunten
#  Bij een lozingspunt maken een controleinrichting met als naam "Controleinrichting " + <lozingspunt naam>.
<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-145f-75f2-8222-342e7028bb37/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-145f-75f2-8222-342e7028bb37> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/controleinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld lozingspunt 019e9271-145b-75f5-83d9-fe9b0b7e9540
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2400006"^^vmm:lozingspuntCode
    ] ;
    # Elke installatie, emissiepunt, ... (systeem) is verbonden met de locatie. Onrechtstreeks lijkt dit overbodig mits je ook de exploitatie -> exploitatielocatie verbinding hebt,
    # maar op deze manier kunnen we een vestiging/locatie later makkelijker verkopen/linken aan een nieuwe exploitatie.
    rdfs:label "Controleinrichting LP01 Industrieel glasfabriek"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1461-7f34-b276-0b3c1bee1186/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1461-7f34-b276-0b3c1bee1186> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/controleinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld lozingspunt 019e9271-145c-7c92-9099-59b4286bc121
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2400007"^^vmm:lozingspuntCode
    ] ;
    rdfs:label "Controleinrichting LP02 Industrieel Kempenglas"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1460-7f57-81d2-d483a58d2439/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1460-7f57-81d2-d483a58d2439> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/controleinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld lozingspunt 019e9271-145d-7a81-bc94-32c5eae624ad
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "9991095"^^vmm:lozingspuntCode
    ] ;
    rdfs:label "Controleinrichting LP07 Industrieel Coater"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1462-7a6b-a750-ee0ec6f63870/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1462-7a6b-a750-ee0ec6f63870> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/controleinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld onttrekkingspunt 019e9271-145e-7f05-8a58-f670d6672c99
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2400019"^^vmm:onttrekkingspuntCode
    ] ;
    rdfs:label "Controleinrichting Opgenomen oppervlakte"@nl .

# Een peilput is een meetpunt
# Migratie uit VMM data op basis van "PEIL" type van een grondwaterput
<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1469-7d16-975e-2b00841913e6/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1469-7d16-975e-2b00841913e6> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # verzonnen mockdatum: geen ondubbelzinnige ingebruiknamedatum gevonden in brondata
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "98955"^^vmm:onttrekkingspuntCode
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-010762"^^vmm:exploitantID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "ANT-00151-A"^^vmm:watnr
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-052596"^^vmm:vergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "54633"^^vmm:installatieVergunningID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "52596"^^vmm:vergundeRubriekID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-058039"^^vmm:installatieID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2019-001882"^^vmm:iioaID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2020-095507"^^vmm:putID
    ], [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "put-1607593700174"^^vmm:putKey
    ] ;
    rdfs:label "Peilput"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-77c8-85ea-cc2defa98785>, <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-719b-a034-5e609820a784> ;
    ogc:hasGeometry [ a ogc:Point ;
        ogc:asWKT "POINT (205713.0 209689.0)"^^ogc:wktLiteral ;
        ogc:crs <http://www.opengis.net/gml/srs/epsg.xml#31370>
    ] .

# Bij onttrekkingspunten maken we ook een meetinrichting op basis van de putnaam.
<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146a-7933-a3fa-3e66af90b82b/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146a-7933-a3fa-3e66af90b82b> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/meetinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld onttrekkingspunt 019e9271-1463-719b-948f-22a102653d02
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46769"^^vmm:onttrekkingspuntCode
    ] ;
    rdfs:label "Meetinrichting 4 (KG atelier)"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7815-b7fd-cbb6110dcf99> .

<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146b-71c7-878c-20d0e9c8aea9/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146b-71c7-878c-20d0e9c8aea9> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/meetinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld onttrekkingspunt 019e9271-1464-79bc-843b-87ccd701edea
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46772"^^vmm:onttrekkingspuntCode
    ] ;
    rdfs:label "Meetinrichting 2 (onderhoud)"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146c-739e-af4f-7b3af72b9b4d/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146c-739e-af4f-7b3af72b9b4d> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/meetinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld onttrekkingspunt 019e9271-1465-72f2-8291-c289676c3ded
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46771"^^vmm:onttrekkingspuntCode
    ] ;
    rdfs:label "Meetinrichting 1 (FL koeltoren)"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146d-7e15-8388-676b085f663f/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146d-7e15-8388-676b085f663f> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/meetinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld onttrekkingspunt 019e9271-1466-7240-ac66-b7831d1b3623
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46773"^^vmm:onttrekkingspuntCode
    ] ;
    rdfs:label "Meetinrichting 3 (VT verzending)"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146e-737d-b305-650c48295731/2026-01-01/2026-01-01T10:00:00Z> a riepr:Meetpunt, ssn:System ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146e-737d-b305-650c48295731> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-type/meetinrichting> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2026-01-01"^^xsd:date ; # afgeleid: gelijkgezet aan gekoppeld onttrekkingspunt 019e9271-1467-70da-9ee3-84dd0066573f
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "46770"^^vmm:onttrekkingspuntCode
    ] ;
    rdfs:label "Meetinrichting 5 (KG verzending)"@nl .

# Installaties (lucht)
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac20-56eb-770d-bbb4-a099f0a90061/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac20-56eb-770d-bbb4-a099f0a90061> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "1980-01-01"^^xsd:date ; 
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "1178"^^vmm:activiteitId
    ] ;
    rdfs:label "ETSLIJN 1 etsafdeling"@nl ;
    rdfs:comment "Bereiding van etsoplossing om vlak glas te etsen - etsen van vlak glas. Wastoren is voorzien om zure dampen te wassen."@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7972-8add-ab826a6ce827> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac24-9c91-7338-a285-c660a5b88d11/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac24-9c91-7338-a285-c660a5b88d11> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "13239"^^vmm:activiteitId
    ] ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    rdfs:label "STOOKINSTALLATIES EN STOOMKETELS"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b92-8d82-d47130a76081> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac67-c259-746e-9dd6-86e632fbc5cb/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac67-c259-746e-9dd6-86e632fbc5cb> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "2003-01-01"^^vmm:activiteitId
    ] ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    rdfs:label "ELEKTRISCHE DROOGOVEN MET NAVERBRANDER"@nl ;
    rdfs:comment "Emaillaag aanbrengen op vlak glas waar het vlak glas niet gecoat mag worden - deze emaillaag drogen in droogoven - coaten van vlak glas - verwijderen van emaillaag vlak glas."@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7236-b3e0-16fd256a169f> .
    
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac7b-b761-73fb-aac9-deea610bf316/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac7b-b761-73fb-aac9-deea610bf316> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2001-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "13240"^^vmm:activiteitId
    ] ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    rdfs:label "COATER"@nl ;
    rdfs:comment " Vlak glas coaten met metaallaag onder vaccuum."@nl # Merk op dat datakwaliteitsproblemen zoals spaties mee overgenomen worden
    .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-13eb-716d-a64e-daccacb9eaee/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-13eb-716d-a64e-daccacb9eaee> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2001-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2001-01-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "13241"^^vmm:activiteitId
    ] ;
    rdfs:label "VACUUMPOMPEN"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7893-bed5-0ec8b5b2f937> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1581-763d-b48b-262afdcf970b/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1581-763d-b48b-262afdcf970b> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2019-05-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2019-05-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "19105"^^vmm:activiteitId
    ] ;
    rdfs:label "ETSLIJN 2 etsafdeling"@nl ;
    rdfs:comment "Bereiding van etsoplossing om vlak glas te etsen - etsen van vlak glas. Wastoren is voorzien om zure dampen te wassen."@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1702-73bb-81a3-61f3c446dfae/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1702-73bb-81a3-61f3c446dfae> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2020-03-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2020-03-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "19240"^^vmm:activiteitId
    ] ;
    rdfs:label "GLASOVEN"@nl ;
    rdfs:comment "Afwegen, mengen en smelten van grondstoffen - vorming vlak glas - stapelen vlak glas. Als luchtzuivering wordt een electrofilter en een SCR installatie gebruikt."@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7603-b4f8-ee17964d55ae> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-189b-735e-b875-c17c55aa0f04/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-189b-735e-b875-c17c55aa0f04> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2019-12-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2019-12-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "19241"^^vmm:activiteitId
    ] ;
    rdfs:label "Steam reformer links"@nl ;
    rdfs:comment " Productie van waterstof uit aardgas"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7119-9cde-259b5af7f5dd> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1a2d-714b-9951-c87409bbc77e/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1a2d-714b-9951-c87409bbc77e> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2019-12-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2019-12-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "19242"^^vmm:activiteitId
    ] ;
    rdfs:label "Steam reformer rechts"@nl ;
    rdfs:comment " Omzetten van aardgas naar waterstofgas"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7ee3-860e-cbb41d935d0e> .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1bc8-70ed-a287-c035b8c37909/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1bc8-70ed-a287-c035b8c37909> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/installatie> ;
    dct:issued "2022-07-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2022-07-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "19715"^^vmm:activiteitId
    ] ;
    rdfs:label "Steam reformer Hygen 3"@nl ;
    rdfs:comment "Omzetten van aardgas naar waterstofgas"@nl ;
    ssn:hasProperty <https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7602-98f1-08ebfdb86b49> .

# Installaties (zuiveringsinstallaties lucht)
<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb679-42b9-77df-bdc8-47ea9b612a9d/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb679-42b9-77df-bdc8-47ea9b612a9d> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/luchtzuivering> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2001-01-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "9158"^^vmm:zuiveringsapparaatId
    ] ;
    rdfs:label "ELECTROFILTER"@nl ;
    rdfs:comment "Techniek: ELECTROFILTER. Zuivert: Zink, SOx (als SO2), F-verbindingen (als F-), CO2, Koper, Totaal stof, NOx (als NO2)."@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-adf1-735c-8bdb-bdf806a3ab25/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-adf1-735c-8bdb-bdf806a3ab25> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/luchtzuivering> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2013-04-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "12782"^^vmm:zuiveringsapparaatId
    ] ;
    rdfs:label "SCR"@nl ;
    rdfs:comment "Techniek: reductie NOx. Zuivert: NOx (als NO2)."@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-af83-728f-99cc-fd2689c6f6a6/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-af83-728f-99cc-fd2689c6f6a6> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/luchtzuivering> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "1999-01-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "4062"^^vmm:zuiveringsapparaatId
    ] ;
    rdfs:label "Wastoren etslijn 1"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-b109-76bd-824f-5373fd2495e3/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-b109-76bd-824f-5373fd2495e3> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/luchtzuivering> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2003-01-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "9159"^^vmm:zuiveringsapparaatId
    ] ;
    rdfs:label "NAVERBRANDER"@nl .

<https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-b296-7358-966d-7a491c9fb7db/2026-01-01/2026-01-01T10:00:00Z> a riepr:Installatie ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-b296-7358-966d-7a491c9fb7db> ;
    adms:status <https://data.omgeving.vlaanderen.be/id/concept/riepr/status-type/in_dienst> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-type/luchtzuivering> ;
    dct:issued "2026-01-01"^^xsd:date ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    riepr:inGebruikVanaf "2019-05-01"^^xsd:date ;
    sosa:isHostedBy <https://data.mjv.omgeving.vlaanderen.be/id/exploitatielocatie/019e9271-1453-7810-92ea-ccac2e6932b1/2026-01-01/2026-01-01T10:00:00Z> ;
    adms:identifier [ a adms:Identifier ;
        adms:schemaAgency "VMM" ;
        skos:notation "13179"^^vmm:zuiveringsapparaatId
    ] ;
    rdfs:label "Wastoren etslijn 2"@nl .

## ---------------------------------------- ##
## Processen en procesverbindingen          ##
## ---------------------------------------- ##
# Processen verbinden de installaties, emissiepunten en andere systemen met elkaar
# deze scheiding zorgt ervoor dat wijziging aan verbindingen (bv. een installatie die naar een andere filterinstallatie gaat)
# geen wijziging aan het systeem zelf vereist.
#
# Elk systeem dat in dienst genomen is heeft een proces/activiteit die deze in dienst name representeert.
#
# Rubrieken hangen op de processen omdat deze afhangen van de installatie voor bepaalde doeleinde (activiteit)
# m.a.w. eenzelfde installatie kan onder verschillende rubrieken vallen afhankelijk van de activiteit die ermee wordt uitgevoerd.

# Proces voor de GPBV installatie
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc> ;
    rdfs:label "Proces GPBV installatie AGC Glass Mol"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/BE_VL_000000002_INSTALLATION/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1455-78f7-94b6-becb88019f89/2026-01-01/2026-01-01T10:00:00Z> ;
    riepr:rubriek [
        a riepr:Rubriek ;
        skos:notation "20.3.4.1°b)" ;
        skos:definition "Glasoven met max. 450 ton per dag en 155.000 ton per jaar productie aan vlak glas."@nl ;
        # Het soort/type rubriek (EGW, VLAREM, ...)
        dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/rubriek-type/vlarem> ;
        # De primaire bron is VITO
        prov:hadPrimarySource <https://URI_TE_BEPALEN_VITO> 
    ], [
        a riepr:Rubriek ;
        skos:notation "43.3.2°" ;
        skos:definition "Het stoken in installaties inclusief stationaire motoren en gasturbines, met een totaal nominaal thermisch ingangsvermogen van 75,465 MW, omvattend stookinstallaties van 26.515 kW, een glasoven van 48.000 kW en inwendige motoren van 2x 375 kW en 1x 200 kW."@nl ;
        # Het soort/type rubriek (EGW, VLAREM, ...)
        dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/rubriek-type/vlarem> ;
        # De primaire bron is VITO
        prov:hadPrimarySource <https://URI_TE_BEPALEN_VITO> 
    ] .

# Proces voor installatie "waterzuiveringsinstallatie"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1470-739e-b93b-ba3f6f75feb4/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1470-739e-b93b-ba3f6f75feb4> ;
    rdfs:label "Proces waterzuiveringsinstallatie"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1456-7a2f-ac4e-8904bab88f37/2026-01-01/2026-01-01T10:00:00Z> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    # [EIGEN INTERPRETATIE] De voorgaande stap zijn de twee installaties (demi en coater) die het proces van de GPBV installatie voorbereiden. De waterzuiveringsinstallatie komt hierna omdat deze het afvalwater van de andere installaties behandelt alvorens dit te lozen.
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1471-7efd-822f-bf68d1c55a77/2026-01-01/2026-01-01T10:00:00Z>, <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1472-775c-839d-d1482699ce7d/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor installatie "demi-installatie glasfabriek"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1471-7efd-822f-bf68d1c55a77/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1471-7efd-822f-bf68d1c55a77> ;
    rdfs:label "Proces demi-installatie glasfabriek"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1457-7564-86c0-e28e802b8fa2/2026-01-01/2026-01-01T10:00:00Z> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor installatie "demi-installatie coater"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1472-775c-839d-d1482699ce7d/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1472-775c-839d-d1482699ce7d> ;
    rdfs:label "Proces demi-installatie coater"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1458-7b1f-bc81-76e221cdb630/2026-01-01/2026-01-01T10:00:00Z> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor installatie "Centrifuge"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1473-774e-a1e6-00927121b4fa/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1473-774e-a1e6-00927121b4fa> ;
    rdfs:label "Proces centrifuge"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-145a-7a7e-b483-954bb6b31bb9/2026-01-01/2026-01-01T10:00:00Z> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    # [EIGEN INTERPRETATIE] De centrifuge komt na de waterzuiveringsinstallatie omdat deze het afvalwater van de andere installaties behandelt alvorens dit te lozen.
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1470-739e-b93b-ba3f6f75feb4/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor installatie "ultrafiltratie"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1474-771b-839b-e3e39963d6e1/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1474-771b-839b-e3e39963d6e1> ;
    rdfs:label "Proces ultrafiltratie"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019e9271-1459-714c-a5bc-ed1889914c81/2026-01-01/2026-01-01T10:00:00Z> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor emissiepunt "LP01 Industrieel glasfabriek"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1475-7b7f-aa45-80c590ff6514/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1475-7b7f-aa45-80c590ff6514> ;
    rdfs:label "Proces emissiepunt LP01 Industrieel glasfabriek"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145b-75f5-83d9-fe9b0b7e9540/2026-01-01/2026-01-01T10:00:00Z> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    # De controleinrichting gaat vooraf aan het lozingspunt
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1476-75aa-ab90-bafcb831f91c/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor emissiepunt "LP02 Industrieel Kempenglas"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1477-7dde-b831-ede778f01064/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1477-7dde-b831-ede778f01064> ;
    rdfs:label "Proces emissiepunt LP02 Industrieel Kempenglas"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145c-7c92-9099-59b4286bc121/2026-01-01/2026-01-01T10:00:00Z> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    # De controleinrichting gaat vooraf aan het lozingspunt
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1478-74ce-9a2e-b8571f6b9e43/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor emissiepunt "LP07 Industrieel Coater"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1479-7684-a8c3-6a59cb6e49d9/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1479-7684-a8c3-6a59cb6e49d9> ;
    rdfs:label "Proces emissiepunt LP07 Industrieel Coater"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019e9271-145d-7a81-bc94-32c5eae624ad/2026-01-01/2026-01-01T10:00:00Z> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    # De controleinrichting gaat vooraf aan het lozingspunt
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147a-7b92-90cd-5639d24ad255/2026-01-01/2026-01-01T10:00:00Z> .

# Processen voor emissiepunten (lucht)
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-b8c6-7096-886c-103c3e21466c-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-b8c6-7096-886c-103c3e21466c-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-b8c6-7096-886c-103c3e21466c/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-ba55-72ab-979c-843563bcb58e-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-ba55-72ab-979c-843563bcb58e-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-ba55-72ab-979c-843563bcb58e/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-af83-728f-99cc-fd2689c6f6a6-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-bbf3-7009-8da2-c864d3860720-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-bbf3-7009-8da2-c864d3860720-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bbf3-7009-8da2-c864d3860720/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac24-9c91-7338-a285-c660a5b88d11-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-bd81-7695-9a2b-2ded5be22aa0-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-bd81-7695-9a2b-2ded5be22aa0-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bd81-7695-9a2b-2ded5be22aa0/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-b109-76bd-824f-5373fd2495e3-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-bf2c-7592-bd64-f5bb8ce8376e-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-bf2c-7592-bd64-f5bb8ce8376e-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-bf2c-7592-bd64-f5bb8ce8376e/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-13eb-716d-a64e-daccacb9eaee-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-c0d0-7099-9a43-76e69454dc63-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-c0d0-7099-9a43-76e69454dc63-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c0d0-7099-9a43-76e69454dc63/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-b296-7358-966d-7a491c9fb7db-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-c262-75cb-8019-85ebb5792237-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-c262-75cb-8019-85ebb5792237-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c262-75cb-8019-85ebb5792237/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-189b-735e-b875-c17c55aa0f04-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-c3fe-77db-b321-7d13bfb958de-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-c3fe-77db-b321-7d13bfb958de-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c3fe-77db-b321-7d13bfb958de/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1a2d-714b-9951-c87409bbc77e-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-c589-72bc-a42c-b7140527c79f-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eaca0-c589-72bc-a42c-b7140527c79f-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/emissie> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/emissiepunt/019eaca0-c589-72bc-a42c-b7140527c79f/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1bc8-70ed-a287-c035b8c37909-lucht/2026-01-01/2026-01-01T10:00:00Z> .

# Processen voor installaties (lucht)
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac20-56eb-770d-bbb4-a099f0a90061-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac20-56eb-770d-bbb4-a099f0a90061-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac20-56eb-770d-bbb4-a099f0a90061/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac24-9c91-7338-a285-c660a5b88d11-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac24-9c91-7338-a285-c660a5b88d11-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac24-9c91-7338-a285-c660a5b88d11/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac67-c259-746e-9dd6-86e632fbc5cb-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac67-c259-746e-9dd6-86e632fbc5cb-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac67-c259-746e-9dd6-86e632fbc5cb/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac7b-b761-73fb-aac9-deea610bf316-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac7b-b761-73fb-aac9-deea610bf316-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac7b-b761-73fb-aac9-deea610bf316-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac7b-b761-73fb-aac9-deea610bf316/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-13eb-716d-a64e-daccacb9eaee-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-13eb-716d-a64e-daccacb9eaee-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-13eb-716d-a64e-daccacb9eaee/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac7b-b761-73fb-aac9-deea610bf316-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1581-763d-b48b-262afdcf970b-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1581-763d-b48b-262afdcf970b-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1581-763d-b48b-262afdcf970b/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1702-73bb-81a3-61f3c446dfae-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1702-73bb-81a3-61f3c446dfae-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1702-73bb-81a3-61f3c446dfae/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-189b-735e-b875-c17c55aa0f04-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-189b-735e-b875-c17c55aa0f04-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-189b-735e-b875-c17c55aa0f04/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1702-73bb-81a3-61f3c446dfae-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1a2d-714b-9951-c87409bbc77e-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1a2d-714b-9951-c87409bbc77e-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1a2d-714b-9951-c87409bbc77e/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1702-73bb-81a3-61f3c446dfae-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1bc8-70ed-a287-c035b8c37909-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1bc8-70ed-a287-c035b8c37909-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eac98-1bc8-70ed-a287-c035b8c37909/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1702-73bb-81a3-61f3c446dfae-lucht/2026-01-01/2026-01-01T10:00:00Z> .

# Processen voor installaties (luchtzuivering)
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb679-42b9-77df-bdc8-47ea9b612a9d-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb679-42b9-77df-bdc8-47ea9b612a9d-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb679-42b9-77df-bdc8-47ea9b612a9d/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1702-73bb-81a3-61f3c446dfae-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-adf1-735c-8bdb-bdf806a3ab25-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-adf1-735c-8bdb-bdf806a3ab25-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-adf1-735c-8bdb-bdf806a3ab25/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1702-73bb-81a3-61f3c446dfae-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-af83-728f-99cc-fd2689c6f6a6-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-af83-728f-99cc-fd2689c6f6a6-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-af83-728f-99cc-fd2689c6f6a6/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac20-56eb-770d-bbb4-a099f0a90061-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-b109-76bd-824f-5373fd2495e3-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-b109-76bd-824f-5373fd2495e3-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-b109-76bd-824f-5373fd2495e3/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac67-c259-746e-9dd6-86e632fbc5cb-lucht/2026-01-01/2026-01-01T10:00:00Z> .

<https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-b296-7358-966d-7a491c9fb7db-lucht/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eb685-b296-7358-966d-7a491c9fb7db-lucht> ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/verwerking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/installatie/019eb685-b296-7358-966d-7a491c9fb7db/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019eac98-1581-763d-b48b-262afdcf970b-lucht/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor onttrekkingspunt "Opgenomen oppervlaktewater"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147b-712f-8499-6bbf0d73ed8a/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147b-712f-8499-6bbf0d73ed8a> ;
    rdfs:label "Proces onttrekkingspunt opgenomen oppervlaktewater"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/onttrekking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-145e-7f05-8a58-f670d6672c99/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1455-78f7-94b6-becb88019f89/2026-01-01/2026-01-01T10:00:00Z> .
    # Voor de onttrekking komt de meetinrichting erna (dus niet 'isPrecededBy')

# Proces voor onttrekkingspunt "4 (KG atelier)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147c-78e0-9d71-20a8271b5e02/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147c-78e0-9d71-20a8271b5e02> ;
    rdfs:label "Proces onttrekkingspunt 4 (KG atelier)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/onttrekking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1463-719b-948f-22a102653d02/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor onttrekkingspunt "2 (onderhoud)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147d-721e-bd38-93f293fd5612/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147d-721e-bd38-93f293fd5612> ;
    rdfs:label "Proces onttrekkingspunt 2 (onderhoud)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/onttrekking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1464-79bc-843b-87ccd701edea/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor onttrekkingspunt "1 (FL koeltoren)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147e-7034-85ba-66abf95ea2e5/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147e-7034-85ba-66abf95ea2e5> ;
    rdfs:label "Proces onttrekkingspunt 1 (FL koeltoren)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/onttrekking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1465-72f2-8291-c289676c3ded/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor onttrekkingspunt "3 (VT verzending)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147f-7752-9b8e-042cf1fbda4f/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147f-7752-9b8e-042cf1fbda4f> ;
    rdfs:label "Proces onttrekkingspunt 3 (VT verzending)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/onttrekking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1466-7240-ac66-b7831d1b3623/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor onttrekkingspunt "5 (KG verzending)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1480-7847-8ac1-d4c44a6dd474/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1480-7847-8ac1-d4c44a6dd474> ;
    rdfs:label "Proces onttrekkingspunt 5 (KG verzending)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/onttrekking> ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/onttrekkingspunt/019e9271-1467-70da-9ee3-84dd0066573f/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Controleinrichting LP01 Industrieel glasfabriek"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1476-75aa-ab90-bafcb831f91c/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1476-75aa-ab90-bafcb831f91c> ;
    rdfs:label "Proces controleinrichting LP01 Industrieel glasfabriek"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-145f-75f2-8222-342e7028bb37/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Controleinrichting LP02 Industrieel Kempenglas"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1478-74ce-9a2e-b8571f6b9e43/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1478-74ce-9a2e-b8571f6b9e43> ;
    rdfs:label "Proces controleinrichting LP02 Industrieel Kempenglas"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1461-7f34-b276-0b3c1bee1186/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Controleinrichting LP07 Industrieel Coater"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147a-7b92-90cd-5639d24ad255/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147a-7b92-90cd-5639d24ad255> ;
    rdfs:label "Proces controleinrichting LP07 Industrieel Coater"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1460-7f57-81d2-d483a58d2439/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    # [EIGEN INTERPRETATIE] De controleinrichting volgt op de zuivering
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1470-739e-b93b-ba3f6f75feb4/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Controleinrichting Opgenomen oppervlakte"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1481-7a80-acfd-0fc82389cba6/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1481-7a80-acfd-0fc82389cba6> ;
    rdfs:label "Proces controleinrichting opgenomen oppervlakte"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1462-7a6b-a750-ee0ec6f63870/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    # Standaard verbonden met het hoofdproces, maar in praktijk hierarchisch onder te brengen onder het proces van de GPBV installatie
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    # De meetinrichting volgt op het onttrekkingspunt
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147b-712f-8499-6bbf0d73ed8a/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Peilput"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1482-7435-84b7-d9598ab331a1/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1482-7435-84b7-d9598ab331a1> ;
    rdfs:label "Proces peilput"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-1469-7d16-975e-2b00841913e6/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Meetinrichting 4 (KG atelier)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1483-73e6-a99b-b910bb261f94/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1483-73e6-a99b-b910bb261f94> ;
    rdfs:label "Proces meetinrichting 4 (KG atelier)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146a-7933-a3fa-3e66af90b82b/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147c-78e0-9d71-20a8271b5e02/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Meetinrichting 2 (onderhoud)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1484-7cae-ae70-30f58d784e03/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1484-7cae-ae70-30f58d784e03> ;
    rdfs:label "Proces meetinrichting 2 (onderhoud)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146b-71c7-878c-20d0e9c8aea9/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147d-721e-bd38-93f293fd5612/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Meetinrichting 1 (FL koeltoren)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1485-7e92-9aff-24678ba91e48/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1485-7e92-9aff-24678ba91e48> ;
    rdfs:label "Proces meetinrichting 1 (FL koeltoren)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146c-739e-af4f-7b3af72b9b4d/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147e-7034-85ba-66abf95ea2e5/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Meetinrichting 3 (VT verzending)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1486-7672-86c4-290e4e8b39d6/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1486-7672-86c4-290e4e8b39d6> ;
    rdfs:label "Proces meetinrichting 3 (VT verzending)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146d-7e15-8388-676b085f663f/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-147f-7752-9b8e-042cf1fbda4f/2026-01-01/2026-01-01T10:00:00Z> .

# Proces voor meetpunt "Meetinrichting 5 (KG verzending)"
<https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1487-7487-b91c-9217e4b84e92/2026-01-01/2026-01-01T10:00:00Z> a riepr:Proces ;
    dct:isVersionOf <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1487-7487-b91c-9217e4b84e92> ;
    rdfs:label "Proces meetinrichting 5 (KG verzending)"@nl ;
    dct:created "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    dct:modified "2026-01-01T10:00:00Z"^^xsd:dateTime ;
    ssn:implementedBy <https://data.mjv.omgeving.vlaanderen.be/id/meetpunt/019e9271-146e-737d-b305-650c48295731/2026-01-01/2026-01-01T10:00:00Z> ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/procedure-type/meting> ;
    pplan:isStepOfPlan <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-146f-7bcc-a28a-c12c48a610fc/2026-01-01/2026-01-01T10:00:00Z> ;
    pplan:isPrecededBy <https://data.mjv.omgeving.vlaanderen.be/id/proces/019e9271-1480-7847-8ac1-d4c44a6dd474/2026-01-01/2026-01-01T10:00:00Z> .

# Systeemeigenschappen
<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-730f-8fc4-c09b55661a9f> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/verwijderingsrendement> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:PERCENT ;
    riepr:parameter <https://data.omgeving.vlaanderen.be/id/concept/chemische_stof/VEXZGXHMUGYJMC-UHFFFAOYSA-M> # Chloride
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7fc8-a1ea-2e029966f763> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/verwijderingsrendement> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:PERCENT ;
    riepr:parameter <https://data.omgeving.vlaanderen.be/id/concept/chemische_stof/OAICVXFJPJFONN-UHFFFAOYSA-N> # Fosfor
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7bf2-b175-a3a609e6f04b> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/verwijderingsrendement> ;
        rdfs:value "0"^^xsd:decimal ;
        qudt:hasUnit unit:PERCENT ;
        riepr:parameter <https://data.omgeving.vlaanderen.be/id/concept/chemische_stof/IJGRMHOSHXDMSA-UHFFFAOYSA-N> # Stikstof
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b3b-b30d-9009ac3ad4a1> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/verwijderingsrendement> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:PERCENT ;
    riepr:parameter <https://data.omgeving.vlaanderen.be/id/concept/chemische_stof/KRHYYFGTRYWZRS-UHFFFAOYSA-M> # Fluoride
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7a2f-a407-9e4892c4debd> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer ;
    
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7f51-881b-55d6b3278a90> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
        rdfs:value "80.0"^^xsd:decimal ;
        qudt:hasUnit unit:M
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-78e1-aeb9-c19e6918e530> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
        rdfs:value "2.2"^^xsd:decimal ;
        qudt:hasUnit unit:M
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b18-830e-9ec04686a339> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer ;
    
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7405-88ed-011584565213> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
    rdfs:value "14.8"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7ef6-a1b0-b45096c5d67e> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
    rdfs:value "0.505"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-766c-9dcb-330766769529> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7195-ab0d-a841dc8a270a> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
    rdfs:value "0.0"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-79c0-9cbd-65234e23228b> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
    rdfs:value "0.0"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7256-9995-dd4d7afe8c83> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer ;
     .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7f1a-aef0-87b093d545ca> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
    rdfs:value "9.3"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-747a-bb53-9177eeac43ac> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
    rdfs:value "0.4"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-729e-9f0e-28f6c9263b7a> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer ;
     .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-72e5-a751-3697982ba05e> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
    rdfs:value "9.3"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7409-9d44-2f23b8eab79f> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
    rdfs:value "0.18"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b1a-bbbe-521166ae2986> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer ;
     .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7bb0-8eb5-0ab162782600> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
    rdfs:value "6.5"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-751f-8deb-2582305d7782> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
    rdfs:value "0.22"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-769e-81e8-a07592609129> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer ;
     .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7dbe-892f-20edf9e9117c> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
    rdfs:value "5.6"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7bc0-a45e-ae8ba382dc53> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
    rdfs:value "0.0"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7692-8056-f66dc56e67dc> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer ;
     .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-788e-ab7c-015d6910ccd1> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
    rdfs:value "5.6"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7976-a21f-ec2bf56eb420> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
    rdfs:value "0.0"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-71de-aa4a-2a574c159729> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/aantalpunten> ;
    rdfs:value "1"^^xsd:integer ;
    qudt:hasUnit unit:PERCENT ;
     .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-710b-8b9f-5654b501a5fc> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/hoogte> ;
    rdfs:value "5.6"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-795f-90a4-c70e76112e84> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/emissiepunt-eigenschappen/equivalente-diameter> ;
    rdfs:value "0.0"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7c21-b0a0-1a798becf2f9> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-eigenschappen/diepte> ;
    rdfs:value "168.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-70c0-99ae-423d2e7c5501> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-eigenschappen/diepte> ;
    rdfs:value "168.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7922-814d-2db735c083eb> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-eigenschappen/diepte> ;
    rdfs:value "168.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7304-956b-b2509b0fdcc7> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-eigenschappen/diepte> ;
    rdfs:value "168.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7a3d-8d0a-fd5a5f9fe433> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/onttrekkingspunt-eigenschappen/diepte> ;
    rdfs:value "165.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7511-b394-11b36f0d8374> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/watervoerendeLaag> ;
    rdfs:value "0100" # Codelijst, indien ja - welke
    .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-70c9-a2ed-258f21b11a8e> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/diepte> ;
    rdfs:value "7.940"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-731a-854f-7cdb6c878196> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/lengte> ;
    rdfs:value "1.940"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7106-ab58-fb7650ab5daa> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/watervoerendeLaag> ;
    rdfs:value "0230" .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7161-9493-f0f15743dd24> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/diepte> ;
    rdfs:value "25.080"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7e13-b8d5-7f7a74085072> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/lengte> ;
    rdfs:value "1.940"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7bd1-b713-0373d720f8d4> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/watervoerendeLaag> ;
    rdfs:value "0250" .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-761c-b018-31c9df52ad8d> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/diepte> ;
    rdfs:value "40.560"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-761a-b36b-c04ab92595c1> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/lengte> ;
    rdfs:value "1.940"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7896-89e8-346b388b7894> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/watervoerendeLaag> ;
    rdfs:value "0254" .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-785c-b8e1-969dcac91749> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/diepte> ;
    rdfs:value "165.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7065-8953-765dc937b866> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/lengte> ;
    rdfs:value "10.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7ad6-aa26-614815274c25> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/watervoerendeLaag> ;
    rdfs:value "0254" .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7e7b-8288-e8ca1fe01021> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/diepte> ;
    rdfs:value "165.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7641-92d0-506f90e71e48> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/lengte> ;
    rdfs:value "10.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7525-b7cd-1a260d9e4bd4> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/watervoerendeLaag> ;
    rdfs:value "0254" .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-79e7-b257-5a12b78deb00> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/diepte> ;
    rdfs:value "165.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7fa2-9df8-23dee3625403> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/lengte> ;
    rdfs:value "10.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-76c7-b72e-5b4f237a7d25> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/watervoerendeLaag> ;
    rdfs:value "0254" .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7ec4-948c-6d7ee4dec799> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/diepte> ;
    rdfs:value "165.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b24-8bfb-e1f1b108efaa> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/lengte> ;
    rdfs:value "10.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7072-91da-219f80feab31> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/watervoerendeLaag> ;
    rdfs:value "0254" .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7059-b375-1386ee8298d7> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/diepte> ;
    rdfs:value "165.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-73b5-8270-1a05bc5046f0> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/filter-eigenschappen/lengte> ;
    rdfs:value "10.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-77c8-85ea-cc2defa98785> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-eigenschappen/diepte> ;
    rdfs:value "42.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-719b-a034-5e609820a784> a riepr:Systeemeigenschap ;
    # DOV: Referentiepunt moet kunnen worden ingegeven
    # [EIGEN AANVULLING]
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-eigenschappen/referentiepunt> ;
    rdfs:label "Maaiveld"@nl ;
    rdfs:value "1.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7815-b7fd-cbb6110dcf99> a riepr:Systeemeigenschap ;
    # DOV: Referentiepunt moet kunnen worden ingegeven
    # [EIGEN AANVULLING]
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/meetpunt-eigenschappen/referentiepunt> ;
    rdfs:label "Maaiveld"@nl ;
    rdfs:value "1.000"^^xsd:decimal ;
    qudt:hasUnit unit:M .

# Geinstalleerd vermogen (lucht)
<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7b92-8d82-d47130a76081> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerd_vermogen> ;
    rdfs:value "0.025"^^xsd:decimal ;
    qudt:hasUnit unit:MegaW .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7236-b3e0-16fd256a169f> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerd_vermogen> ;
    rdfs:value "0.169"^^xsd:decimal ;
    qudt:hasUnit unit:MegaW .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7119-9cde-259b5af7f5dd> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerd_vermogen> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:MegaW .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7ee3-860e-cbb41d935d0e> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerd_vermogen> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:MegaW .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7602-98f1-08ebfdb86b49> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerd_vermogen> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:MegaW .

# Geinstalleerde productiecapaciteit (lucht)
<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7972-8add-ab826a6ce827> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerde_productiecapaciteit> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:TONNE-PER-YR .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7603-b4f8-ee17964d55ae> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerde_productiecapaciteit> ;
    rdfs:value "155000"^^xsd:decimal ;
    qudt:hasUnit unit:TONNE-PER-YR .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019ecf80-eae8-7893-bed5-0ec8b5b2f937> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/geinstalleerde_productiecapaciteit> ;
    rdfs:value "0"^^xsd:decimal ;
    qudt:hasUnit unit:TONNE-PER-YR .

# Waterzuiveringstechnieken
<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2b-71f3-8c45-d9e8f7a6b5c4> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "1970-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/2.2.1> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2c-72e4-9d56-e0f9g8b7c6d5> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "1970-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/2.6.1> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2d-73f5-ae67-f1gad9c8d7e6> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "1970-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/2.7.1> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2e-74g6-bf78-g2hbe0d9e8f7> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "1970-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/3.11.1> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a2f-75h7-cg89-h3icf1eaf9g8> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "1989-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/2.99.99> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a30-76i8-dh9a-i4jdg2fbga9> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "1998-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/3.8.2> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a31-77j9-ei0b-j5keh3gcgb0> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "2000-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/2.99.99> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a32-78k0-fj1c-k6lfh4hdhc1> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "2002-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/3.8.2> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a33-79l1-gk2d-l7mgi5ieid2> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "2002-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/3.7.3> .

<https://data.mjv.omgeving.vlaanderen.be/id/systeemeigenschap/019edc4a-1a34-7am2-hl3e-m8nhj6jfje3> a riepr:Systeemeigenschap ;
    dct:type <https://data.omgeving.vlaanderen.be/id/concept/riepr/installatie-eigenschappen/waterzuiveringstechniek> ;
    riepr:inGebruikVan "2017-01-01"^^xsd:date ;
    rdfs:value <https://vito.be/codelijst/techniek/3> .
```
