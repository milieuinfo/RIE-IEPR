package be.vlaanderen.omgeving.riepr.runner;

import be.vlaanderen.omgeving.riepr.service.JsonLdConversionService;
import be.vlaanderen.omgeving.riepr.service.JsonToParquetService;
import be.vlaanderen.omgeving.riepr.service.OntologyService;
import be.vlaanderen.omgeving.riepr.service.TurtleProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataConversionRunner implements CommandLineRunner {

    @Autowired
    private OntologyService ontologyService;

    @Autowired
    private TurtleProcessingService turtleProcessingService;

    @Autowired
    private JsonLdConversionService jsonLdConversionService;

    @Autowired
    private JsonToParquetService jsonToParquetService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Starting RIE-IEPR data conversion workflow...");
        
        // Print loaded ontologies
        System.out.println("Loaded ontologies:");
        ontologyService.getLoadedOntologyFiles().forEach(System.out::println);
        
        // Check if we should run the full workflow automatically
        boolean runAutomatically = shouldRunAutomatically(args);
        
        if (runAutomatically) {
            boolean runFullWorkflow = false;
            boolean runTurtleProcessing = false;
            boolean runJsonLdConversion = false;
            boolean runParquetConversion = false;
            
            for (String arg : args) {
                if (arg.equals("--run-full-workflow")) {
                    runFullWorkflow = true;
                } else if (arg.equals("--run-turtle-processing")) {
                    runTurtleProcessing = true;
                } else if (arg.equals("--run-jsonld-conversion")) {
                    runJsonLdConversion = true;
                } else if (arg.equals("--run-parquet-conversion")) {
                    runParquetConversion = true;
                }
            }
            
            if (runFullWorkflow) {
                System.out.println("Running full workflow...");
                runFullWorkflow();
            } else if (runTurtleProcessing) {
                System.out.println("Running turtle processing...");
                runTurtleProcessing();
            } else if (runJsonLdConversion) {
                System.out.println("Running JSON-LD conversion...");
                runJsonLdConversion();
            } else if (runParquetConversion) {
                System.out.println("Running Parquet conversion...");
                runParquetConversion();
            }
        } else {
            System.out.println("Skipping automatic workflow execution. Use API endpoints or command line arguments to run.");
            System.out.println("Available commands:");
            System.out.println("  --run-full-workflow: Run the complete conversion workflow");
            System.out.println("  --run-turtle-processing: Run only turtle processing with reasoning");
            System.out.println("  --run-jsonld-conversion: Run only JSON-LD conversion");
            System.out.println("  --run-parquet-conversion: Run only Parquet conversion");
        }
    }

    private boolean shouldRunAutomatically(String... args) {
        if (args == null || args.length == 0) {
            return false;
        }
        
        for (String arg : args) {
            if (arg.equals("--run-full-workflow") || 
                arg.equals("--run-turtle-processing") || 
                arg.equals("--run-jsonld-conversion") || 
                arg.equals("--run-parquet-conversion")) {
                return true;
            }
        }
        
        return false;
    }

    private void runFullWorkflow() throws Exception {
        try {
            // Step 1: Process turtle files with reasoning
            System.out.println("Step 1/3: Processing turtle files with reasoning...");
            turtleProcessingService.processTurtleFiles();
            
            // Step 2: Convert to JSON-LD
            System.out.println("Step 2/3: Converting to JSON-LD...");
            jsonLdConversionService.convertTurtleToJsonLd();
            
            // Step 3: Convert to JSON and Parquet
            System.out.println("Step 3/3: Converting to JSON and Parquet...");
            jsonToParquetService.convertJsonLdToJsonAndParquet();
            
            System.out.println("Full workflow completed successfully!");
            
        } catch (Exception e) {
            System.err.println("Error running workflow: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void runTurtleProcessing() throws Exception {
        System.out.println("Running turtle processing...");
        turtleProcessingService.processTurtleFiles();
        System.out.println("Turtle processing completed!");
    }

    public void runJsonLdConversion() throws Exception {
        System.out.println("Running JSON-LD conversion...");
        jsonLdConversionService.convertTurtleToJsonLd();
        System.out.println("JSON-LD conversion completed!");
    }

    public void runParquetConversion() throws Exception {
        System.out.println("Running Parquet conversion...");
        jsonToParquetService.convertJsonLdToJsonAndParquet();
        System.out.println("Parquet conversion completed!");
    }
}