package be.vlaanderen.omgeving.riepr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.functions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class JsonToParquetService {

    @Value("${data.output.jsonld}")
    private String jsonLdInputPath;

    @Value("${data.output.json}")
    private String jsonOutputPath;

    @Value("${data.output.parquet}")
    private String parquetOutputPath;

    /**
     * Backward-compatible entrypoint voor controllers & runners.
     * Dit vervangt de oude Arrow-implementatie.
     */

    public void convertJsonLdToJsonAndParquet() throws IOException {
        File inputJson = new File(jsonLdInputPath);
        File outputJson = new File(jsonOutputPath);
        File outputParquet = new File(parquetOutputPath);

        // Zorg ervoor dat de output directories bestaan
        if (!outputJson.exists()) {
            outputJson.mkdirs();
        }
        if (!outputParquet.exists()) {
            outputParquet.mkdirs();
        }

        convertJsonLdToJsonAndParquet(inputJson, outputJson, outputParquet);
    }

    /**
     * Nieuwe implementatie die JSON-LD naar JSON converteert met Jackson
     */
    public void convertJsonLdToJson(File jsonLdInput, File jsonOutput) throws IOException {
        processJsonLdToJsonDirectory(jsonLdInput, jsonOutput);
    }

    /**
     * Nieuwe implementatie die JSON naar Parquet converteert met Spark
     */
    public void convertJsonToParquet(File jsonInput, File parquetOutputDir) throws IOException {
        processJsonToParquetDirectory(jsonInput, parquetOutputDir);
    }

    /**
     * Gecombineerde methode voor backward compatibility
     */
    public void convertJsonLdToJsonAndParquet(File jsonLdInput, File jsonOutput, File parquetOutputDir) throws IOException {
        // Eerst JSON-LD naar JSON converteren
        convertJsonLdToJson(jsonLdInput, jsonOutput);
        
        // Dan JSON naar Parquet converteren
        convertJsonToParquet(jsonOutput, parquetOutputDir);
    }

    private void processJsonLdToJsonDirectory(File sourceDir, File jsonOutputRoot) throws IOException {
        if (!sourceDir.exists() || !sourceDir.isDirectory()) {
            return;
        }
        
        File[] files = sourceDir.listFiles();
        if (files == null) {
            return;
        }
        
        for (File file : files) {
            if (file.isDirectory()) {
                // Create corresponding target directories
                String relativePath = getRelativePath(file, new File(jsonLdInputPath));
                File jsonTargetSubDir = new File(jsonOutputRoot, relativePath);
                
                if (!jsonTargetSubDir.exists()) {
                    jsonTargetSubDir.mkdirs();
                }
                
                processJsonLdToJsonDirectory(file, jsonOutputRoot);
            } else if (file.getName().endsWith(".jsonld") || file.getName().endsWith(".json")) {
                processJsonLdToJsonFile(file, jsonOutputRoot);
            }
        }
    }

    private void processJsonToParquetDirectory(File sourceDir, File parquetOutputRoot) throws IOException {
        if (!sourceDir.exists() || !sourceDir.isDirectory()) {
            return;
        }
        
        File[] files = sourceDir.listFiles();
        if (files == null) {
            return;
        }
        
        for (File file : files) {
            if (file.isDirectory()) {
                // Create corresponding target directories
                String relativePath = getRelativePath(file, new File(jsonOutputPath));
                File parquetTargetSubDir = new File(parquetOutputRoot, relativePath);
                
                if (!parquetTargetSubDir.exists()) {
                    parquetTargetSubDir.mkdirs();
                }
                
                processJsonToParquetDirectory(file, parquetOutputRoot);
            } else if (file.getName().endsWith(".json")) {
                processJsonToParquetFile(file, parquetOutputRoot);
            }
        }
    }

    private void processJsonLdToJsonFile(File jsonLdFile, File jsonOutputRoot) throws IOException {
        System.out.println("Processing JSON-LD file: " + jsonLdFile.getAbsolutePath());
        
        // First, check if this is a context-only JSON-LD file
        try {
            String content = new String(Files.readAllBytes(jsonLdFile.toPath()));
            String trimmedContent = content.trim();
            
            // Check if the file is just a @context object with no actual data
            if (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) {
                // Remove the outer braces to check the content structure
                String innerContent = trimmedContent.substring(1, trimmedContent.length() - 1).trim();
                
                // If the file only contains @context (possibly with some whitespace/formatting)
                // and no other top-level properties like @id, @graph, etc.
                if (innerContent.startsWith("\"@context\" : ") || 
                    innerContent.startsWith("\"@context\":")) {
                    
                    // Find the @context section and check if there's any other content
                    int contextStart = innerContent.indexOf("\"@context\"");
                    if (contextStart >= 0) {
                        // Find the matching closing brace for the @context object
                        int braceCount = 0;
                        int i = contextStart;
                        boolean inContext = false;
                        
                        while (i < innerContent.length()) {
                            if (innerContent.charAt(i) == '{') {
                                braceCount++;
                                inContext = true;
                            } else if (innerContent.charAt(i) == '}') {
                                braceCount--;
                                if (braceCount == 0 && inContext) {
                                    break;
                                }
                            }
                            i++;
                        }
                        
                        String beforeContext = innerContent.substring(0, contextStart).trim();
                        String afterContext = innerContent.substring(i + 1).trim();
                        
                        // If there's no content before or after @context, it's a context-only file
                        if (beforeContext.isEmpty() && afterContext.isEmpty()) {
                            System.out.println("Skipping context-only JSON-LD file: " + jsonLdFile.getAbsolutePath());
                            return;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Warning: Could not pre-check file content: " + e.getMessage());
        }
        
        // Use Jackson to process JSON-LD and convert to clean JSON
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(jsonLdFile);
        
        // Create output file path
        String relativePath = getRelativePath(jsonLdFile, new File(jsonLdInputPath));
        String jsonOutputPathStr = relativePath.replaceFirst("\\.jsonld$", ".json").replaceFirst("\\.json$", ".json");
        File jsonOutputFile = new File(jsonOutputRoot, jsonOutputPathStr);
        
        // Ensure parent directory exists
        jsonOutputFile.getParentFile().mkdirs();
        
        // Process @graph arrays if present
        if (rootNode.has("@graph") && rootNode.get("@graph").isArray()) {
            ArrayNode graphArray = (ArrayNode) rootNode.get("@graph");
            
            // Write each object in the @graph array as a separate JSON object
            try (FileOutputStream fos = new FileOutputStream(jsonOutputFile)) {
                for (int i = 0; i < graphArray.size(); i++) {
                    JsonNode graphObject = graphArray.get(i);
                    
                    // Remove @context from individual objects if present
                    if (graphObject.has("@context")) {
                        ((ObjectNode) graphObject).remove("@context");
                    }
                    
                    // Write JSON object
                    String jsonString = objectMapper.writeValueAsString(graphObject);
                    fos.write(jsonString.getBytes());
                    fos.write("\n".getBytes());
                }
            }
            
            System.out.println("Extracted " + graphArray.size() + " records from @graph array");
        } else {
            // For non-@graph files, just remove @context and write as single JSON object
            if (rootNode.has("@context")) {
                ((ObjectNode) rootNode).remove("@context");
            }
            
            try (FileOutputStream fos = new FileOutputStream(jsonOutputFile)) {
                String jsonString = objectMapper.writeValueAsString(rootNode);
                fos.write(jsonString.getBytes());
            }
        }
        
        System.out.println("Written JSON to: " + jsonOutputFile.getAbsolutePath());
    }

    private void processJsonToParquetFile(File jsonFile, File parquetOutputRoot) throws IOException {
        System.out.println("Processing JSON file for Parquet conversion: " + jsonFile.getAbsolutePath());
        
        SparkSession spark = SparkSession.builder()
                .appName("riepr-json-to-parquet")
                .master("local[*]")
                .config("spark.ui.enabled", "false")
                .getOrCreate();

        try {
            // Lees individueel JSON bestand
            Dataset<Row> dataset = spark.read()
                    .option("multiLine", true)
                    .option("samplingRatio", 1.0)
                    .option("inferSchema", true)
                    .option("allowComments", true)
                    .option("allowUnquotedFieldNames", true)
                    .option("allowSingleQuotes", true)
                    .json(jsonFile.getAbsolutePath());

            // Controleer of de dataset leeg is
            if (dataset.columns().length == 0) {
                System.out.println("Skipping empty dataset (no columns): " + jsonFile.getAbsolutePath());
                return;
            }

            // Controleer of de dataset rijen heeft
            try {
                if (dataset.count() == 0) {
                    System.out.println("Skipping empty dataset (no rows): " + jsonFile.getAbsolutePath());
                    return;
                }
            } catch (Exception e) {
                System.out.println("Skipping problematic dataset: " + jsonFile.getAbsolutePath() + " - " + e.getMessage());
                return;
            }

            // Create output file path
            String relativePath = getRelativePath(jsonFile, new File(jsonOutputPath));
            String parquetOutputPathStr = relativePath.replaceFirst("\\.json$", "");
            File parquetOutputFile = new File(parquetOutputRoot, parquetOutputPathStr);
            
            // Ensure parent directory exists
            parquetOutputFile.getParentFile().mkdirs();

            // Schrijf Parquet bestand
            dataset.write()
                    .mode(SaveMode.Overwrite)
                    .parquet(parquetOutputFile.getAbsolutePath());

            System.out.println("Written Parquet to: " + parquetOutputFile.getAbsolutePath());

        } finally {
            spark.stop();
        }
    }

    private String getRelativePath(File file, File baseDir) {
        Path filePath = file.toPath();
        Path basePath = baseDir.toPath();
        return basePath.relativize(filePath).toString();
    }


}
