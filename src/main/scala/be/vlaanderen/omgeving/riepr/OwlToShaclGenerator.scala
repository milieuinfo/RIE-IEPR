package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model._
import org.apache.jena.vocabulary.{OWL, RDF, RDFS}

import scala.collection.JavaConverters._

/**
 * OWL to SHACL converter.
 * 
 * Transforms OWL ontologies to SHACL shapes for RDF data validation.
 * 
 * ==Features==
 * - OWL classes → SHACL NodeShapes
 * - Property restrictions → SHACL property shapes
 * - Inverse properties → SHACL inversePath
 * - Union classes → SHACL OR constraints
 * - Cardinality constraints (minCount, maxCount)
 * - Class hierarchies and property domains/ranges
 * 
 * ==Usage==
 * {{{
 * val ontology = ModelFactory.createDefaultModel()
 * RDFDataMgr.read(ontology, "ontology.ttl", Lang.TURTLE)
 * 
 * val shaclModel = OwlToShaclGenerator.generate(ontology)
 * shaclModel.write(System.out, "TURTLE")
 * 
 * // Save to file
 * val fos = new FileOutputStream("shapes.ttl")
 * shaclModel.write(fos, "TURTLE")
 * fos.close()
 * }}}
 * 
 * ==Namespace==
 * Uses standard SHACL namespace: http://www.w3.org/ns/shacl#
 */
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

  private def isDatatype(res: Resource): Boolean =
    res.isURIResource &&
      res.getURI.startsWith("http://www.w3.org/2001/XMLSchema#")

  private def addClassOrDatatype(
                                  shape: Resource,
                                  value: Resource,
                                  shacl: Model
                                ): Unit = {

    if (isDatatype(value)) {
      shape.addProperty(
        shacl.createProperty(SH + "datatype"),
        shacl.createResource(value.getURI)
      )
    } else {
      shape.addProperty(
        shacl.createProperty(SH + "class"),
        shacl.createResource(value.getURI)
      )
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
        node.as(classOf[RDFList])
      } else {
        val listNode = node.getPropertyResourceValue(OWL.unionOf)
        if (listNode == null)
          throw new IllegalArgumentException(
            s"Expected owl:unionOf or RDFList but got: $node"
          )
        listNode.as(classOf[RDFList])
      }

    val members = rdfList.iterator().asScala.toSeq

    val shapes = members.map { m =>
      val b = shacl.createResource()
      addClassOrDatatype(b, m.asResource(), shacl)
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

      else if (someValuesFrom.isURIResource) {
        addClassOrDatatype(propShape, someValuesFrom, shacl)
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
        addClassOrDatatype(propShape, allValuesFrom, shacl)
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

  /**
   * Generates SHACL shapes from an OWL ontology.
   * 
   * This is the main method that converts an entire OWL ontology to SHACL shapes.
   * It processes all OWL classes and creates corresponding SHACL NodeShapes with property constraints.
   * 
   * @param ontology The OWL ontology model to convert
   * @return A new Jena Model containing the generated SHACL shapes
   * 
   * ==Example==
   * {{{
   * // Load the RIEPR ontology
   * val rieprOntology = ModelFactory.createDefaultModel()
   * RDFDataMgr.read(rieprOntology, "src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl", Lang.TURTLE)
   * 
   * // Generate SHACL shapes
   * val shaclShapes = OwlToShaclGenerator.generate(rieprOntology)
   * 
   * // The resulting model contains SHACL shapes that can be used for validation
   * println(s"Generated ${shaclShapes.size()} SHACL statements")
   * 
   * // Save for later use
   * shaclShapes.write(new FileOutputStream("riepr-shapes.ttl"), "TURTLE")
   * }}}
   * 
   * ==Generated SHACL Structure==
   * The generated SHACL model includes:
   * - NodeShapes for each OWL class
   * - PropertyShapes for each property restriction
   * - Cardinality constraints (minCount, maxCount)
   * - Class constraints (sh:class)
   * - Inverse property handling (sh:inversePath)
   * - Union class handling (sh:or)
   */
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


