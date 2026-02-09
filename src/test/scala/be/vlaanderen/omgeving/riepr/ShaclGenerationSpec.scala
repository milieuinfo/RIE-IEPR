package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.shacl.Shapes
import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should.Matchers

import java.io.FileOutputStream


class ShaclGenerationSpec extends AnyFunSuite with Matchers {

  private val ontologyPath =
    "src/test/resources/validationSourceOntology.ttl"

  private val expectedShaclPath =
    "src/test/resources/generated-shapes.ttl"

  private val testDataDir =
    "src/test/resources/shacl-test-data"

  test("Generated SHACL should not be empty") {
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)

    val generatedShacl = OwlToShaclGenerator.generate(ontology)

    generatedShacl.size() should be > 0L
  }

  test("Generated SHACL should be isomorphic to expected SHACL") {
    val ontology = ModelFactory.createDefaultModel()
    RDFDataMgr.read(ontology, ontologyPath)

    val generatedShacl = OwlToShaclGenerator.generate(ontology)

    val expectedShacl = ModelFactory.createDefaultModel()
    RDFDataMgr.read(expectedShacl, expectedShaclPath)

//    val fos = new FileOutputStream("/tmp/completeOntology.ttl")
//    try generatedShacl.write(fos, "TURTLE")
//    finally fos.close()
    generatedShacl.isIsomorphicWith(expectedShacl) shouldBe true
  }

  test("SHACL validation with expected shapes") {

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

    testFiles.foreach { case (fileName, shouldBeValid) =>
      withClue(s"File: $fileName") {
        val dataModel = ModelFactory.createDefaultModel()
        RDFDataMgr.read(dataModel, s"$testDataDir/$fileName")

        val report =
          org.apache.jena.shacl.ShaclValidator
            .get()
            .validate(shapes, dataModel.getGraph)

        report.conforms() shouldBe shouldBeValid
      }
    }
  }

  test("SHACL validation with generated shapes") {

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

    testFiles.foreach { case (fileName, shouldBeValid) =>
      withClue(s"File: $fileName") {
        val dataModel = ModelFactory.createDefaultModel()
        RDFDataMgr.read(dataModel, s"$testDataDir/$fileName")

        val report =
          org.apache.jena.shacl.ShaclValidator
          .get()
          .validate(shapes, dataModel.getGraph)

        report.conforms() shouldBe shouldBeValid
      }
    }
  }
}
