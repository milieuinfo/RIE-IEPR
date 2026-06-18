package be.vlaanderen.omgeving.riepr

import be.vlaanderen.omgeving.rdfvalidator.{OntologySubsets, RdfUtils}
import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.slf4j.LoggerFactory

import java.io.File

object OntologySorter {

  private val logger = LoggerFactory.getLogger(getClass)

  lazy val completeOntology: Model = {
    val model = ModelFactory.createDefaultModel()
    val resources = new File("src/main/resources")
    RdfUtils.listTurtleFiles(resources).foreach { file =>
      logger.info(s"Processing: ${file.getPath}")
      model.add(RdfUtils.parseTurtle(file))
    }
    model
  }

  lazy val structuralSubset: Model = extractStructuralSubset(completeOntology)

  lazy val disjointSubset: Model = extractDisjointSubset(completeOntology)

  def extractStructuralSubset(source: Model): Model =
    OntologySubsets.extractStructuralSubset(source)

  def extractDisjointSubset(source: Model): Model =
    OntologySubsets.extractDisjointSubset(source)
}
