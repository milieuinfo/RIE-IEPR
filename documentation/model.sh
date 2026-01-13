#!/bin/bash
rm /tmp/luchtwassers.nt
  for i in  `find ../huidige_metingen/ | grep jsonld` ; do
    riot ${i} >> /tmp/luchtwassers.nt
done
riot --formatted=turtle /tmp/luchtwassers.nt > /tmp/luchtwassers.ttl

  sparql --results=TTL --data=/tmp/luchtwassers.ttl  --query model.rq  > model.ttl
  rdf2dot  model.ttl | dot -Tpng > model.png
  rdf2dot  model.ttl  > model.dot