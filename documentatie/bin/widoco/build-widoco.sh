#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ONTOLOGY="$ROOT/documentatie/datamodel/src/ns/riepr/riepr.ttl"
OUTPUT="$ROOT/site/ontology"
CONFIG="$ROOT/documentatie/bin/widoco/widoco-config.ttl"
JAR="$ROOT/documentatie/bin/widoco/widoco.jar"

mkdir -p "$OUTPUT"

java -jar "$JAR" \
  -ontFile "$ONTOLOGY" \
  -confFile "$CONFIG" \
  -outFolder "$OUTPUT" \
  -lang nl \
  -webVowl

echo "Widoco build completed at $OUTPUT"
