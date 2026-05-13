#!/bin/bash

function set_virtuoso_env {
	ssh ${1} "sudo cat /etc/*/*bootstrap | grep virtuoso" > /tmp/${1}

}

set_virtuoso_env virtuoso-imjv-pr-1.vm.cumuli.be
set_virtuoso_env virtuoso-cbb-pr-1.vm.cumuli.be

function select_exploitatie {
	. /tmp/${1}
	curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
		--request POST "http://${1}:8080/sparql-auth?"\
		--data 'format=text/csv'\
		--data-urlencode query@select_exploitaties.rq \
		--output '../exploitaties.csv'
}



select_exploitatie virtuoso-imjv-pr-1.vm.cumuli.be

for i in $(grep -v '"exploitatie"' ../exploitaties.csv); do
  exploitatie=$(echo "$i" | sed 's/"//g')
  exploitatienummer=$(echo $exploitatie | sed -e 's;https://data.cbb.omgeving.vlaanderen.be/id/exploitatie/;;')
  sed "s|___exploitatie___|$exploitatie|g" construct_deployment.rq > /tmp/construct_deployment.rq
  sed "s|___exploitatie___|$exploitatie|g" construct_execution.rq > /tmp/construct_execution.rq
  sed "s|___exploitatie___|$exploitatie|g" construct_exploitant.rq > /tmp/construct_exploitant.rq
  sed "s|___exploitatie___|$exploitatie|g" construct_labels.rq > /tmp/construct_labels.rq
  sed "s|___exploitatie___|$exploitatie|g" construct_plan.rq > /tmp/construct_plan.rq
  sed "s|___exploitatie___|$exploitatie|g" construct_properties.rq > /tmp/construct_properties.rq

  function query_labels_deployment {
    . /tmp/${1}
    curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
      --request POST "http://${1}:8080/sparql-auth?"\
      --data 'format=text/turtle'\
      --data-urlencode query@/tmp/construct_labels.rq \
      --output '/tmp/mjv_labels.ttl'
    riot '/tmp/mjv_labels.ttl' > '/tmp/mjv_labels.nt'
  }

  function query_deployment {
      . /tmp/${1}
    curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
      --request POST "http://${1}:8080/sparql-auth?"\
      --data 'format=text/turtle'\
      --data-urlencode query@/tmp/construct_deployment.rq \
      --output '/tmp/mjv.ttl'
    riot '/tmp/mjv.ttl'  > '/tmp/mjv.nt'
  }

  function query2_deployment {
      . /tmp/${1}
    curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
      --request POST "http://${1}:8080/sparql-auth?"\
      --data 'format=text/turtle'\
      --data-urlencode query@/tmp/construct_exploitant.rq \
      --output '/tmp/mjv_exploitant.ttl'
    riot '/tmp/mjv_exploitant.ttl' \
      > '/tmp/mjv_exploitant.nt'
    riot --formatted=turtle ../../code/source/prefix.ttl \
      '/tmp/mjv_labels.nt' \
      '/tmp/mjv.nt' \
      '/tmp/mjv_exploitant.nt' \
      > "../${exploitatienummer}_mjv_deployment.ttl"
  }

  function query_execution {
      . /tmp/${1}
    curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
      --request POST "http://${1}:8080/sparql-auth?"\
      --data 'format=text/turtle'\
      --data-urlencode query@/tmp/construct_execution.rq \
      --output '/tmp/mjv_execution.ttl'
    curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
      --request POST "http://${1}:8080/sparql-auth?"\
      --data 'format=text/turtle'\
      --data-urlencode query@/tmp/construct_properties.rq \
      --output '/tmp/mjv_properties.ttl'
    riot '/tmp/mjv_execution.ttl' '/tmp/mjv_properties.ttl' \
      > '/tmp/mjv.nt'
    riot --formatted=turtle ../../code/source/prefix.ttl '/tmp/mjv.nt' > "../${exploitatienummer}_mjv_execution.ttl"
  }

  function query_plan {
      . /tmp/${1}
    curl -u ${virtuoso_rw_username}:${virtuoso_rw_password}\
      --request POST "http://${1}:8080/sparql-auth?"\
      --data 'format=text/turtle'\
      --data-urlencode query@/tmp/construct_plan.rq \
      --output '/tmp/mjv_plan.ttl'
    riot '/tmp/mjv_plan.ttl'  > '/tmp/mjv.nt'
    riot --formatted=turtle ../../code/source/prefix.ttl '/tmp/mjv.nt' > "../${exploitatienummer}_mjv_plan.ttl"
  }


  query_labels_deployment virtuoso-imjv-pr-1.vm.cumuli.be
  query_deployment        virtuoso-imjv-pr-1.vm.cumuli.be
  query2_deployment virtuoso-cbb-pr-1.vm.cumuli.be

  query_execution virtuoso-imjv-pr-1.vm.cumuli.be

  query_plan virtuoso-imjv-pr-1.vm.cumuli.be


done

#set_virtuoso_env virtuoso-imjv-pr-1.vm.cumuli.be
#
#query_labels virtuoso-imjv-pr-1.vm.cumuli.be
#query        virtuoso-imjv-pr-1.vm.cumuli.be
#
#set_virtuoso_env virtuoso-cbb-pr-1.vm.cumuli.be
#
#query2 virtuoso-cbb-pr-1.vm.cumuli.be