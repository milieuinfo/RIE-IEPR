import org.eclipse.rdf4j.model.impl.LinkedHashModel
import org.eclipse.rdf4j.model.vocabulary.RDF
import org.eclipse.rdf4j.model.impl.SimpleValueFactory
import org.eclipse.rdf4j.rio.Rio
import org.eclipse.rdf4j.rio.RDFFormat
import java.io.StringWriter

object TestJsonLD extends App {
  val vf = SimpleValueFactory.getInstance()
  val model = new LinkedHashModel()

  model.add(vf.createIRI("http://example.org/a"),
    RDF.TYPE,
    vf.createIRI("http://example.org/B"))

  val writer = new StringWriter()
  Rio.write(model, writer, RDFFormat.JSONLD)

  println(writer.toString)
}
