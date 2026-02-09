import path from 'path';
import fs from 'fs';
import { OntologyModel } from './src/ontology-model.js';
import { ERDiagramGenerator } from './src/er-diagram-generator.js';
import { ClassDiagramGenerator } from './src/class-diagram-generator.js';
import { SqlGenerator } from './src/sql-generator.js';
import { TypeScriptGenerator } from './src/typescript-generator.js';

const ontology = new OntologyModel();
await ontology.load();

const modelType = process.env.MODEL ? process.env.MODEL.toLowerCase() : null;

const outputDir = path.resolve('./output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

if (!modelType) {
	// Generate all models if MODEL is not specified
	console.log('Generating all models...');

	const erOut = path.join(outputDir, 'ER-generated.mmd');
	const erGenerator = new ERDiagramGenerator(ontology, { outputPath: erOut });
	erGenerator.generate();
	console.log('✓ ER diagram generated ->', erOut);

	const classOut = path.join(outputDir, 'Class-generated.mmd');
	const classGenerator = new ClassDiagramGenerator(ontology, { outputPath: classOut });
	classGenerator.generate();
	console.log('✓ Class diagram generated ->', classOut);

	const sqlOut = path.join(outputDir, 'schema-generated.sql');
	const sqlGenerator = new SqlGenerator(ontology, { outputPath: sqlOut });
	sqlGenerator.generate();
	console.log('✓ SQL schema generated ->', sqlOut);

	const modelsOut = path.join(outputDir, 'models');
	if (!fs.existsSync(modelsOut)) fs.mkdirSync(modelsOut, { recursive: true });
	const tsGenerator = new TypeScriptGenerator(ontology, { outputPath: modelsOut });
	tsGenerator.generate();
	console.log('✓ TypeScript models generated ->', modelsOut);

} else if (modelType === 'class') {
	const classOut = path.join(outputDir, 'Class-generated.mmd');
	const generator = new ClassDiagramGenerator(ontology, { outputPath: classOut });
	generator.generate();
} else if (modelType === 'sql') {
	const sqlOut = path.join(outputDir, 'schema-generated.sql');
	const generator = new SqlGenerator(ontology, { outputPath: sqlOut });
	generator.generate();
} else {
	const erOut = path.join(outputDir, 'ER-generated.mmd');
	const generator = new ERDiagramGenerator(ontology, { outputPath: erOut });
	generator.generate();
}
