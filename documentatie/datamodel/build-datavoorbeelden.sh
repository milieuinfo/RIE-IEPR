#!/usr/bin/env bash
# Bouwt synthetische datavoorbeelden voor het RIE-IEPR datamodel met OWL-SDA
# (documentatie/datamodel/src/owlsda.jar + config-owlsda.yml).
#
# De LLM draait volledig lokaal: "muse-glimmer:30b" via het interne
# OpenAI-compatible endpoint (zelfde endpoint/modellen als in
# ~/.config/opencode/opencode.jsonc).
#
# Gebruik:
#   bash documentatie/datamodel/build-datavoorbeelden.sh
#
# API-key: OPENAI_API_KEY in de omgeving; anders wordt de openai-provider-key uit
# ~/.config/opencode/opencode.jsonc gelezen. De key wordt nooit gecommit of gelogd.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

JAR="documentatie/datamodel/src/owlsda.jar"
CONFIG="documentatie/datamodel/src/config-owlsda.yml"
MD_SCRIPT="documentatie/datamodel/datavoorbeelden-md.py"

if [ ! -f "$JAR" ]; then
  echo "Fout: $JAR ontbreekt. Zie documentatie/datamodel/src/README.md." >&2
  exit 1
fi

# 1. API-key oplossen (omgeving eerst, daarna opencode-config fallback)
#    NB: OPENCODE_CONFIG mag in de omgeving al een andere waarde hebben (projectconfig),
#    daarom eerst de standaard user-config proberen.
if [ -z "${OPENAI_API_KEY:-}" ]; then
  OPENCODE_JSONC=""
  for candidate in "$HOME/.config/opencode/opencode.jsonc" "${OPENCODE_CONFIG:-}"; do
    if [ -n "$candidate" ] && [ -f "$candidate" ]; then
      OPENCODE_JSONC="$candidate"
      break
    fi
  done
  if [ -n "$OPENCODE_JSONC" ]; then
    OPENAI_API_KEY="$(python3 - "$OPENCODE_JSONC" <<'PY'
import json, re, sys

raw = open(sys.argv[1], encoding="utf-8").read()
try:
    cfg = json.loads(raw)
except json.JSONDecodeError:
    # .jsonc: strip // comments and trailing commas, retry
    raw = re.sub(r"^\s*//.*$", "", raw, flags=re.M)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    cfg = json.loads(raw)
print(cfg.get("provider", {}).get("openai", {}).get("options", {}).get("apiKey", ""))
PY
)" || OPENAI_API_KEY=""
  fi
fi
if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "Fout: geen API-key gevonden." >&2
  echo "Zet OPENAI_API_KEY in de omgeving of installeer ~/.config/opencode/opencode.jsonc." >&2
  exit 1
fi
export OPENAI_API_KEY

# 2. OWL-SDA run (paden in config-owlsda.yml zijn repo-root-relatief)
mkdir -p .cache/owlsda
echo "=== OWL-SDA: synthetische datavoorbeelden genereren (lokale LLM, duurt een tijd) ==="
java -jar "$JAR" --config "$CONFIG"

# 3. MkDocs-pagina's voor de datavoorbeelden vernieuwen
echo "=== MkDocs-pagina's vernieuwen ==="
python3 "$MD_SCRIPT"

echo ""
echo "Klaar."
echo "  Output:  documentatie/datamodel/datavoorbeelden/agc-glass_synthetisch.ttl"
echo "  Log:     .cache/owlsda/owlsda.log"
echo "  Site:    bash documentatie/datamodel/build-mkdocs.sh"
