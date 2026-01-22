package be.vlaanderen.omgeving.riepr.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.parquet.hadoop.ParquetWriter;
import org.apache.parquet.hadoop.metadata.CompressionCodecName;
import org.apache.parquet.schema.MessageType;
import org.apache.parquet.schema.MessageTypeParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class JsonToParquetService {

    @Value("${data.output.jsonld}")
    private String jsonLdInputPath;

    @Value("${data.output.json}")
    private String jsonOutputPath;

    @Value("${data.output.parquet}")
    private String parquetOutputPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void convertJsonLdToJsonAndParquet() throws Exception {
        File jsonLdDir = new File(jsonLdInputPath);
        File jsonDir = new File(jsonOutputPath);
        File parquetDir = new File(parquetOutputPath);
        
        // Ensure output directories exist
        if (!jsonDir.exists()) {
            jsonDir.mkdirs();
        }
        if (!parquetDir.exists()) {
            parquetDir.mkdirs();
        }
        
        // Process all JSON-LD files
        processDirectory(jsonLdDir, jsonDir, parquetDir);
        
        // Create combined parquet file
        createCombinedParquetFile();
    }

    private void processDirectory(File sourceDir, File jsonTargetDir, File parquetTargetDir) throws Exception {
        if (!sourceDir.exists() || !sourceDir.isDirectory()) {
            return;
        }
        
        File[] files = sourceDir.listFiles();
        if (files == null) {
            return;
        }
        
        for (File file : files) {
            if (file.isDirectory()) {
                File newJsonTargetDir = new File(jsonTargetDir, file.getName());
                File newParquetTargetDir = new File(parquetTargetDir, file.getName());
                if (!newJsonTargetDir.exists()) {
                    newJsonTargetDir.mkdirs();
                }
                if (!newParquetTargetDir.exists()) {
                    newParquetTargetDir.mkdirs();
                }
                processDirectory(file, newJsonTargetDir, newParquetTargetDir);
            } else if (file.getName().endsWith(".jsonld")) {
                convertJsonLdFile(file, jsonTargetDir, parquetTargetDir);
            }
        }
    }

    private void convertJsonLdFile(File jsonLdFile, File jsonTargetDir, File parquetTargetDir) throws Exception {
        System.out.println("Processing JSON-LD file: " + jsonLdFile.getAbsolutePath());
        
        // Read JSON-LD file
        JsonNode jsonLdNode = objectMapper.readTree(jsonLdFile);
        
        // Extract @graph array
        JsonNode graphNode = jsonLdNode.get("@graph");
        if (graphNode == null || !graphNode.isArray()) {
            System.out.println("No @graph array found in JSON-LD file: " + jsonLdFile.getName());
            return;
        }
        
        // Create JSON output file
        String jsonFileName = jsonLdFile.getName().replace(".jsonld", ".json");
        File jsonOutputFile = new File(jsonTargetDir, jsonFileName);
        
        // Write JSON array to file
        objectMapper.writeValue(jsonOutputFile, graphNode);
        System.out.println("Written JSON array to: " + jsonOutputFile.getAbsolutePath());
        
        // Convert JSON to Parquet
        String parquetFileName = jsonLdFile.getName().replace(".jsonld", ".parquet");
        File parquetOutputFile = new File(parquetTargetDir, parquetFileName);
        
        convertJsonToParquet(graphNode, parquetOutputFile);
        System.out.println("Written Parquet file to: " + parquetOutputFile.getAbsolutePath());
    }

    private void convertJsonToParquet(JsonNode jsonArray, File parquetFile) throws Exception {
        // In a real implementation, you would use a Parquet library to convert JSON to Parquet
        // This is a placeholder for the actual implementation
        
        // For now, we'll create a simple Parquet file with basic schema inference
        // You'll need to add proper Parquet dependencies and implement this properly
        
        // Example using Apache Parquet (you'll need to add the dependency):
        // MessageType schema = inferSchemaFromJson(jsonArray);
        // try (ParquetWriter<Group> writer = new ParquetWriter<>(...)) {
        //     writer.write(...);
        // }
        
        // For now, just create an empty file as placeholder
        // Delete existing file if it exists to avoid FileAlreadyExistsException
        if (parquetFile.exists()) {
            Files.delete(parquetFile.toPath());
        }
        Files.createFile(parquetFile.toPath());
        
        System.out.println("Parquet conversion placeholder - implement proper Parquet writing");
    }

    private void createCombinedParquetFile() throws Exception {
        System.out.println("Creating combined Parquet file...");
        
        // Find all JSON files
        File[] jsonFiles = findAllJsonFiles(new File(jsonOutputPath));
        
        // Combine all JSON arrays into one
        List<JsonNode> allRecords = new ArrayList<>();
        for (File jsonFile : jsonFiles) {
            JsonNode jsonArray = objectMapper.readTree(jsonFile);
            if (jsonArray.isArray()) {
                for (JsonNode record : jsonArray) {
                    allRecords.add(record);
                }
            }
        }
        
        // Create combined Parquet file
        File combinedParquetDir = new File(parquetOutputPath, "be/vlaanderen/omgeving/riepr/data/id");
        if (!combinedParquetDir.exists()) {
            combinedParquetDir.mkdirs();
        }
        
        File combinedParquetFile = new File(combinedParquetDir, "combined.parquet");
        
        // Convert combined JSON to Parquet
        JsonNode combinedJsonArray = objectMapper.valueToTree(allRecords);
        convertJsonToParquet(combinedJsonArray, combinedParquetFile);
        
        System.out.println("Written combined Parquet file to: " + combinedParquetFile.getAbsolutePath());
    }

    private File[] findAllJsonFiles(File baseDir) {
        return findFilesRecursively(baseDir, ".json");
    }

    private File[] findFilesRecursively(File dir, String extension) {
        if (!dir.exists() || !dir.isDirectory()) {
            return new File[0];
        }
        
        List<File> result = new ArrayList<>();
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    result.addAll(List.of(findFilesRecursively(file, extension)));
                } else if (file.getName().endsWith(extension)) {
                    result.add(file);
                }
            }
        }
        
        return result.toArray(new File[0]);
    }
}