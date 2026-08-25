package org.openldes.ldio.rdbms;

import io.micrometer.observation.ObservationRegistry;
import org.openldes.ldio.pipeline.creation.LdioInput;
import org.openldes.ldio.pipeline.creation.LdioObserver;
import org.openldes.ldio.pipeline.creation.valueobjects.ComponentProperties;
import org.openldes.ldi.services.ComponentExecutor;
import org.openldes.ldi.types.LdiAdapter;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring configuration that registers the {@code Ldio:RdbmsInput} pipeline input
 * component. The bean name {@code Ldio:RdbmsInput} is the component name used in
 * the pipeline YAML (resolved via {@code getBean(name)}).
 */
@Configuration
public class LdioRdbmsInputAutoConfig {

    @Bean(name = "Ldio:RdbmsInput")
    public RdbmsInputConfigurator ldioRdbmsInputConfigurator(ObservationRegistry observationRegistry) {
        return new RdbmsInputConfigurator(observationRegistry);
    }

    public static class RdbmsInputConfigurator implements org.openldes.ldio.pipeline.creation.LdioInputConfigurator {

        private static final String COMPONENT_NAME = "Ldio:RdbmsInput";
        private final ObservationRegistry observationRegistry;

        public RdbmsInputConfigurator(ObservationRegistry observationRegistry) {
            this.observationRegistry = observationRegistry;
        }

        @Override
        public LdioInput configure(LdiAdapter adapter, ComponentExecutor executor,
                                   ApplicationEventPublisher eventPublisher,
                                   ComponentProperties properties) {
            LdioObserver observer = LdioObserver.register(
                    COMPONENT_NAME, properties.getPipelineName(), observationRegistry);
            RdbmsInputProperties config = RdbmsInputProperties.fromComponentProperties(properties);
            LdioRdbmsInput input = new LdioRdbmsInput(executor, adapter, observer, eventPublisher, config);
            input.start();
            return input;
        }

        @Override
        public boolean isAdapterRequired() {
            return false;
        }
    }
}
