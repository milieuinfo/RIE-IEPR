package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.Model
import org.apache.jena.shacl.Shapes
import be.vlaanderen.omgeving.riepr.OwlToShaclGenerator
import be.vlaanderen.omgeving.riepr.ShaclValidator
import be.vlaanderen.omgeving.riepr.TurtleTransformer

object ShaclTestUtil {

  def validate(model: Model, shapes: Shapes): Boolean = {
    val report = ShaclValidator.get.validate(shapes, model.getGraph)
    report.conforms()
  }
}
