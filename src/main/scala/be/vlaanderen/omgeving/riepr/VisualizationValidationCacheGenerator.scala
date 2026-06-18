package be.vlaanderen.omgeving.riepr

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import be.vlaanderen.omgeving.rdfvalidator.ShaclValidator
import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.apache.jena.riot.{Lang, RDFDataMgr}
import org.apache.jena.vocabulary.RDF
import org.apache.jena.vocabulary.{OWL, RDFS}

import java.io.File
import java.io.StringReader
import java.time.OffsetDateTime
import scala.io.Source
import scala.jdk.CollectionConverters._

object VisualizationValidationCacheGenerator {

  private val OntologyFiles = Seq(
    "src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl",
    "src/main/resources/be/vlaanderen/omgeving/riepr/data/id/concept/riepr/riepr.ttl"
  )

  private val DataFile = "documentatie/bin/agc-glass/agc-glass_MJV.ttl"
  private val ShapesFile = "src/main/resources/generated-shapes.ttl"
  private val ReportFile = "documentatie/bin/visualisatie/validation-report.json"

  def main(args: Array[String]): Unit = {
    val ontology = loadMergedModel(OntologyFiles)
    val data = loadModel(DataFile)

    val shapes = ShaclValidator.loadShapes(ShapesFile)
    val inferredData = applyMinimalInference(data, ontology)
    val report = ShaclValidator.validate(inferredData, shapes)
    val entries = extractEntries(report)

    writeReport(
      report.conforms(),
      data.size(),
      ontology.size(),
      shapes.getGraph.size(),
      entries
    )
  }

  private def loadModel(path: String): Model = {
    val model = ModelFactory.createDefaultModel()
    val content = Source.fromFile(path, "UTF-8").mkString
    RDFDataMgr.read(model, new StringReader(normalizeTTL(content)), null, Lang.TURTLE)
    model
  }

  private def loadMergedModel(paths: Seq[String]): Model = {
    val model = ModelFactory.createDefaultModel()
    paths.foreach(path => {
      val content = Source.fromFile(path, "UTF-8").mkString
      RDFDataMgr.read(model, new StringReader(normalizeTTL(content)), null, Lang.TURTLE)
    })
    model
  }

  private def applyMinimalInference(data: Model, ontology: Model): Model = {
    val inferred = ModelFactory.createDefaultModel()
    inferred.add(data)

    val typeProperty = RDF.`type`
    val equivalentProperty = OWL.equivalentProperty
    val equivalentClass = OWL.equivalentClass
    val subClassOf = RDFS.subClassOf

    val equivalentProperties = ontology.listStatements(null, equivalentProperty, null).asScala.toSeq.collect {
      case statement if statement.getSubject.isURIResource && statement.getObject.isResource =>
        statement.getSubject.getURI -> statement.getObject.asResource().getURI
    }

    val equivalentClasses = ontology.listStatements(null, equivalentClass, null).asScala.toSeq.collect {
      case statement if statement.getSubject.isURIResource && statement.getObject.isResource =>
        statement.getSubject.getURI -> statement.getObject.asResource().getURI
    }

    val subclassEdges = ontology.listStatements(null, subClassOf, null).asScala.toSeq.collect {
      case statement if statement.getSubject.isURIResource && statement.getObject.isResource =>
        statement.getSubject.getURI -> statement.getObject.asResource().getURI
    }

    val propertyClosure = bidirectionalClosure(equivalentProperties)
    val classClosure = bidirectionalClosure(equivalentClasses)
    val superclassClosure = directedClosure(subclassEdges)

    val propertyStatements = data.listStatements().asScala.toSeq
    propertyStatements.foreach { statement =>
      val predicateUri = statement.getPredicate.getURI
      propertyClosure.get(predicateUri).foreach { targets =>
        targets.filterNot(_ == predicateUri).foreach { inferredPredicateUri =>
          inferred.add(statement.getSubject, inferred.createProperty(inferredPredicateUri), statement.getObject)
        }
      }
    }

    val typeStatements = data.listStatements(null, typeProperty, null).asScala.toSeq
    typeStatements.foreach { statement =>
      if (statement.getObject.isResource) {
        val classUri = statement.getObject.asResource().getURI
        val inferredClassUris = classClosure.getOrElse(classUri, Set.empty) ++ superclassClosure.getOrElse(classUri, Set.empty)
        inferredClassUris.filterNot(_ == classUri).foreach { inferredClassUri =>
            inferred.add(statement.getSubject, typeProperty, inferred.createResource(inferredClassUri))
        }
      }
    }

    inferred
  }

  private def bidirectionalClosure(edges: Seq[(String, String)]): Map[String, Set[String]] = {
    val adjacency = scala.collection.mutable.Map.empty[String, scala.collection.mutable.Set[String]]

    def connect(from: String, to: String): Unit = {
      adjacency.getOrElseUpdate(from, scala.collection.mutable.Set.empty) += to
      adjacency.getOrElseUpdate(to, scala.collection.mutable.Set.empty) += from
    }

    edges.foreach { case (from, to) => connect(from, to) }

    adjacency.keysIterator.map { start =>
      val seen = scala.collection.mutable.Set[String](start)
      val queue = scala.collection.mutable.Queue[String](start)

      while (queue.nonEmpty) {
        val current = queue.dequeue()
        adjacency.getOrElse(current, scala.collection.mutable.Set.empty).foreach { next =>
          if (!seen.contains(next)) {
            seen += next
            queue.enqueue(next)
          }
        }
      }

      start -> seen.toSet
    }.toMap
  }

  private def directedClosure(edges: Seq[(String, String)]): Map[String, Set[String]] = {
    val adjacency = scala.collection.mutable.Map.empty[String, scala.collection.mutable.Set[String]]

    edges.foreach { case (from, to) =>
      adjacency.getOrElseUpdate(from, scala.collection.mutable.Set.empty) += to
    }

    adjacency.keysIterator.map { start =>
      val seen = scala.collection.mutable.Set[String](start)
      val queue = scala.collection.mutable.Queue[String](start)

      while (queue.nonEmpty) {
        val current = queue.dequeue()
        adjacency.getOrElse(current, scala.collection.mutable.Set.empty).foreach { next =>
          if (!seen.contains(next)) {
            seen += next
            queue.enqueue(next)
          }
        }
      }

      start -> seen.toSet
    }.toMap
  }

  private def extractEntries(report: org.apache.jena.shacl.ValidationReport): Seq[Map[String, String]] = {
    val model = report.getModel
    val sh = "http://www.w3.org/ns/shacl#"

    def statementValue(resource: org.apache.jena.rdf.model.Resource, localName: String): String = {
      val statement = resource.getProperty(model.createProperty(sh + localName))
      if (statement == null || statement.getObject == null) return ""
      val node = statement.getObject
      if (node.isLiteral) node.asLiteral().getString
      else if (node.isResource) Option(node.asResource().getURI).getOrElse(node.asResource().getId.getLabelString)
      else node.toString
    }

    model
      .listStatements(null, model.createProperty(sh + "result"), null)
      .asScala
      .flatMap(statement => Option(statement.getObject).filter(_.isResource).map(_.asResource()))
      .map { result =>
        Map(
          "focusNode" -> statementValue(result, "focusNode"),
          "resultPath" -> statementValue(result, "resultPath"),
          "message" -> statementValue(result, "resultMessage"),
          "severity" -> statementValue(result, "resultSeverity")
        )
      }
      .toSeq
  }

  private def writeReport(
      conforms: Boolean,
      dataTriples: Long,
      ontologyTriples: Long,
      shapeTriples: Long,
      entries: Seq[Map[String, String]]
  ): Unit = {
    val mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)

    val root = mapper.createObjectNode()
    root.put("generatedAt", OffsetDateTime.now().toString)
    root.put("sourceData", DataFile)
    root.put("sourceOntology", OntologyFiles.mkString(","))
    root.put("inferenceMode", "owl-mini")
    root.put("conforms", conforms)
    root.put("dataTriples", dataTriples)
    root.put("ontologyTriples", ontologyTriples)
    root.put("shapeTriples", shapeTriples)
    root.put("entryCount", entries.size)

    val entryArray = root.putArray("entries")
    entries.foreach { entry =>
      val node = entryArray.addObject()
      entry.foreach { case (key, value) => node.put(key, value) }
    }

    val file = new File(ReportFile)
    file.getParentFile.mkdirs()
    mapper.writerWithDefaultPrettyPrinter().writeValue(file, root)
  }

  private def normalizeTTL(content: String): String = {
    val hasEmptyPrefix =
      "@prefix\\s*:\\s*<[^>]+>\\s*\\.".r.findFirstIn(content).nonEmpty ||
        "PREFIX\\s*:\\s*<[^>]+>".r.findFirstIn(content).nonEmpty

    if (hasEmptyPrefix) content else s"@prefix : <https://data.riepr.omgeving.vlaanderen.be/ns/riepr#> .\n$content"
  }
}