import { OntologyModel } from './src/ontology-model.js';
import { ERDiagramGenerator } from './src/er-diagram-generator.js';
import { ClassDiagramGenerator } from './src/class-diagram-generator.js';

const ontology = new OntologyModel();
await ontology.load();

const modelType = (process.env.MODEL || 'er').toLowerCase();
if (modelType === 'class') {
	const generator = new ClassDiagramGenerator(ontology);
	generator.generate();
} else {
	const generator = new ERDiagramGenerator(ontology);
	generator.generate();
}
