package be.vlaanderen.omgeving.riepr

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.github.jsonldjava.core.{JsonLdOptions, JsonLdProcessor}
import com.github.jsonldjava.utils.JsonUtils
import org.apache.jena.assembler.assemblers.AssemblerGroup.Frame
import org.apache.jena.rdf.model.{Model, ModelFactory}
import org.apache.jena.reasoner.rulesys.{GenericRuleReasoner, Rule}
import org.apache.jena.reasoner.{Reasoner, ReasonerRegistry}
import org.apache.jena.riot.{Lang, RDFParser}
import org.apache.jena.shacl.Shapes
import org.apache.spark.sql.SparkSession
import org.slf4j.LoggerFactory

import java.io._
import scala.collection.JavaConverters._

case class ValidationResult(
                             valid: Boolean,
                             messages: Seq[String]
                           )

  /**
   * Main application for converting RDF/Turtle data to JSON-LD and Parquet.
   *
   * This application provides an end-to-end processing pipeline for RDF data:
   *  - ontology loading and preprocessing
   *  - rule-based and OWL reasoning
   *  - SHACL validation
   *  - JSON-LD conversion with framing
   *  - Parquet generation using Apache Spark
   *
   * The application is intended for batch processing of Turtle files
   * and supports both per-file and consolidated processing.
   *
   * @example
   * {{{
   * // Run from the command line
   * java -cp "target/classes:lib/*" be.vlaanderen.omgeving.riepr.TurtleTransformer
   *
   * // Or via Maven
   * mvn compile exec:java
   * }}}
   */
   */
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

    /**
     * Converts a Jena RDF [[Model]] to JSON-LD.
     *
     * The model is serialized using Jena's JSON-LD writer and parsed
     * into a Jackson [[JsonNode]]. Empty models are ignored.
     *
     * @param model RDF model to convert
     * @return a JSON-LD document wrapped in [[Some]], or [[None]] if the model is empty
     *
     * @example
     * {{{
     * val model = ModelFactory.createDefaultModel()
     * model.add(
     *   model.createResource("http://example.org/subject"),
     *   model.createProperty("http://example.org/predicate"),
     *   model.createLiteral("object")
     * )
     *
     * modelToJsonLd(model).foreach { json =>
     *   println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json))
     * }
     * }}}
     */

  def modelToJsonLd(model: Model): Option[JsonNode] = {
    if (model.isEmpty) return None
    val out = new ByteArrayOutputStream()
    model.write(out, "JSON-LD")
    val jsonString = out.toString("UTF-8")
    Some(mapper.readTree(jsonString))
  }

    /**
     * Applies a JSON-LD frame to a JSON-LD document.
     *
     * Framing restructures JSON-LD according to a given frame,
     * allowing projection, grouping, and shaping of the data.
     *
     * @param jsonLd the input JSON-LD document
     * @param frame the JSON-LD frame definition
     * @return the framed JSON-LD document, or [[None]] if framing fails
     *
     * @example
     * {{{
     * val framed = frameJsonLd(jsonLd, frame)
     * framed.foreach { result =>
     *   println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(result))
     * }
     * }}}
     */

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

    /**
     * Ensures that the parent directory of a file exists.
     *
     * Creates the directory structure if it does not yet exist.
     * Throws a [[RuntimeException]] if directory creation fails.
     */

    private def ensureParentDir(file: File): Unit = {
    val parent = file.getParentFile
    if (!parent.exists()) {
      if (!parent.mkdirs()) {
        throw new RuntimeException(s"Kon directory niet aanmaken: ${parent.getPath}")
      }
    }
  }

    /**
     * Extracts the `@graph` array from a framed JSON-LD document.
     *
     * JSON-LD framing typically wraps result data inside an `@graph` array.
     * This helper extracts that array for downstream processing.
     *
     * @param framed the framed JSON-LD document
     * @return the `@graph` array if present and an array, otherwise [[None]]
     *
     * @example
     * {{{
     * extractGraph(framed).foreach { graph =>
     *   println(s"Graph contains ${graph.size()} elements")
     * }
     * }}}
     */

    def extractGraph(framed: JsonNode): Option[JsonNode] =
    Option(framed.get("@graph")).filter(_.isArray)

    /**
     * Writes a JSON-LD `@graph` array to Parquet using Spark.
     *
     * Each graph element is treated as a JSON record and converted
     * into a Spark DataFrame. Columns are ordered heuristically
     * before being written to disk.
     *
     * @param graph the JSON-LD `@graph` array
     * @param inputPath original input file path (used for output resolution)
     * @param spark active Spark session
     */

    def writeGraphToParquet(graph: JsonNode, inputPath: String, spark: SparkSession): Unit = {
    import spark.implicits._
    import org.apache.spark.sql.functions._

    val outputPath = inputPath
      .replace("/input/", "/output/parquet/")
      .replace(".ttl", "")

    ensureParentDir(new File(outputPath))

    val records = graph.elements().asScala
      .map(n => mapper.writeValueAsString(n))
      .toSeq

    if (records.nonEmpty) {
      val df = spark.read.json(spark.createDataset(records))

      val preferredCols = Seq("uri", "type", "label")
      val orderedCols =
        preferredCols.filter(df.columns.contains) ++
          df.columns.filterNot(preferredCols.contains)

      df.select(orderedCols.map(col): _*)
        .coalesce(1)
        .write.mode("overwrite")
        .parquet(outputPath)
      val schemaJson = df.schema.json
      val writer = new FileWriter(outputPath + "/_schema.json")
      try writer.write(schemaJson)
      finally writer.close()

      //Files.write(Paths.get(outputPath + "/_schema.json"), schemaJson.getBytes("UTF-8"))
    }
  }

  /** JSON → bestand */
  def writeJson(json: JsonNode, inputPath: String, typ: String): Unit = {
    val file = new File(inputPath.replace("/input/", s"/output/$typ/").replace(".ttl", s".$typ"))
    ensureParentDir(file) // ✅ check / maak folders aan
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
    val file = new File(inputPath.replace("/input/", "/output/turtle/"))
    ensureParentDir(file) // ✅ check / maak folders aan
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

    /**
     * Executes the complete processing pipeline for a single RDF model.
     *
     * The pipeline consists of:
     *  - rule-based inference
     *  - Turtle serialization of inferred data
     *  - OWL validation
     *  - SHACL validation
     *  - JSON-LD conversion and framing
     *  - extraction of `@graph`
     *  - Parquet generation
     *
     * @param model input RDF model
     * @param inferenceOntology ontology used for rule-based inference
     * @param reasoner Jena rule reasoner
     * @param owlReasonerWithSchema OWL reasoner with bound schema
     * @param shaclShapes SHACL shapes for validation
     * @param frame JSON-LD frame definition
     * @param spark Spark session for Parquet output
     * @param file original input file (used for output paths)
     *
     * @example
     * {{{
     * val model = parseTurtle(new File("example.ttl"))
     * processModel(
     *   model,
     *   OntologySorter.structuralSubset,
     *   reasoner,
     *   owlReasonerWithSchema,
     *   shaclShapes,
     *   frame,
     *   spark,
     *   new File("example.ttl")
     * )
     * }}}
     */

    def processModel(model: Model, inferenceOntology: Model, reasoner: GenericRuleReasoner, owlReasonerWithSchema: Reasoner, shaclShapes: Shapes, frame: JsonNode, spark: SparkSession, file: File) = {
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

    /**
     * Application entry point.
     *
     * Initializes ontologies, reasoners, SHACL shapes, and Spark,
     * then processes all Turtle files in the input directory.
     * A consolidated model containing all input data is processed last.
     *
     * @param args command-line arguments (currently unused)
     *
     * @example
     * {{{
     * java -cp "target/classes:lib/*" be.vlaanderen.omgeving.riepr.TurtleTransformer
     * }}}
     */
 */

    def main(args: Array[String]): Unit = {
    val completeOntology = OntologySorter.completeOntology
    val inferenceOntology = OntologySorter.structuralSubset
    val reasoningOntology = OntologySorter.disjointSubset

    //val ontology = loadOntology("src/main/resources/ssn-sosa-fullprov-o-p-plan-geosparql-dbo.ttl")
    //val rieOntology = loadOntology("src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl")
    //ontology.add(rieOntology) // rie ontology added

    val shaclModel = OwlToShaclGenerator.generate(completeOntology)
    shaclModel.write(
      new FileOutputStream("src/main/resources/generated-shapes.ttl"),
      "TURTLE"
    )
    val shaclShapes = ShaclValidator.loadShapes("src/main/resources/generated-shapes.ttl")

    val frame = loadFrame("src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json")

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

    val completeDataModel = ModelFactory.createDefaultModel()


    val inputDir = new File("src/main/input")

    listTurtleFiles(inputDir).foreach { file =>
      logger.info(s"Processing: ${file.getPath}")

      val model = parseTurtle(file)
      completeDataModel.add(model)
      processModel(model, inferenceOntology, reasoner, owlReasonerWithSchema, shaclShapes, frame, spark, file)

    }

    processModel(completeDataModel, inferenceOntology, reasoner, owlReasonerWithSchema, shaclShapes, frame, spark, new File("src/main/input/consolidated/consolidated.ttl"))

    spark.stop()
  }
}
