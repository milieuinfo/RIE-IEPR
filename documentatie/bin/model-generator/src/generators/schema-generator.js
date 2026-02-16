import { BaseGenerator } from './base-generator.js';
import * as Config from '../config.js';

export class SchemaGenerator extends BaseGenerator {
  constructor(ontology, options = {}) {
    super(ontology, options);
  }

  /**
   * Derive the SQL table name to use for schema outputs. This prefers an
   * explicit interface display override (Config.INTERFACE_CLASS_DISPLAY_NAMES),
   * then ontology business name, then the raw class local name.
   * Returns a snake_case table name.
   */
  deriveSchemaTableName(className) {
    // Delegate to BaseGenerator.deriveTableName which already handles
    // interface display overrides and business-name fallbacks.
    if (!className) return '';
    return this.deriveTableName(className);
  }

  /**
   * Resolve a target table name (snake_case) for use in FK generation.
   * Tries the direct candidate, stripped `I` prefix, and ontology business
   * name matches. Returns null when no matching produced table is present
   * in `allTableNameSet`.
   */
  resolveTargetTableName(targetClassName, allTableNameSet = new Set()) {
    if (!targetClassName) return null;
    const tryCandidate = (cn) => {
      const tn = this.deriveSchemaTableName(cn);
      if (allTableNameSet && allTableNameSet.has(tn)) return tn;
      return null;
    };

    // 1) direct
    let resolved = tryCandidate(targetClassName);
    if (resolved) return resolved;

    // 2) stripped leading I (ISystem -> System)
    const stripped = String(targetClassName).replace(/^I(?=[A-Z])/, '');
    resolved = tryCandidate(stripped);
    if (resolved) return resolved;

    // 3) search ontology for matching business/local names
    for (const [local, info] of this.ontology.classes) {
      const biz =
        info && info.iri && this.ontology.getBusinessNameForClass
          ? this.ontology.getBusinessNameForClass(info.iri)
          : null;
      if (
        String(local).toLowerCase() === String(targetClassName).toLowerCase() ||
        (biz && String(biz).toLowerCase() === String(targetClassName).toLowerCase())
      ) {
        const tn = this.deriveSchemaTableName(local);
        if (allTableNameSet && allTableNameSet.has(tn)) return tn;
      }
    }

    return null;
  }

  computeJoinTablesFor(
    relationships,
    config = Config,
    visibleClasses = new Set(this.computeVisibleClasses(true))
  ) {
    const joinTables = [];
    const junctionTableInfo = new Map();
    const seen = new Set();

    // Track which property IRIs have corresponding join tables so attribute
    // rendering can omit direct FK columns for those relationships. Also
    // track the derived FK attribute names that should be suppressed.
    const joinTablePropertyIris = new Set();
    const joinTableAttributeNames = new Set();

    const variableRelationships = new Map();
    const enumDefinitions = new Map();

    const groups = new Map();
    const visibleSet = visibleClasses ? new Set(visibleClasses) : null;
    relationships.forEach((rel) => {
      if (visibleSet && !visibleSet.has(rel.from)) return;
      if (rel.property === 'hasInputVar' || rel.property === 'hasOutputVar') {
        const key = `${rel.from}_variabele_relatie`;
        if (!variableRelationships.has(key)) {
          variableRelationships.set(key, {
            fromTable: this.utils.deriveTableName(rel.from),
            toTable: this.utils.deriveTableName(rel.to),
            fromClass: rel.from,
            toClass: rel.to,
            relationships: [],
            propertyIris: new Set(),
          });
        }
        variableRelationships.get(key).relationships.push(rel.property);
        // remember the property IRI for later suppression of FK attributes
        if (rel.propertyIri) variableRelationships.get(key).propertyIris.add(rel.propertyIri);
        return;
      }

      const groupKey = `${rel.from}|${rel.propertyIri || rel.property}`;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey).push(rel);
    });

    function makePropBase(propSource) {
      if (/[A-Z]/.test(String(propSource))) {
        return Config.camelCaseToSnakeCase(String(propSource));
      }
      return String(propSource)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^0-9A-Za-z]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
    }

    groups.forEach((rels) => {
      const rel0 = rels[0];
      const fromTable = this.utils.deriveTableName(rel0.from);
      const businessName = this.ontology.getBusinessNameForProperty(rel0.propertyIri, rel0.from);
      const businessLabel = this.ontology.getBusinessLabelForProperty(rel0.propertyIri, rel0.from);
      const propSource = rel0.label || businessLabel || businessName || rel0.property;
      const propBase = makePropBase(propSource);

      if (rels.length > 1) {
        const joinTableName = `${fromTable}_${propBase}`;
        if (seen.has(joinTableName)) return;
        seen.add(joinTableName);

        const targetTypes = rels.map((r) => r.to);
        if (visibleSet) {
          const hasVisibleTarget = targetTypes.some((t) => visibleSet.has(t));
          if (!hasVisibleTarget) return;
        }
        const enumName = `${joinTableName}_target_type_enum`;
        const enumValues = targetTypes
          .map((t) =>
            String(t)
              .toUpperCase()
              .replace(/[^A-Z0-9_]/g, '_')
          )
          .filter((v, i, a) => v && a.indexOf(v) === i);
        if (enumValues.length > 0) {
          enumDefinitions.set(enumName, enumValues);
        }

        // Attributes for a typed join table (default behaviour)
        const typedAttributes = [
          {
            name: `${fromTable}_uuid`,
            type: 'string',
            sqlType: 'UUID',
            comment: rel0.from,
            isForeignKey: true,
            isPrimaryKey: true,
          },
          {
            name: `target_uuid`,
            type: 'string',
            sqlType: 'UUID',
            comment: targetTypes.join(', '),
            isForeignKey: false,
            isPrimaryKey: true,
          },
          {
            name: `target_type`,
            type: 'enum',
            sqlType: enumValues.length > 0 ? enumName : 'TEXT',
            comment: targetTypes.join(', '),
            isForeignKey: false,
            isPrimaryKey: false,
          },
        ];

        // If configured, create a super-entity table that represents the
        // relationship target as a separate entity instead of using a
        // typed join table with `target_type`. This mirrors the idea of
        // shared interfaces used by the class generators.
        // Allow using configured interface classes as super-entities
        // Only allow interface-driven super-entity creation when the
        // general `USE_SUPER_ENTITY_FOR_MULTI_RELATIONS` flag is also enabled.
        // This preserves the original toggle behaviour for users who only
        // flip the legacy `USE_SUPER_ENTITY_FOR_MULTI_RELATIONS` flag.
        const useInterfaceSuper =
          config &&
          config.USE_INTERFACE_CLASSES_AS_SUPER_ENTITIES &&
          config.USE_SUPER_ENTITY_FOR_MULTI_RELATIONS;
        const interfaceClasses =
          config && config.INTERFACE_CLASSES && typeof config.INTERFACE_CLASSES.has === 'function'
            ? Array.from(config.INTERFACE_CLASSES)
            : [];
        const normalizeLocal = (s) => String(s).replace(/^I(?=[A-Z])/, '');

        // Determine whether the concrete target types share a common superclass
        // that is listed in `INTERFACE_CLASSES` (e.g. many concrete types implement
        // a shared `System` interface). If so, consider the join table a
        // super-entity table when `USE_INTERFACE_CLASSES_AS_SUPER_ENTITIES` is set.
        let intersectsInterface = false;
        if (Array.isArray(targetTypes) && targetTypes.length > 0) {
          // collect supers for each target (normalized)
          const supersForTargets = targetTypes.map((t) => {
            try {
              const ci = this.ontology.classes.get(t) || {};
              const direct = (
                this.getSuperClassNames ? this.getSuperClassNames(ci) : ci.superClasses || []
              ).slice();
              // include local names from superClasses IRIs
              if (Array.isArray(ci.superClasses)) {
                ci.superClasses.forEach((si) => {
                  try {
                    const local = this.ontology.extractLocalName(si);
                    if (local && !direct.includes(local)) direct.push(local);
                  } catch (e) {}
                });
              }
              return direct.map((d) => normalizeLocal(d));
            } catch (e) {
              return [];
            }
          });
          // compute intersection of supers
          if (supersForTargets.length > 0) {
            const common = supersForTargets.reduce(
              (acc, cur) => acc.filter((x) => cur.includes(x)),
              supersForTargets[0].slice()
            );
            if (common && common.length > 0) {
              // see if any common super is in configured interface classes
              const normInterfaces = interfaceClasses.map((i) => normalizeLocal(i));
              intersectsInterface = common.some((c) => normInterfaces.includes(c));
            }
          }
        }

        if (useInterfaceSuper && intersectsInterface) {
          const superAttributes = [
            {
              name: `${joinTableName}_uuid`,
              type: 'string',
              sqlType: 'UUID',
              comment: joinTableName,
              isForeignKey: false,
              isPrimaryKey: true,
            },
            {
              name: `${fromTable}_uuid`,
              type: 'string',
              sqlType: 'UUID',
              comment: rel0.from,
              isForeignKey: true,
              isPrimaryKey: false,
            },
            {
              name: `target_uuid`,
              type: 'string',
              sqlType: 'UUID',
              comment: targetTypes.join(', '),
              isForeignKey: false,
              isPrimaryKey: false,
            },
          ];

          joinTables.push({
            name: joinTableName,
            attributes: superAttributes,
            isSuperEntity: true,
          });
          // record property IRI and predicted FK attribute name for
          // suppression of direct FK attribute
          if (rel0.propertyIri) {
            joinTablePropertyIris.add(rel0.propertyIri);
            try {
              const fk = this.deriveFkName({ propertyIri: rel0.propertyIri, property: rel0.property, fromClass: rel0.from });
              if (fk) joinTableAttributeNames.add(fk);
            } catch (e) {}
          }
          junctionTableInfo.set(joinTableName, {
            from: rel0.from,
            to: joinTableName,
            concreteTargets: targetTypes,
            addsTemporal: true,
            label: businessLabel || rel0.label || '',
          });
          // Add temporal fields to the super-entity (not primary keys)
          superAttributes.push({
            name: 'geldig_van',
            type: 'date',
            sqlType: 'DATE',
            isForeignKey: false,
            isPrimaryKey: true,
          });
          superAttributes.push({
            name: 'aangemaakt_op',
            type: 'datetime',
            sqlType: 'TIMESTAMP',
            isForeignKey: false,
            isPrimaryKey: true,
          });
          superAttributes.push({
            name: 'geldig_tot',
            type: 'date',
            sqlType: 'DATE',
            isForeignKey: false,
            isPrimaryKey: false,
          });
        } else if (config && config.USE_SUPER_ENTITY_FOR_MULTI_RELATIONS) {
          const superAttributes = [
            {
              name: `${joinTableName}_uuid`,
              type: 'string',
              sqlType: 'UUID',
              comment: joinTableName,
              isForeignKey: false,
              isPrimaryKey: true,
            },
            {
              name: `${fromTable}_uuid`,
              type: 'string',
              sqlType: 'UUID',
              comment: rel0.from,
              isForeignKey: true,
              isPrimaryKey: false,
            },
            {
              name: `target_uuid`,
              type: 'string',
              sqlType: 'UUID',
              comment: targetTypes.join(', '),
              isForeignKey: false,
              isPrimaryKey: false,
            },
          ];

          joinTables.push({
            name: joinTableName,
            attributes: superAttributes,
            isSuperEntity: true,
          });
          // record property IRI and predicted FK attribute name for
          // suppression of direct FK attribute
          if (rel0.propertyIri) {
            joinTablePropertyIris.add(rel0.propertyIri);
            try {
              const fk = this.deriveFkName({ propertyIri: rel0.propertyIri, property: rel0.property, fromClass: rel0.from });
              if (fk) joinTableAttributeNames.add(fk);
            } catch (e) {}
          }
          junctionTableInfo.set(joinTableName, {
            from: rel0.from,
            to: joinTableName,
            concreteTargets: targetTypes,
            addsTemporal: true,
            label: businessLabel || rel0.label || '',
          });
          // Add temporal fields to the super-entity (not primary keys)
          superAttributes.push({
            name: 'geldig_van',
            type: 'date',
            sqlType: 'DATE',
            isForeignKey: false,
            isPrimaryKey: true,
          });
          superAttributes.push({
            name: 'aangemaakt_op',
            type: 'datetime',
            sqlType: 'TIMESTAMP',
            isForeignKey: false,
            isPrimaryKey: true,
          });
          superAttributes.push({
            name: 'geldig_tot',
            type: 'date',
            sqlType: 'DATE',
            isForeignKey: false,
            isPrimaryKey: false,
          });
        } else {
          // Default behavior: typed join table — make it temporal
          typedAttributes.push({
            name: 'geldig_van',
            type: 'date',
            sqlType: 'DATE',
            isForeignKey: false,
            isPrimaryKey: true,
          });
          typedAttributes.push({
            name: 'aangemaakt_op',
            type: 'datetime',
            sqlType: 'TIMESTAMP',
            isForeignKey: false,
            isPrimaryKey: true,
          });
          typedAttributes.push({
            name: 'geldig_tot',
            type: 'date',
            sqlType: 'DATE',
            isForeignKey: false,
            isPrimaryKey: false,
          });
          joinTables.push({ name: joinTableName, attributes: typedAttributes });
          // record property IRI and predicted FK attribute name for
          // suppression of direct FK attribute
          if (rel0.propertyIri) {
            joinTablePropertyIris.add(rel0.propertyIri);
            try {
              const fk = this.deriveFkName({ propertyIri: rel0.propertyIri, property: rel0.property, fromClass: rel0.from });
              if (fk) joinTableAttributeNames.add(fk);
            } catch (e) {}
          }
          // Include `concreteTargets` for downstream consumers (ER generator)
          junctionTableInfo.set(joinTableName, {
            from: rel0.from,
            to: targetTypes,
            concreteTargets: targetTypes,
            addsTemporal: true,
            label: businessLabel || rel0.label || '',
          });
        }
      } else {
        const rel = rels[0];
        const toTable = this.utils.deriveTableName(rel.to);
        const joinTableName = `${fromTable}_${propBase}_${toTable}`;
        if (seen.has(joinTableName)) return;
        if (visibleSet && (!visibleSet.has(rel.from) || !visibleSet.has(rel.to))) return;
        seen.add(joinTableName);

        let fromColumn = `${fromTable}_uuid`;
        let toColumn = `${toTable}_uuid`;
        if (fromColumn === toColumn) {
          fromColumn = `${fromTable}_uuid_from`;
          toColumn = `${toTable}_uuid_to`;
        }

        const attributes = [
          {
            name: fromColumn,
            type: 'string',
            sqlType: 'UUID',
            comment: rel.from,
            isForeignKey: true,
            isPrimaryKey: true,
          },
          {
            name: toColumn,
            type: 'string',
            sqlType: 'UUID',
            comment: rel.to,
            isForeignKey: true,
            isPrimaryKey: true,
          },
          {
            name: 'geldig_van',
            type: 'date',
            sqlType: 'DATE',
            isForeignKey: false,
            isPrimaryKey: true,
          },
          {
            name: 'aangemaakt_op',
            type: 'datetime',
            sqlType: 'TIMESTAMP',
            isForeignKey: false,
            isPrimaryKey: true,
          },
          {
            name: 'geldig_tot',
            type: 'date',
            sqlType: 'DATE',
            isForeignKey: false,
            isPrimaryKey: false,
          },
        ];

        joinTables.push({ name: joinTableName, attributes });
        // record property IRI and predicted FK attribute name for
        // suppression of direct FK attribute
        if (rel.propertyIri) {
          joinTablePropertyIris.add(rel.propertyIri);
          try {
            const fk = this.deriveFkName({ propertyIri: rel.propertyIri, property: rel.property, fromClass: rel.from });
            if (fk) joinTableAttributeNames.add(fk);
          } catch (e) {}
        }
        junctionTableInfo.set(joinTableName, {
          from: rel.from,
          to: rel.to,
          addsTemporal: true,
          label: businessLabel || rel.label || '',
        });
      }
    });

    variableRelationships.forEach((config, key) => {
      const fromTable = config.fromTable;
      const toTable = config.toTable;
      const joinTableName = `${fromTable}_variabele_relatie`;
      if (seen.has(joinTableName)) return;
      seen.add(joinTableName);

      const relEnumName = `${joinTableName}_relationship_type_enum`;
      const relEnumValues = ['INPUT_VAR', 'OUTPUT_VAR'];
      enumDefinitions.set(relEnumName, relEnumValues);

      const attributes = [
        {
          name: `${fromTable}_uuid`,
          type: 'string',
          sqlType: 'UUID',
          comment: config.fromClass,
          isForeignKey: true,
          isPrimaryKey: true,
        },
        {
          name: `${toTable}_uuid`,
          type: 'string',
          sqlType: 'UUID',
          comment: config.toClass,
          isForeignKey: true,
          isPrimaryKey: true,
        },
        {
          name: 'relationship_type',
          type: 'enum',
          sqlType: relEnumName,
          comment: relEnumValues.join(', '),
          isForeignKey: false,
          isPrimaryKey: true,
        },
      ];

      // Make variable relationship tables temporal as well
      attributes.push({
        name: 'geldig_van',
        type: 'date',
        sqlType: 'DATE',
        isForeignKey: false,
        isPrimaryKey: true,
      });
      attributes.push({
        name: 'aangemaakt_op',
        type: 'datetime',
        sqlType: 'TIMESTAMP',
        isForeignKey: false,
        isPrimaryKey: true,
      });
      attributes.push({
        name: 'geldig_tot',
        type: 'date',
        sqlType: 'DATE',
        isForeignKey: false,
        isPrimaryKey: false,
      });

      joinTables.push({ name: joinTableName, attributes });
      junctionTableInfo.set(joinTableName, {
        from: config.fromClass,
        to: config.toClass,
        addsTemporal: true,
        label: 'hasInputVar/hasOutputVar',
      });
      // record all property IRIs that mapped to this variable relationship
      if (config.propertyIris && config.propertyIris.size > 0) {
        for (const pi of config.propertyIris) {
          joinTablePropertyIris.add(pi);
          try {
            const fk = this.deriveFkName({ propertyIri: pi, property: Array.from(config.relationships || [])[0], fromClass: config.fromClass });
            if (fk) joinTableAttributeNames.add(fk);
          } catch (e) {}
        }
      }
    });

    // Expose the set on `this` so other generator phases can suppress
    // attributes corresponding to relationship join tables.
    this._joinTablePropertyIris = joinTablePropertyIris;
    this._joinTableAttributeNames = joinTableAttributeNames;

    return { joinTables, junctionTableInfo, enumDefinitions };
  }

  generateIdentifierAttributesForClass(parentClass) {
    // Delegate to BaseGenerator implementation
    return [
      {
        name: `${Config.camelCaseToSnakeCase(parentClass)}_uuid`,
        type: 'string',
        sqlType: 'UUID',
        comment: parentClass,
        isForeignKey: true,
        isPrimaryKey: true,
        propertyIri: 'http://www.w3.org/ns/adms#identifier',
      },
      ...super.generateIdentifierAttributesForClass(parentClass),
    ];
  }

  // Compute which classes are actually used (have attributes or are referenced
  // by relationships or join tables). Returns a Set of class names.
  computeUsedClassSet(classNames, joinTables = []) {
    const usedClassSet = new Set();
    classNames.forEach((className) => {
      const classInfo = this.ontology.classes.get(className);
      if (!classInfo) {
        if (String(className).endsWith('Identifier') && this.utils.isIdentifierTable(className)) {
          usedClassSet.add(className);
        }
        return;
      }
      const attrs = this.utils.deriveAttributes(classInfo, this.enumClasses, className);
      if (attrs && attrs.length > 0) usedClassSet.add(className);
    });

    // Add relationship endpoints
    this.relationships.forEach((rel) => {
      usedClassSet.add(rel.from);
      usedClassSet.add(rel.to);
    });

    // Include join tables when provided
    if (Array.isArray(joinTables)) {
      joinTables.forEach((jt) => {
        if (jt && jt.name) usedClassSet.add(jt.name);
        else if (typeof jt === 'string') usedClassSet.add(jt);
      });
    }

    return usedClassSet;
  }

  // Common attribute filtering and sorting used by SQL and ER generators.
  // - Removes virtual identifier properties from non-Identifier tables
  // - Filters out FK attributes that only target purely technical classes
  // - Sorts attributes so PK fields come first, then `geldig_tot`, then others
  filterAndSortAttributes(attributes, className, visibleClassNames = []) {
    if (!Array.isArray(attributes)) return attributes || [];

    let attrs = attributes.slice();

    // Remove virtual identifier attribute from main entity rendering; identifiers
    // are displayed as separate identifier tables instead.
    if (!String(className).endsWith('Identifier')) {
      attrs = attrs.filter((attr) => {
        if (!attr.propertyIri) return true;
        return !String(attr.propertyIri).includes('adms#identifier');
      });
    }

    // Remove attributes that correspond to relationships represented by
    // join/junction tables. These properties were recorded earlier when
    // `computeJoinTablesFor` created join tables and saved the originating
    // property IRIs to `this._joinTablePropertyIris`.
    if (this._joinTablePropertyIris && this._joinTablePropertyIris.size > 0) {
      attrs = attrs.filter((attr) => {
        if (!attr || !attr.propertyIri) return true;
        return !this._joinTablePropertyIris.has(attr.propertyIri);
      });
    }
    // Also suppress attributes by predicted FK attribute name when available
    if (this._joinTableAttributeNames && this._joinTableAttributeNames.size > 0) {
      attrs = attrs.filter((attr) => {
        if (!attr || !attr.name) return true;
        return !this._joinTableAttributeNames.has(attr.name);
      });
    }

    // Remove FK attributes that only reference technical/abstract classes
    attrs = attrs.filter((attr) => {
      if (!attr.isForeignKey || !attr.comment) return true;
      const targets = String(attr.comment)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => !!s);
      if (targets.length === 0) return true;
      const allTechnical = targets.every((t) => {
        const info = this.ontology.classes.get(t);
        return this.utils.isTechnicalClass(t, info);
      });
      return !allTechnical;
    });

    // Sort attributes: PK fields first, then geldig_tot, then others
    const pkFieldOrder = ['uri', 'geldig_van', 'aangemaakt_op'];
    attrs.sort((a, b) => {
      const aIndex = pkFieldOrder.indexOf(a.name);
      const bIndex = pkFieldOrder.indexOf(b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      if (a.name === 'geldig_tot') return -1;
      if (b.name === 'geldig_tot') return 1;

      return 0;
    });

    return attrs;
  }
}

export default SchemaGenerator;
