#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/documentatie/datamodel"

WIDOCO_JAR="$ROOT/documentatie/bin/widoco/widoco.jar"
ONTOLOGY_SRC="$ROOT/src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl"
WIDOCO_INPUT="$ROOT/documentatie/datamodel/tmp/riepr-widoco.ttl"
WIDOCO_OUT="$ROOT/site/ontology"
SITE_DIR="$ROOT/site/mkdocs"

mkdir -p "$WIDOCO_OUT" "$SITE_DIR/ontologie" "$ROOT/documentatie/datamodel/tmp"

# Use the preprocessed ontology (strips owl:Restriction blocks that OWLAPI
# cannot parse and replaces them with error entities) when available.
if [ -f "$WIDOCO_INPUT" ]; then
  ONTOLOGY_SRC="$WIDOCO_INPUT"
  echo "Using preprocessed ontology for Widoco"
fi

# Note: Widoco 1.4.25 crashes (NullPointerException) when a -confFile is used.
# The ontology itself carries all metadata (dct:title, dct:creator, ...).
java -jar "$WIDOCO_JAR" \
  -ontFile "$ONTOLOGY_SRC" \
  -outFolder "$WIDOCO_OUT" \
  -lang nl \
  -webVowl \
  -rewriteAll > /dev/null 2>&1 || true

# Widoco with -lang nl generates index-nl.html; ensure index.html exists for GitHub Pages
if [ -f "$WIDOCO_OUT/index-nl.html" ] && [ ! -f "$WIDOCO_OUT/index.html" ]; then
  cp "$WIDOCO_OUT/index-nl.html" "$WIDOCO_OUT/index.html"
fi

if [ "$(ls -A "$WIDOCO_OUT" 2>/dev/null)" ]; then
  rm -rf "$SITE_DIR/ontologie"/*
  cp -r "$WIDOCO_OUT"/* "$SITE_DIR/ontologie/"
else
  echo "Widoco output empty, creating placeholder"
  echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ontologie</title></head><body><h1>Ontologie documentatie wordt gegenereerd</h1><p>Widoco kon de documentatie niet genereren in deze omgeving. Raadpleeg de lokale build.</p></body></html>' > "$SITE_DIR/ontologie/index.html"
fi
if [ -f "$SITE_DIR/ontologie/index-nl.html" ] && [ ! -f "$SITE_DIR/ontologie/index.html" ]; then
  cp "$SITE_DIR/ontologie/index-nl.html" "$SITE_DIR/ontologie/index.html"
fi

echo "Widoco build completed at $WIDOCO_OUT"
