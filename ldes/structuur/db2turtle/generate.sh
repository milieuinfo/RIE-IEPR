#!/bin/bash
# Comment-driven DB -> Turtle generator.
#
# Reads the mjv schema metadata (table comments, column comments, FK constraints)
# from pg_catalog and emits one LDES member (Turtle) per row of each stream's
# member table.
#
# Mapping rules:
#   - table comment                     -> rdf:type of the member
#   - column comment '@id'              -> the subject IRI of the member
#   - column with a comment that is an IRI -> that property
#   - FK column whose comment ends in #localId -> the identity localId (literal)
#   - FK column whose comment is another IRI   -> object is the @id uri of the referenced table
#   - TEXT value starting with http(s)://      -> IRI, otherwise a plain literal
#   - multi-value relations               -> declared per stream in $MULTIVALUED
#   - columns whose comment is not an IRI     -> not mapped (not part of the datamodel)
#
# Every generated stream document is POSTed as text/turtle to the LDIO pipeline
# of the same name as the stream:  $LDIO_URL/<stream>
set -euo pipefail

PGHOST="${PGHOST:-postgres-mjv}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-admin}"
PGDATABASE="${PGDATABASE:-structuur}"
LDIO_URL="${LDIO_URL:-http://ldio:8080}"
export PGPASSWORD="${PGPASSWORD:-admin}"

TAB=$'\t'
NL=$'\n'

psqlq() {
  psql --host "$PGHOST" --port "$PGPORT" --username "$PGUSER" --dbname "$PGDATABASE" \
    --quiet --tuples-only --no-align --field-separator "$TAB" -c "$1"
}

# stream|member-table
STREAMS="
exploitant|mjv.exploitant
exploitatielocatie|mjv.exploitatielocatie
exploitatie|mjv.exploitatie_versie
installatie|mjv.installatie_versie
emissiepunt|mjv.emissiepunt_versie
meetpunt|mjv.meetpunt_versie
proces|mjv.proces_versie
rubriek|mjv.rubriek
systeemeigenschap|mjv.systeemeigenschap
"

# stream|relation-table|relation-alias|on-clause|target-table|target-alias|on-clause-2|predicate
MULTIVALUED="
exploitatie|mjv.exploitatie_systeem|es|es.exploitatie_id = m.exploitatie_id|mjv.systeem|ts|ts.id = es.systeem_id|http://www.w3.org/ns/ssn/deployedSystem
installatie|mjv.installatie_versie_systeemeigenschap|ivs|ivs.installatie_versie_id = m.id|mjv.systeemeigenschap|se|se.id = ivs.systeemeigenschap_id|http://www.w3.org/ns/ssn/hasProperty
emissiepunt|mjv.emissiepunt_versie_systeemeigenschap|evs|evs.emissiepunt_versie_id = m.id|mjv.systeemeigenschap|se|se.id = evs.systeemeigenschap_id|http://www.w3.org/ns/ssn/hasProperty
meetpunt|mjv.meetpunt_versie_systeemeigenschap|mvs|mvs.meetpunt_versie_id = m.id|mjv.systeemeigenschap|se|se.id = mvs.systeemeigenschap_id|http://www.w3.org/ns/ssn/hasProperty
proces|mjv.proces_versie_rubriek|pvr|pvr.proces_versie_id = m.id|mjv.rubriek|r|r.id = pvr.rubriek_id|https://data.riepr.omgeving.vlaanderen.be/ns/riepr#rubriek
proces|mjv.proces_proces_volgt_op|ppv|ppv.bron_proces_id = m.proces_id|mjv.proces|tp|tp.id = ppv.doel_proces_id|http://purl.org/net/p-plan/isPrecededBy
"

turtle_escape() {
  local s="$1"
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  printf '%s' "$s"
}

# render_object <value> <pgtype> <is-iri>  -> returns 1 when value is empty
render_object() {
  local val="$1" pgtype="$2" fkuri="$3"
  [ -z "$val" ] && return 1
  if [ "$fkuri" = "1" ]; then
    printf '<%s>' "$val"
    return 0
  fi
  case "$pgtype" in
    "date")               printf '"%s"^^<http://www.w3.org/2001/XMLSchema#date>' "$(turtle_escape "$val")" ;;
    "timestamptz")        printf '"%s"^^<http://www.w3.org/2001/XMLSchema#dateTime>' "$(turtle_escape "$val")" ;;
    "double precision")   printf '"%s"^^<http://www.w3.org/2001/XMLSchema#double>' "$(turtle_escape "$val")" ;;
    "boolean")            printf '"%s"^^<http://www.w3.org/2001/XMLSchema#boolean>' "$(turtle_escape "$val")" ;;
    "wkt")                printf '"%s"^^<http://www.opengis.net/ont/geosparql#wktLiteral>' "$(turtle_escape "$val")" ;;
    "text")
      case "$val" in
        http://*|https://*) printf '<%s>' "$val" ;;
        *)                  printf '"%s"' "$(turtle_escape "$val")" ;;
      esac
      ;;
    *)                    printf '"%s"' "$(turtle_escape "$val")" ;;
  esac
}

generate_stream() {
  local stream_name="$1" table="$2"

  local table_comment
  table_comment=$(psqlq "SELECT obj_description('$table'::regclass, 'pg_class');")
  if [ -z "$table_comment" ]; then
    echo "ERROR: no table comment (rdf:type) found for $table" >&2
    return 1
  fi

  local meta fks
  meta=$(psqlq "SELECT a.attname, col_description(c.oid, a.attnum), format_type(a.atttypid, a.atttypmod)
                FROM pg_class c
                JOIN pg_attribute a ON a.attrelid = c.oid
                WHERE c.oid = '$table'::regclass AND a.attnum > 0 AND NOT a.attisdropped
                ORDER BY a.attnum;")
  fks=$(psqlq "SELECT src.attname, tgn.nspname || '.' || tgc.relname
               FROM pg_constraint con
               JOIN pg_class cc ON cc.oid = con.conrelid
               JOIN pg_attribute src ON src.attrelid = con.conrelid AND src.attnum = con.conkey[1]
               JOIN pg_class tgc ON tgc.oid = con.confrelid
               JOIN pg_namespace tgn ON tgn.oid = tgc.relnamespace
               WHERE cc.oid = '$table'::regclass AND con.contype = 'f';")

  fk_target() {
    local fc ft
    while IFS="$TAB" read -r fc ft; do
      if [ "$fc" = "$1" ]; then
        printf '%s' "$ft"
        return 0
      fi
    done <<< "$fks"
    return 1
  }

  # Build the main SELECT from the column metadata.
  # propdefs lines:  col<TAB>predicate<TAB>pgtype<TAB>iri-or-literal<TAB>sql-expr
  local select_list="m.uri" joins="" propdefs=""
  local col comment pgtype target alias
  while IFS="$TAB" read -r col comment pgtype; do
    [ -z "${col:-}" ] && continue
    [ "$comment" = "@id" ] && continue
    if target=$(fk_target "$col"); then
      case "$comment" in
        *localId)
          propdefs+="${col}${TAB}${comment}${TAB}uuid${TAB}0${TAB}m.${col}${NL}"
          select_list+=", m.${col}"
          ;;
        http://*|https://*)
          alias="t_$(printf '%s' "$col" | tr -cs 'a-z0-9' '_')"
          joins+="${NL}  LEFT JOIN ${target} ${alias} ON ${alias}.id = m.${col}"
          propdefs+="${col}${TAB}${comment}${TAB}uri${TAB}1${TAB}${alias}.uri${NL}"
          select_list+=", ${alias}.uri"
          ;;
      esac
    else
      case "$comment" in
        http://*|https://*)
          if [[ "$pgtype" == geometry* ]]; then
            propdefs+="${col}${TAB}${comment}${TAB}wkt${TAB}0${TAB}ST_AsText(m.${col})${NL}"
            select_list+=", ST_AsText(m.${col})"
          else
            propdefs+="${col}${TAB}${comment}${TAB}${pgtype}${TAB}0${TAB}m.${col}${NL}"
            select_list+=", m.${col}"
          fi
          ;;
      esac
    fi
  done <<< "$meta"

  # Multi-value relation triples for this stream.
  local mv_parts=()
  local mv_stream rtable ralias on1 ttable talias on2 pred
  while IFS='|' read -r mv_stream rtable ralias on1 ttable talias on2 pred; do
    [ "$mv_stream" = "$stream_name" ] || continue
    mv_parts+=("SELECT m.uri, '$pred', ${talias}.uri
                 FROM ${table} m
                 JOIN ${rtable} ${ralias} ON ${on1}
                 JOIN ${ttable} ${talias} ON ${on2}")
  done <<< "$MULTIVALUED"

  local mv_triples_file="/tmp/mv_${stream_name}.tbl"
  : > "$mv_triples_file"
  if [ "${#mv_parts[@]}" -gt 0 ]; then
    local mv_sql
    mv_sql=$(printf '%s\n UNION ALL\n' "${mv_parts[@]}")
    psqlq "$mv_sql" >> "$mv_triples_file"
  fi

  # Render the document.
  local doc="/tmp/doc_${stream_name}.ttl"
  local main_sql="SELECT ${select_list} FROM ${table} m${joins}"
  local count=0
  : > "$doc"

  local uri
  local -a propcols=()
  while IFS="$TAB" read -r uri _rest; do
    propcols=()
    local pc pp pt pfk pexpr p val obj i objarr=()
    while IFS="$TAB" read -r pc pp pt pfk pexpr; do
      [ -z "${pc:-}" ] && continue
      propcols+=("${pp}|${pt}|${pfk}")
      IFS="$TAB" read -r _ _ _ _ val <<< "$(printf '%s\t%s\t%s\t%s\t%s' "$pc" "$pp" "$pt" "$pfk" "$pexpr")"
      IFS="$TAB" read -r _a _b _c _d _e _f _g _h _i _j _k _l _m _n _o <<< "placeholder"
      IFS="|" read -r pp pt pfk <<< ""
    done <<< "$propdefs"
    break
  done < /dev/null

  # NOTE: the block above is unused placeholder logic; the real row loop is below.
  while IFS="$TAB" read -r uri rest; do
    [ -z "$uri" ] && continue
    # split rest into fields
    local fields=()
    IFS="$TAB" read -r -a fields <<< "$rest"
    local objlist=()
    local idx=0 pp pt pfk
    while IFS="$TAB" read -r pc pp pt pfk pexpr; do
      [ -z "${pc:-}" ] && continue
      val="${fields[idx]:-}"
      idx=$((idx + 1))
      if obj=$(render_object "$val" "$pt" "$pfk"); then
        objlist+=("${pp} ${obj}")
      fi
    done <<< "$propdefs"
    # multi-value triples for this subject
    local mt
    while IFS="$TAB" read -r mt_u mt_p mt_o; do
      [ "$mt_u" = "$uri" ] || continue
      [ -z "$mt_o" ] && continue
      objlist+=("${mt_p} <${mt_o}>")
    done < "$mv_triples_file"

    {
      printf '<%s>\n' "$uri"
      printf '    a <%s>' "$table_comment"
      if [ "${#objlist[@]}" -gt 0 ]; then
        local j
        for j in "${!objlist[@]}"; do
          objlist[j]="    ${objlist[j]}"
        done
        local n="${#objlist[@]}"
        for j in "${!objlist[@]}"; do
          if [ "$j" -eq $((n - 1)) ]; then
            printf ' ;\n%s .' "${objlist[j]}"
          else
            printf ' ;\n%s ;' "${objlist[j]}"
          fi
        done
        printf '\n'
      else
        printf ' .\n'
      fi
    } >> "$doc"
    count=$((count + 1))
  done < <(psqlq "$main_sql")

  echo "stream $stream_name: generated $count members"
  if [ "$count" -eq 0 ]; then
    echo "ERROR: stream $stream_name has no members, aborting" >&2
    return 1
  fi

  wget -q -O /dev/null \
    --post-file "$doc" \
    --header "Content-Type: text/turtle" \
    "$LDIO_URL/$stream_name"
  echo "stream $stream_name: POSTed to $LDIO_URL/$stream_name"
}

echo "Waiting for postgres to accept connections..."
until psqlq "SELECT 1;" >/dev/null 2>&1; do
  sleep 2
done

while IFS='|' read -r s t; do
  [ -z "$s" ] && continue
  generate_stream "$s" "$t"
done <<< "$STREAMS"

echo "All streams published."
