package scala


import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.github.jsonldjava.core.{JsonLdOptions, JsonLdProcessor}
import com.github.jsonldjava.utils.JsonUtils
import org.apache.jena.rdf.model.{Model, ModelFactory}
import java.io._

import scala.collection.JavaConverters._


object JsonLdFlattenScala {

  val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  /** Turtle-bestand inlezen naar Jena Model */
  def parseTurtle(file: File): Model = {
    val model = ModelFactory.createDefaultModel()
    model.read(new FileInputStream(file), null, "TURTLE")
    model
  }

  /** Jena Model → JSON-LD als JsonNode */
  def modelToJsonLD(model: Model): JsonNode = {
    val out = new ByteArrayOutputStream()
    model.write(out, "JSON-LD") // Jena kan direct naar JSON-LD
    val jsonString = out.toString("UTF-8")
    mapper.readTree(jsonString)
  }

  /** JSON-LD framen via jsonld-java */
  def frameJsonLd(jsonLd: JsonNode, frame: JsonNode): JsonNode = {
    val options = new JsonLdOptions()
    val jsonLdObj = JsonUtils.fromString(jsonLd.toString)
    val frameObj  = JsonUtils.fromString(frame.toString)
    val framed = JsonLdProcessor.frame(jsonLdObj, frameObj, options)
    mapper.readTree(JsonUtils.toPrettyString(framed))
  }

  /** @graph extraheren */
  def extractGraph(framed: JsonNode): Option[JsonNode] =
    Option(framed.get("@graph")).filter(_.isArray)

  /** JSON → bestand schrijven */
  def writeJson(json: JsonNode, path: String, typ: String): Unit = {
    val file = new File(path.replace(".ttl", s".$typ"))
    file.getParentFile.mkdirs()
    val writer = new FileWriter(file)
    try JsonUtils.writePrettyPrint(writer, json)
    finally writer.close()
  }

  /** Main */
  def main(args: Array[String]): Unit = {
    val turtleFile = new File("src/main/input/activiteit/01-fabriek-proces.ttl")
    val frameFile  = new File("src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json")

    val model   = parseTurtle(turtleFile)
    val jsonLd  = modelToJsonLD(model)
    val frame   = mapper.readTree(scala.io.Source.fromFile(frameFile).mkString)
    val framed  = frameJsonLd(jsonLd, frame)
    val graph   = extractGraph(framed)

    println("=== JSON-LD ===")
    println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonLd))

    println("=== Framed JSON-LD ===")
    println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(framed))

    graph.foreach(g => writeJson(g, "output_graph.json", "json"))
    writeJson(framed, "output_framed.jsonld", "jsonld")
  }
}
