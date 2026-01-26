import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.github.jsonldjava.core.{JsonLdOptions, JsonLdProcessor}
import com.github.jsonldjava.utils.JsonUtils
import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.apache.jena.reasoner.rulesys.{GenericRuleReasoner, Rule}
import org.apache.jena.reasoner.{Reasoner, ReasonerRegistry}
import org.apache.jena.riot.{Lang, RDFParser}
import org.apache.spark.sql.SparkSession
import org.slf4j.LoggerFactory

import java.io.{ByteArrayOutputStream, File, FileInputStream, FileOutputStream, FileWriter}
import scala.collection.JavaConverters._

case class ValidationResult(
                             valid: Boolean,
                             messages: Seq[String]
                           )


object TurtleTransformer {

  // ------------------------
  // Logging
  // ------------------------
  private val logger = LoggerFactory.getLogger(getClass)

  // ------------------------
  // ObjectMapper hergebruiken
  // ------------------------
  val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  // ------------------------
  // JSON-LD Hulpmethodes
  // ------------------------

  /** Model → JSON-LD als JsonNode */
  def modelToJsonLd(model: Model): Option[JsonNode] = {
    if (model.isEmpty) return None
    val out = new ByteArrayOutputStream()
    model.write(out, "JSON-LD")
    val jsonString = out.toString("UTF-8")
    Some(mapper.readTree(jsonString))
  }

  /** JSON-LD framen → JsonNode */
  def frameJsonLd(jsonLd: JsonNode, frame: JsonNode): Option[JsonNode] = {
    val options = new JsonLdOptions()
    try {
      val jsonLdObj = JsonUtils.fromString(jsonLd.toString)
      val frameObj  = JsonUtils.fromString(frame.toString)

      val framed = JsonLdProcessor.frame(jsonLdObj, frameObj, options)
      Some(mapper.readTree(JsonUtils.toPrettyString(framed)))
    } catch {
      case _: Exception => None
    }
  }


  /** @graph extraheren als JsonNode */
  def extractGraph(framed: JsonNode): Option[JsonNode] =
    Option(framed.get("@graph")).filter(_.isArray)

  /** JSON → Parquet (Spark) */
  def writeGraphToParquet(graph: JsonNode, inputPath: String, spark: SparkSession): Unit = {
    import spark.implicits._
    val records = graph.elements().asScala.map(n => mapper.writeValueAsString(n)).toSeq
    if (records.nonEmpty) {
      spark.read.json(spark.createDataset(records))
        .coalesce(1)
        .write.mode("overwrite")
        .parquet(inputPath.replace("/input/", "/output/parquet/").replace(".ttl", ""))
    }
  }

  /** JSON → bestand */
  def writeJson(json: JsonNode, inputPath: String, typ: String): Unit = {
    val file = new File(inputPath.replace("/input/", s"/output/$typ/").replace(".ttl", s".$typ"))
    file.getParentFile.mkdirs() // folder aanmaken indien nodig
    val writer = new FileWriter(file)
    try JsonUtils.writePrettyPrint(writer, json)
    finally writer.close()
  }

  // ------------------------
  // Jena Hulpmethodes
  // ------------------------

  /** Turtle-bestand laden naar Jena Model */
  def parseTurtle(file: File): Model = {
    val model = ModelFactory.createDefaultModel()
    RDFParser.create()
      .source(new FileInputStream(file))
      .lang(Lang.TTL)
      .parse(model)
    model
  }

  /** Ontologie laden */
  def loadOntology(path: String): Model = {
    val model = ModelFactory.createDefaultModel()
    RDFParser.create()
      .source(new FileInputStream(path))
      .lang(Lang.TURTLE)
      .parse(model)
    model
  }

  /** Inferentie uitvoeren */
  def inferTriples(dataModel: Model, ontologyModel: Model, reasoner: GenericRuleReasoner): Model = {
    val reasonerWithSchema = reasoner.bindSchema(ontologyModel)
    val infModel = ModelFactory.createInfModel(reasonerWithSchema, dataModel)
    val result = ModelFactory.createDefaultModel()
    result.setNsPrefixes(ontologyModel)
    result.add(dataModel)
    result.add(infModel.getDeductionsModel)
    result
  }

  /** Validatie t.o.v. ontologie */
  def validateModel(model: Model, owlReasonerWithSchema: Reasoner): ValidationResult = {
    //val owlReasoner = ReasonerRegistry.getOWLReasoner
    //val owlReasoner = ReasonerRegistry.getOWLMiniReasoner
    //val owlReasonerWithSchema = owlReasoner.bindSchema(ontology) // Voeg ontology toe aan reasoner
    val infModel = ModelFactory.createInfModel(owlReasonerWithSchema, model) // gebruik inferredModel

    val report = infModel.validate()
    val messages =
      if (report.isValid) Seq.empty
      else report.getReports.asScala.map(_.getDescription).toSeq

    ValidationResult(report.isValid, messages)
  }

  /** Alle Turtle-bestanden in map (recursief) */
  def listTurtleFiles(dir: File): List[File] =
    Option(dir.listFiles()).getOrElse(Array.empty).toList.flatMap {
      case d if d.isDirectory => listTurtleFiles(d)
      case f if f.getName.endsWith(".ttl") => List(f)
      case _ => Nil
    }

  /** Model → Turtle-bestand */
  def writeModelToTurtle(model: Model, inputPath: String): Unit = {
    val fos = new FileOutputStream(inputPath.replace("/input/", "/output/turtle/"))
    try model.write(fos, "TURTLE")
    finally fos.close()
  }

  // ------------------------
  // JSON Frame laden
  // ------------------------
  def loadFrame(path: String): JsonNode = {
    val jsonString = scala.io.Source.fromFile(path, "utf-8").getLines().mkString
    mapper.readTree(jsonString)
  }

  // ------------------------
  // Main
  // ------------------------
  def main(args: Array[String]): Unit = {

    val ontology = loadOntology("src/main/resources/ssn-sosa-fullprov-o-p-plan.ttl")

    val shaclModel = OwlToShaclGenerator.generate(ontology)
    shaclModel.write(
      new FileOutputStream("src/main/resources/generated-shapes.ttl"),
      "TURTLE"
    )
    val shaclShapes = ShaclValidator.loadShapes("src/main/resources/generated-shapes.ttl")

    val frame = loadFrame("src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json")
    val inferenceOntology = loadOntology("src/main/resources/inference_source.ttl")
    val reasoningOntology = loadOntology("src/main/resources/class-disjointness.ttl")
    val reasoner = new GenericRuleReasoner(
      Rule.rulesFromURL("src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules")
    )
    reasoner.setDerivationLogging(true)

    //val owlReasoner = ReasonerRegistry.getOWLMiniReasoner
    //val owlReasonerWithSchema = owlReasoner.bindSchema(ontology) // Voeg ontology toe aan reasoner
    lazy val owlReasonerWithSchema =
      ReasonerRegistry
        .getOWLMiniReasoner
        .bindSchema(reasoningOntology)

    val spark = SparkSession.builder()
      .appName("TurtleTransformerExample")
      .master("local[*]")
      .getOrCreate()

    val inputDir = new File("src/main/input")

    listTurtleFiles(inputDir).foreach { file =>
      logger.info(s"Processing: ${file.getPath}")

      val model = parseTurtle(file)

      val inferredModel = inferTriples(model, inferenceOntology, reasoner)

      // Schrijf Turtle
      writeModelToTurtle(inferredModel, file.getPath)

      // OWL reasoning
      val validation = validateModel(inferredModel, owlReasonerWithSchema) // gebruik inferredModel
      //val validation = validateModel(model, owlReasonerWithSchema) // gebruik model
      if (!validation.valid) {
        validation.messages.foreach(m =>
          logger.warn(s"❌ [MODEL INVALID] ${file.getName}: $m")
        )
      }

      // Shacl validation
      val report = ShaclValidator.validate(inferredModel, shaclShapes) // gebruik inferredModel
      ShaclValidator.printReport(report)

      // JSON-LD verwerking
      for {
        jsonLd <- modelToJsonLd(inferredModel) // gebruik inferredModel
        //jsonLd <- modelToJsonLd(model) // gebruik model
        framed <- frameJsonLd(jsonLd, frame)
        graph <- extractGraph(framed)
      } {
        writeJson(graph, file.getPath, "json")       // alleen @graph
        writeJson(framed, file.getPath, "jsonld")   // volledig framed document
        writeGraphToParquet(graph, file.getPath, spark)
      }
    }

    spark.stop()
  }
}
