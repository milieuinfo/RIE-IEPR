package be.vlaanderen.omgeving.riepr.config;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.reasoner.rulesys.Rule;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

/**
 * Configuratie voor het laden van ontologieën en redeneerregels
 */
@Configuration
public class ReasoningModelConfiguration {

    private final ResourcePatternResolver resourceResolver;

    @Value("classpath:be/vlaanderen/data/id/organisatie/domain-range-subproperty.rules")
    private Resource rules;

    public ReasoningModelConfiguration(ResourcePatternResolver resourceResolver) {
        this.resourceResolver = resourceResolver;
    }

    @Bean
    public Model loadTurtleFromClasspath() {
        Model combinedModel = ModelFactory.createDefaultModel();
        
        try {
            // Load ontologies using pattern-based approach like OntologyService
            loadOntologiesFromPattern("classpath:org/**/*.ttl", combinedModel);
            loadOntologiesFromPattern("classpath:eu/**/*.ttl", combinedModel);
            loadOntologiesFromPattern("classpath:net/opengis/**/*.ttl", combinedModel);
            
            System.out.println("Successfully loaded ontologies for reasoning");
        } catch (Exception e) {
            System.err.println("Error loading ontologies for reasoning: " + e.getMessage());
            throw new RuntimeException("Failed to load ontologies for reasoning", e);
        }
        
        return combinedModel;
    }

    private void loadOntologiesFromPattern(String pattern, Model combinedModel) throws IOException {
        Resource[] resources = resourceResolver.getResources(pattern);
        for (Resource resource : resources) {
            try (InputStream inputStream = resource.getInputStream()) {
                Model model = ModelFactory.createDefaultModel();
                RDFDataMgr.read(model, inputStream, Lang.TURTLE);
                combinedModel.add(model);
                System.out.println("Loaded ontology for reasoning: " + resource.getDescription());
            }
        }
    }

    @Bean
    public List<Rule> getRules() {
        try {
            // Try the original path first
            InputStream ruleStream = rules.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(ruleStream));
            return Rule.parseRules(Rule.rulesParserFromReader(reader));
        } catch (IOException e) {
            // Fallback: try alternative path patterns
            try {
                Resource[] ruleResources = resourceResolver.getResources("classpath:be/vlaanderen/**/domain-range-subproperty.rules");
                if (ruleResources.length > 0) {
                    InputStream ruleStream = ruleResources[0].getInputStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(ruleStream));
                    return Rule.parseRules(Rule.rulesParserFromReader(reader));
                }
            } catch (IOException ex) {
                // No rules found
            }
            throw new RuntimeException("Failed to construct rules: " + e.getMessage(), e);
        }
    }


}
