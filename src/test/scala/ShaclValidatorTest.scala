import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.apache.jena.shacl.{Shapes, ValidationReport}
import org.apache.jena.vocabulary.{RDF, RDFS}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import java.io.ByteArrayInputStream

class ShaclValidatorTest extends AnyFlatSpec with Matchers {

  "ShaclValidator" should "load SHACL shapes from valid model" in {
    val shaclModel = ModelFactory.createDefaultModel()
    val shape = shaclModel.createResource("http://example.org/TestShape")
    shape.addProperty(RDF.`type`, shaclModel.createResource("http://www.w3.org/ns/shacl#NodeShape"))
    
    // Write model to string and load from it
    val outputStream = new java.io.ByteArrayOutputStream()
    shaclModel.write(outputStream, "TURTLE")
    val shaclString = outputStream.toString("UTF-8")
    
    // Save to temporary file
    val tempFile = java.io.File.createTempFile("test-shapes", ".ttl")
    tempFile.deleteOnExit()
    val writer = new java.io.FileWriter(tempFile)
    writer.write(shaclString)
    writer.close()
    
    val shapes = ShaclValidator.loadShapes(tempFile.getAbsolutePath)
    
    shapes should not be null
    // shapes.getShapesGraph should not be null  // Removed as getShapesGraph doesn't exist
  }

  it should "validate conforming model" in {
    // Create simple SHACL shape
    val shaclModel = ModelFactory.createDefaultModel()
    val shape = shaclModel.createResource("http://example.org/PersonShape")
    shape.addProperty(RDF.`type`, shaclModel.createResource("http://www.w3.org/ns/shacl#NodeShape"))
    shape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#targetClass"),
      shaclModel.createResource("http://example.org/Person")
    )
    
    // Create data model that conforms
    val dataModel = ModelFactory.createDefaultModel()
    val person = dataModel.createResource("http://example.org/john")
    person.addProperty(RDF.`type`, dataModel.createResource("http://example.org/Person"))
    
    // Save SHACL to temp file
    val tempFile = java.io.File.createTempFile("test-shapes", ".ttl")
    tempFile.deleteOnExit()
    val writer = new java.io.FileWriter(tempFile)
    shaclModel.write(writer, "TURTLE")
    writer.close()
    
    val shapes = ShaclValidator.loadShapes(tempFile.getAbsolutePath)
    val report = ShaclValidator.validate(dataModel, shapes)
    
    report.conforms() shouldBe true
  }

  it should "detect non-conforming model" in {
    // Create SHACL shape with property constraint
    val shaclModel = ModelFactory.createDefaultModel()
    val shape = shaclModel.createResource("http://example.org/PersonShape")
    shape.addProperty(RDF.`type`, shaclModel.createResource("http://www.w3.org/ns/shacl#NodeShape"))
    shape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#targetClass"),
      shaclModel.createResource("http://example.org/Person")
    )
    
    val propShape = shaclModel.createResource()
    propShape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#path"),
      shaclModel.createProperty("http://example.org/name")
    )
    propShape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#minCount"),
      shaclModel.createTypedLiteral(1: java.lang.Integer)
    )
    
    shape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#property"),
      propShape
    )
    
    // Create data model that doesn't conform (missing required property)
    val dataModel = ModelFactory.createDefaultModel()
    val person = dataModel.createResource("http://example.org/john")
    person.addProperty(RDF.`type`, dataModel.createResource("http://example.org/Person"))
    // Missing the required name property
    
    // Save SHACL to temp file
    val tempFile = java.io.File.createTempFile("test-shapes", ".ttl")
    tempFile.deleteOnExit()
    val writer = new java.io.FileWriter(tempFile)
    shaclModel.write(writer, "TURTLE")
    writer.close()
    
    val shapes = ShaclValidator.loadShapes(tempFile.getAbsolutePath)
    val report = ShaclValidator.validate(dataModel, shapes)
    
    report.conforms() shouldBe false
    report.getEntries.size() should be > 0
  }

  it should "print report for conforming model" in {
    // Create simple SHACL shape
    val shaclModel = ModelFactory.createDefaultModel()
    val shape = shaclModel.createResource("http://example.org/PersonShape")
    shape.addProperty(RDF.`type`, shaclModel.createResource("http://www.w3.org/ns/shacl#NodeShape"))
    
    // Create conforming data model
    val dataModel = ModelFactory.createDefaultModel()
    
    // Save SHACL to temp file
    val tempFile = java.io.File.createTempFile("test-shapes", ".ttl")
    tempFile.deleteOnExit()
    val writer = new java.io.FileWriter(tempFile)
    shaclModel.write(writer, "TURTLE")
    writer.close()
    
    val shapes = ShaclValidator.loadShapes(tempFile.getAbsolutePath)
    val report = ShaclValidator.validate(dataModel, shapes)
    
    // This should not throw an exception
    ShaclValidator.printReport(report)
    
    // Report should be conforming
    report.conforms() shouldBe true
  }

  it should "print report for non-conforming model" in {
    // Create SHACL shape with class constraint
    val shaclModel = ModelFactory.createDefaultModel()
    val shape = shaclModel.createResource("http://example.org/PersonShape")
    shape.addProperty(RDF.`type`, shaclModel.createResource("http://www.w3.org/ns/shacl#NodeShape"))
    shape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#targetClass"),
      shaclModel.createResource("http://example.org/Person")
    )
    
    val propShape = shaclModel.createResource()
    propShape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#path"),
      shaclModel.createProperty("http://example.org/name")
    )
    propShape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#datatype"),
      shaclModel.createResource("http://www.w3.org/2001/XMLSchema#string")
    )
    
    shape.addProperty(
      shaclModel.createProperty("http://www.w3.org/ns/shacl#property"),
      propShape
    )
    
    // Create non-conforming data model (wrong datatype)
    val dataModel = ModelFactory.createDefaultModel()
    val person = dataModel.createResource("http://example.org/john")
    person.addProperty(RDF.`type`, dataModel.createResource("http://example.org/Person"))
    person.addProperty(
      dataModel.createProperty("http://example.org/name"),
      dataModel.createTypedLiteral(123: java.lang.Integer) // Should be string, not integer
    )
    
    // Save SHACL to temp file
    val tempFile = java.io.File.createTempFile("test-shapes", ".ttl")
    tempFile.deleteOnExit()
    val writer = new java.io.FileWriter(tempFile)
    shaclModel.write(writer, "TURTLE")
    writer.close()
    
    val shapes = ShaclValidator.loadShapes(tempFile.getAbsolutePath)
    val report = ShaclValidator.validate(dataModel, shapes)
    
    // This should not throw an exception
    ShaclValidator.printReport(report)
    
    // Report should be non-conforming
    report.conforms() shouldBe false
  }
}