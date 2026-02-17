import { NAMESPACES } from '../../common/src/constants.js';
export { PATHS, resolveProjectPath, PROJECT_ROOT } from '../../common/src/paths.js';
export { NAMESPACES };

/**
 * Classes that should be excluded from schema generation
 * These are considered technical/abstract base classes or generic vocabulary classes
 */
export const EXCLUDED_TECHNICAL_CLASSES = new Set([
  'Sensor',
  'MeetProcedure',
  'ProcesProcedure',
  'Observation',
  'Platform',
  'Attribution',
  'Deployment',
  'Geometry',
  'Project',
  'Result',
  'Role',
]);

/**
 * Interface-like classes and technical classes that should be emitted
 * as shared interfaces (e.g. IAgent, ISpatialObject) or as enums
 * (e.g. Procedure). Populate this with local class names for your
 * project to avoid hard-coded checks inside generators.
 */
export const INTERFACE_CLASSES = new Set(['Agent', 'SpatialObject', 'System']);

/**
 * Classes that should be treated as enumerables when used as dct:type
 * (e.g. Procedure). Populate with local class names so generators
 * synthesize a single enumerated class with members derived from
 * SKOS/SOSA-like subclasses.
 */
export const ENUMERABLE_CLASSES = new Set(['Procedure']);

/**
 * Optional explicit display names for configured interface classes.
 * Useful when the ontology/business-label does not contain the desired
 * localized name (e.g. prefer 'Systeem' over 'System'). Keys are local
 * class names (without leading I), values are the preferred business name.
 */
export const INTERFACE_CLASS_DISPLAY_NAMES = new Map([['System', 'Systeem']]);

/**
 * Diagram styling configuration for Mermaid class diagrams.
 * Keys are local class names (ontology local name) and values define
 * the `classDef` identifier and optional style properties. The
 * generator will apply the named `classDef` to the class itself and
 * all subclasses. For enums, classes that reference the enum as an
 * attribute type are also considered.
 */
export const DIAGRAM_STYLES = new Map([
  // localName -> { classDef: 'system', fill: '#cfc', stroke: '#333', strokeWidth: '1px' }
  ['System', { classDef: 'system', fill: '#cfc', stroke: '#333', strokeWidth: '1px' }],
  ['Procedure', { classDef: 'procedure', fill: '#ccf', stroke: '#333', strokeWidth: '1px' }],
]);

/**
 * Classes that should always include temporal validity attributes
 */
export const TEMPORAL_CLASSES = new Set(['Adres']);

export const METADATA_CLASSES = new Set([]);

/**
 * Metadata companion classes
 *
 * For each class listed in `METADATA_CLASSES` the generator will synthesize
 * a companion metadata class named `<Class>Metadata` (e.g. `EmissiepuntMetadata`) that
 * can store arbitrary key/value pairs tied to the owning entity. These
 * metadata classes are intended to be non-temporal and always reference the
 * entity they describe. Use these to store auxiliary application metadata
 * (annotations, external source keys, configuration flags, etc.) that are
 * conceptually attached to the owning entity rather than to a time validity.
 */
export function getMetadataClassName(baseClass) {
  return `${baseClass}Metadata`;
}

export function isMetadataOwnerClass(className) {
  return METADATA_CLASSES.has(className);
}

/**
 * PostgreSQL reserved keywords that need escaping
 */
export const POSTGRESQL_RESERVED_KEYWORDS = new Set([
  'all',
  'analyse',
  'analyze',
  'and',
  'any',
  'array',
  'as',
  'asc',
  'asymmetric',
  'authorization',
  'binary',
  'both',
  'case',
  'cast',
  'check',
  'collate',
  'collation',
  'column',
  'concurrently',
  'constraint',
  'create',
  'cross',
  'current_catalog',
  'current_date',
  'current_role',
  'current_schema',
  'current_time',
  'current_timestamp',
  'current_user',
  'default',
  'deferrable',
  'desc',
  'distinct',
  'do',
  'else',
  'end',
  'except',
  'fetch',
  'filter',
  'for',
  'foreign',
  'from',
  'group',
  'having',
  'intersect',
  'into',
  'ilike',
  'is',
  'isnull',
  'join',
  'lateral',
  'leading',
  'left',
  'like',
  'limit',
  'localtime',
  'localtimestamp',
  'natural',
  'not',
  'notnull',
  'null',
  'offset',
  'on',
  'only',
  'or',
  'order',
  'outer',
  'overlaps',
  'placing',
  'primary',
  'references',
  'returning',
  'right',
  'select',
  'session_user',
  'similar',
  'some',
  'symmetric',
  'table',
  'tablesample',
  'then',
  'to',
  'trailing',
  'union',
  'unique',
  'user',
  'using',
  'variadic',
  'verbose',
  'when',
  'where',
  'window',
  'with',
]);

/**
 * Known XSD and RDF datatypes
 */
export const KNOWN_DATATYPES = new Set([
  'string',
  'normalizedString',
  'token',
  'language',
  'Name',
  'NCName',
  'date',
  'dateTime',
  'time',
  'gYear',
  'gMonth',
  'gDay',
  'boolean',
  'decimal',
  'float',
  'double',
  'integer',
  'nonNegativeInteger',
  'positiveInteger',
  'nonPositiveInteger',
  'negativeInteger',
  'long',
  'int',
  'short',
  'byte',
  'Literal',
]);

/**
 * SQL type mappings for XSD datatypes
 */
export const SQL_TYPE_MAPPINGS = {
  datetime: 'TIMESTAMP',
  date: 'DATE',
  time: 'TIME',
  gYear: 'INTEGER',
  boolean: 'BOOLEAN',
  decimal: 'NUMERIC',
  float: 'REAL',
  double: 'DOUBLE PRECISION',
  integer: 'INTEGER',
  long: 'BIGINT',
  short: 'SMALLINT',
  string: 'TEXT',
  normalizedString: 'TEXT',
  token: 'TEXT',
  literal: 'TEXT',
};

/**
 * Namespace prefixes that indicate technical/modeling classes
 */
export function getTechnicalNamespacePrefixes() {
  return [NAMESPACES.pplan];
}

/**
 * Override property groups to customize generator behavior without
 * changing code. Keys are optional and can include:
 */
export const OVERRIDE_PROPERTIES = new Map([
  [
    `${NAMESPACES.qudt}hasUnit`,
    { type: 'number', sqlType: 'DOUBLE PRECISION', comment: `${NAMESPACES.qudt}hasUnit` },
  ],
  [
    `${NAMESPACES.qudt}hasNumericValue`,
    { type: 'number', sqlType: 'DOUBLE PRECISION', comment: `${NAMESPACES.qudt}hasNumericValue` },
  ],
  [
    `${NAMESPACES.ogc}hasGeometry`,
    { type: 'string', sqlType: 'TEXT', comment: `${NAMESPACES.ogc}hasGeometry -> WKT` },
  ],
]);

/**
 * If true, prefer creating a super-entity table for multi-target
 * relationships instead of a typed join table with a `target_type` column.
 */
export const USE_SUPER_ENTITY_FOR_MULTI_RELATIONS = true;

/**
 * When true, treat configured `INTERFACE_CLASSES` as super-entity targets
 * for multi-target relationships. Instead of creating a typed join table
 * with a `target_type` column, the generator will create a super-entity
 * table that represents the relationship and references the concrete
 * targets. This is intended to be an easy switch between behaviors.
 */
export const USE_INTERFACE_CLASSES_AS_SUPER_ENTITIES = true;

/**
 * Check if a class should always include temporal attributes
 */
export function isTemporalClass(className) {
  return TEMPORAL_CLASSES.has(className);
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
  return rangeTypes.every((t) => KNOWN_DATATYPES.has(t));
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
    if (
      lower.includes('int') ||
      lower === 'integer' ||
      lower === 'nonnegativeinteger' ||
      lower === 'positiveinteger'
    ) {
      return 'INTEGER';
    }
    if (
      lower === 'string' ||
      lower === 'normalizedstring' ||
      lower === 'token' ||
      lower === 'literal'
    ) {
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
    if (lower === 'decimal' || lower === 'float') return 'float';
    if (lower === 'double') return 'double';
    if (
      lower.includes('int') ||
      lower === 'integer' ||
      lower === 'nonnegativeinteger' ||
      lower === 'positiveinteger'
    ) {
      return 'integer';
    }
    if (
      lower === 'string' ||
      lower === 'normalizedstring' ||
      lower === 'token' ||
      lower === 'literal'
    ) {
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
  // Treat per-entity UUID columns (e.g. `entity_uuid`) as primary keys
  if (typeof attrName === 'string' && attrName.endsWith('_uuid')) return true;

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

  // Note: interface-like classes (INTERFACE_CLASSES) are not special-cased
  // here. Whether interface classes are emitted for schema generation is
  // controlled by callers (computeVisibleClasses(includeInterfaceClasses=true)).

  // Explicitly excluded classes
  if (EXCLUDED_TECHNICAL_CLASSES.has(className)) {
    return true;
  }

  // Classes from technical namespaces
  if (classInfo.iri) {
    const iriString = String(classInfo.iri);
    const technicalPrefixes = getTechnicalNamespacePrefixes();
    if (technicalPrefixes.some((prefix) => iriString.startsWith(prefix))) {
      return true;
    }
  }

  // SKOS concept schemes are technical
  if (classInfo.isConceptScheme) return true;

  // Enum classes are technical
  if (enumClasses.has(className)) return false;

  return false;
}
