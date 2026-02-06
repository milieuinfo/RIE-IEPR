/**
 * Per-class/property render overrides for diagram/model generation.
 * Example: { 'ExploitatieLocatie': { 'prov:wasAttributedTo': false } }
 * If set to false, the property will not be rendered for that class.
 */
export const PROPERTY_RENDER_OVERRIDES = new Map([
  ['ExploitatieLocatie', new Map([
    [`${NAMESPACES.prov}wasAttributedTo`, false]
  ])]
]);
import { NAMESPACES } from '../../common/src/constants.js';

/**
 * Local configuration for model-generator module
 * Imports shared configuration from common module
 */
export { PATHS, resolveProjectPath, PROJECT_ROOT } from '../../common/src/paths.js';
export { NAMESPACES };

/**
 * Schema generation business rules and configuration
 */

/**
 * Classes that should be excluded from schema generation
 * These are considered technical/abstract base classes or generic vocabulary classes
 */
export const EXCLUDED_TECHNICAL_CLASSES = new Set([
  'System',
  'Sensor', 
  'MeetProcedure',
  'ProcesProcedure',
  'Procedure',
  'Observation',
  'Platform',
  // Generic vocabulary classes (PROV, SOSA, GeoSPARQL) - not RIEPR domain entities
  'Agent',
  'Attribution',
  'Deployment',
  'Geometry',
  'Project',
  'Result',
  'Role',
  'SpatialObject' // External GeoSPARQL base class
]);

/**
 * Properties that should be excluded from relationships
 */
export const EXCLUDED_PROPERTIES = new Set([
  'hadPrimarySource',
  // Exclude problematic inverse properties
  'wasGeneratedBy',
  'isFeatureOfInterestOf',
  'wasAssociatedWith',
  'correspondsToVariable'
]);

/**
 * Classes that should always include temporal validity attributes
 */
export const TEMPORAL_CLASSES = new Set([
  'ProcesVariabele'
]);

/**
 * Properties that should be modeled as many-to-many (junction tables)
 */
export const MANY_TO_MANY_PROPERTIES = new Set([
  `${NAMESPACES.pplan}isPrecededBy`,
  `${NAMESPACES.pplan}hasInputVar`,
  `${NAMESPACES.pplan}hasOutputVar`
  ,
  `${NAMESPACES.prov}wasAttributedTo`
]);

/**
 * Property type overrides allow mapping a property IRI to a preferred
 * TypeScript/interface type and some generation hints (e.g. drop trailing
 * "Id" from generated property names). Keep config here so generators
 * remain data-driven rather than hard-coded.
 * Example key: `${NAMESPACES.prov}wasAttributedTo`
 * Example value: { interface: 'Agent', type: 'IAgent', dropId: true }
 */
export const PROPERTY_TYPE_OVERRIDES = new Map([
  [
    `${NAMESPACES.prov}wasAttributedTo`,
    { interface: 'Agent', type: 'IAgent', dropId: true }
  ]
]);

/**
 * Per-class overrides for business labels (diagram labels)
 */
export const PROPERTY_LABEL_OVERRIDES = new Map([
  ['Proces', new Map([
    [`${NAMESPACES.prov}wasDerivedFrom`, 'type']
  ])]
]);

/**
 * Per-class overrides for business names (attribute/FK names)
 */
export const PROPERTY_NAME_OVERRIDES = new Map([
  ['Proces', new Map([
    [`${NAMESPACES.prov}wasDerivedFrom`, 'type']
  ])]
]);

/**
 * PostgreSQL reserved keywords that need escaping
 */
export const POSTGRESQL_RESERVED_KEYWORDS = new Set([
  'all', 'analyse', 'analyze', 'and', 'any', 'array', 'as', 'asc', 'asymmetric', 'authorization',
  'binary', 'both', 'case', 'cast', 'check', 'collate', 'collation', 'column', 'concurrently', 'constraint', 'create', 'cross',
  'current_catalog', 'current_date', 'current_role', 'current_schema', 'current_time', 'current_timestamp', 'current_user',
  'default', 'deferrable', 'desc', 'distinct', 'do', 'else', 'end', 'except', 'fetch', 'filter', 'for', 'foreign', 'from',
  'group', 'having', 'intersect', 'into', 'ilike', 'is', 'isnull', 'join', 'lateral', 'leading', 'left', 'like', 'limit',
  'localtime', 'localtimestamp', 'natural', 'not', 'notnull', 'null', 'offset', 'on', 'only', 'or', 'order', 'outer',
  'overlaps', 'placing', 'primary', 'references', 'returning', 'right', 'select', 'session_user', 'similar', 'some', 'symmetric',
  'table', 'tablesample', 'then', 'to', 'trailing', 'union', 'unique', 'user', 'using', 'variadic', 'verbose', 'when', 'where', 'window', 'with'
]);

/**
 * Known XSD and RDF datatypes
 */
export const KNOWN_DATATYPES = new Set([
  'string', 'normalizedString', 'token', 'language', 'Name', 'NCName',
  'date', 'dateTime', 'time', 'gYear', 'gMonth', 'gDay',
  'boolean',
  'decimal', 'float', 'double',
  'integer', 'nonNegativeInteger', 'positiveInteger', 'nonPositiveInteger', 'negativeInteger',
  'long', 'int', 'short', 'byte',
  'Literal'
]);

/**
 * Primary key field names
 * Fields with these names are automatically marked as primary keys
 */
export const PRIMARY_KEY_FIELDS = new Set([
  'uri',
  'geldig_van',
  'aangemaakt_op'
]);

/**
 * SQL type mappings for XSD datatypes
 */
export const SQL_TYPE_MAPPINGS = {
  'datetime': 'TIMESTAMP',
  'date': 'DATE',
  'time': 'TIME',
  'gYear': 'INTEGER',
  'boolean': 'BOOLEAN',
  'decimal': 'NUMERIC',
  'float': 'REAL',
  'double': 'DOUBLE PRECISION',
  'integer': 'INTEGER',
  'long': 'BIGINT',
  'short': 'SMALLINT',
  'string': 'TEXT',
  'normalizedString': 'TEXT',
  'token': 'TEXT',
  'literal': 'TEXT'
};

/**
 * Mermaid ER diagram type mappings
 */
export const MERMAID_TYPE_MAPPINGS = {
  'datetime': 'datetime',
  'date': 'date',
  'boolean': 'boolean',
  'float': 'float',
  'integer': 'integer',
  'string': 'string'
};

/**
 * Namespace prefixes that indicate technical/modeling classes
 */
export function getTechnicalNamespacePrefixes() {
  return [NAMESPACES.pplan];
}

/**
 * Check if a property is a geometry property (should be treated as text/spatial type)
 */
export function isGeometryProperty(propertyName) {
  const name = String(propertyName).toLowerCase();
  return name.includes('geometry') || name.includes('geom');
}

/**
 * Check if a property is likely an inverse property based on naming patterns
 * Inverse properties typically follow patterns like:
 * - hasX -> isXOf (hasInputVar -> isInputVarOf)
 * - hasX -> isXOfPlan (hasInputVar -> isVariableOfPlan)
 * - hasX -> isXBy (hasAgent -> isAgentBy)
 * - hasPart -> isPartOf (mereological relationships)
 */
function isLikelyInverseProperty(propertyName) {
  const name = String(propertyName);
  // Exceptions: these properties look like inverses by naming
  // convention but should be treated as normal forward properties
  // in the ER/schema (e.g. pplan:isStepOfPlan links a Step to its
  // parent Plan and should be shown as a relationship).
  const INVERSE_PROPERTY_EXCEPTIONS = new Set([
    'isStepOfPlan',
    'isPrecededBy'
  ]);
  if (INVERSE_PROPERTY_EXCEPTIONS.has(name)) return false;
  
  // Check for "is*Of" pattern (inverse of "has*")
  if (name.match(/^is.+Of$/i)) {
    return true;
  }
  
  // Check for "is*OfPlan" or "is*OfStep" pattern (inverse relationships for plans/steps)
  if (name.match(/^is.+(OfPlan|OfStep)$/i)) {
    return true;
  }
  
  // Check for "is*By" pattern (inverse of "has*")
  if (name.match(/^is.+By$/i)) {
    return true;
  }
  
  // Check for other common inverse patterns
  if (name.match(/^.+ForObject$/i) || name.match(/^.+ForSubject$/i)) {
    return true;
  }
  
  return false;
}

/**
 * Check if a property should be excluded from relationships
 */
export function isExcludedProperty(propertyName) {
  // First check explicit exclusions
  if (EXCLUDED_PROPERTIES.has(propertyName)) {
    return true;
  }
  
  // Then check if it's likely an inverse property
  return isLikelyInverseProperty(propertyName);
}

/**
 * Check if a class should always include temporal attributes
 */
export function isTemporalClass(className) {
  return TEMPORAL_CLASSES.has(className);
}

/**
 * Check if a property should be modeled as many-to-many
 */
export function isManyToManyProperty(propertyIri, propertyName) {
  if (propertyIri && MANY_TO_MANY_PROPERTIES.has(propertyIri)) return true;
  if (!propertyName) return false;

  const local = String(propertyName);
  for (const iri of MANY_TO_MANY_PROPERTIES) {
    if (iri.endsWith(`#${local}`) || iri.endsWith(`/${local}`)) return true;
  }
  return false;
}

/**
 * Escape PostgreSQL reserved keywords by wrapping in double quotes
 */
export function escapeReservedKeyword(word) {
  if (POSTGRESQL_RESERVED_KEYWORDS.has(word.toLowerCase())) {
    return `"${word}"`;
  }
  return word;
}

/**
 * Check if range types represent a datatype (not object reference)
 */
export function isDatatypeRange(rangeTypes) {
  if (!Array.isArray(rangeTypes) || rangeTypes.length === 0) return false;
  return rangeTypes.every(t => KNOWN_DATATYPES.has(t));
}

/**
 * Infer SQL data type from XSD range types
 */
export function inferSqlDataType(rangeTypes, attrName) {
  if (Array.isArray(rangeTypes) && rangeTypes.length > 0) {
    const type = rangeTypes[0];
    const lower = String(type).toLowerCase();

    if (lower.includes('datetime') || lower === 'time') return 'TIMESTAMP';
    if (lower === 'date' || lower.endsWith('date')) return 'DATE';
    if (lower === 'boolean') return 'BOOLEAN';
    if (lower === 'decimal') return 'NUMERIC';
    if (lower === 'float') return 'REAL';
    if (lower === 'double') return 'DOUBLE PRECISION';
    if (lower === 'long') return 'BIGINT';
    if (lower === 'short') return 'SMALLINT';
    if (lower.includes('int') || lower === 'integer' || lower === 'nonnegativeinteger' || lower === 'positiveinteger') {
      return 'INTEGER';
    }
    if (lower === 'string' || lower === 'normalizedstring' || lower === 'token' || lower === 'literal') {
      return 'TEXT';
    }
  }
  return 'TEXT';
}

/**
 * Infer Mermaid ER diagram data type from XSD range types
 */
export function inferMermaidDataType(rangeTypes, attrName) {
  if (Array.isArray(rangeTypes) && rangeTypes.length > 0) {
    const type = rangeTypes[0];
    const lower = String(type).toLowerCase();

    if (lower.includes('datetime') || lower === 'time') return 'datetime';
    if (lower === 'date' || lower.endsWith('date')) return 'date';
    if (lower === 'boolean') return 'boolean';
    if (lower === 'decimal' || lower === 'float' || lower === 'double') return 'float';
    if (lower.includes('int') || lower === 'integer' || lower === 'nonnegativeinteger' || lower === 'positiveinteger') {
      return 'integer';
    }
    if (lower === 'string' || lower === 'normalizedstring' || lower === 'token' || lower === 'literal') {
      return 'string';
    }
  }
  return 'string';
}

/**
 * Convert camelCase to snake_case
 */
export function camelCaseToSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Format an enum class name to UPPER_SNAKE_CASE
 * e.g., VerbruiksProcedure -> VERBRUIKS_PROCEDURE
 */
export function formatEnumValue(enumClassName) {
  return camelCaseToSnakeCase(enumClassName).toUpperCase();
}

/**
 * Check if an attribute name should be a primary key
 */
export function isPrimaryKeyField(attrName, classInfo, className) {
  if (PRIMARY_KEY_FIELDS.has(attrName)) return true;
  
  const baseName = camelCaseToSnakeCase(classInfo?.localName || className || 'entity');
  const identifierAttr = `${baseName}_identifiers`;
  
  return attrName === identifierAttr;
}

/**
 * Check if a class is technical/abstract and should be excluded
 */
export function isTechnicalClass(className, classInfo, enumClasses = new Set()) {
  if (!className || !classInfo) return false;

  // Business concepts are never technical
  if (classInfo.isBusinessConceptTarget) {
    return false;
  }

  // Explicitly excluded classes
  if (EXCLUDED_TECHNICAL_CLASSES.has(className)) {
    return true;
  }

  // Classes from technical namespaces
  if (classInfo.iri) {
    const iriString = String(classInfo.iri);
    const technicalPrefixes = getTechnicalNamespacePrefixes();
    if (technicalPrefixes.some(prefix => iriString.startsWith(prefix))) {
      return true;
    }
  }

  // SKOS concept schemes are technical
  if (classInfo.isConceptScheme) return true;

  // Enum classes are technical
  if (enumClasses.has(className)) return false;

  return false;
}

