package be.vlaanderen.omgeving.riepr.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;


/**
 *
 */
@Configuration
public class JsonldConfiguration {

    @Value("classpath:be/vlaanderen/omgeving/riepr/data/id/jsonld/context.json")
    private Resource contextFile;

    @Value("classpath:be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json")
    private Resource jsonldFrame;

    @Bean
    public JsonNode getJsonLDContext() {
        try (InputStream inputStream = contextFile.getInputStream()) {
            return new ObjectMapper().readTree(inputStream);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load JSON-LD context from " + contextFile.getFilename(), e);
        }
    }

    @Bean
    public Map getJsonLDFrame() throws IOException {
        JsonNode context = getJsonLDContext();
        ObjectMapper mapper = new ObjectMapper();
        String frameStr = new String(jsonldFrame.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        ObjectNode frame = (ObjectNode) mapper.readTree(frameStr);
        frame.set("@context", context);
        return mapper.convertValue(frame, Map.class);
    }



}
