package be.vlaanderen.omgeving.riepr.controller;

import be.vlaanderen.omgeving.riepr.service.JsonLdConversionService;
import be.vlaanderen.omgeving.riepr.service.JsonToParquetService;
import be.vlaanderen.omgeving.riepr.service.OntologyService;
import be.vlaanderen.omgeving.riepr.service.TurtleProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/conversion")
public class DataConversionController {

    @Autowired
    private OntologyService ontologyService;

    @Autowired
    private TurtleProcessingService turtleProcessingService;

    @Autowired
    private JsonLdConversionService jsonLdConversionService;

    @Autowired
    private JsonToParquetService jsonToParquetService;

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "ready");
        status.put("ontologies_loaded", ontologyService.getLoadedOntologyFiles());
        return status;
    }

    @GetMapping("/run-full-workflow")
    public Map<String, Object> runFullWorkflow() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            result.put("status", "starting");
            
            // Step 1: Process turtle files with reasoning
            result.put("step", "processing_turtle_files");
            turtleProcessingService.processTurtleFiles();
            
            // Step 2: Convert to JSON-LD
            result.put("step", "converting_to_jsonld");
            jsonLdConversionService.convertTurtleToJsonLd();
            
            // Step 3: Convert to JSON and Parquet
            result.put("step", "converting_to_json_parquet");
            jsonToParquetService.convertJsonLdToJsonAndParquet();
            
            result.put("status", "completed");
            result.put("message", "Full workflow completed successfully");
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
            result.put("step", "failed");
            e.printStackTrace();
        }
        
        return result;
    }

    @GetMapping("/run-turtle-processing")
    public Map<String, Object> runTurtleProcessing() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            turtleProcessingService.processTurtleFiles();
            result.put("status", "completed");
            result.put("message", "Turtle processing completed successfully");
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }

    @GetMapping("/run-jsonld-conversion")
    public Map<String, Object> runJsonLdConversion() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            jsonLdConversionService.convertTurtleToJsonLd();
            result.put("status", "completed");
            result.put("message", "JSON-LD conversion completed successfully");
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }

    @GetMapping("/run-parquet-conversion")
    public Map<String, Object> runParquetConversion() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            jsonToParquetService.convertJsonLdToJsonAndParquet();
            result.put("status", "completed");
            result.put("message", "Parquet conversion completed successfully");
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }
}