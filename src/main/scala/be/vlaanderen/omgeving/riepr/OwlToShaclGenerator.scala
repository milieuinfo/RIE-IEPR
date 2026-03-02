package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model._
import org.apache.jena.vocabulary.{OWL, RDF, RDFS}

import scala.jdk.CollectionConverters._

object OwlToShaclGenerator {

  val SH = "http://www.w3.org/ns/shacl#"

  // ---------------------------
  // Helpers
  // ---------------------------

  private def shaclProp(local: String, m: Model): Property =
    m.createProperty(SH + local)

  private def isDatatype(res: Resource): Boolean =
    res.isURIResource &&
      res.getURI.startsWith("http://www.w3.org/2001/XMLSchema#")

  private def createPath(prop: Resource, shacl: Model): RDFNode = {
    if (prop.isAnon) {
      Option(prop.getPropertyResourceValue(OWL.inverseOf)) match {
        case Some(inv) if inv.isURIResource =>
          val b = shacl.createResource()
          b.addProperty(shaclProp("inversePath", shacl), inv)
          return b
        case _ =>
      }
    }
    shacl.createResource(prop.getURI)
  }

  private def addClassOrDatatype(ps: Resource, value: Resource, shacl: Model): Unit = {
    if (isDatatype(value))
      ps.addProperty(shaclProp("datatype", shacl), value)
    else
      ps.addProperty(shaclProp("class", shacl), value)
  }

  private def addMinCountIfNeeded(restriction: Resource, ps: Resource, shacl: Model): Unit = {
    if (
      restriction.hasProperty(OWL.someValuesFrom) &&
        !restriction.hasProperty(OWL.minCardinality) &&
        !restriction.hasProperty(OWL.cardinality)
    ) {
      ps.addLiteral(shaclProp("minCount", shacl), 1)
    }
  }

  private def addCardinality(restriction: Resource, ps: Resource, shacl: Model): Unit = {
    def intValue(p: Property): Option[Int] =
      Option(restriction.getProperty(p))
        .map(_.getObject)
        .collect { case l: Literal => l.getInt }

    intValue(OWL.minCardinality).foreach(ps.addLiteral(shaclProp("minCount", shacl), _))
    intValue(OWL.maxCardinality).foreach(ps.addLiteral(shaclProp("maxCount", shacl), _))

    intValue(OWL.cardinality).foreach { exact =>
      ps.addLiteral(shaclProp("minCount", shacl), exact)
      ps.addLiteral(shaclProp("maxCount", shacl), exact)
    }
  }

  // ---------------------------
  // owl:unionOf → sh:or
  // ---------------------------

  private def createOrList(unionNode: Resource, shacl: Model): RDFNode = {
    val list =
      Option(unionNode.getPropertyResourceValue(OWL.unionOf))
        .getOrElse(unionNode)
        .as(classOf[RDFList])

    val shapes = list.iterator().asScala.map { member =>
      val ps = shacl.createResource()
      addClassOrDatatype(ps, member.asResource(), shacl)
      ps
    }.toList

    shacl.createList(shapes.iterator.asJava)
  }

  // ---------------------------
  // PropertyShape generation
  // ---------------------------

  private def generatePropertyShape(
                                     restriction: Resource,
                                     shacl: Model,
                                     nodeShape: Resource
                                   ): Unit = {

    val onProp = restriction.getPropertyResourceValue(OWL.onProperty)
    if (onProp == null) return

    val ps = shacl.createResource()
    ps.addProperty(shaclProp("path", shacl), createPath(onProp, shacl))

    val some = restriction.getPropertyResourceValue(OWL.someValuesFrom)
    val all  = restriction.getPropertyResourceValue(OWL.allValuesFrom)

    // ---- someValuesFrom ----
    if (some != null) {
      if (some.hasProperty(OWL.unionOf)) {
        ps.addProperty(shaclProp("or", shacl), createOrList(some, shacl))
      } else {
        addClassOrDatatype(ps, some, shacl)
      }
    }

    // ---- allValuesFrom ----
    if (all != null) {
      if (all.hasProperty(OWL.unionOf)) {
        ps.addProperty(shaclProp("or", shacl), createOrList(all, shacl))
      } else {
        addClassOrDatatype(ps, all, shacl)
      }
    }

    addMinCountIfNeeded(restriction, ps, shacl)
    addCardinality(restriction, ps, shacl)

    nodeShape.addProperty(shaclProp("property", shacl), ps)
  }

  // ---------------------------
  // NodeShape generation
  // ---------------------------

  private def generateNodeShape(cls: Resource, ontology: Model, shacl: Model): Unit = {
    val ns = shacl.createResource(cls.getURI + "Shape")
    ns.addProperty(RDF.`type`, shacl.createResource(SH + "NodeShape"))
    ns.addProperty(shaclProp("targetClass", shacl), cls)

    ontology
      .listStatements(cls, RDFS.subClassOf, null)
      .asScala
      .map(_.getObject)
      .collect {
        case r: Resource if r.hasProperty(RDF.`type`, OWL.Restriction) => r
      }
      .foreach(generatePropertyShape(_, shacl, ns))
  }

  // ---------------------------
  // Public API
  // ---------------------------

  def generate(ontology: Model): Model = {
    val shacl = ModelFactory.createDefaultModel()

    shacl.setNsPrefix("sh", SH)
    shacl.setNsPrefix("owl", OWL.NS)
    shacl.setNsPrefix("rdfs", RDFS.getURI)

    ontology
      .listResourcesWithProperty(RDF.`type`, OWL.Class)
      .asScala
      .filter(_.isURIResource)
      .foreach(generateNodeShape(_, ontology, shacl))

    shacl
  }
}
