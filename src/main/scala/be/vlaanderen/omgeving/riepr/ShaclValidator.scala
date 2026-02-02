package be.vlaanderen.omgeving.riepr

import org.apache.jena.rdf.model.Model
import org.apache.jena.riot.RDFDataMgr
import org.apache.jena.shacl.{Shapes, ValidationReport}
import org.slf4j.LoggerFactory

/**
 * SHACL validator for RDF models.
 * 
 * Validates RDF data against SHACL constraints with detailed reporting.
 * 
 * ==Features==
 * - Load SHACL shapes from files
 * - Validate RDF models against constraints
 * - Detailed validation reports
 * - Logging with focus nodes and error paths
 * - Handle conformant/non-conformant data
 * 
 * ==Usage==
 * {{{
 * val shapes = ShaclValidator.loadShapes("shapes.ttl")
 * 
 * val model = ModelFactory.createDefaultModel()
 * model.add(
 *   model.createResource("http://example.org/subject"),
 *   model.createProperty("http://example.org/predicate"),
 *   model.createLiteral("value")
 * )
 * 
 * val report = ShaclValidator.validate(model, shapes)
 * ShaclValidator.printReport(report)
 * 
 * if (report.conforms()) {
 *   println("✅ Valid")
 * } else {
 *   println("❌ Invalid")
 *   report.getEntries.forEach { entry =>
 *     println(s"Error: ${entry.message}")
 *   }
 * }
 * }}}
 * 
 * ==Validation Report==
 * Contains:
 * - Conformance status
 * - Validation entries for errors
 * - Focus nodes (RDF nodes that failed)
 * - Property paths
 * - Error messages
 */
object ShaclValidator {

  private val logger = LoggerFactory.getLogger(getClass)

  /**
   * Loads SHACL shapes from a file.
   * 
   * This method reads a SHACL shapes file and parses it into a Shapes object
   * that can be used for validation.
   * 
   * @param shaclFile The path to the SHACL shapes file (Turtle format)
   * @return A Shapes object containing the parsed SHACL constraints
   * 
   * ==Example==
   * {{{
   * // Load SHACL shapes from the generated shapes file
   * val shaclShapes = ShaclValidator.loadShapes("src/main/resources/generated-shapes.ttl")
   * 
   * // Use the shapes for validation
   * val model = parseTurtle(new File("src/main/input/example.ttl"))
   * val report = ShaclValidator.validate(model, shaclShapes)
   * }}}
   * 
   * ==Supported Formats==
   * The method supports SHACL files in Turtle format (.ttl).
   * The file should contain valid SHACL shapes with proper namespace declarations.
   */
  def loadShapes(shaclFile: String): Shapes = {
    val shapesModel = RDFDataMgr.loadModel(shaclFile)
    Shapes.parse(shapesModel)
  }

  /**
   * Validates an RDF model against SHACL shapes.
   * 
   * This method performs the actual validation of RDF data against SHACL constraints.
   * It returns a detailed validation report that indicates whether the data conforms
   * to the shapes and provides specific error information for non-conformant data.
   * 
   * @param model The RDF model to validate
   * @param shapes The SHACL shapes to validate against
   * @return A ValidationReport containing the validation results
   * 
   * ==Example==
   * {{{
   * // Load data and shapes
   * val dataModel = parseTurtle(new File("src/main/input/activity/example.ttl"))
   * val shaclShapes = loadShapes("src/main/resources/generated-shapes.ttl")
   * 
   * // Perform validation
   * val report = ShaclValidator.validate(dataModel, shaclShapes)
   * 
   * // Process the results
   * if (report.conforms()) {
   *   println("✅ Data is valid according to SHACL constraints")
   *   // Proceed with further processing
   *   processModel(dataModel, inferenceOntology, reasoner, owlReasonerWithSchema, shaclShapes, frame, spark, file)
   * } else {
   *   println("❌ Data validation failed")
   *   report.getEntries.forEach { entry =>
   *     println(s"Validation error: ${entry.message}")
   *     println(s"  Focus node: ${entry.focusNode}")
   *     println(s"  Property path: ${entry.resultPath}")
   *   }
   *   // Handle validation errors appropriately
   * }
   * }}}
   * 
   * ==Note on getGraph==
   * The method uses `model.getGraph` to access the underlying Jena Graph,
   * which is required by the Jena SHACL validator implementation.
   */
  def validate(model: Model, shapes: Shapes): ValidationReport = {
    org.apache.jena.shacl.ShaclValidator.get.validate(shapes, model.getGraph) // let op getGraph
  }

  /**
   * Prints a validation report in a human-readable format.
   * 
   * This method logs the validation results using SLF4J logging,
   * providing clear indication of conformance status and detailed error information
   * for non-conformant data.
   * 
   * @param report The ValidationReport to print
   * 
   * ==Example==
   * {{{
   * // Validate and print results
   * val dataModel = parseTurtle(new File("src/main/input/installation/example.ttl"))
   * val shaclShapes = loadShapes("src/main/resources/generated-shapes.ttl")
   * val report = validate(dataModel, shaclShapes)
   * 
   * // Print the validation report
   * ShaclValidator.printReport(report)
   * 
   * // This will output something like:
   * // ✅ Model is conform SHACL
   * // or
   * // ❌ Model is NOT conform:
   * // - FocusNode: http://example.org/invalid-subject, Path: http://example.org/required-property, Message: Less than 1 values
   * }}}
   * 
   * ==Logging Levels==
   * - INFO level: Used for conformant models (✅ success message)
   * - WARN level: Used for non-conformant models (❌ error messages)
   * 
   * ==Report Format==
   * For conformant models: Single line with success indicator
   * For non-conformant models: Error header followed by detailed entries showing:
   * - FocusNode: The specific RDF node that failed validation
   * - Path: The property path where validation failed
   * - Message: Descriptive error message
   */
  def printReport(report: ValidationReport): Unit = {
    if (report.conforms()) {
      logger.info("✅ Model is conform SHACL")
    } else {
      logger.warn("❌ Model is NOT conform:")
      report.getEntries.forEach { e =>
        logger.warn(s"- FocusNode: ${e.focusNode}, Path: ${e.resultPath}, Message: ${e.message}")
      }
    }
  }
}
