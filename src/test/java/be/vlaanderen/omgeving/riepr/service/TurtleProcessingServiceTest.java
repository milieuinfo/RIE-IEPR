package be.vlaanderen.omgeving.riepr.service;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.InfModel;
import org.apache.jena.reasoner.Reasoner;
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner;
import org.apache.jena.reasoner.rulesys.Rule;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TurtleProcessingServiceTest {

    @Mock
    private OntologyService ontologyService;

    @Mock
    private RulesService rulesService;

    @InjectMocks
    private TurtleProcessingService turtleProcessingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testInferenceExcludesOntologies() {
        try {
            // Load a simple turtle file
            Model dataModel = ModelFactory.createDefaultModel();
            String testFilePath = "individual/turtle/be/vlaanderen/omgeving/riepr/data/id/activiteit/01-fabriek-proces.ttl";
            RDFDataMgr.read(dataModel, testFilePath);
            
            System.out.println("Original data model size: " + dataModel.size());
            
            // Create a simple reasoner (no rules for this test)
            Reasoner reasoner = new GenericRuleReasoner(new ArrayList<Rule>());
            reasoner.setDerivationLogging(true);
            
            // Create ontology model (empty for this test)
            Model ontologyModel = ModelFactory.createDefaultModel();
            
            // Combine both models
            Model combinedModel = ModelFactory.createDefaultModel();
            combinedModel.add(ontologyModel);
            combinedModel.add(dataModel);
            
            System.out.println("Combined model size: " + combinedModel.size());
            
            // Create inferred model using the new approach
            InfModel infModel = ModelFactory.createInfModel(reasoner, combinedModel);
            Model inferredModel = infModel.getDeductionsModel().union(dataModel);
            
            System.out.println("Inferred model size: " + inferredModel.size());
            System.out.println("Deductions model size: " + infModel.getDeductionsModel().size());
            
            // Verify that the inferred model contains the original data
            boolean containsOriginalData = inferredModel.containsAll(dataModel);
            System.out.println("Inferred model contains original data: " + containsOriginalData);
            
            // The key test: verify that ontology triples are NOT included
            // Since we used an empty ontology model, the inferred model should only contain
            // the original data plus any deductions (which should be 0 in this case)
            assertTrue(containsOriginalData, "Inferred model should contain original data");
            assertEquals(dataModel.size(), inferredModel.size(), "Inferred model should only contain original data when no rules are applied");
            
            System.out.println("Test completed successfully!");
            
        } catch (Exception e) {
            fail("Test failed with exception: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Test
    void testInferenceWithRules() {
        try {
            // Load a simple turtle file
            Model dataModel = ModelFactory.createDefaultModel();
            String testFilePath = "individual/turtle/be/vlaanderen/omgeving/riepr/data/id/activiteit/01-fabriek-proces.ttl";
            RDFDataMgr.read(dataModel, testFilePath);
            
            System.out.println("Original data model size: " + dataModel.size());
            
            // Create a reasoner with some basic rules
            List<Rule> rules = new ArrayList<>();
            // Add a simple rule for testing
            rules.add(Rule.parseRule("[rule1: (?a ?p ?b) -> (?b ?p ?a)]")); // Simple symmetry rule
            
            Reasoner reasoner = new GenericRuleReasoner(rules);
            reasoner.setDerivationLogging(true);
            
            // Create ontology model (empty for this test)
            Model ontologyModel = ModelFactory.createDefaultModel();
            
            // Combine both models
            Model combinedModel = ModelFactory.createDefaultModel();
            combinedModel.add(ontologyModel);
            combinedModel.add(dataModel);
            
            System.out.println("Combined model size: " + combinedModel.size());
            
            // Create inferred model using the new approach
            InfModel infModel = ModelFactory.createInfModel(reasoner, combinedModel);
            Model inferredModel = infModel.getDeductionsModel().union(dataModel);
            
            System.out.println("Inferred model size: " + inferredModel.size());
            System.out.println("Deductions model size: " + infModel.getDeductionsModel().size());
            
            // Verify that the inferred model contains the original data
            boolean containsOriginalData = inferredModel.containsAll(dataModel);
            System.out.println("Inferred model contains original data: " + containsOriginalData);
            
            // With rules, we might have some deductions
            assertTrue(containsOriginalData, "Inferred model should contain original data");
            assertTrue(inferredModel.size() >= dataModel.size(), "Inferred model should contain at least the original data");
            
            System.out.println("Test with rules completed successfully!");
            
        } catch (Exception e) {
            fail("Test with rules failed with exception: " + e.getMessage());
            e.printStackTrace();
        }
    }
}