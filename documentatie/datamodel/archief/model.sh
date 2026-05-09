#!/bin/bash


#riot --formatted=turtle `find '../../src/main/resources/be/vlaanderen/omgeving/riepr/data/id' -type f` > /tmp/riepr.ttl

#sparql --results=TTL --data=/home/gehau/git/RIE-IEPR/src/main/input/imjv-transformed/mjv_deployment.ttl  --query model.rq | sed -e 's/label/Label/g' > model.ttl
rdf2dot  model.ttl | dot -Tpng > model.png
rdf2dot  model.ttl  > model.dot