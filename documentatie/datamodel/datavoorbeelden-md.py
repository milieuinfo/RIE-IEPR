#!/usr/bin/env python3
"""Genereert de mkdocs-pagina's voor de datavoorbeelden.

Leest de TTL-bestanden uit documentatie/datamodel/datavoorbeelden/ en schrijft daarvoor
een mkdocs-pagina per voorbeeld naar documentatie/datamodel/afname/datavoorbeelden/
(inclusief de volledige TTL in een codeblock). Alleen Python stdlib; wordt na elke
OWL-SDA-run door build-datavoorbeelden.sh aangeroepen en in CI door de docs-build.
"""

from __future__ import annotations

import datetime
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VOORBEELDEN_DIR = os.path.join(ROOT, "documentatie", "datamodel", "datavoorbeelden")
OUT_DIR = os.path.join(ROOT, "documentatie", "datamodel", "afname", "datavoorbeelden")

PAGINAS = [
    {
        "ttl": "agc-glass_MJV_01-07-2026.ttl",
        "md": "agc-glass.md",
        "titel": "AGC Glass Europe (referentie)",
        "inleiding": (
            "Handgeschreven referentie-voorbeeld van de MJV, gebruikt als voorbeeld van de "
            "gewenste structuur, URI-conventies en commentaarstijl."
        ),
        "bron": "handgeschreven (MJV, 01-07-2026)",
        "generator": None,
        "placeholder": None,
    },
]


def fmt_grootte(path: str) -> str:
    grootte = os.path.getsize(path)
    if grootte >= 1024 * 1024:
        return f"{grootte / (1024 * 1024):.1f} MB"
    return f"{grootte / 1024:.0f} KB"


def schrijf_pagina(spec: dict) -> bool:
    ttl_path = os.path.join(VOORBEELDEN_DIR, spec["ttl"])
    md_path = os.path.join(OUT_DIR, spec["md"])

    metadatum = [
        "| | |",
        "|---|---|",
        f"| Bestand | `{documentatie_rel(ttl_path)}` |",
        f"| Bron | {spec['bron']} |",
    ]
    if spec["generator"]:
        metadatum.append(f"| Generator | {spec['generator']} |")
    if os.path.exists(ttl_path):
        aangepast = datetime.datetime.fromtimestamp(
            os.path.getmtime(ttl_path), datetime.timezone.utc
        ).strftime("%Y-%m-%d %H:%M UTC")
        metadatum.append(f"| Laatst gegenereerd | {aangepast} |")
        with open(ttl_path, encoding="utf-8") as f:
            ttl_inhoud = f.read()
        metadatum.append(f"| Grootte | {fmt_grootte(ttl_path)} |")

    regels = [
        f"# Datavoorbeeld: {spec['titel']}",
        "",
        spec["inleiding"],
        "",
        "```{note}",
        "Dit is een **datavoorbeeld**: de data is fictief en dient uitsluitend om het "
        "datamodel te illustreren.",
        "```",
        "",
    ]
    if os.path.exists(ttl_path):
        regels += metadatum + ["", "## TTL", "", "```turtle", ttl_inhoud.rstrip(), "```", ""]
    else:
        regels += [spec["placeholder"], ""]

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(regels))
    print(f"geschreven: {documentatie_rel(md_path)}")
    return True


def documentatie_rel(path: str) -> str:
    return os.path.relpath(path, ROOT)


def main() -> int:
    for spec in PAGINAS:
        schrijf_pagina(spec)
    return 0


if __name__ == "__main__":
    sys.exit(main())
