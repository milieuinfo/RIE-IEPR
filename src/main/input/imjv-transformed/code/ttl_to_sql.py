#!/usr/bin/env python3
"""
ttl_to_sql.py — Converteert all.ttl naar SQL INSERT-statements conform schema.sql

Gebruik:
    python3 ttl_to_sql.py [ttl_path] [schema_path] [output_path]

Defaults:
    ttl_path    = ../dump/all.ttl
    schema_path = ../../../../documentatie/datamodel/generated/sql/schema.sql
    output_path = ../dump/sql/insert.sql
"""

import re
import sys
import io
from dataclasses import dataclass, field
from collections import defaultdict
from pathlib import Path

import rdflib
from rdflib import Graph, RDF, URIRef, Literal, Namespace
from rdflib.namespace import RDFS, XSD, OWL

# ---------------------------------------------------------------------------
# Constanten
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).parent
DEFAULT_TTL    = SCRIPT_DIR / "../dump/all.ttl"
DEFAULT_SCHEMA = SCRIPT_DIR / "../../../../../documentatie/datamodel/generated/sql/schema.sql"
DEFAULT_OUTPUT = SCRIPT_DIR / "../dump/sql/insert.sql"

PSEUDO_URI_PRED  = "http://example.org/vocab/uri"
LOCALID_PRED     = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#localId"
VLID_PRED        = "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#vlaanderenId"
STATUS_PRED      = "http://www.w3.org/ns/adms#status"

# Klasse-aliassen: data-klasse → schema-klasse
CLASS_ALIASES = {
    "http://www.w3.org/ns/sosa/Result":
        "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Resultaat",
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

# qudt:quantityValue-indirectie: resultaat.waarde/eenheid zitten op de QV-node
QUDT_QUANTITYVALUE_PRED = "http://qudt.org/schema/qudt/quantityValue"
BRIDGE_VIA_QV = frozenset({
    "http://qudt.org/schema/qudt/numericValue",
    "http://qudt.org/schema/qudt/hasUnit",
})

# JOIN-tabel predicaat-mapping: original_relation → (predikaat-URI, richting)
# richting "forward": subject van bronklasse heeft pred → doel
# richting "inverse": doel heeft pred → subject van bronklasse
RELATION_TO_PREDICATE = {
    "has_deployment_exploitatie":           ("http://www.w3.org/ns/ssn/hasDeployment",        "forward"),
    "in_deployment_exploitatie":            ("http://www.w3.org/ns/ssn/deployedOnPlatform",   "inverse"),
    "heeft_contactpersoon_contactpersoon":  ("https://data.riepr.omgeving.vlaanderen.be/ns/riepr#heeftContactpersoon", "forward"),
    "contactpersoon_van_exploitant":        ("https://data.riepr.omgeving.vlaanderen.be/ns/riepr#contactpersoonVan",   "forward"),
    "contactpersoon_van_exploitatie":       ("https://data.riepr.omgeving.vlaanderen.be/ns/riepr#contactpersoonVan",   "forward"),
    "heeft_sub_systeem_meet_instrument":    ("http://www.w3.org/ns/ssn/hasSubSystem",          "forward"),
    "heeft_sub_systeem_filter":             ("http://www.w3.org/ns/ssn/hasSubSystem",          "forward"),
    "volgt_op_proces":                      ("http://www.w3.org/ns/prov#wasRevisionOf",         "forward"),
    "is_input_var_of_proces":               ("http://purl.org/net/p-plan#hasInputVar",          "inverse"),
    "subject_exploitatie":                  ("https://data.riepr.omgeving.vlaanderen.be/ns/riepr#exploitatie", "forward"),
    "subject_observatie":                   ("https://data.riepr.omgeving.vlaanderen.be/ns/riepr#observatie",  "forward"),
}

# Voor disambiguatie van ssn:hasSubSystem: welke doelklasse verwachten we?
RELATION_TARGET_CLASS = {
    "heeft_sub_systeem_meet_instrument": "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#MeetInstrument",
    "heeft_sub_systeem_filter":          "https://data.riepr.omgeving.vlaanderen.be/ns/riepr#Filter",
}

# ---------------------------------------------------------------------------
# Datastructuren
# ---------------------------------------------------------------------------

@dataclass
class TableMeta:
    name: str
    table_type: str                   # "REGULAR" | "IDENTITY" | "JOIN"
    class_uri: str
    columns: list[str] = field(default_factory=list)
    col_to_pred: dict[str, str] = field(default_factory=dict)
    pk_cols: list[str] = field(default_factory=list)
    original_relation: str | None = None

# ---------------------------------------------------------------------------
# Fase 1: schema parsen
# ---------------------------------------------------------------------------

RE_CREATE_TABLE   = re.compile(r"^CREATE TABLE (\w+)\s*\(")
RE_PRIMARY_KEY    = re.compile(r"^\s+PRIMARY KEY\s*\(([^)]+)\)")
RE_TABLE_TYPE     = re.compile(r"--\s*Table type:\s*(\w+)")
RE_ORIG_REL       = re.compile(r"--\s*Original relation:\s*(\S+)")
RE_COL_COMMENT    = re.compile(r"^COMMENT ON COLUMN (\w+)\.(\w+) IS '([^']+)'")
RE_TABLE_COMMENT  = re.compile(r"^COMMENT ON TABLE (\w+) IS '([^']+)'")
RE_COL_DEF        = re.compile(r"^\s+(\w+)\s+(?:VARCHAR|DATE|TIMESTAMP|DECIMAL|TEXT)")


def parse_schema(schema_path: Path) -> dict[str, TableMeta]:
    tables: dict[str, TableMeta] = {}
    current: TableMeta | None = None
    comment_buffer: list[str] = []
    in_table = False
    depth = 0

    with open(schema_path) as f:
        for raw_line in f:
            line = raw_line.rstrip()

            # Verzamel comment-regels buiten tabel-definities
            if not in_table:
                if line.startswith("--"):
                    comment_buffer.append(line)
                elif line.strip() == "" or line.startswith("CREATE") or line.startswith("COMMENT") or line.startswith("ALTER"):
                    pass
                else:
                    comment_buffer = []

            m = RE_CREATE_TABLE.match(line)
            if m:
                tname = m.group(1)
                ttype = "REGULAR"
                orig_rel = None
                for cline in comment_buffer:
                    tm = RE_TABLE_TYPE.search(cline)
                    if tm:
                        ttype = tm.group(1)
                    rm = RE_ORIG_REL.search(cline)
                    if rm:
                        orig_rel = rm.group(1)
                current = TableMeta(
                    name=tname,
                    table_type=ttype,
                    class_uri="",
                    original_relation=orig_rel,
                )
                tables[tname] = current
                comment_buffer = []
                in_table = True
                depth = 1
                continue

            if in_table:
                depth += line.count("(") - line.count(")")
                if depth <= 0:
                    in_table = False
                    current = None
                    continue

                # Kolom-namen verzamelen (geen comments, geen constraints)
                col_m = RE_COL_DEF.match(line)
                if col_m and current:
                    col_name = col_m.group(1)
                    if col_name not in ("PRIMARY",):
                        current.columns.append(col_name)

                pk_m = RE_PRIMARY_KEY.match(line)
                if pk_m and current:
                    current.pk_cols = [c.strip() for c in pk_m.group(1).split(",")]

            # COMMENT ON TABLE
            tc_m = RE_TABLE_COMMENT.match(line)
            if tc_m:
                tname, class_uri = tc_m.group(1), tc_m.group(2)
                if tname in tables:
                    tables[tname].class_uri = class_uri

            # COMMENT ON COLUMN
            cc_m = RE_COL_COMMENT.match(line)
            if cc_m:
                tname, col_name, pred_uri = cc_m.group(1), cc_m.group(2), cc_m.group(3)
                if tname in tables and col_name not in tables[tname].col_to_pred:
                    tables[tname].col_to_pred[col_name] = pred_uri

    return tables

# ---------------------------------------------------------------------------
# Fase 2: graph laden + inverse index
# ---------------------------------------------------------------------------

def load_graph(ttl_path: Path) -> Graph:
    print(f"[INFO] Laden: {ttl_path} ...", file=sys.stderr, flush=True)
    g = Graph()
    g.parse(str(ttl_path), format="turtle")
    print(f"[INFO] Graph geladen: {len(g)} triples", file=sys.stderr, flush=True)
    return g


def build_inverse_index(g: Graph) -> dict[str, dict[str, set[str]]]:
    """inverse_index[pred_uri][obj_uri] → {subj_uri, ...}"""
    print("[INFO] Inverse index bouwen ...", file=sys.stderr, flush=True)
    idx: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    for s, p, o in g:
        if isinstance(o, URIRef):
            idx[str(p)][str(o)].add(str(s))
    return idx


def build_class_subjects(g: Graph) -> dict[str, set[str]]:
    """class_uri → {subject_uri, ...}; aliassen worden opgezet."""
    print("[INFO] Klasse-index bouwen ...", file=sys.stderr, flush=True)
    cs: dict[str, set[str]] = defaultdict(set)
    for s, _, o in g.triples((None, RDF.type, None)):
        if isinstance(o, URIRef):
            uri = str(o)
            cs[uri].add(str(s))
            if uri in CLASS_ALIASES:
                cs[CLASS_ALIASES[uri]].add(str(s))
    return cs

# ---------------------------------------------------------------------------
# Fase 3: waarde-extractie
# ---------------------------------------------------------------------------

def sql_escape(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def coerce_literal(lit: Literal) -> str:
    dt = str(lit.datatype) if lit.datatype else ""
    val = str(lit)
    if dt in ("http://www.w3.org/2001/XMLSchema#date",):
        return sql_escape(val[:10])
    if dt in (
        "http://www.w3.org/2001/XMLSchema#dateTime",
        "http://www.w3.org/2001/XMLSchema#dateTimeStamp",
    ):
        # Verwijder timezone-offset voor eenvoud; bewaar seconden
        v = val.replace("Z", "").replace("+00:00", "")
        if "T" in v:
            v = v[:19]
        return sql_escape(v)
    if dt in (
        "http://www.w3.org/2001/XMLSchema#decimal",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double",
        "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#int",
        "http://www.w3.org/2001/XMLSchema#long",
    ):
        try:
            float(val)  # valideer
            return val
        except ValueError:
            return sql_escape(val)
    return sql_escape(val)


def pick_label(g: Graph, subject: URIRef) -> str | None:
    vals = list(g.objects(subject, RDFS.label))
    if not vals:
        return None
    nl = [v for v in vals if isinstance(v, Literal) and v.language == "nl"]
    if nl:
        return sql_escape(str(nl[0]))
    plain = [v for v in vals if isinstance(v, Literal) and not v.language]
    if plain:
        return sql_escape(str(plain[0]))
    return sql_escape(str(vals[0]))


def status_value(uri_str: str) -> str:
    seg = uri_str.rstrip("/").rsplit("/", 1)[-1]
    return sql_escape(seg.upper())


def get_value(
    g: Graph,
    subject: URIRef,
    col: str,
    pred_uri: str,
    warnings: list[str],
    table_name: str,
) -> str:
    """Geeft SQL-waarde terug voor één kolom, of 'NULL'."""

    if pred_uri == PSEUDO_URI_PRED:
        return sql_escape(str(subject))

    if pred_uri in (LOCALID_PRED, VLID_PRED):
        return sql_escape(str(subject))

    # rdfs:label speciaal (multi-language)
    if pred_uri == "http://www.w3.org/2000/01/rdf-schema#label":
        v = pick_label(g, subject)
        return v if v is not None else "NULL"

    # Waarde/eenheid op resultaat: directe triple heeft voorkeur (nieuwe data);
    # qudt:quantityValue-indirectie als fallback (oude data)
    if pred_uri in BRIDGE_VIA_QV:
        direct = list(g.objects(subject, URIRef(pred_uri)))
        if direct:
            obj = direct[0]
            return coerce_literal(obj) if isinstance(obj, Literal) else sql_escape(str(obj))
        qv_objs = list(g.objects(subject, URIRef(QUDT_QUANTITYVALUE_PRED)))
        if not qv_objs:
            return "NULL"
        qv = qv_objs[0]
        bridge_objs = list(g.objects(qv, URIRef(pred_uri)))
        if not bridge_objs:
            return "NULL"
        obj = bridge_objs[0]
        return coerce_literal(obj) if isinstance(obj, Literal) else sql_escape(str(obj))

    pred = URIRef(pred_uri)
    objs = list(g.objects(subject, pred))

    if not objs:
        return "NULL"

    if len(objs) > 1:
        warnings.append(
            f"MULTI {table_name}.{col} <{subject}>: {len(objs)} waarden, eerste genomen"
        )

    obj = objs[0]

    if isinstance(obj, Literal):
        return coerce_literal(obj)

    # URIRef
    obj_str = str(obj)

    if pred_uri == STATUS_PRED:
        return status_value(obj_str)

    return sql_escape(obj_str)

# ---------------------------------------------------------------------------
# Fase 4: INSERT-generatie
# ---------------------------------------------------------------------------

def generate_identity(
    table: TableMeta,
    class_subjects: dict[str, set[str]],
    out: io.TextIOBase,
) -> int:
    subjects = class_subjects.get(table.class_uri, set())
    count = 0
    for subj_uri in sorted(subjects):
        uuid_val = sql_escape(subj_uri)
        # Zoek de enige uuid-kolom
        uuid_col = table.pk_cols[0] if table.pk_cols else "uuid"
        out.write(
            f"INSERT INTO {table.name} ({uuid_col}) VALUES ({uuid_val})"
            " ON CONFLICT DO NOTHING;\n"
        )
        count += 1
    return count


def generate_regular(
    table: TableMeta,
    g: Graph,
    class_subjects: dict[str, set[str]],
    warnings: list[str],
    out: io.TextIOBase,
) -> int:
    subjects = class_subjects.get(table.class_uri, set())
    # Kolommen in volgorde uit col_to_pred (schema-volgorde)
    cols = [c for c in table.columns if c in table.col_to_pred]
    if not cols:
        return 0

    col_list = ", ".join(cols)
    count = 0

    for subj_uri in sorted(subjects):
        subject = URIRef(subj_uri)
        vals = []
        pk_null = False

        for col in cols:
            pred = table.col_to_pred[col]
            val = get_value(g, subject, col, pred, warnings, table.name)
            if val == "NULL" and col in table.pk_cols:
                pk_null = True
                break
            vals.append(val)

        if pk_null:
            warnings.append(f"SKIP {table.name} <{subj_uri}>: PK kolom is NULL")
            continue

        val_list = ", ".join(vals)
        out.write(
            f"INSERT INTO {table.name} ({col_list}) VALUES ({val_list})"
            " ON CONFLICT DO NOTHING;\n"
        )
        count += 1

    return count


def get_temporal_vals(
    g: Graph,
    subject: URIRef,
    table: TableMeta,
) -> dict[str, str]:
    """Haal temporele kolommen op (geldig_van, aangemaakt_op, geldig_tot) van subject."""
    result = {}
    for col in ("geldig_van", "aangemaakt_op", "geldig_tot"):
        if col in table.col_to_pred:
            pred = table.col_to_pred[col]
            vals = list(g.objects(subject, URIRef(pred)))
            if vals and isinstance(vals[0], Literal):
                result[col] = coerce_literal(vals[0])
            else:
                result[col] = "NULL"
    return result


def generate_join(
    table: TableMeta,
    g: Graph,
    class_subjects: dict[str, set[str]],
    inverse_index: dict[str, dict[str, set[str]]],
    warnings: list[str],
    out: io.TextIOBase,
) -> int:
    if not table.original_relation:
        warnings.append(f"JOIN {table.name}: geen original_relation")
        return 0

    mapping = RELATION_TO_PREDICATE.get(table.original_relation)
    if not mapping:
        warnings.append(f"JOIN {table.name}: geen predicaat-mapping voor '{table.original_relation}'")
        return 0

    pred_uri, direction = mapping
    target_class_filter = RELATION_TARGET_CLASS.get(table.original_relation)

    # Bepaal kolom-namen
    source_col = next((c for c in table.columns if c.startswith("source_")), None)
    target_col = next((c for c in table.columns if c.startswith("target_")), None)
    if not source_col or not target_col:
        warnings.append(f"JOIN {table.name}: bron/doel-kolom niet gevonden")
        return 0

    temporal_cols = [c for c in table.columns if c in ("geldig_van", "aangemaakt_op", "geldig_tot")]
    all_cols = [source_col, target_col] + temporal_cols

    # Set van doelklasse-subjects voor type-filtering
    target_class_set: set[str] | None = None
    if target_class_filter:
        target_class_set = class_subjects.get(target_class_filter, set())

    count = 0
    source_subjects = class_subjects.get(table.class_uri, set())

    if direction == "forward":
        pred = URIRef(pred_uri)
        for src_uri in sorted(source_subjects):
            src = URIRef(src_uri)
            src_sql = sql_escape(src_uri)
            for obj in g.objects(src, pred):
                if not isinstance(obj, URIRef):
                    continue
                obj_str = str(obj)
                if target_class_set is not None and obj_str not in target_class_set:
                    continue
                obj_sql = sql_escape(obj_str)
                tvals = get_temporal_vals(g, src, table)
                row_vals = [src_sql, obj_sql] + [tvals.get(c, "NULL") for c in temporal_cols]
                out.write(
                    f"INSERT INTO {table.name} ({', '.join(all_cols)}) "
                    f"VALUES ({', '.join(row_vals)}) ON CONFLICT DO NOTHING;\n"
                )
                count += 1

    else:  # inverse
        # inverse_index[pred_uri][obj_uri] → {subjects die pred→obj hebben}
        obj_to_srcs = inverse_index.get(pred_uri, {})
        for src_uri in sorted(source_subjects):
            # In inverse richting: source_col = de "kleine kant" (ProcesVariabele, Exploitatielocatie)
            # target_col = de entiteit die de predicaat bezit
            # Maar de JOIN-tabel heeft source = bronklasse, target = gerelateerde klasse
            # Voor "inverse": zoek objecten (src_uri) in de inverse index
            related = obj_to_srcs.get(src_uri, set())
            for rel_uri in sorted(related):
                if target_class_set is not None and rel_uri not in target_class_set:
                    continue
                src_sql = sql_escape(src_uri)
                rel_sql = sql_escape(rel_uri)
                tvals = get_temporal_vals(g, URIRef(src_uri), table)
                row_vals = [src_sql, rel_sql] + [tvals.get(c, "NULL") for c in temporal_cols]
                out.write(
                    f"INSERT INTO {table.name} ({', '.join(all_cols)}) "
                    f"VALUES ({', '.join(row_vals)}) ON CONFLICT DO NOTHING;\n"
                )
                count += 1

    return count

# ---------------------------------------------------------------------------
# Hoofdprogramma
# ---------------------------------------------------------------------------

def main():
    ttl_path    = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_TTL
    schema_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_SCHEMA
    output_path = Path(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_OUTPUT

    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Schema parsen: {schema_path}", file=sys.stderr)
    tables = parse_schema(schema_path)
    print(f"[INFO] {len(tables)} tabellen gevonden", file=sys.stderr)

    g = load_graph(ttl_path)
    class_subjects = build_class_subjects(g)
    inverse_index  = build_inverse_index(g)

    warnings: list[str] = []
    stats: dict[str, int] = {}

    with open(output_path, "w", encoding="utf-8") as out:
        out.write("-- Gegenereerd door ttl_to_sql.py\n")
        out.write(f"-- Bron: {ttl_path.resolve()}\n\n")
        out.write("BEGIN;\n")

        for ttype in ("IDENTITY", "REGULAR", "JOIN"):
            for tname in sorted(tables):
                table = tables[tname]
                if table.table_type != ttype:
                    continue
                if not table.class_uri:
                    warnings.append(f"SKIP {tname}: geen class_uri")
                    continue

                out.write(f"\n-- {tname}\n")
                print(f"[INFO] Verwerken: {tname} ({ttype})", file=sys.stderr, flush=True)

                if ttype == "IDENTITY":
                    n = generate_identity(table, class_subjects, out)
                elif ttype == "REGULAR":
                    n = generate_regular(table, g, class_subjects, warnings, out)
                else:
                    n = generate_join(table, g, class_subjects, inverse_index, warnings, out)

                stats[tname] = n
                print(f"[INFO]   → {n} rijen", file=sys.stderr, flush=True)

        out.write("\nCOMMIT;\n")

    # Samenvatting
    print("\n[SAMENVATTING] Rijen per tabel:", file=sys.stderr)
    for tname, n in sorted(stats.items()):
        if n > 0:
            print(f"  {tname:45s} {n:>7}", file=sys.stderr)

    if warnings:
        print(f"\n[WAARSCHUWINGEN] ({len(warnings)} totaal):", file=sys.stderr)
        seen: set[str] = set()
        for w in warnings:
            prefix = w[:60]
            if prefix not in seen:
                print(f"  {w}", file=sys.stderr)
                seen.add(prefix)
        if len(warnings) > len(seen):
            print(f"  ... en {len(warnings) - len(seen)} vergelijkbare waarschuwingen", file=sys.stderr)

    print(f"\n[KLAAR] Output: {output_path.resolve()}", file=sys.stderr)


if __name__ == "__main__":
    main()
