package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.vocabulary.{OWL, RDF, RDFS}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.io.{File, FileOutputStream}
import scala.io.Source

class OntologySorterTest extends AnyFlatSpec with Matchers {
  val completeOntology: Model = ModelFactory.createDefaultModel()
  RDFDataMgr.read(completeOntology, "src/test/resources/shacl-test-data/completeOntology.ttl")



  "OntologySorter" should "load complete ontology from resources" in {
    val ontology = completeOntology
    
    assert(ontology != null)
    assert(ontology.size() > 0)

    // Check that it contains some expected statements
    val hasStatements = ontology.listStatements().hasNext
    assert(hasStatements)
  }

  it should "extract structural subset correctly" in {
    val structuralSubset = OntologySorter.extractStructuralSubset(completeOntology)
    
    assert(structuralSubset != null)
    assert(structuralSubset.size() > 0)
    assert(structuralSubset.size() < completeOntology.size())
    
    // Check that structural subset contains expected relationships
    val hasSubClassOf = structuralSubset.listStatements(null, RDFS.subClassOf, null).hasNext
    val hasSubPropertyOf = structuralSubset.listStatements(null, RDFS.subPropertyOf, null).hasNext
    val hasDomain = structuralSubset.listStatements(null, RDFS.domain, null).hasNext
    val hasRange = structuralSubset.listStatements(null, RDFS.range, null).hasNext
    val hasInverseOf = structuralSubset.listStatements(null, OWL.inverseOf, null).hasNext
    
    hasSubClassOf shouldBe true
    hasSubPropertyOf shouldBe true
    hasDomain shouldBe true
    hasRange shouldBe true
    hasInverseOf shouldBe true
    
    // Check that structural subset does NOT contain disjointWith relationships
    val hasDisjointWith = structuralSubset.listStatements(null, OWL.disjointWith, null).hasNext
    hasDisjointWith shouldBe false
  }

  it should "extract disjoint subset correctly" in {
    val disjointSubset = OntologySorter.extractDisjointSubset(completeOntology)
    
    assert(disjointSubset != null)
    
    // Check that disjoint subset contains only disjointWith relationships
    val disjointStatements = disjointSubset.listStatements(null, OWL.disjointWith, null)
    
    // Count disjoint statements
    var disjointCount = 0
    while (disjointStatements.hasNext) {
      disjointStatements.next()
      disjointCount += 1
    }
    
    // The disjoint subset should contain only disjointWith statements
    assert(disjointSubset.size() == disjointCount)
    
    // Check that disjoint subset does NOT contain structural relationships
    val hasSubClassOf = disjointSubset.listStatements(null, RDFS.subClassOf, null).hasNext
    val hasSubPropertyOf = disjointSubset.listStatements(null, RDFS.subPropertyOf, null).hasNext
    val hasDomain = disjointSubset.listStatements(null, RDFS.domain, null).hasNext
    val hasRange = disjointSubset.listStatements(null, RDFS.range, null).hasNext
    val hasInverseOf = disjointSubset.listStatements(null, OWL.inverseOf, null).hasNext
    
    hasSubClassOf shouldBe false
    hasSubPropertyOf shouldBe false
    hasDomain shouldBe false
    hasRange shouldBe false
    hasInverseOf shouldBe false
  }

  it should "filter out blank nodes from structural subset" in {
    val structuralSubset = OntologySorter.extractStructuralSubset(completeOntology)
    
    // Check that no statements have blank nodes as subject or object
    val statements = structuralSubset.listStatements()
    
    while (statements.hasNext) {
      val stmt = statements.next()
      val subject = stmt.getSubject
      val obj = stmt.getObject
      
      if (subject.isAnon) {
        fail("Structural subset contains statement with blank node subject")
      }
      
      if (obj.isResource && obj.asResource().isAnon) {
        fail("Structural subset contains statement with blank node object")
      }
    }
  }

  it should "filter out blank nodes from disjoint subset" in {
    val disjointSubset = OntologySorter.extractDisjointSubset(completeOntology)
    
    // Check that no statements have blank nodes as subject or object
    val statements = disjointSubset.listStatements()
    
    while (statements.hasNext) {
      val stmt = statements.next()
      val subject = stmt.getSubject
      val obj = stmt.getObject
      
      if (subject.isAnon) {
        fail("Disjoint subset contains statement with blank node subject")
      }
      
      if (obj.isResource && obj.asResource().isAnon) {
        fail("Disjoint subset contains statement with blank node object")
      }
    }
  }

  it should "compare structural subset with expected file" in {
    // Load the expected structural subset from file
    val expectedModel = ModelFactory.createDefaultModel()
    
    // Check if the expected file exists
    val expectedFile = new File("src/test/resources/shacl-test-data/structuralSubset.ttl")
    if (expectedFile.exists()) {
      expectedModel.read(Source.fromFile(expectedFile).reader(), null, "TURTLE")
      
      val actualModel = OntologySorter.extractStructuralSubset(completeOntology)
      
      // Compare the models
      expectedModel.isIsomorphicWith(actualModel) shouldBe true
    } else {
      // If expected file doesn't exist, create it for future reference
      val actualModel = OntologySorter.extractStructuralSubset(completeOntology)
      val fos = new FileOutputStream(expectedFile)
      try {
        actualModel.write(fos, "TURTLE")
      } finally {
        fos.close()
      }
      
      // File created, test will pass on next run
      cancel("Expected structural subset file created, test will pass on next run")
    }
  }

  it should "compare disjoint subset with expected file" in {
    // Load the expected disjoint subset from file
    val expectedModel = ModelFactory.createDefaultModel()
    
    // Check if the expected file exists
    val expectedFile = new File("src/test/resources/shacl-test-data/disjointSubset.ttl")
    if (expectedFile.exists()) {
      expectedModel.read(Source.fromFile(expectedFile).reader(), null, "TURTLE")
      
      val actualModel = OntologySorter.extractDisjointSubset(completeOntology)
      
      // Compare the models
      expectedModel.isIsomorphicWith(actualModel) shouldBe true
    } else {
      // If expected file doesn't exist, create it for future reference
      val actualModel = OntologySorter.extractDisjointSubset(completeOntology)
      val fos = new FileOutputStream(expectedFile)
      try {
        actualModel.write(fos, "TURTLE")
      } finally {
        fos.close()
      }
      
      // File created, test will pass on next run
      cancel("Expected disjoint subset file created, test will pass on next run")
    }
  }

  it should "verify subset sizes are reasonable" in {
    val structuralSubset = OntologySorter.extractStructuralSubset(completeOntology)
    val disjointSubset = OntologySorter.extractDisjointSubset(completeOntology)
    
    // Structural subset should be significantly smaller than complete ontology
    assert(structuralSubset.size() < (completeOntology.size() * 0.8))
    
    // Disjoint subset should be much smaller than structural subset
    if (disjointSubset.size() > 0) {
      assert(disjointSubset.size() < (structuralSubset.size() * 0.5))
    }
    
    // Sum of subsets should be less than complete ontology (due to overlap filtering)
    val totalSubsetSize = structuralSubset.size() + disjointSubset.size()
    assert(totalSubsetSize < completeOntology.size())
  }

  it should "handle lazy evaluation correctly" in {
    // Access the complete ontology to trigger loading
    val ontology1 = OntologySorter.completeOntology
    
    // Access again - should return the same cached instance
    val ontology2 = OntologySorter.completeOntology
    
    // Both should be the same instance (lazy evaluation caching)
    ontology1 should be theSameInstanceAs ontology2
    
    // Same for subsets
    val structural1 = OntologySorter.structuralSubset
    val structural2 = OntologySorter.structuralSubset
    structural1 should be theSameInstanceAs structural2
    
    val disjoint1 = OntologySorter.disjointSubset
    val disjoint2 = OntologySorter.disjointSubset
    disjoint1 should be theSameInstanceAs disjoint2
  }
}