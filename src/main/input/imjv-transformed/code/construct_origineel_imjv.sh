#!/bin/bash

function set_virtuoso_env {
	ssh ${1} "sudo cat /etc/*/*bootstrap | grep virtuoso" > /tmp/${1}

}

function query {
  	. /tmp/${1}
	curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
		--request POST "http://${1}:8080/sparql-auth?"\
		--data 'format=text/turtle'\
		--data-urlencode query@construct_origineel_imjv.rq \
		--output '/tmp/mjv.ttl'
	riot --formatted=turtle '/tmp/mjv.ttl' > '../mjv_origineel_imjv.ttl'
}



set_virtuoso_env virtuoso-imjv-pr-1.vm.cumuli.be

query virtuoso-imjv-pr-1.vm.cumuli.be