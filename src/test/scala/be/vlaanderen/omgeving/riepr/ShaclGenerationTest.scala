package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.shacl.Shapes
import org.junit.jupiter.api.Assertions._
import org.junit.jupiter.api.Test

import java.io.FileOutputStream


class ShaclGenerationTest {

  private val ontologyPath =
    "src/test/resources/validationSourceOntology.ttl"

  private val expectedShaclPath =
    "src/test/resources/generated-shapes.ttl"

  private val testDataDir =
    "src/test/resources/shacl-test-data"

  @Test
  def generatedShaclIsNotEmpty(): Unit = {
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)

    val generated = OwlToShaclGenerator.generate(ontology)

    assertTrue(generated.size() > 0, "Generated SHACL should not be empty")
  }

  @Test
  def generatedShaclMatchesExpected(): Unit = {
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)

    val generated = OwlToShaclGenerator.generate(ontology)

    val expected = ModelFactory.createDefaultModel()
    RDFDataMgr.read(expected, expectedShaclPath)

    assertTrue(
      generated.isIsomorphicWith(expected),
      "Generated SHACL does not match expected SHACL"
    )
  }

  @Test
  def validateWithExpectedShacl(): Unit = {
    val shapesModel = ModelFactory.createDefaultModel()
    RDFDataMgr.read(shapesModel, expectedShaclPath)
    val shapes = Shapes.parse(shapesModel.getGraph)

    val testFiles = Seq(
      "valid.ttl"    -> true,
      "invalid1.ttl" -> false,
      "invalid2.ttl" -> false,
      "invalid3.ttl" -> false,
      "invalid4.ttl" -> false
    )

    testFiles.foreach { case (file, shouldBeValid) =>
      val data = ModelFactory.createDefaultModel()
      RDFDataMgr.read(data, s"$testDataDir/$file")

      val report =
        org.apache.jena.shacl.ShaclValidator.get().validate(shapes, data.getGraph)

      assertEquals(
        shouldBeValid,
        report.conforms(),
        s"Unexpected validation result for $file"
      )
    }
  }

  @Test
  def validateWithGeneratedShacl(): Unit = {
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)

    val generatedShacl = OwlToShaclGenerator.generate(ontology)
    val shapes = Shapes.parse(generatedShacl.getGraph)

    val testFiles = Seq(
      "valid.ttl"    -> true,
      "invalid1.ttl" -> false,
      "invalid2.ttl" -> false,
      "invalid3.ttl" -> false,
      "invalid4.ttl" -> false
    )

    testFiles.foreach { case (file, shouldBeValid) =>
      val data = ModelFactory.createDefaultModel()
      RDFDataMgr.read(data, s"$testDataDir/$file")

      val report =
        org.apache.jena.shacl.ShaclValidator.get().validate(shapes, data.getGraph)

      assertEquals(
        shouldBeValid,
        report.conforms(),
        s"Unexpected validation result for $file (generated SHACL)"
      )
    }
  }
}
