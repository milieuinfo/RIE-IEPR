package be.vlaanderen.omgeving.riepr

import be.vlaanderen.omgeving.rdfvalidator.RdfUtils
import org.apache.jena.rdf.model.ModelFactory
import org.apache.jena.vocabulary.{OWL, RDF, RDFS}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.io.File

class TurtleTransformerTest extends AnyFlatSpec with Matchers {

  "TurtleTransformer" should "parse valid Turtle file" in {
    // Create a temporary Turtle file
    val tempFile = File.createTempFile("test", ".ttl")
    tempFile.deleteOnExit()
    
    val turtleContent = """
@prefix ex: <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

ex:TestSubject a ex:TestClass ;
    ex:hasProperty ex:TestObject .
"""
    
    val writer = new java.io.FileWriter(tempFile)
    writer.write(turtleContent)
    writer.close()
    
    val model = RdfUtils.parseTurtle(tempFile)
    
    assert(model != null)
    assert(model.size() > 0)
  }

  it should "list Turtle files recursively" in {
    // Create temporary directory structure
    val tempDir = File.createTempFile("test", "")
    tempDir.delete()
    tempDir.mkdir()
    tempDir.deleteOnExit()
    
    val subDir = new File(tempDir, "subdir")
    subDir.mkdir()
    subDir.deleteOnExit()
    
    // Create some Turtle files
    val turtleFile1 = new File(tempDir, "test1.ttl")
    turtleFile1.createNewFile()
    turtleFile1.deleteOnExit()
    
    val turtleFile2 = new File(subDir, "test2.ttl")
    turtleFile2.createNewFile()
    turtleFile2.deleteOnExit()
    
    // Create non-Turtle file
    val txtFile = new File(tempDir, "test.txt")
    txtFile.createNewFile()
    txtFile.deleteOnExit()
    
    val turtleFiles = RdfUtils.listTurtleFiles(tempDir)
    
    assert(turtleFiles.size == 2)
    assert(turtleFiles.contains(turtleFile1))
    assert(turtleFiles.contains(turtleFile2))
    assert(!turtleFiles.contains(txtFile))
  }

  it should "load ontology from Turtle file" in {
    // Create a temporary ontology file
    val tempFile = File.createTempFile("ontology", ".ttl")
    tempFile.deleteOnExit()
    
    val ontologyContent = """
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

<http://example.org/TestClass> a owl:Class ;
    rdfs:subClassOf <http://example.org/ParentClass> .
"""
    
    val writer = new java.io.FileWriter(tempFile)
    writer.write(ontologyContent)
    writer.close()
    
    val ontology = RdfUtils.loadOntology(tempFile.getAbsolutePath)
    
    assert(ontology != null)
    assert(ontology.size() > 0)
  }

  it should "infer triples using reasoning" in {
    // Create a simple ontology with subclass relationship
    val ontology = ModelFactory.createDefaultModel()
    val parentClass = ontology.createResource("http://example.org/ParentClass")
    val childClass = ontology.createResource("http://example.org/ChildClass")
    
    parentClass.addProperty(RDF.`type`, OWL.Class)
    childClass.addProperty(RDF.`type`, OWL.Class)
    childClass.addProperty(RDFS.subClassOf, parentClass)
    
    // Create data model with instance of child class
    val dataModel = ModelFactory.createDefaultModel()
    val instance = dataModel.createResource("http://example.org/instance")
    instance.addProperty(RDF.`type`, dataModel.createResource("http://example.org/ChildClass"))
    
    // Create a simple reasoner (this would normally use the rule file)
    val reasoner = new org.apache.jena.reasoner.rulesys.GenericRuleReasoner(
      org.apache.jena.reasoner.rulesys.Rule.rulesFromURL("file:src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules")
    )
    reasoner.setDerivationLogging(true)
    
    val inferredModel = RdfUtils.inferTriples(dataModel, ontology, reasoner)
    
    assert(inferredModel != null)
    // The inferred model should contain the original data plus any inferred triples
    assert(inferredModel.size() >= dataModel.size())
  }

  it should "convert model to JSON-LD" in {
    val model = ModelFactory.createDefaultModel()
    val subject = model.createResource("http://example.org/subject")
    val predicate = model.createProperty("http://example.org/predicate")
    val objectResource = model.createResource("http://example.org/object")
    
    subject.addProperty(predicate, objectResource)
    
    val jsonLd = RdfUtils.modelToJsonLd(model)
    
    assert(jsonLd != null)
    assert(jsonLd.isDefined)
    assert(jsonLd.get != null)
  }

  it should "return None for empty model in modelToJsonLd" in {
    val emptyModel = ModelFactory.createDefaultModel()
    
    val jsonLd = RdfUtils.modelToJsonLd(emptyModel)
    
    jsonLd shouldBe None
  }

  it should "extract graph from framed JSON-LD" in {
    // Create a simple JSON-LD with @graph
    val jsonLdString = """
{
  "@context": {
    "ex": "http://example.org/"
  },
  "@graph": [
    {
      "@id": "ex:subject",
      "ex:predicate": "ex:object"
    }
  ]
}
"""
    
    val jsonLd = RdfUtils.mapper.readTree(jsonLdString)

    val graph = RdfUtils.extractGraph(jsonLd)

    assert(graph != null)
    assert(graph.isDefined)
    assert(graph.get.isArray)
    assert(graph.get.size() == 1)
  }

  it should "return None when @graph is missing" in {
    val jsonLdString = """
{
  "@context": {
    "ex": "http://example.org/"
  }
}
"""

    val jsonLd = RdfUtils.mapper.readTree(jsonLdString)

    val graph = RdfUtils.extractGraph(jsonLd)
    
    assert(graph.isEmpty)
  }

  it should "validate model against ontology" in {
    // Create a simple ontology
    val ontology = ModelFactory.createDefaultModel()
    val testClass = ontology.createResource("http://example.org/TestClass")
    testClass.addProperty(RDF.`type`, OWL.Class)
    
    // Create a valid model
    val validModel = ModelFactory.createDefaultModel()
    val instance = validModel.createResource("http://example.org/instance")
    instance.addProperty(RDF.`type`, validModel.createResource("http://example.org/TestClass"))
    
    // Create OWL reasoner
    val owlReasoner = org.apache.jena.reasoner.ReasonerRegistry.getOWLMiniReasoner
    val owlReasonerWithSchema = owlReasoner.bindSchema(ontology)
    
    val validationResult = RdfUtils.validateModel(validModel, owlReasonerWithSchema)
    
    assert(validationResult != null)
    // For a simple valid model, validation should pass
    assert(validationResult.valid)
  }
}