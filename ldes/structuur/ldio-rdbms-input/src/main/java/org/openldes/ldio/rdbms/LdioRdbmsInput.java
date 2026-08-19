package org.openldes.ldio.rdbms;

import org.apache.jena.rdf.model.Model;
import org.openldes.ldi.services.ComponentExecutor;
import org.openldes.ldi.types.LdiAdapter;
import org.openldes.ldio.pipeline.creation.LdioInput;
import org.openldes.ldio.pipeline.creation.LdioObserver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;

import java.util.concurrent.CompletableFuture;

/**
 * LDIO input component ({@code Ldio:RdbmsInput}) that reads the mjv database
 * and publishes the generated RDF as LDES members, replacing db2turtle + HttpIn.
 *
 * The comment-driven mapping logic (table comments -> rdf:type, column comments
 * -> properties, FK constraints -> IRI objects, CONSTRAINT comments -> junction
 * predicates) is implemented in {@link RdbmsToRdfGenerator}.
 */
public class LdioRdbmsInput extends LdioInput {

    private static final Logger LOG = LoggerFactory.getLogger(LdioRdbmsInput.class);

    private final RdbmsInputProperties properties;
    private volatile boolean running = true;
    private CompletableFuture<?> generation;

    public LdioRdbmsInput(ComponentExecutor executor, LdiAdapter adapter,
                          LdioObserver observer, ApplicationEventPublisher eventPublisher,
                          RdbmsInputProperties properties) {
        super(executor, adapter, observer, eventPublisher);
        this.properties = properties;
    }

    @Override
    public void start() {
        super.start();
        resume();
    }

    @Override
    protected synchronized void resume() {
        if (running && (generation == null || generation.isDone())) {
            generation = CompletableFuture.runAsync(this::generateAndSend);
        }
    }

    @Override
    protected synchronized void pause() {
        // no-op: generation completes in flight
    }

    @Override
    public void shutdown() {
        running = false;
    }

    private void generateAndSend() {
        try {
            RdbmsToRdfGenerator generator = new RdbmsToRdfGenerator(
                    properties.getJdbcUrl(), properties.getUsername(), properties.getPassword(),
                    properties.getSchema(), properties.getMemberTables(), properties.getExpansions());
            for (String stream : properties.getMemberTables()) {
                Model model = generator.generateStream(stream);
                if (model != null && model.size() > 0) {
                    LOG.info("publishing {} triples for {}", model.size(), stream);
                    if (properties.getOutputFile() != null) {
                        try (java.io.FileOutputStream out = new java.io.FileOutputStream(properties.getOutputFile())) {
                            org.apache.jena.riot.RDFDataMgr.write(out, model,
                                    org.apache.jena.riot.RDFFormat.TURTLE);
                            LOG.info("wrote generated turtle to {}", properties.getOutputFile());
                        } catch (java.io.IOException e) {
                            LOG.warn("could not write output file {}", properties.getOutputFile(), e);
                        }
                    }
                    processModel(model);
                }
            }
        } catch (Exception e) {
            LOG.error("Ldio:RdbmsInput generation failed", e);
        }
    }
}
