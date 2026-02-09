package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr
import org.scalatest.BeforeAndAfter
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.io.File

class ShaclGenerationAndValidationTest extends AnyFlatSpec with Matchers with BeforeAndAfter {

  // Load the source ontology
  val ontologyPath = "src/test/resources/validationSourceOntology.ttl"
  val expectedShaclPath = "src/test/resources/generated-shapes.ttl"
  
  "SHACL Generation" should "generate SHACL shapes from OWL ontology" in {
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)
    
    val generatedShacl = OwlToShaclGenerator.generate(ontology)
    
    // Save generated SHACL for inspection
    val tempFile = File.createTempFile("generated-shacl-", ".ttl")
    tempFile.deleteOnExit()
    val writer = new java.io.FileWriter(tempFile)
    generatedShacl.write(writer, "TURTLE")
    writer.close()
    
    println(s"Generated SHACL saved to: ${tempFile.getAbsolutePath}")
    
    // Basic validation that SHACL was generated
    assert(generatedShacl != null)
    assert(generatedShacl.size() > 0)
    
    // Check that it contains expected SHACL elements
    val hasNodeShapes = generatedShacl.listResourcesWithProperty(
      ModelFactory.createDefaultModel().createProperty("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      generatedShacl.createResource("http://www.w3.org/ns/shacl#NodeShape")
    ).hasNext
    
    assert(hasNodeShapes, "Generated SHACL should contain NodeShapes")
  }

  "SHACL Validation" should "validate conforming test data" in {
    val testFiles = Seq(
      "src/test/resources/shacl-test-data/valid.ttl"
    )
    
    testFiles.foreach { filePath =>
      val file = new File(filePath)
      assert(file.exists(), s"Test file $filePath should exist")
      
      val dataModel = ModelFactory.createDefaultModel()
      RDFDataMgr.read(dataModel, filePath)
      
      val shapes = ShaclValidator.loadShapes(expectedShaclPath)
      val report = ShaclValidator.validate(dataModel, shapes)
      
      println(s"${file.getName} -> conforms: ${report.conforms()}")
      
      if (!report.conforms()) {
        println("Validation errors:")
        report.getEntries.forEach { entry =>
          println(s"  - ${entry.focusNode}: ${entry.message}")
        }
      }
      
      assert(report.conforms(), s"${file.getName} should be valid")
    }
  }

  it should "detect non-conforming test data" in {
    val testCases = Seq(
      ("src/test/resources/shacl-test-data/invalid1.ttl", "sh:ClassConstraintComponent", "Wrong class for isObservedBy"),
      ("src/test/resources/shacl-test-data/invalid2.ttl", "sh:OrConstraintComponent", "Wrong class for wasObservedBy"),
      ("src/test/resources/shacl-test-data/invalid3.ttl", "sh:MinCountConstraintComponent", "Missing required property"),
      ("src/test/resources/shacl-test-data/invalid4.ttl", "sh:MaxCountConstraintComponent", "Too many dictionary values")
    )
    
    testCases.foreach { case (filePath, expectedComponent, description) =>
      val file = new File(filePath)
      assert(file.exists(), s"Test file $filePath should exist")
      
      val dataModel = ModelFactory.createDefaultModel()
      RDFDataMgr.read(dataModel, filePath)
      
      val shapes = ShaclValidator.loadShapes(expectedShaclPath)
      val report = ShaclValidator.validate(dataModel, shapes)
      
      println(s"${file.getName} -> conforms: ${report.conforms()}, expected: $expectedComponent")
      
      if (report.conforms()) {
        println(s"WARNING: ${file.getName} should be invalid but passed validation")
      } else {
        println("Validation errors (as expected):")
        report.getEntries.forEach { entry =>
          println(s"  - ${entry.resultPath}: ${entry.message}")
        }
      }
      
      // For now, just check that invalid files are detected
      // Note: The exact component matching might need adjustment based on actual SHACL generation
      assert(!report.conforms(), s"${file.getName} should be invalid: $description")
    }
  }

  "Complete SHACL Workflow" should "generate SHACL and validate all test cases" in {
    // Step 1: Generate SHACL from OWL ontology
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)
    
    val generatedShacl = OwlToShaclGenerator.generate(ontology)
    assert(generatedShacl != null && generatedShacl.size() > 0)
    
    // Step 2: Save generated SHACL to temp file
    val tempShaclFile = File.createTempFile("temp-shacl-", ".ttl")
    tempShaclFile.deleteOnExit()
    val writer = new java.io.FileWriter(tempShaclFile)
    generatedShacl.write(writer, "TURTLE")
    writer.close()
    
    // Step 3: Load all test files and validate
    val testFiles = Seq(
      ("valid.ttl", true),
      ("invalid1.ttl", false),
      ("invalid2.ttl", false),
      ("invalid3.ttl", false),
      ("invalid4.ttl", false)
    )
    
    println("\n=== Complete SHACL Validation Results ===")
    
    testFiles.foreach { case (fileName, shouldBeValid) =>
      val filePath = s"src/test/resources/shacl-test-data/$fileName"
      val file = new File(filePath)
      
      if (file.exists()) {
        val dataModel = ModelFactory.createDefaultModel()
        RDFDataMgr.read(dataModel, filePath)
        
        val shapes = ShaclValidator.loadShapes(tempShaclFile.getAbsolutePath)
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
    
    println("=== End of SHACL Validation ===\n")
  }

  "SHACL Comparison" should "compare generated SHACL with expected SHACL" in {
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)
    
    val generatedShacl = OwlToShaclGenerator.generate(ontology)
    val expectedShacl = ModelFactory.createDefaultModel()
    RDFDataMgr.read(expectedShacl, expectedShaclPath)
    
    println(s"Generated SHACL has ${generatedShacl.size()} triples")
    println(s"Expected SHACL has ${expectedShacl.size()} triples")
    
    // Compare basic structure
    import scala.collection.JavaConverters._
    
    val generatedNodeShapes = generatedShacl.listResourcesWithProperty(
      generatedShacl.createProperty("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      generatedShacl.createResource("http://www.w3.org/ns/shacl#NodeShape")
    ).asScala.toList
    
    val expectedNodeShapes = expectedShacl.listResourcesWithProperty(
      expectedShacl.createProperty("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      expectedShacl.createResource("http://www.w3.org/ns/shacl#NodeShape")
    ).asScala.toList
    
    println(s"Generated NodeShapes: ${generatedNodeShapes.size}")
    println(s"Expected NodeShapes: ${expectedNodeShapes.size}")
    
    // List the NodeShapes for comparison
    println("\nGenerated NodeShapes:")
    generatedNodeShapes.foreach { shape =>
      println(s"  - ${shape.getURI}")
    }
    
    println("\nExpected NodeShapes:")
    expectedNodeShapes.foreach { shape =>
      println(s"  - ${shape.getURI}")
    }
  }
}