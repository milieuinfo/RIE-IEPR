#!/bin/bash
let x=1
for i in `cat systems` ; do
  curl -L -H 'Accept: text/turtle' "${i}" -o $x.ttl ;
  let x=x+1
done