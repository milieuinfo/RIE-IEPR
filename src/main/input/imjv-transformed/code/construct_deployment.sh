#!/bin/bash

function set_virtuoso_env {
	ssh ${1} "sudo cat /etc/*/*bootstrap | grep virtuoso" > /tmp/${1}

}

function query_labels {
	. /tmp/${1}
	curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
		--request POST "http://${1}:8080/sparql-auth?"\
		--data 'format=text/turtle'\
		--data-urlencode query@construct_labels.rq \
		--output '/tmp/mjv_labels.ttl'
	riot '/tmp/mjv_labels.ttl' > '/tmp/mjv_labels.nt'
}

function query {
  	. /tmp/${1}
	curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
		--request POST "http://${1}:8080/sparql-auth?"\
		--data 'format=text/turtle'\
		--data-urlencode query@construct_deployment.rq \
		--output '/tmp/mjv.ttl'
	riot '/tmp/mjv.ttl'  > '/tmp/mjv.nt'
}

function query2 {
  	. /tmp/${1}
	curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
		--request POST "http://${1}:8080/sparql-auth?"\
		--data 'format=text/turtle'\
		--data-urlencode query@construct_exploitant.rq \
		--output '/tmp/mjv_exploitant.ttl'
	riot '/tmp/mjv_exploitant.ttl' \
		> '/tmp/mjv_exploitant.nt'
	riot --formatted=turtle source/prefix.ttl \
		'/tmp/mjv_labels.nt' \
		'/tmp/mjv.nt' \
		'/tmp/mjv_exploitant.nt' \
		> '../mjv_deployment.ttl'
}


set_virtuoso_env virtuoso-imjv-pr-1.vm.cumuli.be

query_labels virtuoso-imjv-pr-1.vm.cumuli.be
query        virtuoso-imjv-pr-1.vm.cumuli.be

set_virtuoso_env virtuoso-cbb-pr-1.vm.cumuli.be

query2 virtuoso-cbb-pr-1.vm.cumuli.be