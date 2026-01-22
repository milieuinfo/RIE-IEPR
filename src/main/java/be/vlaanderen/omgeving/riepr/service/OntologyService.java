package be.vlaanderen.omgeving.riepr.service;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class OntologyService {

    private final ResourcePatternResolver resourceResolver;

    private Model combinedOntologyModel;

    public OntologyService(ResourcePatternResolver resourceResolver) {
        this.resourceResolver = resourceResolver;
    }

    @PostConstruct
    public void loadOntologies() {
        combinedOntologyModel = ModelFactory.createDefaultModel();
        
        try {
            // Load ontologies from ns directory
            loadOntologiesFromPattern("classpath:be/vlaanderen/omgeving/riepr/data/ns/**/*.ttl");
            
            // Load ontologies from org directory
            loadOntologiesFromPattern("classpath:org/**/*.ttl");
            
            // Load ontologies from eu directory
            //loadOntologiesFromPattern("classpath:eu/**/*.ttl");
            
            System.out.println("Successfully loaded ontologies");
        } catch (Exception e) {
            System.err.println("Error loading ontologies: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void loadOntologiesFromPattern(String pattern) throws IOException {
        Resource[] resources = resourceResolver.getResources(pattern);
        for (Resource resource : resources) {
            try (InputStream inputStream = resource.getInputStream()) {
                Model model = ModelFactory.createDefaultModel();
                RDFDataMgr.read(model, inputStream, Lang.TURTLE);
                combinedOntologyModel.add(model);
                System.out.println("Loaded ontology: " + resource.getDescription());
            }
        }
    }

    public Model getCombinedOntologyModel() {
        return combinedOntologyModel;
    }

    public List<String> getLoadedOntologyFiles() {
        List<String> ontologyFiles = new ArrayList<>();
        
        try {
            // Add files from ns directory
            addOntologyFilesFromPattern("classpath:be/vlaanderen/omgeving/riepr/data/ns/**/*.ttl", ontologyFiles);
            
            // Add files from org directory
            addOntologyFilesFromPattern("classpath:org/**/*.ttl", ontologyFiles);
            
            // Add files from eu directory
            //addOntologyFilesFromPattern("classpath:eu/**/*.ttl", ontologyFiles);
        } catch (IOException e) {
            System.err.println("Error getting ontology files: " + e.getMessage());
        }
        
        return ontologyFiles;
    }

    private void addOntologyFilesFromPattern(String pattern, List<String> ontologyFiles) throws IOException {
        Resource[] resources = resourceResolver.getResources(pattern);
        for (Resource resource : resources) {
            ontologyFiles.add(resource.getDescription());
        }
    }
}