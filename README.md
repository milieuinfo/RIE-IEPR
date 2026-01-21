# RIE-IEPR Data Conversion Application

This Spring Boot application provides a workflow for converting RDF/Turtle data to JSON-LD and Parquet format for use in a data lake and LDES server.

## Project Structure

```
src/main/java/be/vlaanderen/omgeving/riepr/
├── RieprApplication.java              # Main Spring Boot application
├── controller/
│   └── DataConversionController.java  # REST API endpoints
├── service/
│   ├── OntologyService.java           # Loads ontologies from TTL files
│   ├── RulesService.java              # Loads Jena reasoning rules
│   ├── TurtleProcessingService.java   # Processes turtle files with reasoning
│   ├── JsonLdConversionService.java   # Converts RDF to JSON-LD
│   └── JsonToParquetService.java      # Converts JSON to Parquet
├── runner/
│   └── DataConversionRunner.java      # Command line runner
├── config/
│   └── ParquetConfig.java            # Parquet configuration
└── util/
    └── FileUtils.java                 # File utility methods
```

## Workflow

The application follows this conversion workflow:

1. **Turtle Processing with Reasoning**
   - Loads ontologies from `.ttl` files in `src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/`, `org/`, and `eu/` directories
   - Loads reasoning rules from `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules`
   - Processes example turtle files from `src/main/resources/individual/turtle/`
   - Applies reasoning using Jena's GenericRuleReasoner
   - Writes inferred triples to `src/main/resources/individual/turtle_inferred/`

2. **JSON-LD Conversion**
   - Converts inferred RDF to JSON-LD using context from `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/context.json`
   - Applies JSON-LD framing to create array structures
   - Writes JSON-LD files to `src/main/resources/individual/jsonld/`

3. **JSON and Parquet Conversion**
   - Extracts `@graph` arrays from JSON-LD files
   - Writes JSON arrays to `src/main/resources/individual/json/`
   - Converts JSON arrays to Parquet files in `src/main/resources/individual/parquet/`

## Usage

### Running the Application

1. **Build and run with Maven:**
   ```bash
   mvn spring-boot:run
   ```

2. **Run specific workflow steps:**
   ```bash
   # Run full workflow
   mvn spring-boot:run -Dspring-boot.run.arguments="--run-full-workflow"
   
   # Run only turtle processing
   mvn spring-boot:run -Dspring-boot.run.arguments="--run-turtle-processing"
   
   # Run only JSON-LD conversion
   mvn spring-boot:run -Dspring-boot.run.arguments="--run-jsonld-conversion"
   
   # Run only Parquet conversion
   mvn spring-boot:run -Dspring-boot.run.arguments="--run-parquet-conversion"
   ```

### Using the REST API

The application provides REST endpoints at `http://localhost:8080/api/conversion`:

- `GET /api/conversion/status` - Get application status and loaded ontologies
- `GET /api/conversion/run-full-workflow` - Run complete conversion workflow
- `GET /api/conversion/run-turtle-processing` - Run turtle processing only
- `GET /api/conversion/run-jsonld-conversion` - Run JSON-LD conversion only
- `GET /api/conversion/run-parquet-conversion` - Run Parquet conversion only

## Configuration

The application uses Spring Boot's standard configuration. You can customize:

- Server port in `application.properties`
- Input/output directories via Spring `@Value` annotations
- Reasoning rules by modifying the `.rules` file
- JSON-LD context and framing in the JSON files

## Dependencies

Key dependencies include:

- **Spring Boot 3.5.8** - Core framework
- **Apache Jena 4.10.0** - RDF processing and reasoning
- **JSONLD-Java 0.13.3** - JSON-LD conversion
- **Jackson** - JSON processing
- **Apache Parquet** - Parquet file format support
- **Hadoop** - Required for Parquet functionality

## Development

### Building

```bash
mvn clean package
```

### Testing

```bash
mvn test
```

### Running Tests

The application includes basic tests in `src/test/java/`. You can run them with:

```bash
mvn test
```

## Data Flow

```
Turtle Files (+ Ontologies + Rules)
    ↓ (Jena Reasoning)
Inferred Turtle Files
    ↓ (JSON-LD Conversion)
JSON-LD Files
    ↓ (JSON Extraction)
JSON Array Files
    ↓ (Parquet Conversion)
Parquet Files
```

## Notes

- The application preserves the directory structure of input files in output directories
- Each step creates both individual files and combined/bundled files
- The workflow ensures that the final Parquet files can be converted back to the original Turtle format
- Reasoning includes domain/range inference, subproperty inference, and inverse property inference


                                                                                                                                                                                                                                                                                                                                         