# RIE-IEPR Data Conversion Application (Scala)

This Scala application provides a workflow for converting RDF/Turtle data to JSON-LD and Parquet format for use in a data lake and LDES server.

## Project Structure

```
src/main/scala/
└── TurtleTransformer.scala          # Main Scala application with all conversion logic

src/main/resources/
├── be/vlaanderen/omgeving/riepr/
│   └── data/id/jsonld/frame.json    # JSON-LD framing configuration
├── ssn-sosa-prov-p-plan.ttl         # Combined ontology
├── ssn-sosa_2023.ttl                # SSN-SOSA ontology
├── prov-o.ttl                       # PROV-O ontology
├── p-plan.ttl                       # P-Plan ontology
└── be/                              # Additional ontology files

src/main/input/
├── activiteit/                      # Activity data
├── bedrijf/                        # Company data
├── codelijsten/                     # Code lists
└── installatie/                     # Installation data

src/main/output/
├── json/                            # JSON output
├── jsonld/                          # JSON-LD output
├── parquet/                         # Parquet output
└── turtle/                          # Inferred Turtle output
```

## Workflow

The application follows this conversion workflow:

1. **Turtle Processing with Reasoning**
   - Loads ontologies from `.ttl` files in `src/main/resources/`
   - Loads reasoning rules from `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules`
   - Processes turtle files from `src/main/input/` recursively
   - Applies reasoning using Jena's GenericRuleReasoner
   - Writes inferred triples to `src/main/output/turtle/`

2. **JSON-LD Conversion**
   - Converts inferred RDF to JSON-LD
   - Applies JSON-LD framing using `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json`
   - Writes JSON-LD files to `src/main/output/jsonld/`

3. **JSON and Parquet Conversion**
   - Extracts `@graph` arrays from JSON-LD files
   - Writes JSON arrays to `src/main/output/json/`
   - Converts JSON arrays to Parquet files in `src/main/output/parquet/`

## Usage

### Running the Application

The application is a standalone Scala program that can be run directly:

```bash
# Compile and run using Maven
mvn compile exec:java -Dexec.mainClass="TurtleTransformer"
```

### Running with Spark

The application uses Apache Spark for Parquet conversion. Ensure you have Spark properly configured in your environment.

## Configuration

The application uses the following key resources:

- **Ontologies**: Located in `src/main/resources/` (SSN-SOSA, PROV-O, P-Plan)
- **JSON-LD Frame**: `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json`
- **Reasoning Rules**: `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules`
- **Input Data**: `src/main/input/` (recursively processes all `.ttl` files)
- **Output Data**: `src/main/output/` (json, jsonld, parquet, turtle directories)

## Dependencies

Key dependencies include:

- **Scala 2.13** - Programming language
- **Apache Jena** - RDF processing and reasoning
- **JSONLD-Java** - JSON-LD conversion
- **Jackson** - JSON processing
- **Apache Spark** - Parquet file format support
- **Apache Parquet** - Parquet file format

## Development

### Building

```bash
mvn clean compile
```

### Running

```bash
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
mvn exec:java -Dexec.mainClass="TurtleTransformer"
```

### Testing

The project includes test scripts:

- `test_json_conversion.sh` - Tests JSON conversion
- `test_json_processing.py` - Python tests for JSON processing
- `test_empty_json.py` - Tests for empty JSON handling

## Data Flow

```
Turtle Files (+ Ontologies + Rules)
    ↓ (Jena Reasoning)
Inferred Turtle Files
    ↓ (JSON-LD Conversion)
JSON-LD Files
    ↓ (JSON Extraction)
JSON Array Files
    ↓ (Spark Parquet Conversion)
Parquet Files
```

## Key Features

1. **Recursive File Processing**: Automatically finds and processes all `.ttl` files in the input directory and subdirectories
2. **Reasoning**: Applies Jena reasoning rules to infer additional triples
3. **JSON-LD Framing**: Uses JSON-LD framing to create structured JSON output
4. **Parquet Conversion**: Converts JSON data to efficient Parquet format using Spark
5. **Multiple Output Formats**: Generates Turtle, JSON, JSON-LD, and Parquet outputs

## Implementation Details

The `TurtleTransformer.scala` file contains all the logic:

- `loadFrame()`: Loads JSON-LD framing configuration
- `loadOntology()`: Loads RDF ontologies
- `listTurtleFiles()`: Recursively finds all `.ttl` files
- `parseTurtle()`: Parses Turtle files into Jena models
- `inferTriples()`: Applies reasoning to infer additional triples
- `modelToJsonLd()`: Converts RDF models to JSON-LD
- `frameJsonLd()`: Applies JSON-LD framing
- `extractGraph()`: Extracts `@graph` arrays from framed JSON-LD
- `writeGraphToParquet()`: Converts JSON to Parquet using Spark
- `writeModelToTurtle()`: Writes inferred models to Turtle format
- `writeJson()`: Writes JSON output files

## Notes

- The application preserves the directory structure of input files in output directories
- Each input Turtle file generates corresponding output files in all formats
- The workflow ensures that the final Parquet files contain the complete inferred data
- Reasoning includes domain/range inference, subproperty inference, and other rules defined in the rules file
- The application handles empty or invalid inputs gracefully by returning `None`/`Option` types
