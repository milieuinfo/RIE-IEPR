# RIE-IEPR Data Model

This Scala application provides a workflow for converting RDF/Turtle data to JSON-LD and Parquet format for use in a data lake and LDES server.

## Project Structure

```
src/main/scala/
├── TurtleTransformer.scala          # Main Scala application with all conversion logic
├── OwlToShaclGenerator.scala        # Generates SHACL shapes from OWL ontology
└── ShaclValidator.scala             # Validates RDF models against SHACL shapes

src/main/resources/
├── be/vlaanderen/omgeving/riepr/
│   └── data/id/jsonld/frame.json    # JSON-LD framing configuration
├── ssn-sosa-fullprov-o-p-plan-geosparql.ttl         # Combined ontology
├── ssn-sosa_2023.ttl                # SSN-SOSA ontology
├── prov-o.ttl                       # PROV-O ontology
├── p-plan.ttl                       # P-Plan ontology
├── geosparql_vocab_all.ttl          # GeoSPARQL vocabulary
├── inference_source.ttl             # Inference ontology
├── class-disjointness.ttl           # Class disjointness rules
├── domain.ttl                       # Domain rules
├── range.ttl                        # Range rules
├── subClassOf.ttl                   # Subclass relationships
├── subpropertyOf.ttl                # Subproperty relationships
├── inverse.ttl                      # Inverse property definitions
└── be/                              # Additional ontology files

src/main/input/
├── activiteit/                      # Activity data
├── bedrijf/                        # Company data
├── codelijsten/                     # Code lists
├── exploitant/                     # Operator data
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

4. **SHACL Validation**
   - Generates SHACL shapes from OWL ontology
   - Validates inferred models against generated SHACL shapes
   - Provides detailed validation reports


## Usage

### Prerequisites

```bash
# Check for java 11
java --version
# If not 11 => something like
sudo apt install openjdk-11-jdk
echo 'export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
```

### Running the Application

The application is a standalone Scala program that can be run directly:

```bash
export PATH=$JAVA_HOME/bin:$PATH
mvn compile exec:java
```

**Important Note:** This application requires Java 11 to run due to Spark 3.5.1 compatibility. If you encounter `UnsupportedOperationException: getSubject is not supported` errors, ensure you're using Java 11 instead of Java 17 or 21.

### Running with Spark

The application uses Apache Spark for Parquet conversion. Ensure you have Spark properly configured in your environment.

## Configuration

The application uses the following key resources:

- **Ontologies**: Located in `src/main/resources/` (SSN-SOSA, PROV-O, P-Plan, GeoSPARQL)
- **JSON-LD Frame**: `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json`
- **Reasoning Rules**: `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules`
- **Inference Ontology**: `src/main/resources/inference_source.ttl`
- **Reasoning Ontology**: `src/main/resources/class-disjointness.ttl`
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
6. **SHACL Validation**: Generates SHACL shapes from OWL ontology and validates data
7. **OWL Validation**: Validates models against OWL reasoning

## Implementation Details

The application consists of three main Scala files:

### TurtleTransformer.scala

The main application file containing the core conversion logic:

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
- `validateModel()`: Validates models using OWL reasoning

### OwlToShaclGenerator.scala

Generates SHACL shapes from OWL ontology:

- `generate()`: Main method that creates SHACL model from OWL ontology
- `generateNodeShape()`: Creates SHACL NodeShape for each OWL class
- `generatePropertyShape()`: Creates SHACL property shapes from OWL restrictions
- `createPath()`: Handles property paths including inverse properties
- `createOrList()`: Creates SHACL OR constraints from OWL union classes

### ShaclValidator.scala

Validates RDF models against SHACL shapes:

- `loadShapes()`: Loads SHACL shapes from file
- `validate()`: Validates model against SHACL shapes
- `printReport()`: Prints validation results in readable format

## Validation Process

The application performs two types of validation:

### OWL Validation
Uses Jena's OWL reasoner to validate the inferred model against the reasoning ontology. This validation checks for logical consistency and class hierarchies.

### SHACL Validation
The application automatically generates SHACL shapes from the OWL ontology using the `OwlToShaclGenerator` and then validates the inferred model against these shapes using the `ShaclValidator`. This process includes:

1. **Shape Generation**: The `OwlToShaclGenerator.generate()` method creates SHACL shapes from OWL restrictions:
   - Converts OWL classes to SHACL NodeShapes
   - Translates OWL property restrictions to SHACL property shapes
   - Handles inverse properties using SHACL inversePath
   - Creates OR constraints from OWL union classes

2. **Validation**: The `ShaclValidator.validate()` method validates the inferred model against the generated SHACL shapes and produces a detailed validation report.

3. **Reporting**: The `ShaclValidator.printReport()` method outputs validation results in a readable format, showing conformance status and detailed error messages for non-conformant data.

Both validation processes provide detailed error messages when validation fails, including:
- Focus nodes (the specific RDF nodes that failed validation)
- Property paths where validation failed
- Descriptive error messages

## Notes

- The application preserves the directory structure of input files in output directories
- Each input Turtle file generates corresponding output files in all formats
- The workflow ensures that the final Parquet files contain the complete inferred data
- Reasoning includes domain/range inference, subproperty inference, and other rules defined in the rules file
- The application handles empty or invalid inputs gracefully by returning `None`/`Option` types
- Validation results are logged with detailed error messages for debugging
