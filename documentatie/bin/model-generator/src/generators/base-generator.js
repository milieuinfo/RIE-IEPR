import * as Config from '../config.js';

export class BaseGenerator {
  constructor(ontology, options = {}) {
    this.ontology = ontology;
    this.options = options;
    this.utils = this;
    this.enumClasses = new Set();
    this.relationships = new Map();
    this.identifierRelations = new Map();
    this.inheritance = new Map();
  }

  prepareOntology() {
    if (typeof this.ontology.extractClasses === 'function') this.ontology.extractClasses();
    if (typeof this.ontology.addExternalClassesFromRestrictions === 'function') this.ontology.addExternalClassesFromRestrictions();
    if (typeof this.ontology.addDomainRangeRestrictions === 'function') this.ontology.addDomainRangeRestrictions();
    this.enumClasses = this.utils.computeEnumClasses();
  }

  buildRelationships(includeIdentifierRelations = true) {
    this.relationships.clear();
    this.inheritance.clear();
    this.identifierRelations.clear();
    const { relationships, inheritance, identifierRelations } = this.extractRelationshipsAndInheritance(this.ontology, this.enumClasses, includeIdentifierRelations);
    if (relationships) relationships.forEach((r, k) => this.relationships.set(k, r));
    if (inheritance) inheritance.forEach((r, k) => this.inheritance.set(k, r));
    if (identifierRelations) identifierRelations.forEach((r, k) => this.identifierRelations.set(k, r));
  }

  computeEnumClasses() {
    // Delegate to ontology implementation (keeps behavior consistent)
    return this.ontology.computeEnumClasses();
  }

  /**
   * Compute shared supers and mapping of classes to supers.
   * Returns { classToSupers, sharedSupers, sharedInterfaceNames }
   */
  computeSharedSupers(classNames, forceExternal = []) {
    const superCount = new Map();
    const classToSupers = new Map();
    classNames.forEach(cn => {
      const ci = this.ontology.classes.get(cn) || {};
      const supers = (this.utils.getSuperClassNames(ci) || []).slice();
      (ci.superClasses || []).forEach(sIri => {
        const local = this.ontology.extractLocalName(sIri);
        if (local && !supers.includes(local)) supers.push(local);
      });
      classToSupers.set(cn, supers);
      supers.forEach(s => superCount.set(s, (superCount.get(s) || 0) + 1));
    });

    let sharedSupers = Array.from(superCount.entries()).filter(([s, cnt]) => cnt > 1).map(([s]) => s);
    forceExternal.forEach(s => { if (!sharedSupers.includes(s)) sharedSupers.push(s); });
    sharedSupers = sharedSupers.filter(s => {
      const info = this.ontology.classes.get(s);
      return Boolean((info && info.external) || forceExternal.includes(s));
    });

    const sharedInterfaceNames = new Map();
    sharedSupers.forEach(s => sharedInterfaceNames.set(s, `I${this.pascalCase ? this.pascalCase(s) : s}`));

    return { classToSupers, sharedSupers, sharedInterfaceNames };
  }

  /**
   * Determine which shared interfaces are actually used by the visible classes
   * or referenced by foreign key targets. Returns a Set of interface node names.
   */
  computeUsedSharedInterfaces(classNames, classToSupers, sharedInterfaceNames) {
    const usedSharedInterfaces = new Set();
    classNames.forEach(className => {
      const classInfo = this.ontology.classes.get(className);
      const supers = classToSupers.get(className) || [];
      // Would this class implement a shared interface? (no internal superclass)
      let hasInternalSuper = false;
      for (const s of supers) {
        const sinfo = this.ontology.classes.get(s);
        if (sinfo && !sinfo.external) { hasInternalSuper = true; break; }
      }
      if (!hasInternalSuper) {
        for (const s of supers) {
          if (sharedInterfaceNames.has(s)) { usedSharedInterfaces.add(sharedInterfaceNames.get(s)); break; }
        }
      }

      // Inspect attributes for FK targets that would resolve to a shared interface
      let attrs = [];
      if (!classInfo) {
        if (className.endsWith('Identifier') && this.isIdentifierTable(className)) {
          const parentClass = className.replace('Identifier', '');
          attrs = this.generateIdentifierAttributesForClass(parentClass) || [];
        } else {
          attrs = [];
        }
      } else {
        attrs = this.deriveAttributes(classInfo, this.enumClasses, className) || [];
      }
      attrs.forEach(attr => {
        if (!attr.isForeignKey || !Array.isArray(attr.targetClasses) || attr.targetClasses.length === 0) return;
        const targets = attr.targetClasses.filter(tn => classNames.includes(tn));
        if (targets.length === 0) return;

        const supersList = targets.map(t => {
          const list = (classToSupers.get(t) || []).slice();
          const tinfo = this.ontology.classes.get(t);
          if (tinfo && Array.isArray(tinfo.superClasses)) {
            tinfo.superClasses.forEach(si => {
              const local = this.ontology.extractLocalName(si);
              if (local && !list.includes(local)) list.push(local);
            });
          }
          return list;
        });
        if (supersList.length === 0) return;
        const common = supersList.reduce((acc, cur) => acc.filter(x => cur.includes(x)), supersList[0].slice());
        for (const s of common) {
          if (sharedInterfaceNames.has(s)) { usedSharedInterfaces.add(sharedInterfaceNames.get(s)); break; }
        }
      });
    });
    return usedSharedInterfaces;
  }

  /**
   * Extract relationships and inheritance for use in generators
   * Returns { relationships, inheritance, identifierRelations } (identifierRelations only when requested)
   */
  extractRelationshipsAndInheritance(ontology, enumClasses, includeIdentifierRelations = false) {
    const relationships = new Map();
    const inheritance = new Map();
    const identifierRelations = new Map();
    enumClasses = enumClasses || new Set();

    for (const [classLocalName, classInfo] of ontology.classes) {
      if (this.isTechnicalClass(classLocalName, classInfo)) continue;
      // Inheritance (subClassOf)
      const superClassNames = ontology.getSuperClassNames(classInfo);
      superClassNames
        .filter(name => !enumClasses.has(name))
        .filter(name => {
          const info = ontology.classes.get(name);
          return !this.isTechnicalClass(name, info);
        })
        .forEach(name => {
          const info = ontology.classes.get(name);
          if (info?.external && !info.isBusinessConceptTarget) return;
          const key = `${name}|${classLocalName}`;
          if (!inheritance.has(key)) {
            inheritance.set(key, {
              from: name,
              to: classLocalName
            });
          }
        });

      // Relationships (object properties)
      (classInfo.restrictions || []).forEach(restriction => {
        // Special: identifier
        if (restriction.property === 'identifier' && restriction.propertyIri && restriction.propertyIri.includes('adms#identifier')) {
          if (includeIdentifierRelations) identifierRelations.set(classLocalName, restriction);
          return;
        }
        if (restriction.rangeTypes.length === 0) return;
        if (!ontology.isRelevantPropertyIri(restriction.propertyIri)) return;
        const resolvedRangeTypes = ontology
          .resolveRangeTypes(restriction.rangeTypes, restriction)
          .filter(type => !enumClasses.has(type))
          .filter(type => ontology.isRelevantClassName(type))
          .filter(type => {
            const info = ontology.classes.get(type);
            return !this.isTechnicalClass(type, info);
          });
        resolvedRangeTypes.forEach(rangeType => {
          const key = `${classLocalName}|${rangeType}|${restriction.property}`;
          if (!relationships.has(key)) {
            const businessLabel = ontology.getBusinessLabelForProperty(restriction.propertyIri, classLocalName);
            relationships.set(key, {
              from: classLocalName,
              to: rangeType,
              property: restriction.property,
              label: businessLabel || restriction.property,
              minCard: restriction.minCardinality,
              maxCard: restriction.maxCardinality
            });
          }
        });
      });
    }

    if (includeIdentifierRelations) {
      return { relationships, inheritance, identifierRelations };
    }

    return { relationships, inheritance };
  }

  /**
   * Internal method for deriving attributes without enum checking
   * Used by computeEnumClasses to avoid circular dependencies
   */
  deriveAttributesInternal(classInfo, enumClasses, className, skipForeignKeys) {
    const attributes = [];
    if (!classInfo) return attributes;
    const seen = new Set();

    (classInfo.restrictions || []).forEach(restriction => {
      if (!this.ontology.isRelevantPropertyIri(restriction.propertyIri)) return;

      // Handle dct:type with no explicit range as a simple string attribute
      if (restriction.propertyIri === `${Config.NAMESPACES.dct}type` && restriction.rangeTypes.length === 0) {
        const attrName = this.deriveAttributeName(restriction);
        if (seen.has(attrName)) return;
        seen.add(attrName);
        attributes.push({ name: attrName, type: 'string', sqlType: 'TEXT', isForeignKey: false });
        return;
      }

      // Handle QUDT properties without explicit range
      if ((restriction.propertyIri === `${Config.NAMESPACES.qudt}hasUnit` ||
           restriction.propertyIri === `${Config.NAMESPACES.qudt}hasNumericValue`) &&
          restriction.rangeTypes.length === 0) {
        const attrName = this.deriveAttributeName(restriction);
        if (seen.has(attrName)) return;
        seen.add(attrName);
        attributes.push({ name: attrName, type: 'string', sqlType: 'TEXT', isForeignKey: false });
        return;
      }

      // Special handling for geometry properties - treat as TEXT datatype
      if (Config.isGeometryProperty(restriction.property)) {
        const attrName = this.deriveAttributeName(restriction);
        if (seen.has(attrName)) return;
        seen.add(attrName);
        attributes.push({ name: attrName, type: 'string', sqlType: 'TEXT', isForeignKey: false });
        return;
      }

      const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction);
      const isDatatype = Config.isDatatypeRange(restriction.rangeTypes);
      const isForeignKey = !isDatatype && resolvedRangeTypes.length > 0;

      if (isForeignKey && skipForeignKeys) {
        return; // Skip FK when requested
      }

      if (isDatatype) {
        const attrName = this.deriveAttributeName(restriction);
        if (seen.has(attrName)) return;
        seen.add(attrName);
        attributes.push({
          name: attrName,
          type: Config.inferMermaidDataType(restriction.rangeTypes, attrName),
          sqlType: Config.inferSqlDataType(restriction.rangeTypes, attrName),
          isForeignKey: false
        });
      }
    });

    return attributes;
  }

  /**
   * Compute attributes for a class, handling identifier relations and
   * filtering out attributes that belong to a direct superclass when
   * extending that superclass.
   */
  computeAttributesForClass(className, classNames = [], extendsSuperName = null) {
    const camel = (s) => Config.camelCaseToSnakeCase ? Config.camelCaseToSnakeCase(s) : String(s);
    let attrs = [];
    const classInfo = this.ontology.classes.get(className);
    if (!classInfo) {
      if (className.endsWith('Identifier') && this.identifierRelations && this.identifierRelations.has(className.replace('Identifier', ''))) {
        const parentClass = className.replace('Identifier', '');
        attrs = this.generateIdentifierAttributesForClass(parentClass) || [];
      } else {
        attrs = [];
      }
    } else {
      attrs = this.deriveAttributes(classInfo, this.enumClasses, className) || [];
    }

    if (extendsSuperName) {
      const superInfo = this.ontology.classes.get(extendsSuperName);
      if (superInfo) {
        const superAttrs = this.deriveAttributes(superInfo, this.enumClasses, extendsSuperName) || [];
        const superNames = new Set(superAttrs.map(a => a.name));
        attrs = attrs.filter(a => !superNames.has(a.name));
        const fkForSuper = `${Config.camelCaseToSnakeCase(this.getBusinessClassName(extendsSuperName))}_id`;
        attrs = attrs.filter(a => {
          if (a.name === fkForSuper) return false;
          if (!a.isForeignKey || !Array.isArray(a.targetClasses)) return true;
          return !a.targetClasses.includes(extendsSuperName);
        });
      }
    }

    // Add virtual identifier attribute when identifier relations exist
      if (this.identifierRelations && this.identifierRelations.has(className)) {
      const identClass = `${className}Identifier`;
      if (Array.isArray(classNames) && classNames.includes(identClass)) {
        const restriction = this.identifierRelations.get(className);
        const derivedName = (this.ontology && typeof this.ontology.deriveAttributeName === 'function')
          ? this.ontology.deriveAttributeName(restriction)
          : `${camel(className)}Identifiers`;
        attrs.push({
          name: derivedName,
          type: 'string',
          sqlType: 'TEXT',
          isForeignKey: true,
          propertyIri: `${Config.NAMESPACES.adms}identifier`,
          targetClasses: [identClass],
          minCardinality: 0,
          maxCardinality: undefined
        });
      }
    }

    return attrs;
  }

  /**
   * Determine whether a given class name represents an identifier table.
   * Moved here so all generators can share the same logic.
   */
  isIdentifierTable(className) {
    if (!className || !className.endsWith('Identifier')) return false;
    const parentClass = className.replace('Identifier', '');
    return this.identifierRelations && this.identifierRelations.has(parentClass);
  }

  computeVisibleClasses() {
    const classNames = Array.from(this.ontology.classes.keys())
      .filter(name => {
        if (this.enumClasses.has(name)) return false;
        if (!this.ontology.isRelevantClassName(name)) return false;
        const info = this.ontology.classes.get(name);
        // Exclude external vocabulary classes (SOSA/PROV/GeoSPARQL/etc.)
        // unless they are explicitly a business concept target in the RIE mappings.
        if (info && info.external && !info.isBusinessConceptTarget) return false;
        if (this.utils.isTechnicalClass(name, info)) return false;
        return true;
      })
      .sort((a, b) => a.localeCompare(b));

    // Add identifier tables
    this.identifierRelations.forEach((restriction, classLocalName) => {
      const identifierTableName = `${classLocalName}Identifier`;
      if (!classNames.includes(identifierTableName)) {
        classNames.push(identifierTableName);
      }
    });
    classNames.sort((a, b) => a.localeCompare(b));

    return classNames;
  }

  getDisplayName(className, classInfo = null) {
    if (!classInfo) {
      classInfo = this.ontology.classes.get(className);
    }
    // Prefer business name from ontology when available (handled below)
    // Prefer business name (when available), then label, then fallback to className
    let raw = className;
    try {
      if (classInfo && classInfo.iri && this.ontology.getBusinessNameForClass) {
        const bn = this.ontology.getBusinessNameForClass(classInfo.iri);
        if (bn) raw = bn;
        else if (classInfo.label) raw = classInfo.label;
      } else if (classInfo && classInfo.label) {
        raw = classInfo.label;
      }
    } catch (e) {
      raw = className;
    }
    // normalize to a safe mermaid identifier: replace non-alnum/underscore with underscore
    const cleaned = String(raw).replace(/[^A-Za-z0-9_]+/g, '_');
    // Try to use pascalCase helper if available
    if (typeof this.pascalCase === 'function') return this.pascalCase(cleaned);
    return cleaned.replace(/(^.|_.)/g, s => s.replace(/_/g, '').toUpperCase());
  }

  // Compute join/junction tables from relationships. Default visibleClasses to computed set.
  computeJoinTablesFor(relationships, config = Config, visibleClasses = null) {
    // copy of previous computeJoinTablesLocal logic, adapted to use this.utils/this.ontology
    const joinTables = [];
    const junctionTableInfo = new Map();
    const seen = new Set();

    const variableRelationships = new Map();
    const enumDefinitions = new Map();

    const groups = new Map();
    const visibleSet = visibleClasses ? new Set(visibleClasses) : null;
    relationships.forEach(rel => {
      if (visibleSet && !visibleSet.has(rel.from)) return;
      if (rel.property === 'hasInputVar' || rel.property === 'hasOutputVar') {
        const key = `${rel.from}_variabele_relatie`;
        if (!variableRelationships.has(key)) {
          variableRelationships.set(key, { fromTable: this.utils.deriveTableName(rel.from), toTable: this.utils.deriveTableName(rel.to), fromClass: rel.from, toClass: rel.to, relationships: [] });
        }
        variableRelationships.get(key).relationships.push(rel.property);
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

        const targetTypes = rels.map(r => r.to);
        if (visibleSet) {
          const hasVisibleTarget = targetTypes.some(t => visibleSet.has(t));
          if (!hasVisibleTarget) return;
        }
        const enumName = `${joinTableName}_target_type_enum`;
        const enumValues = targetTypes
          .map(t => String(t).toUpperCase().replace(/[^A-Z0-9_]/g, '_'))
          .filter((v, i, a) => v && a.indexOf(v) === i);
        if (enumValues.length > 0) {
          enumDefinitions.set(enumName, enumValues);
        }

        // Check for a configured override that maps this property to an
        // interface type (collapse multiple concrete targets into one
        // interface-backed join table). We support lookup both by full
        // property IRI and by short property name.
        let override = null;
        const attributes = [
          { name: `${fromTable}_uri`, type: 'string', sqlType: 'TEXT', comment: rel0.from, isForeignKey: true, isPrimaryKey: true },
          { name: `target_uri`, type: 'string', sqlType: 'TEXT', comment: targetTypes.join(', '), isForeignKey: false, isPrimaryKey: true },
          { name: `target_type`, type: 'enum', sqlType: enumValues.length > 0 ? enumName : 'TEXT', comment: targetTypes.join(', '), isForeignKey: false, isPrimaryKey: false }
        ];

        if (override && override.interface && config.INTERFACE_CLASSES && config.INTERFACE_CLASSES.has(override.interface)) {
          // Collapse to the configured interface and remember concrete targets
          // so calling generators can avoid emitting concrete per-type relations
          joinTables.push({ name: joinTableName, attributes });
          junctionTableInfo.set(joinTableName, { from: rel0.from, to: override.interface, concreteTargets: targetTypes, addsTemporal: true, label: businessLabel || rel0.label || '' });
          // Add temporal fields to the join table (not primary keys)
          attributes.push({ name: 'geldig_van', type: 'date', sqlType: 'DATE', isForeignKey: false, isPrimaryKey: false });
          attributes.push({ name: 'aangemaakt_op', type: 'datetime', sqlType: 'TIMESTAMP', isForeignKey: false, isPrimaryKey: false });
          attributes.push({ name: 'geldig_tot', type: 'date', sqlType: 'DATE', isForeignKey: false, isPrimaryKey: false });
        } else {
          joinTables.push({ name: joinTableName, attributes });
          junctionTableInfo.set(joinTableName, { from: rel0.from, to: targetTypes, label: businessLabel || rel0.label || '' });
        }
      } else {
        const rel = rels[0];
        const toTable = this.utils.deriveTableName(rel.to);
        const joinTableName = `${fromTable}_${propBase}_${toTable}`;
        if (seen.has(joinTableName)) return;
        if (visibleSet && (!visibleSet.has(rel.from) || !visibleSet.has(rel.to))) return;
        seen.add(joinTableName);

        let fromColumn = `${fromTable}_uri`;
        let toColumn = `${toTable}_uri`;
        if (fromColumn === toColumn) {
          fromColumn = `${fromTable}_uri_from`;
          toColumn = `${toTable}_uri_to`;
        }

        const attributes = [
          { name: fromColumn, type: 'string', sqlType: 'TEXT', comment: rel.from, isForeignKey: true, isPrimaryKey: true },
          { name: toColumn, type: 'string', sqlType: 'TEXT', comment: rel.to, isForeignKey: true, isPrimaryKey: true }
        ];

        joinTables.push({ name: joinTableName, attributes });
        junctionTableInfo.set(joinTableName, { from: rel.from, to: rel.to, label: businessLabel || rel.label || '' });
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
        { name: `${fromTable}_uri`, type: 'string', sqlType: 'TEXT', comment: config.fromClass, isForeignKey: true, isPrimaryKey: true },
        { name: `${toTable}_uri`, type: 'string', sqlType: 'TEXT', comment: config.toClass, isForeignKey: true, isPrimaryKey: true },
        { name: 'relationship_type', type: 'enum', sqlType: relEnumName, comment: relEnumValues.join(', '), isForeignKey: false, isPrimaryKey: true }
      ];

      joinTables.push({ name: joinTableName, attributes });
      junctionTableInfo.set(joinTableName, { from: config.fromClass, to: config.toClass, label: 'hasInputVar/hasOutputVar' });
    });

    return { joinTables, junctionTableInfo, enumDefinitions };
  }

  /**
   * Check if a class should be excluded from schema
   */
  isTechnicalClass(className, classInfo) {
    if (!className || !classInfo) return false;

    // Use centralized business logic
    return Config.isTechnicalClass(className, classInfo, this.enumClasses);
  }

  /**
   * Derive table name from class name (using business concepts)
   */
  deriveTableName(className) {
    const classInfo = this.ontology.classes.get(className);
    const businessName = classInfo?.iri ? this.ontology.getBusinessNameForClass(classInfo.iri) : null;
    return Config.camelCaseToSnakeCase(businessName || className);
  }

  // deriveFkName moved to OntologyModel; keep wrapper for compatibility
  deriveFkName(restriction) {
    return this.ontology.deriveFkName(restriction);
  }

  /**
   * Get business class name for a class
   */
  getBusinessClassName(className) {
    if (!className) return className;
    const info = this.ontology.classes.get(className);
    const businessName = info?.iri ? this.ontology.getBusinessNameForClass(info.iri) : null;
    return businessName || className;
  }

  /**
   * Derive attribute name from restriction
   */
  deriveAttributeName(restriction) {
    const propLower = restriction.property.toLowerCase();

    if (propLower === 'identifier' || propLower === 'identifiers') {
      const base = Config.camelCaseToSnakeCase(restriction.fromClass || 'entity');
      return `${base}_identifiers`;
    }

    const businessName = this.ontology.getBusinessNameForProperty(restriction.propertyIri, restriction.fromClass);
    const base = businessName || restriction.property;
    return Config.camelCaseToSnakeCase(base);
  }

  /**
   * Apply primary key rules to attributes
   */
  applyPrimaryKeyRule(attributes, classInfo, className) {
    if (!Array.isArray(attributes)) return;

    attributes.forEach(attr => {
      attr.isPrimaryKey = Config.isPrimaryKeyField(attr.name, classInfo, className);
    });
  }

  /**
   * Derive attributes for a class (full ER-compatible implementation)
   */
  deriveAttributes(classInfo, enumClasses, className, skipTechnicalFilters = false) {
    const attributes = new Map();

    // Handle superclass FKs first
    const superClassNames = this.ontology.getSuperClassNames(classInfo);
    superClassNames
      .filter(name => !enumClasses.has(name))
      .filter(name => {
        if (skipTechnicalFilters) return true;
        const info = this.ontology.classes.get(name);
        return !this.isTechnicalClass(name, info);
      })
      .forEach(name => {
        const displayName = this.getBusinessClassName(name);
        const fkName = `${Config.camelCaseToSnakeCase(displayName)}_id`;
        if (!attributes.has(fkName)) {
          attributes.set(fkName, {
            name: fkName,
            type: 'string',
            sqlType: 'TEXT',
            comment: displayName,
            isForeignKey: true,
            propertyIri: null
          });
        }
      });

    // Handle property restrictions
    classInfo.restrictions.forEach(restriction => {
      if (restriction.property === 'identifier' && restriction.propertyIri && restriction.propertyIri.includes('adms#identifier')) return;
      if (!this.ontology.isRelevantPropertyIri(restriction.propertyIri)) return;

      // Special handling for dct:type
      if (restriction.propertyIri === `${Config.NAMESPACES.dct}type`) {
        const attrName = this.deriveAttributeName(restriction);
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction);
        // If any resolved range type is a subclass/instance of a configured
        // ENUMERABLE_CLASSES entry, treat this attribute as a single enum.
        try {
          if (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set) {
            let matched = null;
            for (const candidate of Array.from(Config.ENUMERABLE_CLASSES)) {
              const isMatch = resolvedRangeTypes.some(rt => {
                if (!rt) return false;
                if (rt === candidate) return true;
                try {
                  const info = this.ontology.classes.get(rt);
                  if (info && info.iri) return this.ontology.isSubClassOf(info.iri, candidate);
                } catch (e) { /* ignore */ }
                return false;
              });
              if (isMatch) { matched = candidate; break; }
            }
            if (matched) {
              if (!attributes.has(attrName)) {
                attributes.set(attrName, {
                  name: attrName,
                  type: 'enum',
                  sqlType: 'TEXT',
                  comment: matched,
                  isForeignKey: false,
                  propertyIri: restriction.propertyIri
                });
              }
              return;
            }
          }
        } catch (e) { /* ignore */ }
        // If rangeTypes includes an enum class, treat as enum
        const enumTypes = resolvedRangeTypes.filter(type => enumClasses.has(type));
        if (enumTypes.length > 0) {
          if (!attributes.has(attrName)) {
            attributes.set(attrName, {
              name: attrName,
              type: 'enum',
              sqlType: 'TEXT',
              comment: enumTypes[0],
              isForeignKey: false,
              propertyIri: restriction.propertyIri
            });
          }
          return;
        }
        // If no enum, but no explicit range, treat as string
        if (restriction.rangeTypes.length === 0) {
          if (!attributes.has(attrName)) {
            attributes.set(attrName, {
              name: attrName,
              type: 'string',
              sqlType: 'TEXT',
              comment: restriction.propertyIri,
              isForeignKey: false,
              propertyIri: restriction.propertyIri
            });
          }
          return;
        }
      }

      // Special handling for QUDT properties without explicit range
      if ((restriction.propertyIri === `${Config.NAMESPACES.qudt}hasUnit` ||
           restriction.propertyIri === `${Config.NAMESPACES.qudt}hasNumericValue`) &&
          restriction.rangeTypes.length === 0) {
        const attrName = this.deriveAttributeName(restriction);
        if (!attributes.has(attrName)) {
          attributes.set(attrName, {
            name: attrName,
            type: 'string',
            sqlType: 'TEXT',
            comment: restriction.propertyIri,
            isForeignKey: false,
            propertyIri: restriction.propertyIri
          });
        }
        return;
      }

      // If there are no explicit rangeTypes, emit a default string attribute (except for dct:type which is handled above)
      if (!Array.isArray(restriction.rangeTypes) || restriction.rangeTypes.length === 0) {
        const attrName = this.deriveAttributeName(restriction);
        if (!attributes.has(attrName)) {
          attributes.set(attrName, {
            name: attrName,
            type: 'string',
            sqlType: 'TEXT',
            comment: restriction.propertyIri,
            isForeignKey: false,
            propertyIri: restriction.propertyIri,
            minCardinality: restriction.minCardinality,
            maxCardinality: restriction.maxCardinality
          });
        }
        return;
      }

      // Special handling for geometry properties - treat as TEXT datatype
      if (Config.isGeometryProperty(restriction.property)) {
        const attrName = this.deriveAttributeName(restriction);
        if (!attributes.has(attrName)) {
          attributes.set(attrName, {
            name: attrName,
            type: 'string',
            sqlType: 'TEXT',
            comment: 'WKT (Well-Known Text) geometry representation',
            isForeignKey: false,
            propertyIri: restriction.propertyIri
          });
        }
        return; // Skip further processing for geometry
      }

      const isDatatype = Config.isDatatypeRange(restriction.rangeTypes);

      if (restriction.rangeTypes.length > 0 && !isDatatype) {
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction);
        const enumTypes = resolvedRangeTypes.filter(type => enumClasses.has(type));
        const nonEnumTypes = resolvedRangeTypes
          .filter(type => !enumClasses.has(type))
          .filter(type => this.ontology.isRelevantClassName(type))
          .filter(type => {
            if (skipTechnicalFilters) return true;
            const info = this.ontology.classes.get(type);
            return !this.isTechnicalClass(type, info);
          });

        // Add enum attribute if there are enum types (already handled for dct:type above)
        if (enumTypes.length > 0 && restriction.propertyIri !== `${Config.NAMESPACES.dct}type`) {
          if (nonEnumTypes.length === 0) {
            const attrName = this.ontology.deriveAttributeName(restriction);
            if (!attributes.has(attrName)) {
              // Format enum values to UPPER_SNAKE_CASE
              const formattedEnumValues = enumTypes
                .map(type => Config.formatEnumValue(type))
                .join(', ');
              attributes.set(attrName, {
                name: attrName,
                type: 'enum',
                sqlType: 'TEXT',
                comment: formattedEnumValues,
                isForeignKey: false,
                propertyIri: restriction.propertyIri
              });
            }
          }
        }

        if (nonEnumTypes.length === 0) return;

        const isUnionLike = restriction.restrictionType === 'union' || restriction.restrictionType === 'list';

        if (!isUnionLike || nonEnumTypes.length === 1) {
          // Single target type OR union with single non-enum: use simple FK column name
          const fkName = this.deriveFkName(restriction);
          const displayTypes = nonEnumTypes.map(type => this.getBusinessClassName(type));
          if (!attributes.has(fkName)) {
            attributes.set(fkName, {
              name: fkName,
              type: 'string',
              sqlType: 'TEXT',
              comment: displayTypes.join(', '),
              isForeignKey: true,
              propertyIri: restriction.propertyIri,
              targetClasses: nonEnumTypes,
              minCardinality: restriction.minCardinality,
              maxCardinality: restriction.maxCardinality
            });
          } else {
            // If an attribute already exists (from a superclass), prefer the
            // stricter single-valued restriction when the current restriction
            // declares maxCardinality === 1. This avoids emitting arrays when a
            // subclass tightens cardinality to a single value.
            const existing = attributes.get(fkName);
            if (typeof restriction.maxCardinality === 'number' && restriction.maxCardinality === 1 && existing && existing.maxCardinality !== 1) {
              existing.maxCardinality = 1;
              existing.minCardinality = restriction.minCardinality;
              // update comment/targetClasses to reflect the more specific restriction
              existing.comment = displayTypes.join(', ');
              existing.targetClasses = nonEnumTypes;
              attributes.set(fkName, existing);
            }
          }
        } else {
          // Union/list with multiple non-enum types: separate FK column per type
          nonEnumTypes.forEach(targetType => {
            const fkName = `${this.deriveFkName(restriction)}_${Config.camelCaseToSnakeCase(this.getBusinessClassName(targetType))}`;
            const comment = this.getBusinessClassName(targetType);
            if (!attributes.has(fkName)) {
              attributes.set(fkName, {
                name: fkName,
                type: 'string',
                sqlType: 'TEXT',
                comment,
                isForeignKey: true,
                propertyIri: restriction.propertyIri,
                targetClasses: [targetType],
                minCardinality: restriction.minCardinality,
                maxCardinality: restriction.maxCardinality
              });
            } else {
              const existing = attributes.get(fkName);
              if (typeof restriction.maxCardinality === 'number' && restriction.maxCardinality === 1 && existing && existing.maxCardinality !== 1) {
                existing.maxCardinality = 1;
                existing.minCardinality = restriction.minCardinality;
                existing.comment = comment;
                attributes.set(fkName, existing);
              }
            }
          });
        }
      } else if (isDatatype) {
        // Datatype property
        const attrName = this.ontology.deriveAttributeName(restriction);
        if (attributes.has(attrName)) return;

        const mermaidType = Config.inferMermaidDataType(restriction.rangeTypes, attrName);
        const sqlType = Config.inferSqlDataType(restriction.rangeTypes, attrName);

        attributes.set(attrName, {
          name: attrName,
          type: mermaidType,
          sqlType: sqlType,
          comment: restriction.rangeTypes.join(', '),
          isForeignKey: false,
          propertyIri: restriction.propertyIri,
          minCardinality: restriction.minCardinality,
          maxCardinality: restriction.maxCardinality
        });
      }
    });

    // Always add URI
    const uriAttrName = 'uri';
    if (!attributes.has(uriAttrName)) {
      attributes.set(uriAttrName, {
        name: uriAttrName,
        type: 'string',
        sqlType: 'TEXT',
        comment: 'URI',
        isForeignKey: false,
        propertyIri: null,
        isPrimaryKey: true
      });
    }

    // Ensure temporal attributes for configured temporal classes
    if (Config.isTemporalClass(className)) {
      if (!attributes.has('geldig_van')) {
        attributes.set('geldig_van', {
          name: 'geldig_van',
          type: 'date',
          sqlType: 'DATE',
          comment: 'http://purl.org/dc/terms/issued',
          isForeignKey: false,
          propertyIri: 'http://purl.org/dc/terms/issued',
          minCardinality: 1,
          maxCardinality: 1
        });
      }
      if (!attributes.has('aangemaakt_op')) {
        attributes.set('aangemaakt_op', {
          name: 'aangemaakt_op',
          type: 'datetime',
          sqlType: 'TIMESTAMP',
          comment: 'http://purl.org/dc/terms/created',
          isForeignKey: false,
          propertyIri: 'http://purl.org/dc/terms/created',
          minCardinality: 1,
          maxCardinality: 1
        });
      }
    }

    // If class has geldig_van (dct:issued), auto-add geldig_tot (dct:valid) if not already present
    if (attributes.has('geldig_van') && !attributes.has('geldig_tot')) {
      attributes.set('geldig_tot', {
        name: 'geldig_tot',
        type: 'date',
        sqlType: 'DATE',
        comment: 'http://purl.org/dc/terms/valid',
        isForeignKey: false,
        propertyIri: 'http://purl.org/dc/terms/valid',
        minCardinality: 0,
        maxCardinality: 1
      });
    }

    // Ensure 'uri' is first, 'geldig_van'/'geldig_tot' are in correct order
    const attrsArray = Array.from(attributes.values()).sort((a, b) => {
      if (a.name === uriAttrName && b.name !== uriAttrName) return -1;
      if (b.name === uriAttrName && a.name !== uriAttrName) return 1;
      if (a.name === 'geldig_tot' && b.name !== 'geldig_tot') return 1; // geldig_tot after other fields
      if (b.name === 'geldig_tot' && a.name !== 'geldig_tot') return -1;
      return 0;
    });

    this.applyPrimaryKeyRule(attrsArray, classInfo, className);
    return attrsArray;
  }

  /**
   * Get superclass names for a class
   */
  getSuperClassNames(classInfo) {
    // Deprecated: delegate to ontology model
    return this.ontology.getSuperClassNames(classInfo);
  }

  /**
   * Generate identifier table attributes
   */
  generateIdentifierAttributesForClass(parentClass) {
    return [
      {
        name: 'geldig_van',
        type: 'date',
        sqlType: 'DATE',
        comment: 'Begindatum geldigheid',
        isPrimaryKey: true,
        propertyIri: 'http://purl.org/dc/terms/issued'
      },
      {
        name: 'schema',
        type: 'string',
        sqlType: 'TEXT',
        comment: 'Identificatieschema',
        isPrimaryKey: true,
        propertyIri: 'http://www.w3.org/2004/02/skos/core#inScheme'
      },
      {
        name: 'notation',
        type: 'string',
        sqlType: 'TEXT',
        comment: 'De identifier notatie',
        isPrimaryKey: true,
        propertyIri: 'http://www.w3.org/2004/02/skos/core#notation'
      },
      {
        name: 'geldig_tot',
        type: 'date',
        sqlType: 'DATE',
        comment: 'Einddatum geldigheid',
        propertyIri: 'http://purl.org/dc/terms/valid'
      },
      {
        name: 'value',
        type: 'string',
        sqlType: 'TEXT',
        comment: 'De identifier waarde',
        propertyIri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value'
      }
    ];
  }
}

export default BaseGenerator;
