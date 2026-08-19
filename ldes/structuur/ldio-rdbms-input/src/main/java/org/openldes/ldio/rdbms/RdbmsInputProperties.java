package org.openldes.ldio.rdbms;

import org.openldes.ldio.pipeline.creation.valueobjects.ComponentProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * Configuration for the {@code Ldio:RdbmsInput} component, read from the
 * pipeline YAML {@code config} block. There are NO hardcoded defaults: every
 * value (including the schema and the expansion rules) is declared in the
 * pipeline configuration.
 *
 * <pre>
 * config:
 *   jdbc-url: "jdbc:postgresql://postgres-mjv:5432/structuur"
 *   username: "admin"
 *   password: "admin"
 *   schema: "mjv"
 *   member-tables: "mjv.exploitatie_versie"
 *   expansion:
 *     - member-table: "mjv.exploitatie_versie"
 *       subtables: |
 *         mjv.installatie_versie|WHERE ... {uri} ...
 *         mjv.emissiepunt_versie|WHERE ... {uri} ...
 *       relations: |
 *         SELECT v.uri, '&lt;predicate&gt;', t.uri FROM ... ;
 * </pre>
 *
 * <ul>
 *   <li>{@code subtables}: one line per expansion subtable,
 *       {@code <table>|<scope-SQL>}; {@code {uri}} in the scope is replaced by
 *       the member identity uri, {@code {schema}} by the configured schema.</li>
 *   <li>{@code relations}: SQL producing {@code subject&lt;TAB&gt;predicate&lt;TAB&gt;object}
 *       rows for extra links (e.g. ssn:deployedSystem, p-plan:isPrecededBy);
 *       {@code {schema}} is replaced by the configured schema.</li>
 * </ul>
 */
public final class RdbmsInputProperties {

    private static final String JDBC_URL = "jdbc-url";
    private static final String USERNAME = "username";
    private static final String PASSWORD = "password";
    private static final String SCHEMA = "schema";
    private static final String MEMBER_TABLES = "member-tables";
    private static final String EXPANSION = "expansion";
    private static final String OUTPUT_FILE = "output-file";

    private final String jdbcUrl;
    private final String username;
    private final String password;
    private final String schema;
    private final String[] memberTables;
    private final List<Expansion> expansions;
    private final String outputFile;

    private RdbmsInputProperties(String jdbcUrl, String username, String password,
                                 String schema, String[] memberTables,
                                 List<Expansion> expansions, String outputFile) {
        this.jdbcUrl = jdbcUrl;
        this.username = username;
        this.password = password;
        this.schema = schema;
        this.memberTables = memberTables;
        this.expansions = expansions;
        this.outputFile = outputFile;
    }

    public static RdbmsInputProperties fromComponentProperties(ComponentProperties properties) {
        String jdbcUrl = require(properties, JDBC_URL);
        String username = require(properties, USERNAME);
        String password = require(properties, PASSWORD);
        String schema = require(properties, SCHEMA);
        String[] memberTables = require(properties, MEMBER_TABLES).split(",");
        for (int i = 0; i < memberTables.length; i++) {
            memberTables[i] = memberTables[i].trim();
        }
        List<Expansion> expansions = parseExpansions(properties);
        String outputFile = properties.getOptionalProperty(OUTPUT_FILE).orElse(null);
        return new RdbmsInputProperties(jdbcUrl, username, password, schema, memberTables, expansions, outputFile);
    }

    private static String require(ComponentProperties properties, String key) {
        return properties.getOptionalProperty(key)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Ldio:RdbmsInput requires config property '" + key + "' (no defaults are assumed)"));
    }

    private static List<Expansion> parseExpansions(ComponentProperties properties) {
        List<Expansion> expansions = new ArrayList<>();
        for (int i = 0; ; i++) {
            String prefix = EXPANSION + "." + i;
            String memberTable = properties.getOptionalProperty(prefix + ".member-table").orElse(null);
            if (memberTable == null) {
                break;
            }
            String subtables = properties.getOptionalProperty(prefix + ".subtables").orElse("");
            String relations = properties.getOptionalProperty(prefix + ".relations").orElse(null);
            List<String[]> subtableDefs = new ArrayList<>();
            for (String line : subtables.split("\n")) {
                String t = line.trim();
                if (t.isEmpty()) continue;
                int sep = t.indexOf('|');
                if (sep < 0) {
                    throw new IllegalArgumentException(
                            "Ldio:RdbmsInput expansion.subtables line must be '<table>|<scope>': " + t);
                }
                subtableDefs.add(new String[]{t.substring(0, sep).trim(), t.substring(sep + 1).trim()});
            }
            expansions.add(new Expansion(memberTable.trim(), subtableDefs, relations));
        }
        return expansions;
    }

    public static final class Expansion {
        private final String memberTable;
        private final List<String[]> subtables; // [table, scopeSql]
        private final String relationsSql;

        Expansion(String memberTable, List<String[]> subtables, String relationsSql) {
            this.memberTable = memberTable;
            this.subtables = subtables;
            this.relationsSql = relationsSql;
        }

        public String getMemberTable() {
            return memberTable;
        }

        public List<String[]> getSubtables() {
            return subtables;
        }

        public String getRelationsSql() {
            return relationsSql;
        }
    }

    /** Test-harness factory: explicit values, no component-properties parsing. */
    public static RdbmsInputProperties fromPropertiesForTest(String jdbcUrl, String username,
                                                             String password, String schema,
                                                             String[] memberTables) {
        return new RdbmsInputProperties(jdbcUrl, username, password, schema, memberTables, List.of(), null);
    }

    public String getJdbcUrl() {
        return jdbcUrl;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getSchema() {
        return schema;
    }

    public String[] getMemberTables() {
        return memberTables;
    }

    public List<Expansion> getExpansions() {
        return expansions;
    }

    public String getOutputFile() {
        return outputFile;
    }
}
