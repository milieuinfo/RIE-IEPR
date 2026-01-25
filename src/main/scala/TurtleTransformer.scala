import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.github.jsonldjava.core.{JsonLdOptions, JsonLdProcessor}
import com.github.jsonldjava.utils.JsonUtils
import org.apache.jena.rdf.model.{InfModel, Model, ModelFactory}
import org.apache.jena.reasoner.rulesys.GenericRuleReasoner
import org.apache.jena.reasoner.rulesys.Rule
import org.apache.jena.riot.{Lang, RDFDataMgr, RDFParser}
import org.apache.spark.sql.{DataFrame, SparkSession}

import java.io.{ByteArrayOutputStream, File, FileInputStream, FileOutputStream, FileWriter}

import scala.collection.JavaConverters._

object TurtleTransformer {

  // Hulpmethodes
  def loadFrame(path: String): Object =
    JsonUtils.fromString(
      scala.io.Source.fromFile(path, "utf-8").getLines.mkString
    )

  def loadOntology(path: String): Model = {
    val model = ModelFactory.createDefaultModel()
    RDFParser.create()
      .source(new FileInputStream(path))
      .lang(Lang.TURTLE)
      .parse(model)
    model
  }

  // Bestanden vinden
  def listTurtleFiles(dir: File): List[File] =
    Option(dir.listFiles()).getOrElse(Array.empty).toList.flatMap {
      case d if d.isDirectory => listTurtleFiles(d)
      case f if f.getName.endsWith(".ttl") => List(f)
      case _ => Nil
    }

  // Turtle → Jena Model
  def parseTurtle(file: File): Model = {
    val model = ModelFactory.createDefaultModel()
    RDFParser.create()
      .source(new FileInputStream(file))
      .lang(Lang.TTL)
      .parse(model)
    model
  }

  // Inference

  def inferTriples(
                    dataModel: Model,
                    ontologyModel: Model,
                    reasoner: GenericRuleReasoner
                  ): Model = {

    val reasonerWithSchema = reasoner.bindSchema(ontologyModel)
    val infModel = ModelFactory.createInfModel(reasonerWithSchema, dataModel)
    val result = ModelFactory.createDefaultModel()
    result.setNsPrefixes(ontologyModel)
    result.add(dataModel)
    result.add(infModel.getDeductionsModel)
    result
  }




  // Model → JSON-LD
  def modelToJsonLd(
                     model: Model
                   ): Option[Object] = {
    if (model.isEmpty) return None

    val out = new ByteArrayOutputStream()
    model.write(out, "JSON-LD")
    Some(JsonUtils.fromString(out.toString("UTF-8")))
  }

  // JSON-LD framen
  def frameJsonLd(
                   jsonLd: Object,
                   frame: Object
                 ): Option[java.util.Map[String, Object]] = {
    val options = new JsonLdOptions()
    try {
      Some(JsonLdProcessor.frame(jsonLd, frame, options))
    } catch {
      case _: NullPointerException =>
        None // leeg of ongeldig input → geen framing
    }
  }

  // @graph extraheren
  def extractGraph(
                    framed: java.util.Map[String, Object]
                  ): Option[JsonNode] = {
    val mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)

    val root = mapper.readTree(JsonUtils.toPrettyString(framed))
    Option(root.get("@graph")).filter(_.isArray)
  }


  // JSON → Parquet (Spark)
  def writeGraphToParquet(
                           graph: JsonNode,
                           inputPath: String,
                           spark: SparkSession
                         ): Unit = {

    val mapper = new ObjectMapper()
    mapper.registerModule(DefaultScalaModule)

    import spark.implicits._

    val records = graph.elements().asScala
      .map(n => mapper.writeValueAsString(n))
      .toSeq

    if (records.nonEmpty) {
      spark.read.json(spark.createDataset(records))
        .coalesce(1)
        .write.mode("overwrite")
        .parquet(inputPath.replace("/input/", "/output/parquet/").replace(".ttl", ""))
    }
  }

  // Write ttl
  def writeModelToTurtle(
                          model: Model,
                          inputPath: String
                        ): Unit = {
    val fos = new FileOutputStream(inputPath.replace("/input/", "/output/turtle/"))
    try {
      model.write(fos, "TURTLE") // Other formats: "RDF/XML", "N-TRIPLES", "TURTLE"
    }
    finally {
      fos.close()
    }
  }

  // Write json
  def writeJson(
                 json: JsonNode,
                 inputPath: String,
                 typ: String
               ): Unit = {
    val writer = new FileWriter(inputPath.replace("/input/", s"/output/${typ}/").replace(".ttl", s".${typ}"))
    try {
      JsonUtils.writePrettyPrint(writer, json)
    } finally {
      writer.close()
    }
  }

  def main(args: Array[String]): Unit = {

    val frame = loadFrame("src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json")
    val ontology = loadOntology("src/main/resources/ssn-sosa-prov-p-plan.ttl")
    val reasoner = new GenericRuleReasoner(Rule.rulesFromURL("src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules"))
    reasoner.setDerivationLogging(true)

    val spark = SparkSession.builder()
      .appName("TurtleTransformerExample")
      .master("local[*]")
      .getOrCreate()

    val inputDir = new File("src/main/input")

    listTurtleFiles(inputDir).foreach { file =>
      println(s"Processing: ${file.getPath}")

      val model = parseTurtle(file)

      val inferredModel = inferTriples(dataModel = model, ontologyModel = ontology, reasoner)

      writeModelToTurtle(
        inferredModel,
        file.getPath
      )

      for {
        jsonLd <- modelToJsonLd(model)
        framed <- frameJsonLd(jsonLd, frame)
        graph <- extractGraph(framed)
      } {
        writeJson(
          graph,
          file.getPath,
          "json"
        )
        // schrijf het hele framed object als "jsonld"
        val mapper = new ObjectMapper()
        mapper.registerModule(DefaultScalaModule)
        val framedJsonNode = mapper.readTree(JsonUtils.toPrettyString(framed))
        writeJson(
          framedJsonNode,
          file.getPath,
          "jsonld"
        )
        writeGraphToParquet(
          graph,
          file.getPath,
          spark
        )
      }
    }
    spark.stop()
  }

}