#!/bin/bash

riot --formatted=turtle ../*ttl > /tmp/all.ttl

sparql --results=CSV --data=/tmp/all.ttl  --query select_types.rq  > ../types.csv

type_list=$(grep -v '^\s*#' type_priority.txt | grep -v '^\s*$')

let x=1
excl_uris=""

for c in $type_list; do
  class=$(echo "$c" | tr -d '\r\n' )
  className=$(echo "$class" | sed 's;.*/;;g' | sed 's;#;:;g')
  mkdir -p ../sorted/$className
  sed "s|___type___|$class|g; s|___excluded_types___|$excl_uris|g" construct_sorts.rq > /tmp/construct_sorts.rq
  sparql --results=TTL --data=/tmp/all.ttl  --query /tmp/construct_sorts.rq > ../sorted/$className/$x.ttl
  excl_uris="$excl_uris <$class>"
  let x=x+1
done