package be.vlaanderen.omgeving.riepr

import be.vlaanderen.omgeving.rdfvalidator.{OwlToShaclGenerator, ShaclValidator, ValidationResult}
import be.vlaanderen.omgeving.rdfvalidator.RdfUtils._
import com.fasterxml.jackson.databind.JsonNode
import com.github.jsonldjava.utils.JsonUtils
import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.apache.jena.reasoner.rulesys.{GenericRuleReasoner, Rule}
import org.apache.jena.reasoner.{Reasoner, ReasonerRegistry}
import org.apache.jena.shacl.Shapes
import org.slf4j.LoggerFactory

import java.io._

object TurtleTransformer {

  private val logger = LoggerFactory.getLogger(getClass)

  private def ensureParentDir(file: File): Unit = {
    val parent = file.getParentFile
    if (!parent.exists()) {
      if (!parent.mkdirs()) {
        throw new RuntimeException(s"Kon directory niet aanmaken: ${parent.getPath}")
      }
    }
  }

  def writeJson(json: JsonNode, inputPath: String, typ: String): Unit = {
    val file = new File(inputPath.replace("/input/", s"/output/$typ/").replace(".ttl", s".$typ"))
    ensureParentDir(file)
    file.getParentFile.mkdirs()
    val writer = new FileWriter(file)
    try JsonUtils.writePrettyPrint(writer, json)
    finally writer.close()
  }

  def writeModelToTurtle(model: Model, inputPath: String): Unit = {
    val file = new File(inputPath.replace("/input/", "/output/turtle/"))
    ensureParentDir(file)
    val fos = new FileOutputStream(inputPath.replace("/input/", "/output/turtle/"))
    try model.write(fos, "TURTLE")
    finally fos.close()
  }

  def processModel(model: Model, inferenceOntology: Model, reasoner: GenericRuleReasoner, owlReasonerWithSchema: Reasoner, shaclShapes: Shapes, frame: JsonNode, file: File): Unit = {
    val inferredModel = inferTriples(model, inferenceOntology, reasoner)

    writeModelToTurtle(inferredModel, file.getPath)

    val validation = validateModel(inferredModel, owlReasonerWithSchema)
    if (!validation.valid) {
      validation.messages.foreach(m =>
        logger.warn(s"❌ [MODEL INVALID] ${file.getName}: $m")
      )
    }

    val report = ShaclValidator.validate(model, shaclShapes)
    ShaclValidator.printReport(report)

    for {
      jsonLd <- modelToJsonLd(model)
      framed <- frameJsonLd(jsonLd, frame)
      graph  <- extractGraph(framed)
    } {
      //writeJson(graph, file.getPath, "json")
      //writeJson(framed, file.getPath, "jsonld")
    }
  }

  def main(args: Array[String]): Unit = {
    val completeOntology = OntologySorter.completeOntology
    val inferenceOntology = OntologySorter.structuralSubset
    val reasoningOntology = OntologySorter.disjointSubset

    val shaclModel = OwlToShaclGenerator.generate(completeOntology)
    shaclModel.write(
      new FileOutputStream("src/main/resources/generated-shapes.ttl"),
      "TURTLE"
    )
    val shaclShapes = ShaclValidator.loadShapes("src/main/resources/generated-shapes.ttl")

    val frame = loadFrame("src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json")

    val reasoner = new GenericRuleReasoner(
      Rule.rulesFromURL("src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules")
    )
    reasoner.setDerivationLogging(true)

    lazy val owlReasonerWithSchema =
      ReasonerRegistry
        .getOWLMiniReasoner
        .bindSchema(reasoningOntology)

    val completeDataModel = ModelFactory.createDefaultModel()
    val inputDir = new File("src/main/input")

    listTurtleFiles(inputDir).foreach { file =>
      logger.info(s"Processing: ${file.getPath}")
      val model = parseTurtle(file)
      completeDataModel.add(model)

      val vocabValidation = checkVocabularyUsage(model, completeOntology)
      if (!vocabValidation.valid) {
        vocabValidation.messages.foreach(m =>
          logger.warn(s"❌ [VOCAB ERROR] ${file.getName}: $m")
        )
      }
      processModel(model, inferenceOntology, reasoner, owlReasonerWithSchema, shaclShapes, frame, file)
    }

    processModel(completeDataModel, inferenceOntology, reasoner, owlReasonerWithSchema, shaclShapes, frame, new File("src/main/input/consolidated/consolidated.ttl"))
  }
}
