package be.vlaanderen.omgeving.riepr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Map;

@Service
public class JsonLdConversionService {

    @Value("classpath:be/vlaanderen/omgeving/riepr/data/id/jsonld/context.json")
    private Resource contextFile;

    @Value("classpath:individual/turtle_inferred")
    private Resource turtleInferredPath;

    @Value("classpath:individual/jsonld")
    private Resource jsonLdOutputPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void convertTurtleToJsonLd() throws Exception {
        File inferredDir = turtleInferredPath.getFile();
        File jsonLdDir = jsonLdOutputPath.getFile();
        
        // Ensure JSON-LD output directory exists
        if (!jsonLdDir.exists()) {
            jsonLdDir.mkdirs();
        }
        
        // Load context
        Object context = JsonUtils.fromInputStream(contextFile.getInputStream());
        
        // Process all inferred turtle files
        processDirectory(inferredDir, jsonLdDir, context);
    }

    private void processDirectory(File sourceDir, File targetDir, Object context) throws Exception {
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
                processDirectory(file, newTargetDir, context);
            } else if (file.getName().endsWith(".ttl")) {
                convertTurtleFileToJsonLd(file, targetDir, context);
            }
        }
    }

    private void convertTurtleFileToJsonLd(File turtleFile, File targetDir, Object context) throws Exception {
        System.out.println("Converting turtle to JSON-LD: " + turtleFile.getAbsolutePath());
        
        // Load RDF model from turtle file
        Model model = ModelFactory.createDefaultModel();
        RDFDataMgr.read(model, turtleFile.getAbsolutePath(), Lang.TURTLE);
        
        // Convert RDF to JSON-LD
        String jsonLdString = convertRdfToJsonLd(model, context);
        
        // Create output file path
        String jsonLdFileName = turtleFile.getName().replace(".ttl", ".jsonld");
        File outputFile = new File(targetDir, jsonLdFileName);
        
        // Write JSON-LD to file
        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            fos.write(jsonLdString.getBytes());
        }
        
        System.out.println("Written JSON-LD to: " + outputFile.getAbsolutePath());
    }

    private String convertRdfToJsonLd(Model model, Object context) throws Exception {
        // Convert Jena Model to JSON-LD using jsonld-java
        // This is a simplified approach - you might need to adjust based on your specific requirements
        
        // For a more complete implementation, you would use the jsonld-java library
        // to properly frame the RDF data according to your context and frames
        
        // Here's a basic approach using Jena's built-in JSON-LD writer:
        java.io.StringWriter writer = new java.io.StringWriter();
        model.write(writer, "JSON-LD");
        String jsonLdString = writer.toString();
        
        // Parse the JSON-LD string
        Object jsonObject = JsonUtils.fromString(jsonLdString);
        
        // Apply context and framing
        JsonLdOptions options = new JsonLdOptions();
        Object framed = JsonLdProcessor.frame(jsonObject, getFrameForModel(model), options);
        Object compacted = JsonLdProcessor.compact(framed, context, options);
        
        return JsonUtils.toPrettyString(compacted);
    }

    private Object getFrameForModel(Model model) {
        // In a real implementation, you would determine the appropriate frame
        // based on the content of the model or use a default frame
        // For now, return a simple frame
        return Map.of(
            "@context", contextFile.getFilename(),
            "@type", "@id"
        );
    }

    public void convertTurtleToJsonLdWithFrame(File turtleFile, File frameFile, File outputFile) throws Exception {
        // Load RDF model
        Model model = ModelFactory.createDefaultModel();
        RDFDataMgr.read(model, turtleFile.getAbsolutePath(), Lang.TURTLE);
        
        // Load context
        Object context = JsonUtils.fromInputStream(contextFile.getInputStream());
        
        // Load frame
        Object frame = JsonUtils.fromInputStream(Files.newInputStream(frameFile.toPath()));
        
        // Convert to JSON-LD with framing
        java.io.StringWriter writer = new java.io.StringWriter();
        model.write(writer, "JSON-LD");
        String jsonLdString = writer.toString();
        Object jsonObject = JsonUtils.fromString(jsonLdString);
        JsonLdOptions options = new JsonLdOptions();
        Object framed = JsonLdProcessor.frame(jsonObject, frame, options);
        Object compacted = JsonLdProcessor.compact(framed, context, options);
        
        // Write result
        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            fos.write(JsonUtils.toPrettyString(compacted).getBytes());
        }
    }
}