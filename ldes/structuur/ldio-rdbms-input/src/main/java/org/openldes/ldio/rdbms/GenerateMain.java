package org.openldes.ldio.rdbms;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;

import java.util.HashMap;
import java.util.Map;

/**
 * Test harness that mimics LDIO's flattened ComponentProperties parsing:
 * nested yaml is flattened to dot-keys (expansion.0.subtables, etc.),
 * block scalars keep their newlines. Reads the pipeline yaml's config block
 * from the environment-variable supplied keys and runs the generator.
 */
public class GenerateMain {

    public static void main(String[] args) throws Exception {
        Map<String, String> flat = new HashMap<>();
        for (String key : new String[]{
                "jdbc-url", "username", "password", "schema", "member-tables", "output-file",
                "expansion.0.member-table", "expansion.0.subtables", "expansion.0.relations"}) {
            String v = System.getenv(key);
            if (v != null) {
                flat.put(key, v);
            }
        }

        FlatComponentProperties props = new FlatComponentProperties(flat);
        RdbmsInputProperties properties = RdbmsInputProperties.fromComponentProperties(props);
        RdbmsToRdfGenerator generator = new RdbmsToRdfGenerator(
                properties.getJdbcUrl(), properties.getUsername(), properties.getPassword(),
                properties.getSchema(), properties.getMemberTables(), properties.getExpansions());
        Model model = ModelFactory.createDefaultModel();
        for (String t : generator.getMemberTables()) {
            Model m = generator.generateStream(t.trim());
            System.err.println("; stream " + t + ": " + m.size() + " triples");
            model.add(m);
        }
        RDFDataMgr.write(System.out, model, RDFFormat.TURTLE);
    }

    /** Minimal ComponentProperties stand-in with a plain map (getOptionalProperty only). */
    static final class FlatComponentProperties extends org.openldes.ldio.pipeline.creation.valueobjects.ComponentProperties {
        private final Map<String, String> flat;

        FlatComponentProperties(Map<String, String> flat) {
            super("test", "Ldio:RdbmsInput");
            this.flat = flat;
        }

        @Override
        public java.util.Optional<String> getOptionalProperty(String key) {
            return java.util.Optional.ofNullable(flat.get(key));
        }
    }
}
