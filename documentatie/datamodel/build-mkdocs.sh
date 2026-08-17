#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/documentatie/datamodel"

pip install -q --break-system-packages -r requirements-mkdocs.txt >/dev/null 2>&1 || echo "pip install skipped / already satisfied"

SITE_DIR="$ROOT/site/mkdocs"
WIDOCO_OUT="$ROOT/site/ontology"
mkdir -p "$SITE_DIR/ontologie"

if command -v mkdocs >/dev/null 2>&1; then
  mkdocs build --site-dir "$SITE_DIR"
else
  echo "mkdocs not found after pip install, failing build"
  exit 1
fi

mkdir -p "$SITE_DIR/ontologie"
if [ "$(ls -A "$WIDOCO_OUT" 2>/dev/null)" ]; then
  rm -rf "$SITE_DIR/ontologie"/*
  cp -r "$WIDOCO_OUT"/* "$SITE_DIR/ontologie/"
else
  echo "Widoco output empty, ensuring placeholder exists"
  [ -f "$SITE_DIR/ontologie/index.html" ] || echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ontologie</title></head><body><h1>Ontologie documentatie wordt gegenereerd</h1><p>Widoco kon de documentatie niet genereren in deze omgeving. Raadpleeg de lokale build.</p></body></html>' > "$SITE_DIR/ontologie/index.html"
fi
if [ -f "$SITE_DIR/ontologie/index-nl.html" ] && [ ! -f "$SITE_DIR/ontologie/index.html" ]; then
  cp "$SITE_DIR/ontologie/index-nl.html" "$SITE_DIR/ontologie/index.html"
fi

echo "MkDocs build completed at $SITE_DIR"
