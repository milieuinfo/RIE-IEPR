package be.vlaanderen.omgeving.riepr.service;

import be.vlaanderen.omgeving.riepr.config.JsonldConfiguration;
import be.vlaanderen.omgeving.riepr.config.ReasoningModelConfiguration;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import org.apache.jena.rdf.model.InfModel;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner;
import org.apache.jena.reasoner.rulesys.Rule;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 *
 */
@Service
public class TransformatieService {

    @Autowired
    private JsonldConfiguration jsonldConfiguration;

    @Autowired
    private ReasoningModelConfiguration reasoningModelConfiguration;



    private String getValue(JsonNode node, String... keys) {
        for (String key : keys) {
            if (node.hasNonNull(key) && !Objects.equals(node.get(key).asText(), " ")) {
                return node.get(key).asText();
            }
        }
        return null;
    }







    public String rdfToJsonLd(Model model) {
        StringWriter writer = new StringWriter();
        RDFDataMgr.write(writer, model, Lang.JSONLD);
        return frameJsonLd(writer.toString());
    }

    private String frameJsonLd(String jsonldString) {
        try {
            Object jsonObject = JsonUtils.fromString(jsonldString);
            // Define your frame
            Object frame = jsonldConfiguration.getJsonLDFrame();
            // Frame the JSON-LD
            JsonLdOptions options = new JsonLdOptions();
            Map<String, Object> framed = JsonLdProcessor.frame(jsonObject, frame, options);
            if (framed.containsKey("@graph")) {
                List<?> graph = (List<?>) framed.get("@graph");
                if (graph.size() == 1) {
                    // Promote the node outside of @graph
                    Map<String, Object> singleNode = (Map<String, Object>) graph.get(0);
                    singleNode.put("@context", framed.get("@context"));
                    framed = singleNode;
                }
            }
            return JsonUtils.toPrettyString(framed);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Model parseModelFromJsonLD(String jsonld) {
        Model model = ModelFactory.createDefaultModel();
        try (InputStream is = new ByteArrayInputStream(jsonld.getBytes(StandardCharsets.UTF_8))) {
            RDFParser.source(is).lang(Lang.JSONLD).parse(model);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON-LD to RDF", e);
        }
        return inferTriples(model, reasoningModelConfiguration.loadTurtleFromClasspath(), reasoningModelConfiguration.getRules());
    }

    public Model inferTriples(Model dataModel, Model ontologyModel, List<Rule> rules) {
        // Combine both models
        Model combinedModel = ModelFactory.createUnion(ontologyModel, dataModel);
        Reasoner reasoner = new GenericRuleReasoner(rules);
        reasoner.setDerivationLogging(true);  // optional

        InfModel infModel = ModelFactory.createInfModel(reasoner, combinedModel);
        return infModel.getDeductionsModel().union(dataModel);
    }
}
