#!/bin/bash


function set_virtuoso_env {
	ssh ${1} "sudo cat /etc/*/*bootstrap | grep virtuoso" > /tmp/${1}

}

function query {
  #let x=1
  #for uri in `cat systems` ; do
  let x=27
  for uri in `cat observaties` ; do
    echo "construct { ?s ?p ?o .  ?x ?y ?z . }  where {VALUES ?s { <$uri>  }  VALUES ?z { <$uri>  } ?s ?p ?o .   optional{ ?x ?y ?z .}}" > query.rq
  	. /tmp/${1}
    curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
      --request POST "http://${1}:8080/sparql-auth?"\
      --data 'format=text/turtle'\
      --data-urlencode query@query.rq \
      --output '/tmp/mjv.ttl'
    riot '/tmp/mjv.ttl' > '/tmp/mjv.nt'
    riot --formatted=turtle prefix.ttl '/tmp/mjv.nt' > $x.ttl
    let x=x+1
  done
}

set_virtuoso_env virtuoso-imjv-pr-1.vm.cumuli.be

query virtuoso-imjv-pr-1.vm.cumuli.be


