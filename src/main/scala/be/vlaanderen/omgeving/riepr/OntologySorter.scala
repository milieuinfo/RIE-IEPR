package be.vlaanderen.omgeving.riepr

import be.vlaanderen.omgeving.riepr.TurtleTransformer.{listTurtleFiles, logger, parseTurtle, processModel}
import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.shacl.{Shapes, ValidationReport}
import org.slf4j.LoggerFactory

import java.io.File

object OntologySorter {

  private val logger = LoggerFactory.getLogger(getClass)

  lazy val completeOntology = ModelFactory.createDefaultModel()

  def getCompleteOntology(): Model = {
    val resources = new File("src/main/resources")
    listTurtleFiles(resources).foreach { file =>
      logger.info(s"Processing: ${file.getPath}")
      val model = parseTurtle(file)
      completeOntology.add(model)
    }
    completeOntology
  }


}
