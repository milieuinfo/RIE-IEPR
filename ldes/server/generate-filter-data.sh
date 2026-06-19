#!/usr/bin/env bash
#
# generate-filter-data.sh
#
# Generates a TTL file with synthetic riepr:Filter members in the same shape
# as filter-data.ttl. Each member has a unique subject IRI, so there are no
# duplicate members.
#
# Usage: ./generate-filter-data.sh <output-file> <number-of-members>
#
set -euo pipefail

if [[ $# -ne 2 ]]; then
    echo "Usage: $0 <output-file> <number-of-members>" >&2
    exit 1
fi

OUTPUT_FILE="$1"
COUNT="$2"

if ! [[ "$COUNT" =~ ^[0-9]+$ ]] || [[ "$COUNT" -lt 1 ]]; then
    echo "Error: number-of-members must be a positive integer" >&2
    exit 1
fi

# Write prefixes / header
cat > "$OUTPUT_FILE" <<'EOF'
PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX adms:    <http://www.w3.org/ns/adms#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX imjv:    <https://data.imjv.omgeving.vlaanderen.be/ns/imjv#>
PREFIX riepr:   <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#>
PREFIX sosa:    <http://www.w3.org/ns/sosa/>
PREFIX ssn:     <http://www.w3.org/ns/ssn/>
PREFIX st:      <https://data.imjv.omgeving.vlaanderen.be/id/concept/status/>
PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>
PREFIX geo:     <http://www.opengis.net/ont/geosparql#>

EOF

BASE="https://data.imjv.omgeving.vlaanderen.be/id"

# Generate members. The synthetic subject IRI uses a zero-padded sequential
# index, guaranteeing uniqueness across members.
{
    for ((i = 1; i <= COUNT; i++)); do
        ID=$(printf "gen-%010d" "$i")
        SUBJECT="${BASE}/peilfilter/${ID}/jaar/2021"
        EXPLOITATION="${BASE}/exploitatie/${ID}"
        DEPLOYMENT="${EXPLOITATION}/jaar/2021"

        cat <<EOF
<${SUBJECT}>
    rdf:type         sosa:FeatureOfInterest, riepr:Filter, ssn:System ;
    rdfs:label       "PEILFILTER : GENERATED ${i} (2021)" ;
    dcterms:issued   "2010-01-01T00:00:00Z"^^xsd:dateTime ;
    dcterms:valid    "2030-01-01T00:00:00Z"^^xsd:dateTime ;
    dcterms:modified "2010-01-01T00:00:00Z"^^xsd:dateTime ;
    adms:status      st:in_gebruik ;
    sosa:isFeatureOfInterestOf
                     <${SUBJECT}/imjv#diepteOnderkant>,
                     <${SUBJECT}/imjv#lengte> ;
    sosa:isHostedBy  <${EXPLOITATION}> ;
    ssn:hasDeployment
                     <${DEPLOYMENT}> ;
    ssn:hasProperty  imjv:diepteOnderkant, imjv:lengte .

EOF
    done
} >> "$OUTPUT_FILE"

# Sanity check: ensure the number of unique subject IRIs equals COUNT.
UNIQUE=$(grep -E '^<https://data\.imjv\.omgeving\.vlaanderen\.be/id/peilfilter/gen-[0-9]+/jaar/2021>$' "$OUTPUT_FILE" | sort -u | wc -l | tr -d ' ')
if [[ "$UNIQUE" -ne "$COUNT" ]]; then
    echo "Error: generated $UNIQUE unique members, expected $COUNT" >&2
    exit 1
fi

echo "Generated $COUNT unique members in $OUTPUT_FILE"

