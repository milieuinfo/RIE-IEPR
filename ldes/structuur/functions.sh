export SERVER_URL=http://localhost:8081
export LDIO_URL=http://localhost:8091

post_to_ingest() {
  echo "ingesting to stream $1 with body content of file $2"
  curl -X POST "${SERVER_URL}/$1" \
    -H "Content-Type: text/turtle" \
    -d @$2 \
    -w "\nHTTP status: %{http_code}\n" \
    --fail-with-body || echo "Warning: failed to create $1 (it may already exist)"
}


get_ldio_pipeline_information() {
  curl "${LDIO_URL}/admin/api/v1/pipeline" | jq
}


delete_ldio_pipeline() {
  curl -X DELETE "${LDIO_URL}/admin/api/v1/pipeline/$1" | jq
}

create_ldio_pipeline() {
  echo "Creating pipeline with body content of file $1"
  curl -X 'POST' \
    "${LDIO_URL}/admin/api/v1/pipeline" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/yaml' \
    -d @$1 \
    -w "\nHTTP status: %{http_code}\n" \
    --fail-with-body || echo "Warning: failed to create $1 (it may already exist)"
}
