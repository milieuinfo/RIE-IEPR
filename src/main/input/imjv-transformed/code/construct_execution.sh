#!/bin/bash

function set_virtuoso_env {
	ssh ${1} "sudo cat /etc/*/*bootstrap | grep virtuoso" > /tmp/${1}

}

function query {
  	. /tmp/${1}
	curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
		--request POST "http://${1}:8080/sparql-auth?"\
		--data 'format=text/turtle'\
		--data-urlencode query@construct_execution.rq \
		--output '/tmp/mjv_execution.ttl'
	curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
		--request POST "http://${1}:8080/sparql-auth?"\
		--data 'format=text/turtle'\
		--data-urlencode query@construct_properties.rq \
		--output '/tmp/mjv_properties.ttl'
	riot '/tmp/mjv_execution.ttl' '/tmp/mjv_properties.ttl' \
		> '/tmp/mjv.nt'
	riot --formatted=turtle source/prefix.ttl '/tmp/mjv.nt' > '../mjv_execution.ttl'
}



set_virtuoso_env virtuoso-imjv-pr-1.vm.cumuli.be

query virtuoso-imjv-pr-1.vm.cumuli.be
