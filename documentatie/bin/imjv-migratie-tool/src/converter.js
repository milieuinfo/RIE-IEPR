import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { fileURLToPath } from 'url';
import N3 from 'n3';
import { GrondwaterParser } from './grondwater-parser.js';
import { WaterParser } from './water-parser.js';
import { LuchtParser } from './lucht-parser.js';
import { ShaclValidator } from './shacl-validator.js';
import { parseTurtleString } from '../../common/src/rdf.js';
import { NAMESPACES } from './constants.js';
import { PATHS } from '../../common/src/paths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validate Turtle data against SHACL shapes
 */
async function validateTurtle(turtle, shapesPath, dataSource = '') {
    try {
        const store = await parseTurtleString(turtle);
        const validator = new ShaclValidator(shapesPath);
        const report = await validator.validate(store);
        const formatted = validator.formatReport(report, dataSource);
        return formatted;
    } catch (error) {
        console.error(`Validation error for ${dataSource}:`, error.message);
        return null;
    }
}

function sanitizeId(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

async function ensureProcessInputOutputVars(turtle) {
    const store = await parseTurtleString(turtle);
    const { namedNode, literal } = N3.DataFactory;

    const rdfType = namedNode(`${NAMESPACES.rdf}type`);
    const rdfsLabel = namedNode(`${NAMESPACES.rdfs}label`);
    const rieprProces = namedNode(`${NAMESPACES.riepr}Proces`);
    const rieprVariable = namedNode(`${NAMESPACES.riepr}Variable`);
    const hasInputVar = namedNode(`${NAMESPACES.pplan}hasInputVar`);
    const hasOutputVar = namedNode(`${NAMESPACES.pplan}hasOutputVar`);

    const procesSubjects = store.getSubjects(rdfType, rieprProces, null);
    let fallbackCounter = 0;

    for (const proces of procesSubjects) {
        const inputVars = store.getObjects(proces, hasInputVar, null);
        const outputVars = store.getObjects(proces, hasOutputVar, null);

        if (inputVars.length === 0 && outputVars.length === 0) {
            const procesId = proces.value?.split('/').pop() || `proces_${fallbackCounter++}`;
            const varId = sanitizeId(`var_${procesId}`) || `var_${fallbackCounter++}`;
            const varUri = namedNode(`${NAMESPACES.var}${varId}`);

            store.addQuad(varUri, rdfType, rieprVariable);
            store.addQuad(varUri, rdfsLabel, literal('Onbekende stroom', 'nl'));
            store.addQuad(proces, hasInputVar, varUri);
            store.addQuad(proces, hasOutputVar, varUri);
        } else if (inputVars.length === 0 && outputVars.length > 0) {
            store.addQuad(proces, hasInputVar, outputVars[0]);
        } else if (outputVars.length === 0 && inputVars.length > 0) {
            store.addQuad(proces, hasOutputVar, inputVars[0]);
        }
    }

    const writer = new N3.Writer({ format: 'Turtle', prefixes: NAMESPACES });
    writer.addQuads(store.getQuads(null, null, null));

    return new Promise((resolve, reject) => {
        writer.end((error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
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
                turtle = await ensureProcessInputOutputVars(turtle);
            }

        } else if (xmlPath.includes('water')) {
            const fullWaterData = xmlData['n15:MilieuverslagVasteGegevens'];
            if (fullWaterData) {
                parser = new WaterParser(fullWaterData);
                turtle = await parser.parse();
                turtle = await ensureProcessInputOutputVars(turtle);
            }
        } else if (xmlPath.includes('lucht')) {
            const fullLuchtData = xmlData['n15:MilieuverslagVasteGegevens'];
            if (fullLuchtData) {
                parser = new LuchtParser(fullLuchtData);
                turtle = await parser.parse();
                turtle = await ensureProcessInputOutputVars(turtle);
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
 * Read XML input files from input directory recursively
 */
function getXmlFiles(inputDir) {
    if (!fs.existsSync(inputDir)) {
        console.error(`Input directory not found: ${inputDir}`);
        return [];
    }

    const xmlFiles = [];
    const walkDir = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                walkDir(filePath);
            } else if (file.endsWith('.xml')) {
                xmlFiles.push(filePath);
            }
        }
    };
    walkDir(inputDir);
    return xmlFiles;
}

/**
 * Main execution
 */
async function main() {
    const inputDir = path.join(__dirname, '..', 'input');
    const outputDir = path.join(__dirname, '..', 'output');
    const shapesPath = PATHS.shapes;

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const xmlFiles = getXmlFiles(inputDir);
    if (xmlFiles.length === 0) {
        console.log('No XML files found in input directory.');
        return;
    }

    for (const xmlFile of xmlFiles) {
        console.log(`Processing: ${xmlFile}`);
        const turtle = await convertXmlToTurtle(xmlFile);

        if (!turtle) {
            console.warn(`No Turtle generated for ${xmlFile}`);
            continue;
        }

        const fileName = path.basename(xmlFile, '.xml');
        const outputFile = path.join(outputDir, fileName, `${fileName}.ttl`);
        const outputSubDir = path.dirname(outputFile);

        if (!fs.existsSync(outputSubDir)) {
            fs.mkdirSync(outputSubDir, { recursive: true });
        }

        fs.writeFileSync(outputFile, turtle);
        console.log(`Saved Turtle: ${outputFile}`);

        // Validate generated Turtle against SHACL shapes
        const report = await validateTurtle(turtle, shapesPath, fileName);
        if (report) {
            const reportFile = path.join(outputSubDir, `${fileName}-validation.json`);
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            console.log(`Validation report saved: ${reportFile}`);
        }
    }

    // Merge all TTL files into a single file per directory
    const directories = fs.readdirSync(outputDir).filter(file => 
        fs.statSync(path.join(outputDir, file)).isDirectory()
    );

    for (const dir of directories) {
        const dirPath = path.join(outputDir, dir);
        const ttlFiles = fs.readdirSync(dirPath)
            .filter(file => file.endsWith('.ttl'))
            .filter(file => file !== 'merged.ttl' && file !== 'test.ttl')
            .map(file => path.join(dirPath, file));

        if (ttlFiles.length > 0) {
            const mergedOutputFile = path.join(dirPath, `${dir}-merged.ttl`);
            await mergeTurtleFiles(ttlFiles, mergedOutputFile);
            console.log(`Merged Turtle file created: ${mergedOutputFile}`);
        }
    }

    // Merge per company (input subdirectory) into output/<company>/<company>-merged.ttl
    const companyDirs = fs.readdirSync(inputDir).filter(file =>
        fs.statSync(path.join(inputDir, file)).isDirectory()
    );

    for (const company of companyDirs) {
        const companyInputDir = path.join(inputDir, company);
        const companyXmlFiles = fs.readdirSync(companyInputDir)
            .filter(file => file.endsWith('.xml'))
            .map(file => path.join(companyInputDir, file));

        if (companyXmlFiles.length === 0) continue;

        const companyTtlFiles = companyXmlFiles
            .map(xmlPath => {
                const fileName = path.basename(xmlPath, '.xml');
                return path.join(outputDir, fileName, `${fileName}.ttl`);
            })
            .filter(ttlPath => fs.existsSync(ttlPath));

        if (companyTtlFiles.length === 0) continue;

        const companyOutputDir = path.join(outputDir, company);
        if (!fs.existsSync(companyOutputDir)) {
            fs.mkdirSync(companyOutputDir, { recursive: true });
        }

        const companyMergedOutputFile = path.join(companyOutputDir, `${company}-merged.ttl`);
        await mergeTurtleFiles(companyTtlFiles, companyMergedOutputFile);
        console.log(`Company merged Turtle file created: ${companyMergedOutputFile}`);
    }
}

main().catch(err => {
    console.error('Error:', err);
});
