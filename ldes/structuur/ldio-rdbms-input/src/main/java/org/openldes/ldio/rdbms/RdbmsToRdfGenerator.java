package org.openldes.ldio.rdbms;

import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.openldes.ldio.rdbms.RdbmsInputProperties.Expansion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Generic comment-driven DB -> RDF generator.
 *
 * Mapping rules (from the database schema, no hardcoded domain knowledge):
 *   - table comment                      -> rdf:type of the member
 *   - column comment '@id'               -> subject IRI
 *   - column comment ending in #localId  -> adms:identifier [ a adms:Identifier ; rdf:value <v>^^<localId-URI> ]
 *   - FK column with IRI comment         -> object is the referenced table's uri
 *   - column with IRI comment            -> that property (geometry -> wktLiteral)
 *   - TEXT value starting with http(s)://-> IRI, otherwise plain literal
 *   - multi-value relations              -> junction tables whose object-side FK carries a
 *                                           predicate IRI as COMMENT ON CONSTRAINT
 *   - columns whose comment is not an IRI -> not mapped
 *   - lid-expansie (extra subtables + extra relation-links) -> fully driven by the
 *                                           pipeline config (RdbmsInputProperties)
 *
 * De LDES-server (ldes:createVersions true) stempelt zelf dcterms:created /
 * dcterms:isVersionOf; de kolommen aangemaakt_op/gewijzigd_op worden overgeslagen.
 */
public class RdbmsToRdfGenerator {

    private static final Logger LOG = LoggerFactory.getLogger(RdbmsToRdfGenerator.class);

    private static final String NS_XSD = "http://www.w3.org/2001/XMLSchema#";
    private static final String NS_GEO = "http://www.opengis.net/ont/geosparql#";
    private static final String ADMS_IDENTIFIER = "http://www.w3.org/ns/adms#identifier";
    private static final String ADMS_IDENTIFIER_TYPE = "http://www.w3.org/ns/adms#Identifier";
    private static final String RDF_VALUE = "http://www.w3.org/1999-02-22-rdf-syntax-ns#value";
    private static final String RDF_TYPE = "http://www.w3.org/1999-02-22-rdf-syntax-ns#type";

    private final String jdbcUrl;
    private final String username;
    private final String password;
    private final String schema;
    private final String[] memberTables;
    private final List<Expansion> expansions;

    public RdbmsToRdfGenerator(String jdbcUrl, String username, String password,
                               String schema, String[] memberTables,
                               List<Expansion> expansions) {
        this.jdbcUrl = jdbcUrl;
        this.username = username;
        this.password = password;
        this.schema = schema;
        this.memberTables = memberTables;
        this.expansions = expansions;
    }

    // ------------------------------------------------------------------
    // SQL helpers
    // ------------------------------------------------------------------

    private Connection connect() throws SQLException {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("PostgreSQL JDBC driver not found on classpath", e);
        }
        return DriverManager.getConnection(jdbcUrl, username, password);
    }

    private String q(String sql) {
        try (Connection conn = connect();
             PreparedStatement st = conn.prepareStatement(sql);
             ResultSet rs = st.executeQuery()) {
            StringBuilder sb = new StringBuilder();
            int cols = rs.getMetaData().getColumnCount();
            while (rs.next()) {
                for (int i = 1; i <= cols; i++) {
                    if (i > 1) sb.append('\t');
                    Object v = rs.getObject(i);
                    sb.append(v == null ? "" : String.valueOf(v));
                }
                sb.append('\n');
            }
            return sb.toString();
        } catch (SQLException e) {
            throw new IllegalStateException("SQL failed: " + sql, e);
        }
    }

    private String tableComment(String table) {
        String s = q("SELECT obj_description('" + table + "'::regclass, 'pg_class');").trim();
        return s.isEmpty() ? null : s;
    }

    private List<String[]> columnMeta(String table) {
        List<String[]> rows = new ArrayList<>();
        String out = q("SELECT a.attname, col_description(c.oid, a.attnum), format_type(a.atttypid, a.atttypmod) "
                + "FROM pg_class c "
                + "JOIN pg_attribute a ON a.attrelid = c.oid "
                + "WHERE c.oid = '" + table + "'::regclass AND a.attnum > 0 AND NOT a.attisdropped "
                + "ORDER BY a.attnum;");
        for (String line : out.split("\n")) {
            if (line.isEmpty()) continue;
            String[] parts = line.split("\t", -1);
            if (parts.length >= 3) rows.add(parts);
        }
        return rows;
    }

    private Map<String, String> fkTargets(String table) {
        Map<String, String> map = new HashMap<>();
        String out = q("SELECT src.attname, tgn.nspname || '.' || tgc.relname "
                + "FROM pg_constraint con "
                + "JOIN pg_class cc ON cc.oid = con.conrelid "
                + "JOIN pg_attribute src ON src.attrelid = con.conrelid AND src.attnum = con.conkey[1] "
                + "JOIN pg_class tgc ON tgc.oid = con.confrelid "
                + "JOIN pg_namespace tgn ON tgn.oid = tgc.relnamespace "
                + "WHERE cc.oid = '" + table + "'::regclass AND con.contype = 'f';");
        for (String line : out.split("\n")) {
            if (line.isEmpty()) continue;
            String[] parts = line.split("\t", -1);
            if (parts.length >= 2) map.put(parts[0], parts[1]);
        }
        return map;
    }

    // ------------------------------------------------------------------
    // Property definitions (propdefs)
    // ------------------------------------------------------------------

    private static final class PropDef {
        final String col;
        final String predicate;
        final String pgtype;
        final boolean fkIri;
        final String sqlExpr;

        PropDef(String col, String predicate, String pgtype, boolean fkIri, String sqlExpr) {
            this.col = col;
            this.predicate = predicate;
            this.pgtype = pgtype;
            this.fkIri = fkIri;
            this.sqlExpr = sqlExpr;
        }
    }

    private Object[] buildTableMeta(String table) {
        Map<String, String> fks = fkTargets(table);
        StringBuilder select = new StringBuilder("SELECT m.uri");
        List<PropDef> propdefs = new ArrayList<>();
        List<String> joins = new ArrayList<>();

        for (String[] meta : columnMeta(table)) {
            String col = meta[0];
            String comment = meta[1];
            String pgtype = meta[2];
            if (comment == null || comment.isEmpty()) continue;
            if ("@id".equals(comment)) continue;
            if (comment.contains("/dc/terms/created") || comment.contains("/dc/terms/modified")) continue;

            String target = fks.get(col);
            if (target != null) {
                if (comment.endsWith("localId")) {
                    propdefs.add(new PropDef(col, comment, "uuid", false, "m." + col));
                    select.append(", m.").append(col);
                } else if (comment.startsWith("http://") || comment.startsWith("https://")) {
                    String alias = "t_" + col.replaceAll("[^a-z0-9]", "_");
                    joins.add("LEFT JOIN " + target + " " + alias + " ON " + alias + ".id = m." + col);
                    propdefs.add(new PropDef(col, comment, "uri", true, alias + ".uri"));
                    select.append(", ").append(alias).append(".uri");
                }
            } else {
                if (comment.startsWith("http://") || comment.startsWith("https://")) {
                    if (pgtype.startsWith("geometry")) {
                        propdefs.add(new PropDef(col, comment, "wkt", false, "ST_AsText(m." + col + ")"));
                        select.append(", ST_AsText(m.").append(col).append(")");
                    } else {
                        propdefs.add(new PropDef(col, comment, pgtype, false, "m." + col));
                        select.append(", m.").append(col);
                    }
                }
            }
        }

        select.append("\nFROM ").append(table).append(" m");
        for (String join : joins) select.append("\n  ").append(join);
        return new Object[]{select.toString(), propdefs};
    }

    // ------------------------------------------------------------------
    // Multi-value junction discovery (COMMENT ON CONSTRAINT)
    // ------------------------------------------------------------------

    private static final class Junction {
        final String table;
        final String subjCol;
        final String subjTbl;
        final String objCol;
        final String objTbl;
        final String predicate;

        Junction(String table, String subjCol, String subjTbl, String objCol, String objTbl, String predicate) {
            this.table = table;
            this.subjCol = subjCol;
            this.subjTbl = subjTbl;
            this.objCol = objCol;
            this.objTbl = objTbl;
            this.predicate = predicate;
        }
    }

    private List<Junction> discoverJunctions() {
        List<Junction> junctions = new ArrayList<>();
        String out = q("SELECT j.relname, subj.attname, subjt.relname, obj.attname, objt.relname, "
                + "       obj_description(objcon.oid, 'pg_constraint') "
                + "FROM pg_constraint objcon "
                + "JOIN pg_class j ON j.oid = objcon.conrelid "
                + "JOIN pg_attribute obj ON obj.attrelid = j.oid AND obj.attnum = objcon.conkey[1] "
                + "JOIN pg_class objt ON objt.oid = objcon.confrelid "
                + "JOIN pg_constraint subjcon ON subjcon.conrelid = j.oid AND subjcon.contype = 'f' "
                + "                            AND subjcon.oid <> objcon.oid "
                + "JOIN pg_attribute subj ON subj.attrelid = j.oid AND subj.attnum = subjcon.conkey[1] "
                + "JOIN pg_class subjt ON subjt.oid = subjcon.confrelid "
                + "WHERE objcon.contype = 'f' AND j.relnamespace = '" + schema + "'::regnamespace "
                + "  AND obj_description(objcon.oid, 'pg_constraint') ~ '^https?://' "
                + "  AND (SELECT count(*) FROM pg_constraint c2 WHERE c2.conrelid = j.oid AND c2.contype = 'f') = 2;");
        for (String line : out.split("\n")) {
            if (line.isEmpty()) continue;
            String[] parts = line.split("\t", -1);
            if (parts.length >= 6) {
                junctions.add(new Junction(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]));
            }
        }
        return junctions;
    }

    private Map<String, List<String[]>> buildMvTriples(String memberTable) {
        Map<String, List<String[]>> triples = new HashMap<>();
        String mainTbl = shortName(memberTable);
        for (Junction j : discoverJunctions()) {
            String on1;
            if (j.subjTbl.equals(mainTbl)) {
                on1 = "j." + j.subjCol + " = m.id";
            } else {
                String fk = q("SELECT src.attname FROM pg_constraint c2 "
                        + "JOIN pg_class cc ON cc.oid = c2.conrelid "
                        + "JOIN pg_attribute src ON src.attrelid = c2.conrelid AND src.attnum = c2.conkey[1] "
                        + "JOIN pg_class tc ON tc.oid = c2.confrelid "
                        + "WHERE c2.contype = 'f' AND cc.relname = '" + mainTbl + "' AND tc.relname = '" + j.subjTbl + "';").trim();
                if (fk.isEmpty()) continue;
                on1 = "j." + j.subjCol + " = m." + fk;
            }
            String sql = "SELECT m.uri, '" + j.predicate + "', t.uri "
                    + "FROM " + memberTable + " m "
                    + "JOIN " + schema + "." + j.table + " j ON " + on1 + " "
                    + "JOIN " + schema + "." + j.objTbl + " t ON t.id = j." + j.objCol;
            addTriples(triples, sql);
        }
        return triples;
    }

    private void addTriples(Map<String, List<String[]>> triples, String sql) {
        String out = q(sql);
        for (String line : out.split("\n")) {
            if (line.isEmpty()) continue;
            String[] parts = line.split("\t", -1);
            if (parts.length < 3 || parts[0].isEmpty() || parts[2].isEmpty()) continue;
            triples.computeIfAbsent(parts[0], k -> new ArrayList<>()).add(new String[]{parts[1], parts[2]});
        }
    }

    private static String shortName(String qualified) {
        int dot = qualified.lastIndexOf('.');
        return dot >= 0 ? qualified.substring(dot + 1) : qualified;
    }

    // ------------------------------------------------------------------
    // Member rendering into a Jena model
    // ------------------------------------------------------------------

    private void addProperty(Model model, Resource subject, PropDef pd, String val) {
        Property prop = model.createProperty(pd.predicate);
        if (pd.predicate.endsWith("#localId")) {
            Resource id = model.createResource()
                    .addProperty(model.createProperty(RDF_TYPE), model.createResource(ADMS_IDENTIFIER_TYPE))
                    .addProperty(model.createProperty(RDF_VALUE),
                            model.createTypedLiteral(val, pd.predicate));
            subject.addProperty(model.createProperty(ADMS_IDENTIFIER), id);
            return;
        }
        if (pd.fkIri) {
            subject.addProperty(prop, model.createResource(val));
            return;
        }
        switch (pd.pgtype) {
            case "date":
                subject.addProperty(prop, model.createTypedLiteral(val, XSDDatatype.XSDdate));
                break;
            case "timestamp with time zone":
            case "timestamp without time zone":
                subject.addProperty(prop, model.createTypedLiteral(val, XSDDatatype.XSDdateTime));
                break;
            case "double precision":
                subject.addProperty(prop, model.createTypedLiteral(val, XSDDatatype.XSDdouble));
                break;
            case "boolean":
                subject.addProperty(prop, model.createTypedLiteral(val, XSDDatatype.XSDboolean));
                break;
            case "wkt":
                subject.addProperty(prop, model.createTypedLiteral(val, NS_GEO + "wktLiteral"));
                break;
            case "text":
                if (val.startsWith("http://") || val.startsWith("https://")) {
                    subject.addProperty(prop, model.createResource(val));
                } else {
                    subject.addProperty(prop, model.createLiteral(val));
                }
                break;
            default:
                subject.addProperty(prop, model.createLiteral(val));
        }
    }

    private void renderMemberFields(Model model, Resource subject, String[] fields, List<PropDef> propdefs) {
        int idx = 0;
        for (PropDef pd : propdefs) {
            String val = idx < fields.length ? fields[idx] : null;
            idx++;
            if (val == null || val.isEmpty()) continue;
            addProperty(model, subject, pd, val);
        }
    }

    private void applyMvTriples(Model model, Resource subject, Map<String, List<String[]>> mvTriples, String uri) {
        List<String[]> mvs = mvTriples.get(uri);
        if (mvs != null) {
            for (String[] mt : mvs) {
                subject.addProperty(model.createProperty(mt[0]), model.createResource(mt[1]));
            }
        }
    }

    // ------------------------------------------------------------------
    // Top-level stream generation
    // ------------------------------------------------------------------

    /**
     * Generate one stream document as a Jena Model. The subject of each member
     * is the versionless identity URI; the LDES server stamps versions.
     */
    public Model generateStream(String memberTable) {
        Model model = ModelFactory.createDefaultModel();
        String typeIri = tableComment(memberTable);
        if (typeIri == null) {
            throw new IllegalStateException("no table comment (rdf:type) for " + memberTable);
        }

        Object[] meta = buildTableMeta(memberTable);
        String selectSql = (String) meta[0];
        @SuppressWarnings("unchecked")
        List<PropDef> propdefs = (List<PropDef>) meta[1];

        Map<String, List<String[]>> mvTriples = buildMvTriples(memberTable);

        // expansion relations (extra links, config-driven)
        Expansion expansion = findExpansion(memberTable);
        if (expansion != null && expansion.getRelationsSql() != null) {
            addTriples(mvTriples, expandTemplate(expansion.getRelationsSql(), null));
        }

        String out = q(selectSql);
        for (String line : out.split("\n")) {
            if (line.isEmpty()) continue;
            String[] parts = line.split("\t", -1);
            String uri = parts[0];
            if (uri.isEmpty()) continue;
            Resource subject = model.createResource(uri);
            subject.addProperty(model.createProperty(RDF_TYPE), model.createResource(typeIri));
            String[] fields = new String[parts.length - 1];
            System.arraycopy(parts, 1, fields, 0, fields.length);
            renderMemberFields(model, subject, fields, propdefs);
            applyMvTriples(model, subject, mvTriples, uri);
        }

        // expansion subtables (config-driven scopes)
        if (expansion != null) {
            expandSubtables(model, mvTriples, expansion);
        }
        return model;
    }

    private Expansion findExpansion(String memberTable) {
        for (Expansion e : expansions) {
            if (e.getMemberTable().equals(memberTable)) {
                return e;
            }
        }
        return null;
    }

    /** Replace {schema} and {uri} placeholders in a config template. */
    private String expandTemplate(String template, String uri) {
        String s = template.replace("{schema}", schema);
        if (uri != null) {
            s = s.replace("{uri}", uri);
        }
        return s;
    }

    private void expandSubtables(Model model, Map<String, List<String[]>> mvTriples, Expansion expansion) {
        Set<String> seen = new LinkedHashSet<>();
        List<String> uris = new ArrayList<>();
        String memberTable = expansion.getMemberTable();
        String out = q("SELECT uri FROM " + memberTable + ";");
        for (String line : out.split("\n")) {
            if (!line.trim().isEmpty()) uris.add(line.trim());
        }
        for (String[] subtable : expansion.getSubtables()) {
            String table = subtable[0];
            String scopeTemplate = subtable[1];
            Object[] meta = buildTableMeta(table);
            String selectSql = (String) meta[0];
            @SuppressWarnings("unchecked")
            List<PropDef> propdefs = (List<PropDef>) meta[1];
            String typeIri = tableComment(table);
            for (String uri : uris) {
                String scope = expandTemplate(scopeTemplate, uri);
                String rows = q(selectSql + "\nWHERE " + scope);
                for (String line : rows.split("\n")) {
                    if (line.isEmpty()) continue;
                    String[] parts = line.split("\t", -1);
                    String subUri = parts[0];
                    if (subUri.isEmpty() || !seen.add(subUri)) continue;
                    Resource subject = model.createResource(subUri);
                    subject.addProperty(model.createProperty(RDF_TYPE), model.createResource(typeIri));
                    String[] fields = new String[parts.length - 1];
                    System.arraycopy(parts, 1, fields, 0, fields.length);
                    renderMemberFields(model, subject, fields, propdefs);
                    applyMvTriples(model, subject, mvTriples, subUri);
                }
            }
        }
    }

    public String[] getMemberTables() {
        return memberTables;
    }
}
