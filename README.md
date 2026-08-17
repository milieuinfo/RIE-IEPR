# RIE-IEPR Data Model

This Scala application provides a workflow for converting RDF/Turtle data to JSON-LD and Parquet format for use in a data lake and LDES server.

## Project Structure

```
src/main/scala/
├── TurtleTransformer.scala          # Main Scala application with all conversion logic
├── OwlToShaclGenerator.scala        # Generates SHACL shapes from OWL ontology
├── ShaclValidator.scala             # Validates RDF models against SHACL shapes
└── OntologySorter.scala             # Sorts ontologies and creates structural/disjoint subsets

src/main/resources/
├── be/vlaanderen/omgeving/riepr/
│   └── data/
│       ├── id/
│       │   ├── jsonld/
│       │   │   ├── frame.json              # JSON-LD framing configuration
│       │   │   └── context.json            # JSON-LD context configuration
│       │   └── rule/
│       │       └── domain-range-subproperty.rules  # Reasoning rules
│       └── ns/
│           └── riepr/
│               ├── riepr.ttl                # RIEPR domain ontology
│               └── rieprAlignments.ttl      # RIEPR ontology alignments
├── generated-shapes.ttl                                 # Auto-generated SHACL shapes
├── logback.xml                                         # Logging configuration
├── be/                                                  # Additional ontology files
├── net/                                                 # Network-related ontologies
└── org/                                                 # Organization-related ontologies

src/main/input/
├── activiteit/                      # Activity data
├── bedrijf/                        # Company data
├── exploitant/                     # Operator data
└── installatie/                     # Installation data

src/main/output/
├── json/                            # JSON output
├── jsonld/                          # JSON-LD output
├── parquet/                         # Parquet output
└── turtle/                          # Inferred Turtle output

src/test/scala/
├── ShaclGenerationTest.scala        # SHACL generation tests
├── ShaclGenerationAndValidationTest.scala  # Combined SHACL tests
├── ShaclTestRunner.scala            # SHACL test runner
├── ShaclGenerationSpec.scala        # SHACL generation specifications
├── ShaclTestUtil.scala              # SHACL test utilities
├── ShaclValidatorTest.scala         # SHACL validator tests
└── TurtleTransformerTest.scala      # Turtle transformer tests

```

## Documentatie

De documentatie bevindt zich in `documentatie/datamodel/` en is onderverdeeld in meerdere secties:

| Sectie | Beschrijving |
|---|---|
| `documentatie/datamodel/applicatief/` | Technische datamodel-documentatie (datastructuur, versionering, identificatie, codelijsten) |
| `documentatie/datamodel/afname/` | Afname/gebruik documentatie voor LOD/LDES-afnemers — beschrijft **wat** er als Linked Open Data beschikbaar is |
| `documentatie/datamodel/datavoorbeelden/` | Realistische datavoorbeelden (Turtle) gebaseerd op AGC Glass Europe |
| `documentatie/datamodel/generated/` | Gegenereerde modellen (Java, TypeScript, SQL, SHACL) |
| `documentatie/datamodel/src/` | Bronontologie (`riepr.ttl`), configuratie en oddtoolkit tools |

### Afname-documentatie (LOD/LDES)

Voor data-afnemers die het model raadplegen via SPARQL, LDES of andere LOD-technologieën, bevat `documentatie/datamodel/afname/` gedetailleerde documentatie:

- **Gebruiksscenario's** — concrete SPARQL-query's en Turtle-snippets
- **Basisaannames** — URI-patronen, proces-skelet, OWL-axioma's
- **Exploitant- en exploitatiemodel** — organisaties, locaties, activiteiten
- **Installaties en emissiepunten** — systemen, subsystemen, eigenschappen
- **Observaties en emissies** — metingen, gebeurtenissen (emissie/onttrekking/uitwisseling)
- **Aangifte en dossier** — documentbeheer via de Dossier-ontologie
- **Versiebeheer en tijdsrecht** — versies, geldigheid, historische query's

De afname-documentatie beschrijft uitsluitend wat er als LOD/LDES beschikbaar is, niet hoe het gegenereerd wordt.

### Codelijsten

Het model maakt uitgebreid gebruik van gecontroleerde vocabulaires (SKOS concepten), beheerd in het aparte repository [**milieuinfo/codelijst-rie-iepr**](https://github.com/milieuinfo/codelijst-rie-iepr/). Deze codelijsten zijn gepubliceerd als Linked Data op [data.omgeving.vlaanderen.be](https://data.omgeving.vlaanderen.be/id/concept/riepr/) en omvatten onder meer: installatie_type, emissiepunt_type, procedure_type, status_type, rubriek_type, en eigenschaps-koppelingen.

### Externe standaarden

Het RIE-IEPR-datamodel bouwt voort op W3C-standaarden zoals **SOSA/SSN** (observaties/systemen), **PROV-O** (provenance/versiebeheer), **GeoSPARQL** (geospatiale data) en **P-Plan** (processen). Zie de [afname-documentatie](./documentatie/datamodel/afname/) voor gedetailleerde uitleg.

## Workflow

The application follows this conversion workflow:

1. **Ontology Sorting and Subsetting**
   - Uses `OntologySorter` to create structural and disjoint subsets from complete ontology
   - Generates three ontology variants: complete, structural subset, and disjoint subset
   - Structural subset contains: subPropertyOf, subClassOf, inverseOf, domain, and range relationships
   - Disjoint subset contains: disjointWith relationships

2. **Turtle Processing with Reasoning**
   - Loads ontologies from `.ttl` files in `src/main/resources/` including:
     - Combined ontologies (SSN-SOSA, PROV-O, P-Plan, GeoSPARQL, DBO)
     - RIEPR domain ontology from `src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl`
     - RIEPR ontology alignments from `src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/rieprAlignments.ttl`
   - Loads reasoning rules from `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules`
   - Processes turtle files from `src/main/input/` recursively
   - Applies reasoning using Jena's GenericRuleReasoner
   - Writes inferred triples to `src/main/output/turtle/`

3. **JSON-LD Conversion**
   - Converts inferred RDF to JSON-LD
   - Applies JSON-LD framing using `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json`
   - Uses JSON-LD context from `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/context.json`
   - Writes JSON-LD files to `src/main/output/jsonld/`

4. **JSON and Parquet Conversion**
   - Extracts `@graph` arrays from JSON-LD files
   - Writes JSON arrays to `src/main/output/json/`
   - Converts JSON arrays to Parquet files in `src/main/output/parquet/`
   - Generates and saves Parquet schema as `_schema.json` in each output directory

5. **SHACL Validation**
   - Generates SHACL shapes from OWL ontology using `OwlToShaclGenerator`
   - Validates inferred models against generated SHACL shapes using `ShaclValidator`
   - Provides detailed validation reports with error messages
   - Saves generated SHACL shapes to `src/main/resources/generated-shapes.ttl`

6. **OWL Validation**
   - Validates models using Jena's OWL Mini Reasoner
   - Checks logical consistency and class hierarchies
   - Provides detailed error messages for non-conformant data


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

- **Ontologies**: Located in `src/main/resources/` including:
  - Combined ontologies: SSN-SOSA, PROV-O, P-Plan, GeoSPARQL, DBO
  - RIEPR domain ontology: `src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl`
  - RIEPR ontology alignments: `src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/rieprAlignments.ttl`
- **JSON-LD Frame**: `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/frame.json`
- **JSON-LD Context**: `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/jsonld/context.json`
- **Reasoning Rules**: `src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.rules`
- **Generated SHACL Shapes**: `src/main/resources/generated-shapes.ttl`
- **Logging Configuration**: `src/main/resources/logback.xml`
- **Input Data**: `src/main/input/` (recursively processes all `.ttl` files)
- **Output Data**: `src/main/output/` (json, jsonld, parquet, turtle directories)
- **Ontology Subsets**: Automatically created by `OntologySorter` (complete, structural, disjoint)

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
mvn exec:java -Dexec.mainClass="be.vlaanderen.omgeving.riepr.TurtleTransformer"
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

1. **Ontology Sorting**: Automatically sorts and subsets ontologies for efficient processing
2. **Recursive File Processing**: Automatically finds and processes all `.ttl` files in the input directory and subdirectories
3. **Reasoning**: Applies Jena reasoning rules to infer additional triples
4. **JSON-LD Framing**: Uses JSON-LD framing to create structured JSON output
5. **Parquet Conversion**: Converts JSON data to efficient Parquet format using Spark with schema preservation
6. **Multiple Output Formats**: Generates Turtle, JSON, JSON-LD, and Parquet outputs
7. **SHACL Validation**: Generates SHACL shapes from OWL ontology and validates data
8. **OWL Validation**: Validates models against OWL reasoning
9. **Comprehensive Testing**: Includes Scala tests, Java integration tests, and Python utility scripts
10. **Error Handling**: Graceful handling of empty or invalid inputs with detailed error messages

## Implementation Details

The application consists of four main Scala files:

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
- `writeGraphToParquet()`: Converts JSON to Parquet using Spark and saves schema
- `writeModelToTurtle()`: Writes inferred models to Turtle format
- `writeJson()`: Writes JSON output files
- `validateModel()`: Validates models using OWL reasoning
- `processModel()`: Complete processing pipeline for individual models
- `main()`: Main entry point with complete workflow

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

### OntologySorter.scala

Sorts and subsets ontologies for efficient processing:

- `completeOntology`: Loads and combines all ontology files
- `structuralSubset`: Extracts structural relationships (subPropertyOf, subClassOf, inverseOf, domain, range)
- `disjointSubset`: Extracts disjointness relationships (disjointWith)
- `extractStructuralSubset()`: Private method for structural subset extraction
- `extractDisjointSubset()`: Private method for disjoint subset extraction

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
- Parquet files include schema information saved as `_schema.json` in each output directory
- Ontology sorting improves performance by creating focused subsets for different processing needs
- The application supports both individual file processing and consolidated processing of all input data
