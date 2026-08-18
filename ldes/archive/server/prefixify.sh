#!/bin/bash

FILE=$1
if [ -f $FILE ]; then
  perl -i -pe '
    s|<http://www.w3.org/ns/sosa/Execution>|sosa:Execution|g;
    s|<https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie>|riepr:Observatie|g;
    s|<http://www.w3.org/ns/sosa/hasFeatureOfInterest>|sosa:hasFeatureOfInterest|g;
    s|<http://www.w3.org/ns/sosa/hasResult>|sosa:hasResult|g;
    s|<http://www.w3.org/ns/sosa/madeBySensor>|sosa:madeBySensor|g;
    s|<http://www.w3.org/ns/sosa/phenomenonTime>|sosa:phenomenonTime|g;
    s|<http://www.w3.org/ns/sosa/resultTime>|sosa:resultTime|g;
    s|<https://data.riepr.omgeving.vlaanderen.be/id/agent/labo_mens_sensor_x>|agent:labo_mens_sensor_x|g;
    s|"\^\^<http://www.w3.org/2001/XMLSchema#dateTime>|"^^xsd:dateTime|g;
  ' $FILE
else
   echo "File $FILE does not exist."
   echo "usage: ./prefixify.sh <file>"
   echo "Example: ./prefixify.sh observatie-data.ttl"
fi

