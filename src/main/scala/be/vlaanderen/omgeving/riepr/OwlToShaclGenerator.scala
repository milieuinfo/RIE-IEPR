package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model._
import org.apache.jena.vocabulary.{OWL, RDF, RDFS}

import scala.collection.JavaConverters._

object OwlToShaclGenerator {

  val SH = "http://www.w3.org/ns/shacl#"

  private def createPath(prop: Resource, shacl: Model): RDFNode = {
    if (prop.hasProperty(OWL.inverseOf)) {
      val inv = prop.getPropertyResourceValue(OWL.inverseOf)
      if (inv != null && inv.isURIResource) {
        val blank = shacl.createResource()
        blank.addProperty(
          shacl.createProperty(SH + "inversePath"),
          shacl.createResource(inv.getURI)
        )
        blank
      } else {
        shacl.createResource(prop.getURI) // fallback
      }
    } else {
      shacl.createResource(prop.getURI)
    }
  }

  private def createOrList(unionClass: Resource, shacl: Model): RDFNode = {
    val listNode = unionClass.getPropertyResourceValue(OWL.unionOf)
    val rdfList = listNode.as(classOf[RDFList])
    val members = rdfList.iterator().asScala.toSeq

    val shapes = members.map { cls =>
      val b = shacl.createResource()
      b.addProperty(
        shacl.createProperty(SH + "class"),
        shacl.createResource(cls.asResource().getURI)
      )
      b
    }

    shacl.createList(shapes.iterator.asJava)
  }

  private def generatePropertyShape(
                                     restriction: Resource,
                                     shacl: Model,
                                     nodeShape: Resource
                                   ): Unit = {

    val onProp = restriction.getPropertyResourceValue(OWL.onProperty)
    val allValuesFrom = restriction.getPropertyResourceValue(OWL.allValuesFrom)

    if (onProp == null || allValuesFrom == null) return

    val propShape = shacl.createResource()
    propShape.addProperty(
      shacl.createProperty(SH + "path"),
      createPath(onProp, shacl)
    )

    // Voor owl:someValuesFrom, minCount = 1
    if (restriction.hasProperty(OWL.someValuesFrom)) {
      propShape.addLiteral(
        shacl.createProperty(SH + "minCount"),
        1 // Int literal, compiler kiest juiste overload
      )
    }

    // Voor owl:allValuesFrom
    if (allValuesFrom.hasProperty(OWL.unionOf)) {
      val orList = createOrList(allValuesFrom, shacl)
      propShape.addProperty(
        shacl.createProperty(SH + "or"),
        orList
      )
    } else if (allValuesFrom.isURIResource) {
      propShape.addProperty(
        shacl.createProperty(SH + "class"),
        shacl.createResource(allValuesFrom.getURI)
      )
    }

    nodeShape.addProperty(
      shacl.createProperty(SH + "property"),
      propShape
    )
  }

  private def generateNodeShape(
                                 cls: Resource,
                                 ontology: Model,
                                 shacl: Model
                               ): Unit = {

    val shape = shacl.createResource(cls.getURI + "Shape")
    shape.addProperty(RDF.`type`, shacl.createResource(SH + "NodeShape"))
    shape.addProperty(
      shacl.createProperty(SH + "targetClass"),
      shacl.createResource(cls.getURI)
    )

    // rdfs:subClassOf restricties
    val restrictions =
      ontology.listStatements(cls, RDFS.subClassOf, null)
        .asScala
        .map(_.getObject)
        .collect {
          case r: Resource if r.hasProperty(RDF.`type`, OWL.Restriction) => r
        }

    restrictions.foreach { r =>
      generatePropertyShape(r, shacl, shape)
    }
  }

  def generate(ontology: Model): Model = {
    val shacl = ModelFactory.createDefaultModel()

    shacl.setNsPrefix("sh", SH)
    shacl.setNsPrefix("owl", OWL.NS)
    shacl.setNsPrefix("rdfs", RDFS.getURI)

    // Alle OWL klassen
    val classes = ontology
      .listResourcesWithProperty(RDF.`type`, OWL.Class)
      .asScala
      .filter(_.isURIResource)

    classes.foreach { cls =>
      generateNodeShape(cls, ontology, shacl)
    }

    shacl
  }
}


