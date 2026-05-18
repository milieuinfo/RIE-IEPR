#!/usr/bin/env python3
"""
codelijsten_to_sql.py — Genereert SQL voor de property-tabel vanuit de drie codelijsten-CSV's

Gebruik:
    python3 codelijsten_to_sql.py [codelijsten_dir] [output_sql]

Defaults:
    codelijsten_dir = ../codelijsten/
    output_sql      = ../dump/sql/property.sql

De property-tabel bevat één rij per observed_property-URI en is bedoeld als
opzoektabel bij queries op emissie_observatie.observed_property:

    JOIN property p ON p.uri = eo.observed_property

Bronbestanden:
    chemische_stof.csv              → type = 'chemische_stof'
    fysico-chemische-eigenschap.csv → type = 'fysico_chemisch'
    sommatie_stoffen.csv            → type = 'sommatie_stoffen'

Enkel rijen waarvan het id begint met
    https://data.omgeving.vlaanderen.be/id/concept/
worden opgenomen — dat zijn exact de URI's die in observed_property voorkomen.
"""

import csv
import sys
from pathlib import Path

csv.field_size_limit(10_000_000)

SCRIPT_DIR = Path(__file__).parent
DEFAULT_INPUT  = SCRIPT_DIR / "../codelijsten"
DEFAULT_OUTPUT = SCRIPT_DIR / "../dump/sql/property.sql"

BASE_URI = "https://data.omgeving.vlaanderen.be/id/concept/"

# (bestandsnaam, type-label, extra kolommen die aanwezig zijn)
SOURCES = [
    ("chemische_stof.csv",              "chemische_stof",   ["prefLabel", "prefLabel_en", "iupacName",  "notation", "casNumber", "ecNumber"]),
    ("fysico-chemische-eigenschap.csv", "fysico_chemisch",  ["prefLabel", None,           None,          "notation", None,        None      ]),
    ("sommatie_stoffen.csv",            "sommatie_stoffen", ["prefLabel", "altLabel_en",  None,          "notation", "casNumber", "ecNumber"]),
]

DDL = """\
-- property: opzoektabel voor observed_property-URI's uit de codelijsten
-- Laad met:
--   psql -h .../postgress/run -p 5433 -U gehau riepr -f dump/sql/property.sql

DROP TABLE IF EXISTS property;

CREATE TABLE property (
    uri        TEXT PRIMARY KEY,
    type       TEXT NOT NULL,    -- 'chemische_stof' | 'fysico_chemisch' | 'sommatie_stoffen'
    naam       TEXT,             -- prefLabel (NL)
    naam_en    TEXT,             -- prefLabel_en of altLabel_en
    iupac      TEXT,             -- iupacName (alleen chemische_stof)
    notation   TEXT,             -- korte code (bv. 'n_t', 'EC', 'zs')
    cas_nummer TEXT,             -- CAS-nummer
    ec_nummer  TEXT              -- EC-nummer
);
"""


def esc(value: str | None) -> str:
    """Enkelvoudig aanhalingsteken escapen voor SQL-literal, NULL bij leeg/null."""
    if not value or value.strip() in ("", "null"):
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def normalize_uri(uri: str, type_label: str) -> str:
    """
    De fysico-chemisch-codelijst gebruikt '/39', '/40', … als URI-suffix,
    maar emissie_observatie.observed_property bevat '/0039', '/0040', …
    (4-cijferig, zero-padded). We normaliseren naar het formaat uit de data.
    """
    if type_label != "fysico_chemisch":
        return uri
    base, _, segment = uri.rpartition("/")
    if segment.isdigit():
        return f"{base}/{int(segment):04d}"
    return uri


def read_source(path: Path, type_label: str, cols: list) -> list[dict]:
    col_naam, col_naam_en, col_iupac, col_notation, col_cas, col_ec = cols
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if not row["id"].startswith(BASE_URI):
                continue
            rows.append({
                "uri":       normalize_uri(row["id"], type_label),
                "type":      type_label,
                "naam":      row.get(col_naam)      if col_naam      else None,
                "naam_en":   row.get(col_naam_en)   if col_naam_en   else None,
                "iupac":     row.get(col_iupac)     if col_iupac     else None,
                "notation":  row.get(col_notation)  if col_notation  else None,
                "cas_nummer":row.get(col_cas)       if col_cas       else None,
                "ec_nummer": row.get(col_ec)        if col_ec        else None,
            })
    return rows


def main():
    input_dir  = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    output_sql = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    all_rows: list[dict] = []
    for filename, type_label, cols in SOURCES:
        path = input_dir / filename
        rows = read_source(path, type_label, cols)
        print(f"  {filename}: {len(rows)} rijen", file=sys.stderr)
        all_rows.extend(rows)

    output_sql.parent.mkdir(parents=True, exist_ok=True)
    with open(output_sql, "w", encoding="utf-8") as out:
        out.write(DDL)
        out.write("\nBEGIN;\n\n")
        for r in all_rows:
            out.write(
                f"INSERT INTO property (uri, type, naam, naam_en, iupac, notation, cas_nummer, ec_nummer) VALUES ("
                f"{esc(r['uri'])}, {esc(r['type'])}, {esc(r['naam'])}, {esc(r['naam_en'])}, "
                f"{esc(r['iupac'])}, {esc(r['notation'])}, {esc(r['cas_nummer'])}, {esc(r['ec_nummer'])}"
                f") ON CONFLICT DO NOTHING;\n"
            )
        out.write("\nCOMMIT;\n")

    print(f"  Totaal: {len(all_rows)} rijen → {output_sql}", file=sys.stderr)


if __name__ == "__main__":
    main()
