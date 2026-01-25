package be.vlaanderen.omgeving.riepr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;

@Service
public class JsonLdConversionService {

    @Autowired
    private TransformatieService transformatieService;

    @Value("${data.output.turtle-inferred}")
    private String turtleInferredPath;

    @Value("${data.output.jsonld}")
    private String jsonLdOutputPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void convertTurtleToJsonLd() throws Exception {
        File inferredDir = new File(turtleInferredPath);
        File jsonLdDir = new File(jsonLdOutputPath);
        
        // Ensure JSON-LD output directory exists
        if (!jsonLdDir.exists()) {
            jsonLdDir.mkdirs();
        }
        
        // Process all inferred turtle files using TransformatieService
        processDirectory(inferredDir, jsonLdDir);
    }

    private void processDirectory(File sourceDir, File targetDir) throws Exception {
        if (!sourceDir.exists() || !sourceDir.isDirectory()) {
            return;
        }
        
        File[] files = sourceDir.listFiles();
        if (files == null) {
            return;
        }
        
        for (File file : files) {
            if (file.isDirectory()) {
                File newTargetDir = new File(targetDir, file.getName());
                if (!newTargetDir.exists()) {
                    newTargetDir.mkdirs();
                }
                processDirectory(file, newTargetDir);
            } else if (file.getName().endsWith(".ttl")) {
                convertTurtleFileToJsonLd(file, targetDir);
            }
        }
    }

    private void convertTurtleFileToJsonLd(File turtleFile, File targetDir) throws Exception {
        System.out.println("Converting turtle to JSON-LD: " + turtleFile.getAbsolutePath());
        
        // Load RDF model from turtle file
        Model model = ModelFactory.createDefaultModel();
        RDFDataMgr.read(model, turtleFile.getAbsolutePath(), Lang.TURTLE);
        
        // Convert RDF to JSON-LD using TransformatieService
        String jsonLdString = convertRdfToJsonLd(model);
        
        // Create output file path
        String jsonLdFileName = turtleFile.getName().replace(".ttl", ".jsonld");
        File outputFile = new File(targetDir, jsonLdFileName);
        
        // Write JSON-LD to file
        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            fos.write(jsonLdString.getBytes());
        }
        
        System.out.println("Written JSON-LD to: " + outputFile.getAbsolutePath());
    }

    private String convertRdfToJsonLd(Model model) throws Exception {
        // Use TransformatieService for consistent JSON-LD conversion with framing
        return transformatieService.rdfToJsonLd(model);
    }



    public void convertTurtleToJsonLdWithFrame(File turtleFile, File frameFile, File outputFile) throws Exception {
        // Load RDF model
        Model model = ModelFactory.createDefaultModel();
        RDFDataMgr.read(model, turtleFile.getAbsolutePath(), Lang.TURTLE);
        
        // Convert to JSON-LD using TransformatieService (which handles framing automatically)
        String jsonLdString = transformatieService.rdfToJsonLd(model);
        
        // Write result
        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            fos.write(jsonLdString.getBytes());
        }
    }
}