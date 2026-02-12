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
    this.ontology.extractClasses();
    this.ontology.addExternalClassesFromRestrictions();
    this.ontology.addDomainRangeRestrictions();
    this.enumClasses = this.utils.computeEnumClasses();
  }

  /**
   * Check whether a restriction's property is present in the unified
   * `OVERRIDE_PROPERTIES` Map. Supports lookup by local name (case-insensitive)
   * and full IRI. Returns the spec object, `true` for boolean overrides, or
   * `false` when not present.
   * @param {Restriction} restriction
   * @returns {boolean|Object}
   */
  _isOverriddenProperty(restriction) {
    const map = Config.OVERRIDE_PROPERTIES;
    if (!map || typeof map.get !== 'function') return false;
    const prop = String(restriction.property || '');
    const propLower = prop.toLowerCase();
    const propIri = String(restriction.propertyIri || '');
    // Full IRI match first
    const byIri = map.get(propIri);
    if (byIri) return byIri;
    // Local name exact match
    const byLocal = map.get(prop);
    if (byLocal) return byLocal;
    // Local name lowercase match
    const byLower = map.get(propLower);
    if (byLower) return byLower;
    return false;
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

        const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction)
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
   * Internal method for deriving attributes without enum checking.
   * Used by `computeEnumClasses` to avoid circular dependencies.
   * @param {ClassInfo} classInfo
   * @param {Set<string>} enumClasses
   * @param {string} className
   * @param {boolean} [skipForeignKeys=false]
   * @returns {Array<Attribute>}
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

      const overrideSpec = this._isOverriddenProperty(restriction);
      if (overrideSpec && restriction.rangeTypes.length === 0) {
        const attrName = this.deriveAttributeName(restriction);
        if (seen.has(attrName)) return;
        seen.add(attrName);
        const t = (typeof overrideSpec === 'object' && overrideSpec.type) ? overrideSpec.type : 'string';
        const sql = (typeof overrideSpec === 'object' && overrideSpec.sqlType) ? overrideSpec.sqlType : 'TEXT';
        attributes.push({ name: attrName, type: t, sqlType: sql, isForeignKey: false });
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
   * @param {string} className
   * @param {Array<string>} [classNames]
   * @param {string|null} [extendsSuperName]
   * @returns {Array<Attribute>}
   */
  computeAttributesForClass(className, classNames = [], extendsSuperName = null) {
    const camel = (s) => Config.camelCaseToSnakeCase ? Config.camelCaseToSnakeCase(s) : String(s);
    let attrs = [];
    this.ensureUri(attrs);
    this.ensureTemporal(attrs, className);

    const classInfo = this.ontology.classes.get(className);
    if (!classInfo) {
      if (className.endsWith('Identifier') && this.identifierRelations && this.identifierRelations.has(className.replace('Identifier', ''))) {
        const parentClass = className.replace('Identifier', '');
        attrs = this.generateIdentifierAttributesForClass(parentClass) || [];
      } else {
        attrs = [];
        try {
          // Attempt to infer attributes for business-only classes (no classInfo)
          const inferred = new Map();
          this._inferBusinessConceptAttributes(inferred, null, className);
          if (inferred.size > 0) {
            inferred.forEach(v => attrs.push(v));
          }
        } catch (e) { /* ignore inference errors */ }
      }
    } else {
      attrs = this.deriveAttributes(classInfo, this.enumClasses, className) || [];
    }

    // If we derived no attributes from classInfo, still attempt inference
    if ((!attrs || attrs.length === 0) && classInfo) {
      const inferred = new Map();
      this._inferBusinessConceptAttributes(inferred, classInfo, className);
      if (inferred.size > 0) {
        // merge inferred attributes avoiding duplicates
        const existing = new Set((attrs || []).map(a => a && a.name));
        inferred.forEach(v => { if (!existing.has(v.name)) attrs.push(v); });
      }
    }

    if (extendsSuperName) {
      const superInfo = this.ontology.classes.get(extendsSuperName);
      if (superInfo) {
        const superAttrs = this.deriveAttributes(superInfo, this.enumClasses, extendsSuperName) || [];
        const superNames = new Set(superAttrs.map(a => a.name));
        attrs = attrs.filter(a => !superNames.has(a.name));
        const camel = (s) => Config.camelCaseToSnakeCase ? Config.camelCaseToSnakeCase(s) : String(s);
        const bizName = this.getBusinessClassName(extendsSuperName) || extendsSuperName;
        const fkCandidates = new Set([
          `${camel(bizName)}_id`,
          `${camel(bizName)}_uuid`,
          `${camel(extendsSuperName)}_id`,
          `${camel(extendsSuperName)}_uuid`
        ]);
        attrs = attrs.filter(a => {
          if (!a) return false;
          if (fkCandidates.has(a.name)) return false;
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

  sortAttributes(attrs) {
    if (!Array.isArray(attrs)) return [];
    const priority = ['uri', 'geldig_van', 'aangemaakt_op'];
    return attrs.slice().sort((a, b) => {
      const aPri = priority.indexOf(a.name) >= 0 ? priority.indexOf(a.name) : Number.POSITIVE_INFINITY;
      const bPri = priority.indexOf(b.name) >= 0 ? priority.indexOf(b.name) : Number.POSITIVE_INFINITY;
      if (aPri !== bPri) return aPri - bPri;
      return a.name.localeCompare(b.name);
    });
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
      .map(name => this.getBusinessClassName(name) || name)
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
    * @param {Array<Attribute>} attributes
    * @param {ClassInfo} classInfo
    * @param {string} className
   */
  applyPrimaryKeyRule(attributes, classInfo, className) {
    if (!Array.isArray(attributes)) return;

    attributes.forEach(attr => {
      attr.isPrimaryKey = Config.isPrimaryKeyField(attr.name, classInfo, className);
    });
  }

  /**
    * Ensure `uri` attribute exists. Accepts either a Map (attributes map)
    * or an Array (attributes list) and inserts a canonical `uri` attribute
    * if missing.
    * @param {Map<string,Attribute>|Array<Attribute>} attributes
   */
  ensureUri(attributes, className) {
    const uuidName = `uuid`;
    const uuidObj = {
      name: uuidName,
      type: 'string',
      sqlType: 'UUID',
      comment: 'UUID primary key',
      isForeignKey: false,
      propertyIri: null,
      isPrimaryKey: true
    };
    const uriObj = {
      name: 'uri',
      type: 'string',
      sqlType: 'TEXT',
      comment: 'URI',
      isForeignKey: false,
      propertyIri: null,
      isPrimaryKey: false
    };

    if (!attributes) return attributes;
    if (attributes instanceof Map) {
      if (!attributes.has(uuidName)) attributes.set(uuidName, uuidObj);
      if (!attributes.has('uri')) attributes.set('uri', uriObj);
      return attributes;
    }

    if (Array.isArray(attributes)) {
      const hasUuid = attributes.some(a => a && a.name === uuidName);
      if (!hasUuid) attributes.unshift(uuidObj);
      const hasUri = attributes.some(a => a && a.name === 'uri');
      if (!hasUri) attributes.push(uriObj);
    }
    return attributes;
  }

  /**
   * Ensure temporal attributes exist for classes configured as temporal.
   * Accepts either a Map (attributes map) or Array (attributes list) and
   * inserts canonical temporal attributes when missing.
   * @param {Map<string,Attribute>|Array<Attribute>} attributes
   * @param {string} className
   */
  ensureTemporal(attributes, className) {
    const biz = this.getBusinessClassName ? this.getBusinessClassName(className) : className;
    if (!Config.isTemporalClass(className) && !Config.isTemporalClass(biz)) return;

    const van = {
      name: 'geldig_van',
      type: 'date',
      sqlType: 'DATE',
      comment: 'http://purl.org/dc/terms/issued',
      isForeignKey: false,
      propertyIri: 'http://purl.org/dc/terms/issued',
      minCardinality: 1,
      maxCardinality: 1
    };
    const aangemaakt = {
      name: 'aangemaakt_op',
      type: 'datetime',
      sqlType: 'TIMESTAMP',
      comment: 'http://purl.org/dc/terms/created',
      isForeignKey: false,
      propertyIri: 'http://purl.org/dc/terms/created',
      minCardinality: 1,
      maxCardinality: 1
    };
    const tot = {
      name: 'geldig_tot',
      type: 'date',
      sqlType: 'DATE',
      comment: 'http://purl.org/dc/terms/valid',
      isForeignKey: false,
      propertyIri: 'http://purl.org/dc/terms/valid',
      minCardinality: 0,
      maxCardinality: 1
    };

    if (!attributes) return;
    if (attributes instanceof Map) {
      if (!attributes.has('geldig_van')) attributes.set('geldig_van', van);
      if (!attributes.has('aangemaakt_op')) attributes.set('aangemaakt_op', aangemaakt);
      if (!attributes.has('geldig_tot')) attributes.set('geldig_tot', tot);
      return;
    }

    if (Array.isArray(attributes)) {
      const names = new Set(attributes.map(a => a && a.name));
      if (!names.has('aangemaakt_op')) attributes.unshift(aangemaakt);
      if (!names.has('geldig_van')) attributes.unshift(van);
      if (!names.has('geldig_tot')) attributes.push(tot);
    }
  }

  /**
   * Derive attributes for a classInfo.
   * @param {ClassInfo|null} classInfo
   * @param {Set<string>} enumClasses
   * @param {string} className
   * @param {boolean} [skipTechnicalFilters=false]
   * @returns {Array<Attribute>}
   */
  deriveAttributes(classInfo, enumClasses, className, skipTechnicalFilters = false) {
    const attributes = new Map();
    this.ensureUri(attributes, className);
    this.ensureTemporal(attributes, className);

    // Handle superclass FKs first (extracted to helper)
    this._addSuperclassForeignKeys(attributes, classInfo, enumClasses, skipTechnicalFilters);

    // Handle property restrictions (extracted to helper)
    this._processPropertyRestrictions(classInfo, attributes, enumClasses, className, skipTechnicalFilters);

    // Always attempt to infer additional business-concept attributes
    // (merge with any derived attributes).
    this._inferBusinessConceptAttributes(attributes, classInfo, className);

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

    this.applyPrimaryKeyRule(attributes, classInfo, className);
    this.sortAttributes(attributes);
    return Array.from(attributes.values());
  }

  /**
 * Add foreign key attributes for direct superclasses.
 * @param {Map<string,Attribute>} attributes
 * @param {ClassInfo|null} classInfo
 * @param {Set<string>} enumClasses
 * @param {boolean} skipTechnicalFilters
 */
  _addSuperclassForeignKeys(attributes, classInfo, enumClasses, skipTechnicalFilters) {
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
        const fkName = `${Config.camelCaseToSnakeCase(displayName)}_uuid`;
        if (!attributes.has(fkName)) {
          attributes.set(fkName, {
            name: fkName,
            type: 'string',
            sqlType: 'UUID',
            comment: displayName,
            isForeignKey: true,
            propertyIri: null
          });
        }
      });
  }

  /**
 * Process property restrictions from `classInfo` and populate `attributes`.
 * @param {ClassInfo|null} classInfo
 * @param {Map<string,Attribute>} attributes
 * @param {Set<string>} enumClasses
 * @param {string} className
 * @param {boolean} skipTechnicalFilters
 */
  _processPropertyRestrictions(classInfo, attributes, enumClasses, className, skipTechnicalFilters) {
    if (!classInfo || !Array.isArray(classInfo.restrictions)) return;
    classInfo.restrictions.forEach(restriction => {
      // synthesize a human-readable comment summarizing the restriction
      const rComment = (restriction && restriction.comment && String(restriction.comment).trim())
        || `${restriction.propertyIri}${(typeof restriction.minCardinality === 'number' && restriction.minCardinality>0) ? ' min:'+restriction.minCardinality : ''}${(typeof restriction.maxCardinality === 'number' && restriction.maxCardinality>=0) ? ' max:'+restriction.maxCardinality : ''}${(Array.isArray(restriction.rangeTypes) && restriction.rangeTypes.length>0) ? ' range:'+restriction.rangeTypes.join(',') : ''}`;
      if (restriction.property === 'identifier' && restriction.propertyIri && restriction.propertyIri.includes('adms#identifier')) return;
      if (!this.ontology.isRelevantPropertyIri(restriction.propertyIri)) return;

      // Special handling for dct:type
      if (restriction.propertyIri === `${Config.NAMESPACES.dct}type`) {
        const attrName = this.deriveAttributeName(restriction);
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(restriction.rangeTypes, restriction);
        // If any resolved range type is a subclass/instance of a configured
        // ENUMERABLE_CLASSES entry, treat this attribute as a single enum.
        if (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set) {
          let matched = null;
          for (const candidate of Array.from(Config.ENUMERABLE_CLASSES)) {
            const isMatch = resolvedRangeTypes.some(rt => {
              if (!rt) return false;
              if (rt === candidate) return true;
              const info = this.ontology.classes.get(rt);
              if (info && info.iri) return this.ontology.isSubClassOf(info.iri, candidate);
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
                comment: rComment,
                isForeignKey: false,
                propertyIri: restriction.propertyIri,
                enumClass: matched
              });
            }
            return;
          }
        }
        // If rangeTypes includes an enum class, treat as enum
        const enumTypes = resolvedRangeTypes.filter(type => enumClasses.has(type));
        if (enumTypes.length > 0) {
          if (!attributes.has(attrName)) {
            attributes.set(attrName, {
              name: attrName,
              type: 'enum',
              sqlType: 'TEXT',
              comment: rComment,
              isForeignKey: false,
              propertyIri: restriction.propertyIri,
              enumClass: enumTypes[0]
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
              comment: rComment,
              isForeignKey: false,
              propertyIri: restriction.propertyIri
            });
          }
          return;
        }
      }

      // Special handling for QUDT properties without explicit range (configurable via OVERRIDE_PROPERTIES.qudt)
      const qudtSpec = this._isOverriddenProperty(restriction);
      if (qudtSpec && restriction.rangeTypes.length === 0) {
        const attrName = this.deriveAttributeName(restriction);
        if (!attributes.has(attrName)) {
          const t = (typeof qudtSpec === 'object' && qudtSpec.type) ? qudtSpec.type : 'string';
          const sql = (typeof qudtSpec === 'object' && qudtSpec.sqlType) ? qudtSpec.sqlType : 'TEXT';
          const comment = (typeof qudtSpec === 'object' && qudtSpec.comment) ? qudtSpec.comment : restriction.propertyIri;
          attributes.set(attrName, {
            name: attrName,
            type: t,
            sqlType: sql,
            comment: rComment,
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
            comment: rComment,
            isForeignKey: false,
            propertyIri: restriction.propertyIri,
            minCardinality: restriction.minCardinality,
            maxCardinality: restriction.maxCardinality
          });
        }
        return;
      }

      // Special handling for geometry properties - treat as TEXT datatype
      const geomSpec = this._isOverriddenProperty(restriction);
      if (geomSpec) {
        const attrName = this.deriveAttributeName(restriction);
        if (!attributes.has(attrName)) {
          const t = (typeof geomSpec === 'object' && geomSpec.type) ? geomSpec.type : 'string';
          const sql = (typeof geomSpec === 'object' && geomSpec.sqlType) ? geomSpec.sqlType : 'TEXT';
          const comment = (typeof geomSpec === 'object' && geomSpec.comment) ? geomSpec.comment : 'WKT (Well-Known Text) geometry representation';
          attributes.set(attrName, {
            name: attrName,
            type: t,
            sqlType: sql,
            comment: rComment,
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
                comment: rComment,
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
          if (!attributes.has(fkName)) {
            const displayTypes = nonEnumTypes.map(type => this.getBusinessClassName(type));
            attributes.set(fkName, {
              name: fkName,
              type: 'string',
              sqlType: 'TEXT',
              comment: rComment,
              isForeignKey: true,
              propertyIri: restriction.propertyIri,
              targetClasses: nonEnumTypes,
              minCardinality: restriction.minCardinality,
              maxCardinality: restriction.maxCardinality
            });
          }
        } else {
          // Union/list with multiple non-enum types: separate FK column per type
          nonEnumTypes.forEach(targetType => {
            const fkName = `${this.deriveFkName(restriction)}_${Config.camelCaseToSnakeCase(this.getBusinessClassName(targetType))}`;
            if (!attributes.has(fkName)) {
              attributes.set(fkName, {
                name: fkName,
                type: 'string',
                sqlType: 'TEXT',
                comment: rComment,
                isForeignKey: true,
                propertyIri: restriction.propertyIri,
                targetClasses: [targetType],
                minCardinality: restriction.minCardinality,
                maxCardinality: restriction.maxCardinality
              });
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
          comment: rComment,
          isForeignKey: false,
          propertyIri: restriction.propertyIri,
          minCardinality: restriction.minCardinality,
          maxCardinality: restriction.maxCardinality
        });
      }
    });
  }

  /**
 * Infer business-concept attributes for classes that lack explicit classInfo.
 * Populates the provided `attributes` Map with Attribute objects where appropriate.
 * @param {Map<string,Attribute>} attributes - map to populate
 * @param {ClassInfo|null} classInfo
 * @param {string} className
 * @returns {void}
 */
  _inferBusinessConceptAttributes(attributes, classInfo, className) {
    const store = this.ontology && this.ontology.store;
    if (!store || typeof store.getQuads !== 'function') return;

    // Resolve a candidate class IRI: prefer classInfo.iri, otherwise try
    // to find a skos:Concept or any subject whose local name matches
    // the provided className.
    let classIri = classInfo && classInfo.iri ? classInfo.iri : null;
    if (!classIri && className) {
      const allQuads = store.getQuads(null, null, null) || [];
      for (const q of allQuads) {
        try {
          if (!q.subject || !q.subject.value) continue;
          const subj = String(q.subject.value);
          const local = subj.split(/[\\/#!]/).pop();
          if (local && local.toLowerCase() === String(className).toLowerCase()) { classIri = subj; break; }
        } catch (e) { /* ignore */ }
      }
    }
    if (!classIri) return;

    const domainPred = `${Config.NAMESPACES.rdfs}domain`;
    const eqPropPred = `${Config.NAMESPACES.owl}equivalentProperty`;

    const quads = store.getQuads(null, null, null) || [];
    const domainProps = new Set();
    const targetClassIris = new Set([classIri]);
    // include classes equivalent to this business concept (e.g. locn:Address)
    quads.forEach(q => {
      if (q.predicate && q.predicate.value === `${Config.NAMESPACES.owl}equivalentClass`) {
        if (q.subject && q.subject.value === classIri && q.object && q.object.value) targetClassIris.add(q.object.value);
        else if (q.object && q.object.value === classIri && q.subject && q.subject.value) targetClassIris.add(q.subject.value);
      }
    });
    quads.forEach(q => {
      if (q.predicate && q.predicate.value === domainPred && q.object && q.object.value && targetClassIris.has(q.object.value)) {
        if (q.subject && q.subject.value) domainProps.add(q.subject.value);
      }
    });
    if (domainProps.size === 0) return;

    const businessProps = new Set();
      // find business properties that are equivalentProperty -> domainProp
      quads.forEach(q => {
        if (q.predicate && q.predicate.value === eqPropPred && q.object && domainProps.has(q.object.value)) {
          if (q.subject && q.subject.value) businessProps.add(q.subject.value);
        }
      });

      // Keep only business-mapped properties:
      // - properties that are subjects of `owl:equivalentProperty` pointing to the domain prop
      // - OR domain properties that themselves have an associated business concept
      const filteredBusinessProps = new Set();
      businessProps.forEach(p => { filteredBusinessProps.add(p); });
      domainProps.forEach(dp => {
        const bn = (this.ontology && typeof this.ontology.getBusinessNameForProperty === 'function') ? this.ontology.getBusinessNameForProperty(dp, className) : null;
        if (bn) filteredBusinessProps.add(dp);
      });

      if (filteredBusinessProps.size === 0) return;
      filteredBusinessProps.forEach(propIri => {
        const propLocal = this.ontology.extractLocalName ? this.ontology.extractLocalName(propIri) : null;
        const bn = this.ontology.getBusinessNameForProperty ? this.ontology.getBusinessNameForProperty(propIri, className) : null;
        const base = bn || propLocal || String(propIri).split(/[\/#!]/).pop();
        const attrName = Config.camelCaseToSnakeCase ? Config.camelCaseToSnakeCase(base) : String(base);
        if (!attributes.has(attrName)) {
          attributes.set(attrName, {
            name: attrName,
            type: 'string',
            sqlType: 'TEXT',
            comment: propIri,
            isForeignKey: false,
            propertyIri: propIri
          });
        }
      });
  }

  /**
   * Get superclass names for a class
   */
  getSuperClassNames(classInfo) {
    return this.ontology.getSuperClassNames(classInfo);
  }

  /**
   * Generate identifier table attributes
   */
  generateIdentifierAttributesForClass(parentClass) {
    return [
      {
        name: 'in_scheme',
        type: 'string',
        sqlType: 'TEXT',
        comment: 'inScheme',
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
