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
   - Processes example turtle files from `/home/gehau/git/RIE-IEPR/individual/turtle/`
   - Applies reasoning using Jena's GenericRuleReasoner
   - Writes inferred triples to `/home/gehau/git/RIE-IEPR/individual/turtle_inferred/`
   - Excludes ontology triples from output to keep only data-specific inferences

2. **JSON-LD Conversion**
   - Converts inferred RDF to JSON-LD using context from `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/context.json`
   - Applies JSON-LD framing to create array structures
   - Writes JSON-LD files to `/home/gehau/git/RIE-IEPR/individual/jsonld/`

3. **JSON and Parquet Conversion**
   - Extracts `@graph` arrays from JSON-LD files
   - Writes JSON arrays to `/home/gehau/git/RIE-IEPR/individual/json/`
   - Converts JSON arrays to Parquet files in `/home/gehau/git/RIE-IEPR/individual/parquet/`

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
- Input/output directories via Spring `@Value` annotations (currently configured to use absolute paths outside the project directory)
- Reasoning rules by modifying the `.rules` file
- JSON-LD context and framing in the JSON files

### Current Path Configuration

The application is currently configured to use absolute paths:

```properties
data.input.turtle=/home/gehau/git/RIE-IEPR/individual/turtle
data.output.turtle-inferred=/home/gehau/git/RIE-IEPR/individual/turtle_inferred
data.output.jsonld=/home/gehau/git/RIE-IEPR/individual/jsonld
data.output.json=/home/gehau/git/RIE-IEPR/individual/json
data.output.parquet=/home/gehau/git/RIE-IEPR/individual/parquet
```

To use relative paths or different locations, modify these properties in `src/main/resources/application.properties`.

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

## Recent Changes

### Version Update (Jan 22, 2026)

- **Fixed inference to exclude ontologies from output**: The turtle processing now filters inferred triples to include only data-specific URIs (starting with `https://data.riepr.omgeving.vlaanderen.be/`), excluding ontology triples from the output.

- **Fixed turtle processing workflow issues**:
  - Added missing `individual/turtle_inferred` directory with `.keep` file
  - Added missing `individual/jsonld` directory with `.keep` file
  - Fixed `findFilesRecursively` method to prevent infinite recursion
  - Fixed output file path calculation in `processTurtleFile` method
  - Fixed `DataConversionRunner` to properly handle individual workflow steps
  - Updated `processDirectory` to use root target directory consistently

- **Configuration changes**: Updated input/output paths to use absolute paths outside the project directory structure for better separation of concerns.

## Notes

- The application preserves the directory structure of input files in output directories
- Each step creates both individual files and combined/bundled files
- The workflow ensures that the final Parquet files can be converted back to the original Turtle format
- Reasoning includes domain/range inference, subproperty inference, and inverse property inference
- The application now excludes ontology triples from the inferred output to keep only data-specific inferences
- Fixed issues with infinite recursion and FileNotFoundException in the turtle processing workflow


                                                                                                                                                                                                                                                                                                                                         