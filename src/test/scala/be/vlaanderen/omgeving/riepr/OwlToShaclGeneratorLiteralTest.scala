package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model._
import org.apache.jena.vocabulary.{OWL, RDF, RDFS, XSD}
import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should.Matchers
import scala.jdk.CollectionConverters._
import scala.collection.immutable.Seq

class OwlToShaclGeneratorLiteralTest extends AnyFunSuite with Matchers {

  val EX = "http://example.org/"
  val SH = "http://www.w3.org/ns/shacl#"

  private def createOntology(): Model = {
    val m = ModelFactory.createDefaultModel()
    m.setNsPrefix("ex", EX)
    m.setNsPrefix("owl", OWL.NS)
    m.setNsPrefix("rdfs", RDFS.getURI)
    m.setNsPrefix("xsd", XSD.NS)

    // --------------------------
    // 1. Node with owl:allValuesFrom xsd:date
    // --------------------------
    val DateClass = m.createResource(EX + "DateClass")
    m.add(DateClass, RDF.`type`, OWL.Class)
    val propDate = m.createProperty(EX + "propDate")
    val r1 = m.createResource()
    r1.addProperty(RDF.`type`, OWL.Restriction)
      .addProperty(OWL.onProperty, propDate)
      .addProperty(OWL.allValuesFrom, XSD.date)
    DateClass.addProperty(RDFS.subClassOf, r1)

    // --------------------------
    // 2. Node with owl:allValuesFrom (unionOf xsd:date xsd:dateTime)
    // --------------------------
    val UnionClass = m.createResource(EX + "UnionClass")
    m.add(UnionClass, RDF.`type`, OWL.Class)
    val propUnion = m.createProperty(EX + "propUnion")
    val unionList =
      m.createList(
        scala.collection.immutable
          .Seq(XSD.date, XSD.dateTime)
          .map(_.asInstanceOf[RDFNode])
          .iterator
          .asJava
      )


    val r2 = m.createResource()
    r2.addProperty(RDF.`type`, OWL.Restriction)
      .addProperty(OWL.onProperty, propUnion)
      .addProperty(OWL.allValuesFrom, m.createResource().addProperty(OWL.unionOf, unionList))
    UnionClass.addProperty(RDFS.subClassOf, r2)

    // --------------------------
    // 3. Node with object property to OtherClass
    // --------------------------
    val ObjectClass = m.createResource(EX + "ObjectClass")
    m.add(ObjectClass, RDF.`type`, OWL.Class)
    val propObj = m.createProperty(EX + "propObj")
    val OtherClass = m.createResource(EX + "OtherClass")
    m.add(OtherClass, RDF.`type`, OWL.Class) // voor object property
    val r3 = m.createResource()
    r3.addProperty(RDF.`type`, OWL.Restriction)
      .addProperty(OWL.onProperty, propObj)
      .addProperty(OWL.someValuesFrom, OtherClass)
    ObjectClass.addProperty(RDFS.subClassOf, r3)

    m
  }




  test("owl:someValuesFrom xsd:dateTime generates sh:datatype instead of sh:class") {



    // --- Arrange: mini OWL model ---
    val ontology = ModelFactory.createDefaultModel()

    val ex = "http://example.com/ns#"
    val MyClass = ontology.createResource(ex + "MyClass")
    val myProp  = ontology.createProperty(ex + "created")

    ontology.add(MyClass, RDF.`type`, OWL.Class)

    val restriction = ontology.createResource()
      .addProperty(RDF.`type`, OWL.Restriction)
      .addProperty(OWL.onProperty, myProp)
      .addProperty(OWL.someValuesFrom, XSD.dateTime)

    ontology.add(MyClass, RDFS.subClassOf, restriction)

    // --- Act ---
    val shacl = OwlToShaclGenerator.generate(ontology)

    val SH = "http://www.w3.org/ns/shacl#"
    val shDatatype = shacl.createProperty(SH + "datatype")
    val shClass    = shacl.createProperty(SH + "class")
    val shProperty = shacl.createProperty(SH + "property")

    // --- Assert ---
    val propertyShapes =
      shacl.listObjectsOfProperty(shProperty).toList

    propertyShapes should not be empty

    val ps = propertyShapes.get(0).asResource()

    // ✔ correct: datatype constraint
    ps.hasProperty(shDatatype, XSD.dateTime) shouldBe true

    // ❌ incorrect: class constraint must NOT be present
    ps.hasProperty(shClass, XSD.dateTime) shouldBe false
  }

  test("OwlToShaclGenerator handles owl:allValuesFrom xsd:date") {
    val ontology = createOntology()
    val shacl = OwlToShaclGenerator.generate(ontology)

    val propShapes = shacl
      .listResourcesWithProperty(shacl.createProperty(SH + "path"))
      .asScala
      .toList

    val dateShapeOpt =
      propShapes.find { ps =>
        ps.getPropertyResourceValue(shacl.createProperty(SH + "path"))
          .getURI
          .endsWith("propDate")
      }

    dateShapeOpt should not be empty

    val datatype =
      dateShapeOpt.get.getPropertyResourceValue(shacl.createProperty(SH + "datatype"))

    datatype should not be null
    datatype.getURI shouldBe XSD.date.getURI
  }


  test("OwlToShaclGenerator handles owl:allValuesFrom unionOf xsd:date xsd:dateTime") {
    val ontology = createOntology()
    val shacl = OwlToShaclGenerator.generate(ontology)

    val propShapes =
      shacl.listResourcesWithProperty(shacl.createProperty(SH + "path"))
        .asScala
        .toList

    val unionShapeOpt =
      propShapes.find { ps =>
        ps.getPropertyResourceValue(shacl.createProperty(SH + "path"))
          .getURI
          .endsWith("propUnion")
      }

    unionShapeOpt should not be empty

    val orList =
      unionShapeOpt.get.getPropertyResourceValue(shacl.createProperty(SH + "or"))

    orList should not be null

    val datatypes =
      orList
        .as(classOf[RDFList])
        .iterator()
        .asScala
        .map { node =>
          node
            .asResource()
            .getPropertyResourceValue(shacl.createProperty(SH + "datatype"))
        }
        .map(_.getURI)
        .toSet

    datatypes should contain allOf (
      XSD.date.getURI,
      XSD.dateTime.getURI
    )
  }


  test("OwlToShaclGenerator handles object property with someValuesFrom OtherClass") {
    val ontology = createOntology()
    val shacl = OwlToShaclGenerator.generate(ontology)

    val propShapes = shacl.listResourcesWithProperty(shacl.createProperty(SH + "path"))
      .asScala.toList

    val objShapeOpt = propShapes.find(_.getPropertyResourceValue(shacl.createProperty(SH + "path")).getURI.endsWith("propObj"))
    objShapeOpt should not be empty

    val cls = objShapeOpt.get.getPropertyResourceValue(shacl.createProperty(SH + "class"))
    cls should not be null
    cls.getURI shouldBe "http://example.org/OtherClass"

    // minCount = 1 should be automatically set for someValuesFrom
    val minCount = objShapeOpt.get.getProperty(shacl.createProperty(SH + "minCount")).getInt
    minCount shouldBe 1
  }
  test("OwlToShaclGenerator handles multiple xsd:dateTime literals") {
    val ontology = ModelFactory.createDefaultModel()
    val EX = "http://example.org/"
    ontology.setNsPrefix("ex", EX)
    ontology.setNsPrefix("owl", OWL.NS)
    ontology.setNsPrefix("xsd", XSD.NS)
    ontology.setNsPrefix("rdfs", RDFS.getURI)

    val DateTimeClass = ontology.createResource(EX + "DateTimeClass")
    ontology.add(DateTimeClass, RDF.`type`, OWL.Class)
    val propDateTime = ontology.createProperty(EX + "propDateTime")

    val r = ontology.createResource()
      .addProperty(RDF.`type`, OWL.Restriction)
      .addProperty(OWL.onProperty, propDateTime)
      .addProperty(OWL.allValuesFrom, XSD.dateTime)

    // Stel dat er meerdere datetimes zijn → moet nog steeds sh:class xsd:dateTime worden
    DateTimeClass.addProperty(RDFS.subClassOf, r)
    DateTimeClass.addProperty(RDFS.subClassOf, r) // duplicate intentionally

    val shacl = OwlToShaclGenerator.generate(ontology)

    val propShapes = shacl.listResourcesWithProperty(shacl.createProperty(SH + "path"))
      .asScala.toList

    val dtShapeOpt = propShapes.find(_.getPropertyResourceValue(shacl.createProperty(SH + "path")).getURI.endsWith("propDateTime"))
    dtShapeOpt should not be empty

    val dt = dtShapeOpt.get.getPropertyResourceValue(shacl.createProperty(SH + "datatype"))
    dt should not be null
    dt.getURI shouldBe XSD.dateTime.getURI

  }


}
