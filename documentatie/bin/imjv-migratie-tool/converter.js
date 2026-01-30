import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { fileURLToPath } from 'url';
import N3 from 'n3';
import { GrondwaterParser } from './GrondwaterParser.js';
import { WaterParser } from './WaterParser.js';
import { LuchtParser } from './LuchtParser.js';
import { TurtleBuilder } from './TurtleBuilder.js';
import { ShaclValidator } from './ShaclValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validate Turtle data against SHACL shapes
 */
async function validateTurtle(turtle, shapesPath, dataSource = '') {
    try {
        const parser = new N3.Parser({ format: 'Turtle' });
        const store = new N3.Store();

        return new Promise((resolve) => {
            parser.parse(turtle, (error, quad) => {
                if (error) {
                    console.error(`Parse error in ${dataSource}:`, error.message);
                    resolve(null);
                } else if (quad) {
                    store.addQuad(quad);
                } else {
                    // Parsing complete
                    (async () => {
                        const validator = new ShaclValidator(shapesPath);
                        const report = await validator.validate(store);
                        const formatted = validator.formatReport(report, dataSource);
                        resolve(formatted);
                    })();
                }
            });
        });
    } catch (error) {
        console.error(`Validation error for ${dataSource}:`, error.message);
        return null;
    }
}

/**
 * Main converter function
 */
async function convertXmlToTurtle(xmlPath) {
    try {
        const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
        const xmlData = await parseStringPromise(xmlContent);

        let turtle = '';
        let parser = null;

        // Determine file type and parse accordingly
        if (xmlPath.includes('grondwater')) {
            const grondwaterData = xmlData['ns2:VasteGegevensAangifteGrondwater'];
            if (grondwaterData) {
                parser = new GrondwaterParser(grondwaterData);
                turtle = await parser.parse();
            }

        } else if (xmlPath.includes('water')) {
            const fullWaterData = xmlData['n15:MilieuverslagVasteGegevens'];
            if (fullWaterData) {
                parser = new WaterParser(fullWaterData);
                turtle = await parser.parse();
            }
        } else if (xmlPath.includes('lucht')) {
            const fullLuchtData = xmlData['n15:MilieuverslagVasteGegevens'];
            if (fullLuchtData) {
                parser = new LuchtParser(fullLuchtData);
                turtle = await parser.parse();
            }
        } else {
            console.warn('Unknown file type:', xmlPath);
            return null;
        }

        return turtle;
    } catch (error) {
        console.error(`Error converting ${xmlPath}:`, error.message);
        console.error(error.stack);
        return null;
    }
}

/**
 * Merge multiple TTL files into a single file using N3 Store to avoid duplicates
 * with proper pretty-printing and nested blank nodes
 */
async function mergeTurtleFiles(ttlFiles, outputFile) {
    const mergedStore = new N3.Store();
    const mergedPrefixes = {};
    const { Writer } = N3;

    // Load all TTL files into a single store and collect prefixes
    for (const ttlFile of ttlFiles) {
        try {
            const ttlContent = fs.readFileSync(ttlFile, 'utf-8');
            const parser = new N3.Parser({ format: 'Turtle' });

            await new Promise((resolve, reject) => {
                parser.parse(ttlContent, (error, quad, prefixes) => {
                    if (error) reject(error);
                    else if (quad) mergedStore.addQuad(quad);
                    else {
                        // Collect prefixes at the end of parsing
                        if (prefixes) {
                            Object.assign(mergedPrefixes, prefixes);
                        }
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error(`Error reading ${ttlFile}:`, error.message);
        }
    }

    // Ensure all standard prefixes are included
    const { NAMESPACES } = await import('./constants.js');
    for (const [prefix, namespace] of Object.entries(NAMESPACES)) {
        if (!mergedPrefixes[prefix]) {
            mergedPrefixes[prefix] = namespace;
        }
    }

    // Write merged store to file with nested blank nodes using custom writer
    return new Promise((resolve, reject) => {
        const writer = new Writer({ 
            format: 'Turtle', 
            prefixes: mergedPrefixes,
        });

        // Track which blank nodes have been nested to avoid duplicate output
        const nestedBlankNodes = new Set();

        // Add quads with proper blank node nesting
        const quads = mergedStore.getQuads();
        for (const quad of quads) {
            // Skip quads where the subject is a blank node that was already nested
            if (quad.subject.termType === 'BlankNode' && nestedBlankNodes.has(quad.subject.value)) {
                continue;
            }

            if (quad.object.termType === 'BlankNode') {
                // Write with nested blank node
                const nestedBN = writeBlankNode(writer, quad.object, mergedStore, nestedBlankNodes);
                writer.addQuad(quad.subject, quad.predicate, nestedBN);
                // Mark this blank node as nested
                nestedBlankNodes.add(quad.object.value);
            } else {
                writer.addQuad(quad);
            }
        }

        writer.end((error, result) => {
            if (error) reject(error);
            else {
                fs.writeFileSync(outputFile, result);
                resolve(result);
            }
        });
    });
}

/**
 * Recursively write blank nodes in nested format
 * Similar to OpenHPS RDFSerializer.writeBlankNode approach
 */
function writeBlankNode(writer, blankNode, store, nestedBlankNodes) {
    const predicates = store.getPredicates(blankNode, null, null);
    
    if (predicates.length === 0) {
        // Empty blank node
        return writer.blank([]);
    }

    const properties = [];
    for (const predicate of predicates) {
        const objects = store.getObjects(blankNode, predicate, null);
        for (const obj of objects) {
            if (obj.termType === 'BlankNode') {
                // Recursively nest blank nodes
                properties.push({
                    predicate,
                    object: writeBlankNode(writer, obj, store, nestedBlankNodes),
                });
                // Mark this blank node as nested
                nestedBlankNodes.add(obj.value);
            } else {
                properties.push({
                    predicate,
                    object: obj,
                });
            }
        }
    }

    return writer.blank(properties);
}

/**
 * Main entry point
 */
async function main() {
    const inputDir = path.join(__dirname, 'input');
    const outputDir = path.join(__dirname, 'output');
    const shapesPath = path.join(__dirname, '../../../src/main/resources/generated-shapes.ttl');

    // Check if shapes file exists
    if (!fs.existsSync(shapesPath)) {
        console.warn(`⚠ SHACL shapes file not found: ${shapesPath}`);
        console.warn('Validation will be skipped.\n');
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Find all XML files in input directory
    const xmlFiles = [];
    const walkDir = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                walkDir(filePath);
            } else if (file.endsWith('.xml')) {
                xmlFiles.push(filePath);
            }
        });
    };

    walkDir(inputDir);

    console.log(`Found ${xmlFiles.length} XML files to convert\n`);

    const validationResults = [];
    const conversionResults = [];
    const directoriesByName = new Map(); // Map of directory name -> list of TTL files

    // Convert each XML file
    for (const xmlFile of xmlFiles) {
        console.log(`Converting: ${xmlFile}`);
        const turtle = await convertXmlToTurtle(xmlFile);

        if (turtle) {
            // Generate output filename
            const relative = path.relative(inputDir, xmlFile);
            const outputFile = path.join(outputDir, relative.replace(/\.xml$/, '.ttl'));
            const outputFileDir = path.dirname(outputFile);

            // Create output directory
            if (!fs.existsSync(outputFileDir)) {
                fs.mkdirSync(outputFileDir, { recursive: true });
            }

            // Write individual Turtle file
            fs.writeFileSync(outputFile, turtle);
            console.log(`✓ Created: ${outputFile}`);

            // Track for directory-level merging
            const dirName = path.basename(outputFileDir);
            if (!directoriesByName.has(dirName)) {
                directoriesByName.set(dirName, []);
            }
            directoriesByName.get(dirName).push(outputFile);

            // Validate if shapes file exists
            if (fs.existsSync(shapesPath)) {
                console.log('  Validating against SHACL...');
                const validation = await validateTurtle(turtle, shapesPath, path.basename(outputFile));
                if (validation) {
                    const icon = validation.status === 'PASS' ? '✓' : '✗';
                    console.log(`  ${icon} ${validation.message}`);
                    validationResults.push({
                        file: outputFile,
                        ...validation
                    });
                }
            }
            console.log();
        } else {
            console.log(`✗ Failed to convert: ${xmlFile}\n`);
        }
    }

    // Merge TTL files per directory
    console.log('\n' + '='.repeat(70));
    console.log('MERGING TTL FILES PER DIRECTORY');
    console.log('='.repeat(70) + '\n');

    for (const [dirName, ttlFiles] of directoriesByName.entries()) {
        if (ttlFiles.length > 1) {
            console.log(`Merging ${ttlFiles.length} files in directory: ${dirName}`);
            const mergedOutputFile = path.join(outputDir, dirName, 'merged.ttl');
            
            try {
                const mergedContent = await mergeTurtleFiles(ttlFiles, mergedOutputFile);
                console.log(`✓ Created merged file: ${mergedOutputFile}`);
                
                // Validate merged file if shapes file exists
                if (fs.existsSync(shapesPath)) {
                    console.log('  Validating merged file against SHACL...');
                    const validation = await validateTurtle(mergedContent, shapesPath, `${dirName}/merged.ttl`);
                    if (validation) {
                        const icon = validation.status === 'PASS' ? '✓' : '✗';
                        console.log(`  ${icon} ${validation.message}`);
                        validationResults.push({
                            file: mergedOutputFile,
                            ...validation
                        });
                    }
                }
            } catch (error) {
                console.error(`✗ Error merging files for ${dirName}:`, error.message);
            }
            console.log();
        } else if (ttlFiles.length === 1) {
            console.log(`Skipping merge for ${dirName} (only 1 file)\n`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('CONVERSION AND VALIDATION COMPLETE');
    console.log('='.repeat(70) + '\n');

    // Summary
    const passCount = validationResults.filter(r => r.status === 'PASS').length;
    const failCount = validationResults.filter(r => r.status === 'FAIL').length;

    if (validationResults.length > 0) {
        console.log(`Validation Results: ${passCount} passed, ${failCount} failed out of ${validationResults.length} files\n`);

        // Show details for failed validations
        const failures = validationResults.filter(r => r.status === 'FAIL');
        if (failures.length > 0) {
            console.log('FAILED VALIDATIONS:\n');
            failures.forEach((f, idx) => {
                console.log(`${idx + 1}. ${path.basename(f.file)}`);
                console.log(`   ${f.violations.length} violations`);
                f.violations.slice(0, 3).forEach(v => {
                    console.log(`   - ${v.resultMessage} (Node: ${v.focusNode.substring(0, 50)}...)`);
                });
                if (f.violations.length > 3) {
                    console.log(`   ... and ${f.violations.length - 3} more`);
                }
                console.log();
            });
        }
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { convertXmlToTurtle, GrondwaterParser, WaterParser, LuchtParser, TurtleBuilder };
