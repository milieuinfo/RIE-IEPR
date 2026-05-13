#!/bin/bash

riot --formatted=turtle ../*ttl > /tmp/all.ttl

sparql --results=CSV --data=/tmp/all.ttl  --query select_types.rq  > ../types.csv
let x=1
for c in $(grep -v 'type' ../types.csv); do
  class=$(echo "$c" | tr -d '\r\n' )
  className=$(echo "$class" | sed 's;.*/;;g' | sed 's;#;:;g')
  mkdir -p ../sorted/$className
  sed "s|___type___|$class|g" construct_sorts.rq > /tmp/construct_sorts.rq
  sparql --results=TTL --data=/tmp/all.ttl  --query /tmp/construct_sorts.rq > ../sorted/$className/$x.ttl
  let x=x+1
done