package scala

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.github.jsonldjava.core.{JsonLdOptions, JsonLdProcessor}
import com.github.jsonldjava.utils.JsonUtils
import org.apache.jena.rdf.model.Model

import scala.collection.JavaConverters._

object JsonLdUtils {

  val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  /** Model → JSON-LD als JsonNode */
  def modelToJsonLd(model: Model): Option[JsonNode] = {
    if (model.isEmpty) return None
    val out = new java.io.ByteArrayOutputStream()
    model.write(out, "JSON-LD")
    Some(mapper.readTree(out.toString("UTF-8")))
  }

  /** Automatisch frame die alle properties van elke node opneemt */
  def frameJsonLdAuto(jsonLd: JsonNode): Option[JsonNode] = {
    try {
      val jsonLdObj = JsonUtils.fromString(jsonLd.toString)
      val graph = jsonLdObj.asInstanceOf[java.util.List[java.util.Map[String, Any]]]

      // Maak een frame met @embed = @always voor alle nodes
      val frame = graph.asScala.map { node =>
        val id = node.get("@id")
        val f = new java.util.HashMap[String, Any]()
        f.put("@id", id)
        f.put("@embed", "@always") // Alle properties opnemen
        f
      }.asJava

      val framed = JsonLdProcessor.frame(jsonLdObj, frame, new JsonLdOptions())
      Some(mapper.readTree(JsonUtils.toPrettyString(framed)))
    } catch {
      case ex: Exception =>
        ex.printStackTrace()
        None
    }
  }
}

