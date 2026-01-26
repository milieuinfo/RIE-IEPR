package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr

import java.io.File

object ShaclTestRunner {

  def main(args: Array[String]): Unit = {
    println("=== SHACL Generation and Validation Test Runner ===\n")
    
    // Load the source ontology
    val ontologyPath = "src/test/resources/validationSourceOntology.ttl"
    val expectedShaclPath = "src/test/resources/generated-shapes.ttl"
    
    // Step 1: Generate SHACL from OWL ontology
    println("Step 1: Generating SHACL from OWL ontology...")
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)
    
    val generatedShacl = OwlToShaclGenerator.generate(ontology)
    
    println(s"Generated SHACL model with ${generatedShacl.size()} triples")
    
    // Save generated SHACL for inspection
    val tempFile = File.createTempFile("generated-shacl-", ".ttl")
    tempFile.deleteOnExit()
    val writer = new java.io.FileWriter(tempFile)
    generatedShacl.write(writer, "TURTLE")
    writer.close()
    
    println(s"Generated SHACL saved to: ${tempFile.getAbsolutePath}\n")
    
    // Step 2: Compare with expected SHACL
    println("Step 2: Comparing generated SHACL with expected SHACL...")
    val expectedShacl = ModelFactory.createDefaultModel()
    RDFDataMgr.read(expectedShacl, expectedShaclPath)
    
    println(s"Expected SHACL has ${expectedShacl.size()} triples")
    
    // Step 3: Validate test data using expected SHACL
    println("\nStep 3: Validating test data using expected SHACL...")
    
    val testFiles = Seq(
      ("valid.ttl", true),
      ("invalid1.ttl", false),
      ("invalid2.ttl", false),
      ("invalid3.ttl", false),
      ("invalid4.ttl", false)
    )
    
    testFiles.foreach { case (fileName, shouldBeValid) =>
      val filePath = s"src/test/resources/shacl-test-data/$fileName"
      val file = new File(filePath)
      
      if (file.exists()) {
        val dataModel = ModelFactory.createDefaultModel()
        RDFDataMgr.read(dataModel, filePath)
        
        val shapes = ShaclValidator.loadShapes(expectedShaclPath)
        val report = ShaclValidator.validate(dataModel, shapes)
        
        val result = if (report.conforms() == shouldBeValid) "✅ PASS" else "❌ FAIL"
        println(f"$result $fileName: conforms=${report.conforms()} (expected=$shouldBeValid)")
        
        if (!report.conforms()) {
          report.getEntries.forEach { entry =>
            println(s"    Error: ${entry.resultPath} - ${entry.message}")
          }
        }
      } else {
        println(s"⚠️  SKIP $fileName: file not found")
      }
    }
    
    // Step 4: Validate test data using generated SHACL
    println("\nStep 4: Validating test data using generated SHACL...")
    
    testFiles.foreach { case (fileName, shouldBeValid) =>
      val filePath = s"src/test/resources/shacl-test-data/$fileName"
      val file = new File(filePath)
      
      if (file.exists()) {
        val dataModel = ModelFactory.createDefaultModel()
        RDFDataMgr.read(dataModel, filePath)
        
        val shapes = ShaclValidator.loadShapes(tempFile.getAbsolutePath)
        val report = ShaclValidator.validate(dataModel, shapes)
        
        val result = if (report.conforms() == shouldBeValid) "✅ PASS" else "❌ FAIL"
        println(f"$result $fileName: conforms=${report.conforms()} (expected=$shouldBeValid) [generated SHACL]")
        
        if (!report.conforms()) {
          report.getEntries.forEach { entry =>
            println(s"    Error: ${entry.resultPath} - ${entry.message}")
          }
        }
      } else {
        println(s"⚠️  SKIP $fileName: file not found")
      }
    }
    
    println("\n=== SHACL Test Runner Complete ===")
  }
}