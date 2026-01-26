package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.Model
import org.apache.jena.shacl.Shapes

object ShaclTestUtil {

  def validate(model: Model, shapes: Shapes): Boolean = {
    val report = org.apache.jena.shacl.ShaclValidator.get().validate(shapes, model.getGraph)
    report.conforms()
  }
}
