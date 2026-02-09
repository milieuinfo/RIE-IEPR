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
}

export default SchemaGenerator;
