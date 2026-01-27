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

  private def addCardinality(
                              restriction: Resource,
                              propShape: Resource,
                              shacl: Model
                            ): Unit = {

    def intLiteral(p: Property): Option[Int] =
      Option(restriction.getProperty(p))
        .map(_.getObject)
        .collect {
          case l: Literal if l.getDatatypeURI != null => l.getInt
        }

    intLiteral(OWL.minCardinality).foreach { min =>
      propShape.addLiteral(
        shacl.createProperty(SH + "minCount"),
        min
      )
    }

    intLiteral(OWL.maxCardinality).foreach { max =>
      propShape.addLiteral(
        shacl.createProperty(SH + "maxCount"),
        max
      )
    }

    intLiteral(OWL.cardinality).foreach { exact =>
      propShape.addLiteral(
        shacl.createProperty(SH + "minCount"),
        exact
      )
      propShape.addLiteral(
        shacl.createProperty(SH + "maxCount"),
        exact
      )
    }
  }


  private def createOrList(node: Resource, shacl: Model): RDFNode = {

    val rdfList =
      if (node.canAs(classOf[RDFList])) {
        // direct ( A B )
        node.as(classOf[RDFList])
      }
      else {
        // _:x owl:unionOf ( A B )
        val listNode = node.getPropertyResourceValue(OWL.unionOf)
        if (listNode == null)
          throw new IllegalArgumentException(
            s"Expected owl:unionOf or RDFList but got: $node"
          )
        listNode.as(classOf[RDFList])
      }

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
    if (onProp == null) return

    val allValuesFrom  = restriction.getPropertyResourceValue(OWL.allValuesFrom)
    val someValuesFrom = restriction.getPropertyResourceValue(OWL.someValuesFrom)


    val propShape = shacl.createResource()
    propShape.addProperty(
      shacl.createProperty(SH + "path"),
      createPath(onProp, shacl)
    )




    if (someValuesFrom != null) {

      // someValuesFrom met lijst
      if (someValuesFrom.canAs(classOf[RDFList])) {
        val rdfList = someValuesFrom.as(classOf[RDFList])
        val members = rdfList.iterator().asScala.toSeq

        val orList = shacl.createList(
          members.map { cls =>
            val b = shacl.createResource()
            b.addProperty(
              shacl.createProperty(SH + "class"),
              shacl.createResource(cls.asResource().getURI)
            )
            b
          }.iterator.asJava
        )

        propShape.addProperty(
          shacl.createProperty(SH + "or"),
          orList
        )
      }

      // Enkel klasse
      else if (someValuesFrom.isURIResource) {
        propShape.addProperty(
          shacl.createProperty(SH + "class"),
          shacl.createResource(someValuesFrom.getURI)
        )
      }
    }

    // owl:someValuesFrom ⇒ minCount = 1 (tenzij expliciet overschreven)
    if (restriction.hasProperty(OWL.someValuesFrom)
      && !restriction.hasProperty(OWL.minCardinality)
      && !restriction.hasProperty(OWL.cardinality)) {

      propShape.addLiteral(
        shacl.createProperty(SH + "minCount"),
        1
      )
    }

    // Cardinaliteiten
    addCardinality(restriction, propShape, shacl)


    // Voor owl:allValuesFrom
    if (allValuesFrom != null) {
      if (allValuesFrom.hasProperty(OWL.unionOf) || allValuesFrom.canAs(classOf[RDFList])) {
        val orList = createOrList(allValuesFrom, shacl)
        propShape.addProperty(
          shacl.createProperty(SH + "or"),
          orList
        )
      }
      else if (allValuesFrom.isURIResource) {
        propShape.addProperty(
          shacl.createProperty(SH + "class"),
          shacl.createResource(allValuesFrom.getURI)
        )
      }
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


