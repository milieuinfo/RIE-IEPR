import N3 from 'n3';
import fs from 'fs';

export class ShaclValidator {
    constructor(shapesPath) {
        this.shapesPath = shapesPath;
        this.shapes = null;
    }

    async initialize() {
        const parser = new N3.Parser({ format: 'Turtle' });
        const store = new N3.Store();
        
        const shapesContent = fs.readFileSync(this.shapesPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            parser.parse(shapesContent, (error, quad) => {
                if (error) reject(error);
                else if (quad) store.addQuad(quad);
                else resolve(store);
            });
        });
    }

    /**
     * Basic SHACL validation - checks for required properties from shapes
     */
    async validate(dataStore) {
        if (!this.shapes) {
            this.shapes = await this.initialize();
        }

        const violations = [];
        const namedNode = N3.DataFactory.namedNode;
        const rdf = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
        const type = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
        const sh = namedNode('http://www.w3.org/ns/shacl#');

        // Get all NodeShapes
        const shapeQuads = this.shapes.getQuads(
            null,
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            namedNode('http://www.w3.org/ns/shacl#NodeShape')
        );

        // Get targetClass for each shape
        const shapeTargets = new Map();
        for (const shapeQuad of shapeQuads) {
            const shapeUri = shapeQuad.subject;
            const targetClassQuads = this.shapes.getQuads(
                shapeUri,
                namedNode('http://www.w3.org/ns/shacl#targetClass'),
                null
            );
            
            for (const tcQuad of targetClassQuads) {
                const targetClass = tcQuad.object.value;
                if (!shapeTargets.has(targetClass)) {
                    shapeTargets.set(targetClass, []);
                }
                shapeTargets.get(targetClass).push({
                    shape: shapeUri,
                    constraints: this.getShapeConstraints(shapeUri)
                });
            }
        }

        // Validate instances against their target classes
        for (const [targetClass, shapes] of shapeTargets.entries()) {
            const instances = dataStore.getQuads(
                null,
                type,
                namedNode(targetClass)
            );

            for (const instance of instances) {
                const instanceUri = instance.subject;
                
                for (const shape of shapes) {
                    const constraints = shape.constraints;
                    
                    for (const constraint of constraints) {
                        if (constraint.minCount > 0) {
                            const values = dataStore.getQuads(
                                instanceUri,
                                namedNode(constraint.path),
                                null
                            );
                            
                            if (values.length < constraint.minCount) {
                                violations.push({
                                    focusNode: instanceUri.value,
                                    sourceShape: shape.shape.value,
                                    resultPath: constraint.path,
                                    resultMessage: `Property ${constraint.path} requires minimum ${constraint.minCount} value(s), found ${values.length}`,
                                    severity: 'Violation'
                                });
                            }
                        }
                        
                        if (constraint.maxCount > 0) {
                            const values = dataStore.getQuads(
                                instanceUri,
                                namedNode(constraint.path),
                                null
                            );
                            
                            if (values.length > constraint.maxCount) {
                                violations.push({
                                    focusNode: instanceUri.value,
                                    sourceShape: shape.shape.value,
                                    resultPath: constraint.path,
                                    resultMessage: `Property ${constraint.path} exceeds maximum ${constraint.maxCount} value(s), found ${values.length}`,
                                    severity: 'Violation'
                                });
                            }
                        }
                    }
                }
            }
        }

        return {
            conforms: violations.length === 0,
            results: violations
        };
    }

    getShapeConstraints(shapeUri) {
        const constraints = [];
        const sh = N3.DataFactory.namedNode('http://www.w3.org/ns/shacl#');
        
        // Get all sh:property constraints
        const propertyQuads = this.shapes.getQuads(
            shapeUri,
            N3.DataFactory.namedNode('http://www.w3.org/ns/shacl#property'),
            null
        );

        for (const propQuad of propertyQuads) {
            const propertyShape = propQuad.object;
            
            // Get path
            const pathQuads = this.shapes.getQuads(
                propertyShape,
                N3.DataFactory.namedNode('http://www.w3.org/ns/shacl#path'),
                null
            );
            
            if (pathQuads.length > 0) {
                const path = pathQuads[0].object.value;
                
                // Get minCount
                const minCountQuads = this.shapes.getQuads(
                    propertyShape,
                    N3.DataFactory.namedNode('http://www.w3.org/ns/shacl#minCount'),
                    null
                );
                const minCount = minCountQuads.length > 0 
                    ? parseInt(minCountQuads[0].object.value) 
                    : 0;
                
                // Get maxCount
                const maxCountQuads = this.shapes.getQuads(
                    propertyShape,
                    N3.DataFactory.namedNode('http://www.w3.org/ns/shacl#maxCount'),
                    null
                );
                const maxCount = maxCountQuads.length > 0 
                    ? parseInt(maxCountQuads[0].object.value) 
                    : 0;

                constraints.push({
                    path,
                    minCount,
                    maxCount
                });
            }
        }

        return constraints;
    }

    formatReport(report, dataSource = '') {
        if (report.conforms) {
            return {
                status: 'PASS',
                message: `✓ Alle SHACL constraints zijn geldig${dataSource ? ` (${dataSource})` : ''}`,
                violations: []
            };
        }

        const violations = report.results || [];

        return {
            status: 'FAIL',
            message: `✗ ${violations.length} SHACL violations gevonden${dataSource ? ` (${dataSource})` : ''}`,
            violations: violations
        };
    }

    printReport(report, detailed = false) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(report.message);
        console.log(`${'='.repeat(70)}\n`);

        if (!report.conforms && detailed && report.violations.length > 0) {
            report.violations.slice(0, 10).forEach((v, idx) => {
                console.log(`${idx + 1}. ${v.severity}`);
                console.log(`   Focus Node: ${v.focusNode}`);
                if (v.resultPath) console.log(`   Path: ${v.resultPath}`);
                console.log(`   Message: ${v.resultMessage}`);
                console.log();
            });

            if (report.violations.length > 10) {
                console.log(`... en ${report.violations.length - 10} meer violations\n`);
            }
        }
    }
}
