import { BaseGenerator } from './base-generator.js';
import * as Config from '../config.js';

export class SchemaGenerator extends BaseGenerator {
  constructor(ontology, options = {}) {
    super(ontology, options);
  }

  computeJoinTablesFor(relationships, config = Config, visibleClasses) {
    // Delegate to BaseGenerator implementation and default visibleClasses
    return super.computeJoinTablesFor(relationships, config, visibleClasses || new Set(this.computeVisibleClasses()));
  }

  generateIdentifierAttributesForClass(parentClass) {
    // Delegate to BaseGenerator implementation
    return [
      {
        name: `${Config.camelCaseToSnakeCase(parentClass)}_uid`,
        type: 'string',
        sqlType: 'TEXT',
        comment: parentClass,
        isForeignKey: true,
        isPrimaryKey: true,
        propertyIri: 'http://www.w3.org/ns/adms#identifier'
      },
      ...super.generateIdentifierAttributesForClass(parentClass)
    ];
  }
}

export default SchemaGenerator;
