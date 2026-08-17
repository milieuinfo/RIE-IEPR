#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/documentatie/datamodel"

WIDOCO_JAR="$ROOT/documentatie/bin/widoco/widoco.jar"
WIDOCO_CONFIG="$ROOT/documentatie/bin/widoco/widoco-config.ttl"
ONTOLOGY_SRC="$ROOT/src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl"
WIDOCO_OUT="$ROOT/site/ontology"
SITE_DIR="$ROOT/site/mkdocs"

mkdir -p "$WIDOCO_OUT" "$SITE_DIR/ontologie"
java -jar "$WIDOCO_JAR" \
  -ontFile "$ONTOLOGY_SRC" \
  -outFolder "$WIDOCO_OUT" \
  -confFile "$WIDOCO_CONFIG" \
  -rewriteAll > /dev/null 2>&1 || true

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
