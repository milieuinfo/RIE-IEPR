package be.vlaanderen.omgeving.riepr

import org.apache.jena.vocabulary.{OWL, RDFS}
import org.apache.jena.rdf.model.{Model, ModelFactory, Property}

import be.vlaanderen.omgeving.riepr.TurtleTransformer.{listTurtleFiles, logger, parseTurtle, processModel}
import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.slf4j.LoggerFactory

import java.io.File

object OntologySorter {

  private val logger = LoggerFactory.getLogger(getClass)

  lazy val completeOntology: Model = {
    val model = ModelFactory.createDefaultModel()
    val resources = new File("src/main/resources")

    listTurtleFiles(resources).foreach { file =>
      logger.info(s"Processing: ${file.getPath}")
      model.add(parseTurtle(file))
    }

    model
  }

  lazy val structuralSubset: Model =
    extractStructuralSubset(completeOntology)

  lazy val disjointSubset: Model =
    extractDisjointSubset(completeOntology)

  private def extractStructuralSubset(source: Model): Model = {
    val subset = ModelFactory.createDefaultModel()

    val structuralPredicates = Seq(
      RDFS.subPropertyOf,
      RDFS.subClassOf,
      OWL.inverseOf
    )

    // Deze mogen geen blank nodes hebben in subject of object
    structuralPredicates.foreach { p =>
      source.listStatements(null, p, null).forEachRemaining { stmt =>
        if (!stmt.getSubject.isAnon && stmt.getObject.isResource && !stmt.getObject.asResource().isAnon) {
          subset.add(stmt)
        }
      }
    }

    // domain & range: subject mag geen blank node zijn, object ook niet
    Seq(RDFS.domain, RDFS.range).foreach { p =>
      source.listStatements(null, p, null).forEachRemaining { stmt =>
        val subject = stmt.getSubject
        val obj = stmt.getObject

        if (
          !subject.isAnon &&
            obj.isResource &&
            !obj.asResource().isAnon
        ) {
          subset.add(stmt)
        }
      }
    }

    subset
  }


  private def extractDisjointSubset(source: Model): Model = {
    val subset = ModelFactory.createDefaultModel()

    source.listStatements(null, OWL.disjointWith, null).forEachRemaining { stmt =>
      val subject = stmt.getSubject
      val obj = stmt.getObject

      if (
        !subject.isAnon &&
          obj.isResource &&
          !obj.asResource().isAnon
      ) {
        subset.add(stmt)
      }
    }

    subset
  }
}


