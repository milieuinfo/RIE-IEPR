#!/usr/bin/env python3
"""
ttl_to_jsonld.py — Converteert all.ttl naar per-klasse JSON-bestanden + PostgreSQL load.sql

Gebruik:
    python3 ttl_to_jsonld.py [ttl_path] [frame_path] [output_dir]

Defaults:
    ttl_path   = ../dump/all.ttl
    frame_path = ../../../../documentatie/datamodel/generated/dataframe/frame.json
                 (relatief t.o.v. dit script, 5 niveaus omhoog naar repo-root)
    output_dir = ../dump/jsonld/

Output:
    {output_dir}/{classname}.json    — JSON-array per klasse (leesbaar)
    {output_dir}/load.sql            — CREATE TABLE + INSERT per klasse
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

import rdflib
from rdflib import Graph, RDF, URIRef, Literal

# ---------------------------------------------------------------------------
# Paden
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
DEFAULT_TTL    = SCRIPT_DIR / "../dump/all.ttl"
DEFAULT_FRAME  = SCRIPT_DIR / "../../../../../documentatie/datamodel/generated/dataframe/frame.json"
DEFAULT_OUT    = SCRIPT_DIR / "../dump/jsonld"

# ---------------------------------------------------------------------------
# Klasse-aliassen: data-type → frame-type
# ---------------------------------------------------------------------------

CLASS_ALIASES = {
    "http://www.w3.org/ns/sosa/Observation":
        "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie",
    "http://www.w3.org/ns/sosa/Execution":
        "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Observatie",
    "http://qudt.org/schema/qudt/QuantityValue":
        "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#HoeveelheidWaarde",
    "http://www.w3.org/ns/ssn/Deployment":
        "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatie",
    "http://www.w3.org/ns/sosa/Platform":
        "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Exploitatielocatie",
}

# Predicaten waarvan het object als genest JSON-object ingebed wordt
EMBED_PREDICATES = {
    "http://www.opengis.net/ont/geosparql#hasGeometry",
}

GEO_AS_WKT = URIRef("http://www.opengis.net/ont/geosparql#asWKT")

# ---------------------------------------------------------------------------
# Fase 1: frame.json inlezen
# ---------------------------------------------------------------------------

def load_frame(frame_path: Path):
    """Laad frame.json en geef (uri_to_term, class_uris) terug."""
    frame = json.loads(frame_path.read_text(encoding="utf-8"))
    context = frame.get("@context", {})
    classes = frame.get("@type", [])

    uri_to_term: dict[str, str] = {}
    for term, defn in context.items():
        if isinstance(defn, dict):
            uri = defn.get("@id")
        else:
            uri = defn
        if uri and uri != "@id" and uri != "@type":
            if uri not in uri_to_term:
                uri_to_term[uri] = term

    return uri_to_term, classes

# ---------------------------------------------------------------------------
# Fase 2: graph laden
# ---------------------------------------------------------------------------

def load_graph(ttl_path: Path) -> Graph:
    print(f"[INFO] Laden: {ttl_path} ...", file=sys.stderr, flush=True)
    g = Graph()
    g.parse(str(ttl_path), format="turtle")
    print(f"[INFO] Graph geladen: {len(g)} triples", file=sys.stderr, flush=True)
    return g

# ---------------------------------------------------------------------------
# Fase 3: klasse-subjects verzamelen
# ---------------------------------------------------------------------------

def build_class_subjects(g: Graph) -> dict[str, set[str]]:
    """Geeft class_uri → set(subject_uri). Aliassen worden samengevoegd."""
    cs: dict[str, set[str]] = defaultdict(set)
    for s, _, o in g.triples((None, RDF.type, None)):
        if not isinstance(o, URIRef):
            continue
        uri = str(o)
        canonical = CLASS_ALIASES.get(uri, uri)
        cs[canonical].add(str(s))
    return cs

# ---------------------------------------------------------------------------
# Fase 4: record bouwen
# ---------------------------------------------------------------------------

def embed_geometry(g: Graph, geom_uri: str) -> dict:
    obj = {"@id": geom_uri}
    wkt = g.value(URIRef(geom_uri), GEO_AS_WKT)
    if wkt is not None:
        obj["asWKT"] = str(wkt)
    return obj


def coerce_literal(lit: Literal):
    dt = str(lit.datatype) if lit.datatype else ""
    val = str(lit)
    if any(t in dt for t in ("decimal", "float", "double")):
        try:
            return float(val)
        except ValueError:
            return val
    if any(t in dt for t in ("integer", "int", "long")):
        try:
            return int(val)
        except ValueError:
            return val
    return val


def build_record(g: Graph, subject_uri: str, uri_to_term: dict[str, str]) -> dict:
    subject = URIRef(subject_uri)
    rec: dict = {"@id": subject_uri}

    # RDF-types
    types = sorted({str(o) for o in g.objects(subject, RDF.type)})
    if types:
        rec["@type"] = types

    # Properties
    seen: dict = {}
    for _, pred, obj in g.triples((subject, None, None)):
        pred_str = str(pred)
        if pred_str == str(RDF.type):
            continue
        term = uri_to_term.get(pred_str)
        if term is None:
            continue

        if isinstance(obj, URIRef):
            if pred_str in EMBED_PREDICATES:
                val = embed_geometry(g, str(obj))
            else:
                val = str(obj)
        elif isinstance(obj, Literal):
            val = coerce_literal(obj)
        else:
            continue

        # Meerdere waarden → lijst
        if term in seen:
            existing = seen[term]
            if isinstance(existing, list):
                existing.append(val)
            else:
                seen[term] = [existing, val]
        else:
            seen[term] = val

    rec.update(seen)
    return rec

# ---------------------------------------------------------------------------
# Fase 5: klasse-URI naar tabelnaam
# ---------------------------------------------------------------------------

def class_to_tablename(class_uri: str) -> str:
    """riepr#Exploitant → exploitant, adms#Identifier → admsIdentifier."""
    if "#" in class_uri:
        name = class_uri.rsplit("#", 1)[-1]
    else:
        name = class_uri.rstrip("/").rsplit("/", 1)[-1]
    # lowerCamelCase → snake_case voor leesbaarheid als tabelnaam
    import re
    snake = re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()
    return snake

# ---------------------------------------------------------------------------
# Fase 6: schema-inferentie
# ---------------------------------------------------------------------------

def infer_schema(records: list[dict]) -> dict[str, str]:
    """Geeft col_name → SQL-type ('TEXT' | 'JSONB' | 'NUMERIC')."""
    col_types: dict[str, str] = {}
    for rec in records:
        for k, v in rec.items():
            if k in ("@id", "@type"):
                continue
            if isinstance(v, dict):
                col_types[k] = "JSONB"
            elif isinstance(v, list):
                if any(isinstance(i, dict) for i in v):
                    col_types[k] = "JSONB"
                else:
                    current = col_types.get(k)
                    if current not in ("JSONB",):
                        col_types[k] = "JSONB"   # arrays als jsonb
            elif isinstance(v, float):
                if col_types.get(k) not in ("JSONB",):
                    col_types[k] = "NUMERIC"
            elif isinstance(v, int):
                if col_types.get(k) not in ("JSONB", "NUMERIC"):
                    col_types[k] = "BIGINT"
            else:
                if col_types.get(k) not in ("JSONB", "NUMERIC", "BIGINT"):
                    col_types[k] = "TEXT"
    return col_types

# ---------------------------------------------------------------------------
# Fase 7: SQL-waarde serialiseren
# ---------------------------------------------------------------------------

def sql_val(v, col_type: str = "TEXT") -> str:
    if v is None:
        return "NULL"
    if isinstance(v, (dict, list)):
        s = json.dumps(v, ensure_ascii=False)
        return "'" + s.replace("'", "''") + "'::jsonb"
    if isinstance(v, float):
        return str(v)
    if isinstance(v, int):
        return str(v)
    # Scalaire string in een JSONB-kolom: serialiseer als JSON-string
    if col_type == "JSONB":
        s = json.dumps(str(v), ensure_ascii=False)
        return "'" + s.replace("'", "''") + "'::jsonb"
    return "'" + str(v).replace("'", "''") + "'"

# ---------------------------------------------------------------------------
# Hoofdprogramma
# ---------------------------------------------------------------------------

def main():
    ttl_path   = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_TTL
    frame_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_FRAME
    out_dir    = Path(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_OUT

    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Frame laden: {frame_path}", file=sys.stderr)
    uri_to_term, frame_classes = load_frame(frame_path)
    print(f"[INFO] {len(uri_to_term)} termen, {len(frame_classes)} klassen in frame", file=sys.stderr)

    g = load_graph(ttl_path)
    class_subjects = build_class_subjects(g)

    stats: dict[str, int] = {}

    with open(out_dir / "load.sql", "w", encoding="utf-8") as sql_out:
        sql_out.write("-- Gegenereerd door ttl_to_jsonld.py\n")
        sql_out.write(f"-- Bron: {ttl_path.resolve()}\n\n")
        sql_out.write("BEGIN;\n")

        for class_uri in frame_classes:
            table_name = "jsonld_" + class_to_tablename(class_uri)
            subjects = class_subjects.get(class_uri, set())

            if not subjects:
                print(f"[INFO] {table_name}: 0 entiteiten — overgeslagen", file=sys.stderr, flush=True)
                stats[table_name] = 0
                continue

            print(f"[INFO] {table_name}: {len(subjects)} entiteiten verwerken ...", file=sys.stderr, flush=True)

            # Records bouwen
            records = [build_record(g, s, uri_to_term) for s in sorted(subjects)]

            # JSON-bestand schrijven
            file_stem = class_to_tablename(class_uri)
            json_path = out_dir / f"{file_stem}.json"
            json_path.write_text(
                json.dumps(records, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

            # Schema infereren
            col_types = infer_schema(records)
            # Vaste kolommen vooraan
            ordered_cols = list(col_types.keys())

            # CREATE TABLE
            sql_out.write(f"\n-- {table_name}\n")
            sql_out.write(f"DROP TABLE IF EXISTS {table_name};\n")
            sql_out.write(f"CREATE TABLE {table_name} (\n")
            sql_out.write(f"  id TEXT PRIMARY KEY,\n")
            sql_out.write(f"  types JSONB")
            for col in ordered_cols:
                sql_col = col.replace('"', '""')
                sql_out.write(f",\n  \"{sql_col}\" {col_types[col]}")
            sql_out.write("\n);\n")

            # INSERT per record
            all_cols = ["id", "types"] + ordered_cols
            col_list = ", ".join(
                ['"id"', '"types"'] + [f'"{c}"' for c in ordered_cols]
            )

            for rec in records:
                id_val = sql_val(rec.get("@id"), "TEXT")
                types_val = sql_val(rec.get("@type"), "JSONB")
                vals = [id_val, types_val]
                for col in ordered_cols:
                    vals.append(sql_val(rec.get(col), col_types[col]))
                sql_out.write(
                    f"INSERT INTO {table_name} ({col_list})\n"
                    f"  VALUES ({', '.join(vals)})\n"
                    f"  ON CONFLICT DO NOTHING;\n"
                )

            stats[table_name] = len(records)
            print(f"[INFO]   → {len(records)} rijen", file=sys.stderr, flush=True)

        sql_out.write("\nCOMMIT;\n")

    # Samenvatting
    print("\n[SAMENVATTING] Rijen per tabel:", file=sys.stderr)
    for tname, n in sorted(stats.items()):
        if n > 0:
            print(f"  {tname:50s} {n:>7}", file=sys.stderr)

    print(f"\n[KLAAR]", file=sys.stderr)
    print(f"  JSON-bestanden: {out_dir}/", file=sys.stderr)
    print(f"  Load-script:    {(out_dir / 'load.sql').resolve()}", file=sys.stderr)


if __name__ == "__main__":
    main()
