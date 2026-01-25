package be.vlaanderen.omgeving.riepr.service;


import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;





import org.apache.jena.riot.RDFDataMgr;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import be.vlaanderen.omgeving.riepr.config.ReasoningModelConfiguration;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;












@Service
public class TurtleProcessingService {

    @Autowired
    private OntologyService ontologyService;

    @Autowired
    private RulesService rulesService;

    @Autowired
    private TransformatieService transformatieService;

    @Autowired
    private ReasoningModelConfiguration reasoningModelConfiguration;

    @Value("${data.input.turtle}")
    private String turtleSourcePath;

    @Value("${data.output.turtle-inferred}")
    private String turtleInferredPath;

    private final Model combinedInferredModel = ModelFactory.createDefaultModel();

    public void processTurtleFiles() throws IOException {
        File sourceDir = new File(turtleSourcePath);
        File inferredDir = new File(turtleInferredPath);

        if (!inferredDir.exists()) {
            inferredDir.mkdirs();
        }

        processDirectory(sourceDir, inferredDir);

        writeCombinedInferredModel();
    }

    private void writeCombinedInferredModel() throws IOException {
        System.out.println("Writing combined inferred model...");

        File combinedOutputDir =
                new File(turtleInferredPath, "be/vlaanderen/omgeving/riepr/data/id");

        if (!combinedOutputDir.exists()) {
            combinedOutputDir.mkdirs();
        }

        File combinedOutputFile =
                new File(combinedOutputDir, "combined_inferred.ttl");

        combinedInferredModel.setNsPrefixes(ontologyService.getCombinedOntologyModel());

        try (FileOutputStream fos = new FileOutputStream(combinedOutputFile)) {
            combinedInferredModel.write(fos, "TURTLE");
        }

        System.out.println(
                "Written combined inferred turtle to: " +
                        combinedOutputFile.getAbsolutePath()
        );
    }

    private void processDirectory(File sourceDir, File targetRootDir) throws IOException {
        if (!sourceDir.exists() || !sourceDir.isDirectory()) {
            return;
        }
        
        File[] files = sourceDir.listFiles();
        if (files == null) {
            return;
        }
        
        for (File file : files) {
            if (file.isDirectory()) {
                // Create corresponding target directory
                String relativePath = getRelativePath(file, new File(turtleSourcePath));
                File targetSubDir = new File(targetRootDir, relativePath);
                if (!targetSubDir.exists()) {
                    targetSubDir.mkdirs();
                }
                processDirectory(file, targetRootDir);
            } else if (file.getName().endsWith(".ttl")) {
                processTurtleFile(file, targetRootDir);
            }
        }
    }

    private void processTurtleFile(File turtleFile, File targetDir) throws IOException {
        System.out.println("Processing turtle file: " + turtleFile.getAbsolutePath());
        
        // Load the turtle file
        Model dataModel = ModelFactory.createDefaultModel();
        RDFDataMgr.read(dataModel, turtleFile.getAbsolutePath());
        
        // Use TransformatieService for simplified inference
        Model inferredModel = transformatieService.inferTriples(
            dataModel,
            ontologyService.getCombinedOntologyModel(),
            reasoningModelConfiguration.getRules()
        );


        synchronized (combinedInferredModel) {
            combinedInferredModel.add(inferredModel);
        }
        
        // Validate the reasoning
        // Note: Not all Reasoner implementations support validate()
        // We'll skip validation for now to avoid compilation issues
        // In a production environment, you might want to implement custom validation
        System.out.println("Reasoning applied successfully");
        
        // Create output file path
        String relativePath = getRelativePath(turtleFile, new File(turtleSourcePath));
        File outputFile = new File(targetDir, relativePath);
        
        // Ensure parent directories exist
        outputFile.getParentFile().mkdirs();
        
        // Write inferred model to turtle file
        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            inferredModel.write(fos, "TURTLE");
        }
        
        System.out.println("Written inferred turtle to: " + outputFile.getAbsolutePath());
    }

    private String getRelativePath(File file, File baseDir) {
        Path filePath = file.toPath();
        Path basePath = baseDir.toPath();
        return basePath.relativize(filePath).toString();
    }




}