package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.Model
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.shacl.{Shapes, ValidationReport}
import org.slf4j.LoggerFactory

object ShaclValidator {

  private val logger = LoggerFactory.getLogger(getClass)

  /** SHACL Shapes laden van bestand of Model */
  def loadShapes(shaclFile: String): Shapes = {
    val shapesModel = RDFDataMgr.loadModel(shaclFile)
    Shapes.parse(shapesModel)
  }

  /** Model valideren tegen SHACL Shapes */
  def validate(model: Model, shapes: Shapes): ValidationReport = {
    org.apache.jena.shacl.ShaclValidator.get.validate(shapes, model.getGraph) // let op getGraph
  }

  /** Print rapport in leesbare vorm */
  def printReport(report: ValidationReport): Unit = {
    if (report.conforms()) {
      logger.info("✅ Model is conform SHACL")
    } else {
      logger.warn("❌ Model is NOT conform:")
      report.getEntries.forEach { e =>
        logger.warn(s"- FocusNode: ${e.focusNode}, Path: ${e.resultPath}, Message: ${e.message}")
      }
    }
  }
}
