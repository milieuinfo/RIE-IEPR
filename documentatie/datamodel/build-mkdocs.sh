#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/documentatie/datamodel"

# pip install may fail offline; try but continue if already present
pip install -q --break-system-packages -r requirements-mkdocs.txt || echo "pip install skipped / already satisfied"

# Build Widoco ontology documentation
WIDOCO_JAR="$ROOT/documentatie/bin/widoco/widoco.jar"
WIDOCO_CONFIG="$ROOT/documentatie/bin/widoco/widoco-config.ttl"
ONTOLOGY_SRC="$ROOT/documentatie/datamodel/src/ns/riepr/riepr.ttl"
WIDOCO_OUT="$ROOT/site/ontology"

mkdir -p "$WIDOCO_OUT"
java -jar "$WIDOCO_JAR" \
  -ontFile "$ONTOLOGY_SRC" \
  -outFolder "$WIDOCO_OUT" \
  -confFile "$WIDOCO_CONFIG" \
  -rewriteAll > /dev/null 2>&1 || true

# Copy Widoco output into MkDocs site_dir for integration
SITE_DIR="$ROOT/site/mkdocs"
mkdir -p "$SITE_DIR/ontologie"
cp -r "$WIDOCO_OUT"/* "$SITE_DIR/ontologie/" 2>/dev/null || true
if [ -f "$SITE_DIR/ontologie/index-nl.html" ] && [ ! -f "$SITE_DIR/ontologie/index.html" ]; then
  cp "$SITE_DIR/ontologie/index-nl.html" "$SITE_DIR/ontologie/index.html"
fi

mkdocs build --site-dir "$SITE_DIR"

# Ensure ontology static files are present after mkdocs clean
mkdir -p "$SITE_DIR/ontologie"
cp -r "$WIDOCO_OUT"/* "$SITE_DIR/ontologie/" 2>/dev/null || true
if [ -f "$SITE_DIR/ontologie/index-nl.html" ] && [ ! -f "$SITE_DIR/ontologie/index.html" ]; then
  cp "$SITE_DIR/ontologie/index-nl.html" "$SITE_DIR/ontologie/index.html"
fi

echo "MkDocs build completed at $SITE_DIR with integrated Widoco ontology"
