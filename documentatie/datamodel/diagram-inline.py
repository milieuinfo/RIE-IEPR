#!/usr/bin/env python3
"""Plaatst gegenereerde mermaid-diagrammen in de mkdocs-pagina's.

Vervangt `<!--mermaid:<pad>-->`-placeholders in pagina's onder afname/ door een
```mermaid-fence met de inhoud van het .mmd-bestand (relatief ten opzichte van
documentatie/datamodel/). De YAML-frontmatter van het gegenereerde bestand wordt
verwijderd: de site heeft haar eigen mermaid-configuratie (theme via
extra/mermaid-init.js).

Alleen Python stdlib; wordt door build-mkdocs.sh aangeroepen vóór `mkdocs build`.
Pagina's zonder placeholders worden niet aangeraakt.
"""

from __future__ import annotations

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_MODEL_DIR = os.path.join(ROOT, "documentatie", "datamodel")
AFNAME_DIR = os.path.join(DATA_MODEL_DIR, "afname")

PLACEHOLDER = re.compile(r"<!--mermaid:([^>]+?)-->")


def strip_frontmatter(content: str) -> str:
    """Verwijdert een eventuele YAML-frontmatter bloot (--- ... ---) aan het begin."""
    if not content.startswith("---"):
        return content
    lines = content.splitlines(keepends=True)
    if lines[0].strip() != "---":
        return content
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            return "".join(lines[i + 1:])
    return content


def inline_diagram(md_path: str) -> bool:
    with open(md_path, encoding="utf-8") as f:
        content = f.read()

    def replace(match: re.Match) -> str:
        rel_path = match.group(1).strip()
        mmd_path = os.path.join(DATA_MODEL_DIR, rel_path)
        if not os.path.exists(mmd_path):
            print(f"WAARSCHUWING: {md_path}: diagram bestaat niet: {rel_path}")
            return match.group(0)
        with open(mmd_path, encoding="utf-8") as f:
            diagram = strip_frontmatter(f.read()).strip("\n")
        print(f"INLINE: {os.path.relpath(md_path, DATA_MODEL_DIR)} <- {rel_path}")
        return "```mermaid\n" + diagram + "\n```"

    new_content = PLACEHOLDER.sub(replace, content)
    if new_content != content:
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        return True
    return False


def main() -> int:
    if not os.path.isdir(AFNAME_DIR):
        print(f"FOUT: afname-dir niet gevonden: {AFNAME_DIR}")
        return 1
    for dirpath, _dirnames, filenames in os.walk(AFNAME_DIR):
        for filename in sorted(filenames):
            if filename.endswith(".md"):
                inline_diagram(os.path.join(dirpath, filename))
    return 0


if __name__ == "__main__":
    sys.exit(main())
