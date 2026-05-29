#!/usr/bin/env bash
# update-schema.sh
# Kopieert de actuele ontologie- en conceptbestanden naar de visualisatie map.
# Uitvoeren vanuit de repo-root:
#   bash documentatie/bin/visualisatie/update-schema.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

SRC_ONTOLOGIE="$REPO_ROOT/src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl"
SRC_CONCEPT="$REPO_ROOT/src/main/resources/be/vlaanderen/omgeving/riepr/data/id/concept/riepr/riepr.ttl"
SRC_SHAPES="$REPO_ROOT/src/main/resources/generated-shapes.ttl"
DEST="$SCRIPT_DIR"

cp -f "$SRC_ONTOLOGIE" "$DEST/riepr-ontologie.ttl"
echo "Gekopieerd: riepr-ontologie.ttl"

cp -f "$SRC_CONCEPT" "$DEST/riepr-concept.ttl"
echo "Gekopieerd: riepr-concept.ttl"

cp -f "$SRC_SHAPES" "$DEST/generated-shapes.ttl"
echo "Gekopieerd: generated-shapes.ttl"

echo ""
echo "Schema bijgewerkt in $DEST"
echo "Voer hierna de cache-generator uit om validation-report.json te vernieuwen:"
echo "  mvn -q -DskipTests compile && java -cp \"target/classes:\$(cat /tmp/riepr-classpath.txt)\" be.vlaanderen.omgeving.riepr.VisualizationValidationCacheGenerator"
