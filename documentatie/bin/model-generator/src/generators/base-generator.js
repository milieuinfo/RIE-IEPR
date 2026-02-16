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

  /**
   * Normalize a string for fuzzy matching: strip diacritics and non-alphanumerics, lower-case.
   */
  normalizeString(s) {
    if (!s || typeof s !== 'string') return '';
    try {
      if (typeof String.prototype.normalize === 'function') {
        return s
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^0-9A-Za-z]/g, '')
          .toLowerCase();
      }
    } catch (e) {
      // fallthrough
    }
    return s.replace(/[^0-9A-Za-z]/g, '').toLowerCase();
  }

  /**
   * Decide whether a relationship should prefer a concrete target instead of
   * collapsing to a shared interface. Uses a configurable map in `Config` when
   * available, otherwise defaults to preferring concrete targets for synthetic
   * relationships and the legacy `Proces/isStepOfPlan` case.
   */
  shouldPreferConcreteTarget(rel) {
    if (!rel) return false;
    if (rel.synthetic) return true;
    // Allow configuration to override behavior: Config.RELATION_CONCRETE_PREFERENCES
    if (Config && Config.RELATION_CONCRETE_PREFERENCES) {
      try {
        const pref = Config.RELATION_CONCRETE_PREFERENCES;
        if (typeof pref === 'function') return pref(rel);
        if (pref instanceof Set)
          return (
            pref.has(rel.property) ||
            pref.has(rel.propertyIri) ||
            pref.has(`${rel.from}|${rel.property}`)
          );
        if (pref instanceof Map)
          return Boolean(pref.get(rel.property) || pref.get(rel.propertyIri));
      } catch (e) {
        /* ignore config errors */
      }
    }
    // Automatic detection: if the declaring class has a restriction for the
    // same property whose resolved range explicitly includes the concrete
    // target class (`rel.to`), prefer the concrete target rather than
    // collapsing to a shared interface. This avoids hardcoding property
    // names like "isStepOfPlan" while still honouring ontology intent.
    try {
      const classInfo =
        this.ontology && this.ontology.classes ? this.ontology.classes.get(rel.from) : null;
      if (classInfo && Array.isArray(classInfo.restrictions) && (rel.property || rel.propertyIri)) {
        for (const r of classInfo.restrictions) {
          const propMatch =
            (r.property && rel.property && String(r.property) === String(rel.property)) ||
            (r.propertyIri && rel.propertyIri && String(r.propertyIri) === String(rel.propertyIri));
          if (!propMatch) continue;
          const resolved = this.ontology.resolveRangeTypes
            ? this.ontology.resolveRangeTypes(r.rangeTypes || [], r)
            : r.rangeTypes || [];
          if (!Array.isArray(resolved) || resolved.length === 0) continue;
          // Prefer concrete target only when the declaring restriction resolves
          // to a single concrete type equal to the candidate target. This
          // avoids preferring concrete classes when the restriction is a
          // union/multi-range (e.g. hasSubSysteem -> [Emissiepunt, Apparaat,...])
          // where collapsing to a shared interface is more appropriate.
          const nonEnumResolved = resolved.filter(
            (rt) => !(this.enumClasses && this.enumClasses.has(rt))
          );
          if (nonEnumResolved.length === 1 && String(nonEnumResolved[0]) === String(rel.to))
            return true;
        }
      }
    } catch (e) {
      /* ignore ontology inspection errors */
    }

    return false;
  }

  buildRelationships(includeIdentifierRelations = true, includeSchemaFKs = false) {
    this.relationships.clear();
    this.inheritance.clear();
    this.identifierRelations.clear();
    const { relationships, inheritance, identifierRelations } =
      this.extractRelationshipsAndInheritance(
        this.ontology,
        this.enumClasses,
        includeIdentifierRelations
      );
    if (relationships) relationships.forEach((r, k) => this.relationships.set(k, r));
    if (inheritance) inheritance.forEach((r, k) => this.inheritance.set(k, r));
    if (identifierRelations)
      identifierRelations.forEach((r, k) => this.identifierRelations.set(k, r));

    // Post-process: detect anonymous intersection restrictions that indicate
    // a `hasInputVar`-like pattern pointing to an underlying `ssn:System` via
    // `rdf:value someValuesFrom ssn:System`. For those, add an additional
    // relationship entry that targets `System` (ontology-driven) and stores
    // the original property IRI so the TypeScript generator can emit a
    // separate property with the original json name.
    const store = this.ontology && this.ontology.store;
    if (store && typeof store.getQuads === 'function') {
      for (const [classLocalName2, classInfo2] of this.ontology.classes) {
        const classIri = classInfo2 && classInfo2.iri ? classInfo2.iri : null;
        if (!classIri) continue;
        // get subclassOf restrictions quads
        const subs = store.getQuads(classIri, `${Config.NAMESPACES.rdfs}subClassOf`, null) || [];
        for (const sq of subs) {
          const obj = sq.object;
          if (!obj || obj.termType !== 'BlankNode') continue;
          const onProp = store.getQuads(obj, `${Config.NAMESPACES.owl}onProperty`, null) || [];
          if (!onProp || onProp.length === 0) continue;
          const propIri =
            onProp[0].object && onProp[0].object.value ? String(onProp[0].object.value) : null;
          if (!propIri) continue;
          const svf = store.getQuads(obj, `${Config.NAMESPACES.owl}someValuesFrom`, null) || [];
          if (!svf || svf.length === 0) continue;
          const svObj = svf[0].object;
          // Check for intersectionOf pattern
          const inters =
            store.getQuads(svObj, `${Config.NAMESPACES.owl}intersectionOf`, null) || [];
          if (!inters || inters.length === 0) continue;
          for (const iq of inters) {
            const listNode = iq.object;
            // traverse rdf:list
            const items = [];
            let cur = listNode;
            while (
              cur &&
              cur.termType &&
              cur.value &&
              String(cur.value) !== `${Config.NAMESPACES.rdf}nil`
            ) {
              const first = store.getQuads(cur, `${Config.NAMESPACES.rdf}first`, null)[0];
              if (first && first.object) items.push(first.object);
              const rest = store.getQuads(cur, `${Config.NAMESPACES.rdf}rest`, null)[0];
              if (!rest) break;
              cur = rest.object;
            }
            // look for a member that is a restriction on rdf:value someValuesFrom ssn:System
            let indicatesSystem = false;
            for (const item of items) {
              if (!item || item.termType !== 'BlankNode') continue;
              const onPropInner =
                store.getQuads(item, `${Config.NAMESPACES.owl}onProperty`, null) || [];
              const hasOnValue = onPropInner.some(
                (q) => String(q.object.value) === `${Config.NAMESPACES.rdf}value`
              );
              const svInner =
                store.getQuads(item, `${Config.NAMESPACES.owl}someValuesFrom`, null) || [];
              const hasSystem = svInner.some(
                (q) => String(q.object.value) === `${Config.NAMESPACES.ssn}System`
              );
              if (hasOnValue && hasSystem) {
                indicatesSystem = true;
                break;
              }
            }
            if (indicatesSystem) {
              // derive a skos:prefLabel if present on the outer restriction node
              const labelQuad = store.getQuads(obj, `${Config.NAMESPACES.skos}prefLabel`, null)[0];
              const businessLabel =
                labelQuad && labelQuad.object && labelQuad.object.value
                  ? labelQuad.object.value
                  : null;
              // create a relationship entry that targets the (interface) System
              const syntheticPropLocal = `${
                this.ontology.extractLocalName
                  ? this.ontology.extractLocalName(propIri)
                  : String(propIri)
              }__system`;
              const key = `${classLocalName2}|System|${syntheticPropLocal}`;
              if (!relationships.has(key)) {
                const relObj = {
                  from: classLocalName2,
                  to: 'System',
                  // unique internal property name so we don't clash with the original
                  property: syntheticPropLocal,
                  // preserve original IRI separately so downstream generators can
                  // choose the JSON property name explicitly
                  propertyIriOriginal: propIri,
                  // label from skos:prefLabel or fallback to business label
                  label:
                    businessLabel ||
                    (this.ontology.getBusinessLabelForProperty
                      ? this.ontology.getBusinessLabelForProperty(propIri, classLocalName2)
                      : propIri),
                  minCard: undefined,
                  maxCard: undefined,
                  synthetic: true,
                };
                relationships.set(key, relObj);
                // also expose on this.relationships so later consumers see it
                if (this.relationships && typeof this.relationships.set === 'function')
                  this.relationships.set(key, relObj);
              }
            }
          }
        }
      }
    }

    // No implicit rewrites here; let configuration and downstream
    // analysis determine concrete-vs-interface choices.

    // Post-process relationships: when interface-as-super-entities are
    // enabled, promote relationships from implementing concrete classes
    // to the configured interface so the ER shows the relation starting
    // from the interface (e.g. `System -> ExploitatieLocatie`) instead
    // of from each concrete implementer (Meetpunt, Emissiepunt, ...).
    try {
      if (
        includeSchemaFKs &&
        Config.USE_INTERFACE_CLASSES_AS_SUPER_ENTITIES &&
        Config.USE_SUPER_ENTITY_FOR_MULTI_RELATIONS &&
        Config.INTERFACE_CLASSES &&
        Config.INTERFACE_CLASSES instanceof Set
      ) {
        const ifaceSet = Array.from(Config.INTERFACE_CLASSES);
        // collect existing relationships snapshot to iterate
        const relEntries = Array.from(relationships.entries());
        for (const [key, rel] of relEntries) {
          if (!rel || !rel.from) continue;
          const fromInfo = this.ontology.classes.get(rel.from);
          if (!fromInfo) continue;
          const supers = this.getSuperClassNames(fromInfo) || [];
          // also include explicit superClass IRIs
          if (Array.isArray(fromInfo.superClasses)) {
            fromInfo.superClasses.forEach((si) => {
              try {
                const local = this.ontology.extractLocalName(si);
                if (local && !supers.includes(local)) supers.push(local);
              } catch (e) {}
            });
          }
          // for each configured interface that is in the supers of this concrete class,
          // add a relationship from the interface to the original target if not present.
          for (const iface of ifaceSet) {
            const ifaceNormalized = String(iface).replace(/^I(?=[A-Z])/, '');
            if (!supers.includes(iface) && !supers.includes(ifaceNormalized)) continue;
            const ifaceName = supers.includes(iface) ? iface : ifaceNormalized;
            const newKey = `${ifaceName}|${rel.to}|${rel.property}`;
            if (!relationships.has(newKey)) {
              const newRel = Object.assign({}, rel, { from: ifaceName });
              relationships.set(newKey, newRel);
              if (this.relationships && typeof this.relationships.set === 'function')
                this.relationships.set(newKey, newRel);
            }
          }
        }
      }
    } catch (e) {
      /* ignore post-processing errors */
    }
    // Prune redundant concrete->interface-target relationships: if an
    // interface (configured in `INTERFACE_CLASSES`) now has a relation to
    // the same target, remove the original relations that start from the
    // concrete implementers to avoid duplicate join tables / direct FKs.
    try {
      if (
        includeSchemaFKs &&
        Config.USE_INTERFACE_CLASSES_AS_SUPER_ENTITIES &&
        Config.USE_SUPER_ENTITY_FOR_MULTI_RELATIONS &&
        Config.INTERFACE_CLASSES &&
        Config.INTERFACE_CLASSES instanceof Set
      ) {
        const relSnapshot = Array.from(relationships.entries());
        for (const [key, rel] of relSnapshot) {
          if (!rel || !rel.from) continue;
          const fromClass = rel.from;
          // skip if 'from' is itself an interface
          if (
            Config.INTERFACE_CLASSES.has(fromClass) ||
            Config.INTERFACE_CLASSES.has(String(fromClass).replace(/^I(?=[A-Z])/, ''))
          )
            continue;
          const classInfo = this.ontology.classes.get(fromClass);
          if (!classInfo) continue;
          const supers = this.getSuperClassNames(classInfo) || [];
          if (Array.isArray(classInfo.superClasses)) {
            classInfo.superClasses.forEach((si) => {
              try {
                const local = this.ontology.extractLocalName(si);
                if (local && !supers.includes(local)) supers.push(local);
              } catch (e) {}
            });
          }
          for (const iface of Array.from(Config.INTERFACE_CLASSES)) {
            const ifaceNorm = String(iface).replace(/^I(?=[A-Z])/, '');
            if (!supers.includes(iface) && !supers.includes(ifaceNorm)) continue;
            // if there exists an interface->target relationship, remove concrete one
            const ifaceName = supers.includes(iface) ? iface : ifaceNorm;
            // consider interface relation present if any relationship exists
            // from the interface to the same target (property-insensitive)
            const ifaceHasRel = Array.from(relationships.values()).some(
              (r2) =>
                (r2.from === ifaceName || r2.from === ifaceNorm) && String(r2.to) === String(rel.to)
            );
            if (ifaceHasRel) {
              // remove the concrete relation
              relationships.delete(key);
              if (this.relationships && typeof this.relationships.delete === 'function')
                this.relationships.delete(key);
            }
          }
        }
      }
    } catch (e) {
      /* ignore pruning errors */
    }
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
    classNames.forEach((cn) => {
      const ci = this.ontology.classes.get(cn) || {};
      const supers = (this.utils.getSuperClassNames(ci) || []).slice();
      (ci.superClasses || []).forEach((sIri) => {
        const local = this.ontology.extractLocalName(sIri);
        if (local && !supers.includes(local)) supers.push(local);
      });
      classToSupers.set(cn, supers);
      supers.forEach((s) => superCount.set(s, (superCount.get(s) || 0) + 1));
    });

    let sharedSupers = Array.from(superCount.entries())
      .filter(([s, cnt]) => cnt > 1)
      .map(([s]) => s);
    forceExternal.forEach((s) => {
      if (!sharedSupers.includes(s)) sharedSupers.push(s);
    });
    sharedSupers = sharedSupers.filter((s) => {
      const info = this.ontology.classes.get(s);
      return Boolean((info && info.external) || forceExternal.includes(s));
    });

    const sharedInterfaceNames = new Map();
    sharedSupers.forEach((s) => {
      // Prefer a readable/business display name for the generated interface
      // identifier when available (e.g. prefer `Systeem` over `System`).
      let display = s;
      try {
        // First prefer explicit config override for interface display names
        if (Config && Config.INTERFACE_CLASS_DISPLAY_NAMES && Config.INTERFACE_CLASS_DISPLAY_NAMES.get(s)) {
          display = Config.INTERFACE_CLASS_DISPLAY_NAMES.get(s) || s;
        } else if (Config && Config.INTERFACE_CLASS_DISPLAY_NAMES) {
          // try lowercase key match
          const lc = String(s).toLowerCase();
          for (const [k, v] of Config.INTERFACE_CLASS_DISPLAY_NAMES.entries()) {
            if (String(k).toLowerCase() === lc) {
              display = v || s;
              break;
            }
          }
        }
        if (display === s) {
          if (typeof this.getPreferredBusinessName === 'function') display = this.getPreferredBusinessName(s) || s;
          else if (this.ontology && typeof this.ontology.getBusinessNameForClass === 'function') {
            const info = this.ontology.classes.get(s);
            if (info && info.iri) display = this.ontology.getBusinessNameForClass(info.iri) || s;
          }
        }
      } catch (e) {
        display = s;
      }
      sharedInterfaceNames.set(s, `I${this.pascalCase ? this.pascalCase(display) : display}`);
    });

    return { classToSupers, sharedSupers, sharedInterfaceNames };
  }

  /**
   * Determine which shared interfaces are actually used by the visible classes
   * or referenced by foreign key targets. Returns a Set of interface node names.
   */
  computeUsedSharedInterfaces(classNames, classToSupers, sharedInterfaceNames) {
    const usedSharedInterfaces = new Set();
    classNames.forEach((className) => {
      const classInfo = this.ontology.classes.get(className);
      const supers = classToSupers.get(className) || [];
      // Would this class implement a shared interface? (no internal superclass)
      let hasInternalSuper = false;
      for (const s of supers) {
        const sinfo = this.ontology.classes.get(s);
        if (sinfo && !sinfo.external) {
          hasInternalSuper = true;
          break;
        }
      }
      if (!hasInternalSuper) {
        for (const s of supers) {
          if (sharedInterfaceNames.has(s)) {
            usedSharedInterfaces.add(sharedInterfaceNames.get(s));
            break;
          }
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
      attrs.forEach((attr) => {
        if (
          !attr.isForeignKey ||
          !Array.isArray(attr.targetClasses) ||
          attr.targetClasses.length === 0
        )
          return;
        const targets = attr.targetClasses.filter((tn) => classNames.includes(tn));
        if (targets.length === 0) return;

        const supersList = targets.map((t) => {
          const list = (classToSupers.get(t) || []).slice();
          const tinfo = this.ontology.classes.get(t);
          if (tinfo && Array.isArray(tinfo.superClasses)) {
            tinfo.superClasses.forEach((si) => {
              const local = this.ontology.extractLocalName(si);
              if (local && !list.includes(local)) list.push(local);
            });
          }
          return list;
        });
        if (supersList.length === 0) return;
        const common = supersList.reduce(
          (acc, cur) => acc.filter((x) => cur.includes(x)),
          supersList[0].slice()
        );
        for (const s of common) {
          if (sharedInterfaceNames.has(s)) {
            usedSharedInterfaces.add(sharedInterfaceNames.get(s));
            break;
          }
        }
      });
    });
    return usedSharedInterfaces;
  }

  /**
   * Compute diagram styling mapping from configured `Config.DIAGRAM_STYLES`.
   * Returns { styleForClass, classDefToStyle }
   * - styleForClass: Map of class local/business name -> classDef identifier
   * - classDefToStyle: Map of classDef identifier -> styleSpec (original config value)
   */
  computeDiagramStyles(classNames = [], classToSupers = new Map()) {
    const diagramStyles =
      Config && Config.DIAGRAM_STYLES && Config.DIAGRAM_STYLES instanceof Map
        ? Config.DIAGRAM_STYLES
        : new Map();
    const styleForClass = new Map();
    const classDefToStyle = new Map();

    if (diagramStyles.size === 0) return { styleForClass, classDefToStyle };

    // helper to test transitive ancestry using classToSupers
    const hasAncestor = (start, target, visited = new Set()) => {
      if (!start || !target) return false;
      if (start === target) return true;
      if (visited.has(start)) return false;
      visited.add(start);
      const sups = classToSupers.get(start) || [];
      if (Array.isArray(sups) && sups.includes(target)) return true;
      for (const s of sups) {
        if (hasAncestor(s, target, visited)) return true;
      }
      return false;
    };

    for (const [rootLocal, styleSpec] of diagramStyles.entries()) {
      const classDefName =
        styleSpec && styleSpec.classDef ? styleSpec.classDef : String(rootLocal).toLowerCase();
      classDefToStyle.set(classDefName, styleSpec || {});
      // mark the root itself and its interface form
      styleForClass.set(rootLocal, classDefName);
      const ifaceLabel =
        typeof this.pascalCase === 'function' ? `I${this.pascalCase(rootLocal)}` : `I${rootLocal}`;
      styleForClass.set(ifaceLabel, classDefName);

      // mark visible classes that are subclasses of the root
      classToSupers.forEach((supers, cn) => {
        if (hasAncestor(cn, rootLocal)) {
          const biz =
            typeof this.getBusinessClassName === 'function' ? this.getBusinessClassName(cn) : cn;
          styleForClass.set(cn, classDefName);
          if (biz && biz !== cn) styleForClass.set(biz, classDefName);
        }
      });

      // mark classes that have an enum attribute referencing this root (e.g. Proces -> Procedure)
      const enumRoot = rootLocal;
      Array.from(classNames).forEach((cn) => {
        const ci = this.ontology.classes.get(cn);
        const attrs =
          typeof this.deriveAttributes === 'function'
            ? this.deriveAttributes(ci, this.enumClasses, cn) || []
            : [];
        const hasEnum = attrs.some(
          (a) =>
            a &&
            a.type === 'enum' &&
            (a.comment === enumRoot ||
              a.enumClass === enumRoot ||
              (a.propertyIri &&
                typeof this.ontology.extractLocalName === 'function' &&
                this.ontology.extractLocalName(a.propertyIri) === 'type'))
        );
        if (hasEnum) {
          const biz =
            typeof this.getBusinessClassName === 'function' ? this.getBusinessClassName(cn) : cn;
          styleForClass.set(cn, classDefName);
          if (biz && biz !== cn) styleForClass.set(biz, classDefName);
        }
      });
    }

    return { styleForClass, classDefToStyle };
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
        .filter((name) => !enumClasses.has(name))
        .filter((name) => {
          const info = ontology.classes.get(name);
          return !this.isTechnicalClass(name, info);
        })
        .forEach((name) => {
          const info = ontology.classes.get(name);
          if (info?.external && !info.isBusinessConceptTarget) return;
          const key = `${name}|${classLocalName}`;
          if (!inheritance.has(key)) {
            inheritance.set(key, {
              from: name,
              to: classLocalName,
            });
          }
        });

      // Relationships (object properties)
      (classInfo.restrictions || []).forEach((restriction) => {
        // Special: identifier
        if (
          restriction.property === 'identifier' &&
          restriction.propertyIri &&
          restriction.propertyIri.includes('adms#identifier')
        ) {
          if (includeIdentifierRelations) identifierRelations.set(classLocalName, restriction);
          return;
        }
        if (restriction.rangeTypes.length === 0) return;
        if (!ontology.isRelevantPropertyIri(restriction.propertyIri)) return;

        const resolvedRangeTypes = this.ontology
          .resolveRangeTypes(restriction.rangeTypes, restriction)
          .filter((type) => ontology.isRelevantClassName(type))
          .filter((type) => {
            const info = ontology.classes.get(type);
            return !this.isTechnicalClass(type, info);
          });

        resolvedRangeTypes.forEach((rangeType) => {
          const key = `${classLocalName}|${rangeType}|${restriction.property}`;
          if (!relationships.has(key)) {
            const businessLabel = ontology.getBusinessLabelForProperty(
              restriction.propertyIri,
              classLocalName
            );
            relationships.set(key, {
              from: classLocalName,
              to: rangeType,
              property: restriction.property,
              propertyIri: restriction.propertyIri,
              label: businessLabel || restriction.property,
              minCard: restriction.minCardinality,
              maxCard: restriction.maxCardinality,
            });
          }
        });
      });
    }

    // Inject synthetic metadata relationships for configured metadata companion
    // classes. Rather than modelling a `metadata` attribute on the owner, the
    // metadata companion table should reference the owning entity. Therefore
    // synthesize a relationship from `<Owner>Metadata` -> `Owner` (many-to-one)
    // so the ER/SQL generators will render the FK on the metadata table.
    if (Config && Config.METADATA_CLASSES && Config.METADATA_CLASSES instanceof Set) {
      for (const owner of Config.METADATA_CLASSES) {
        if (!owner) continue;
        if (!ontology.isRelevantClassName(owner)) continue;
        const metaClass = `${owner}Metadata`;
        const key = `${metaClass}|${owner}|metadata`;
        if (!relationships.has(key)) {
          relationships.set(key, {
            // relationship originates on the metadata companion and points to the owner
            from: metaClass,
            to: owner,
            // generic property name indicating ownership
            property: 'owner',
            // keep a human-friendly label for diagrams
            label: 'metadata',
            minCard: 0,
            maxCard: undefined,
          });
        }
      }
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

    (classInfo.restrictions || []).forEach((restriction) => {
      if (!this.ontology.isRelevantPropertyIri(restriction.propertyIri)) return;

      // Handle dct:type with no explicit range as a simple string attribute
      if (
        restriction.propertyIri === `${Config.NAMESPACES.dct}type` &&
        restriction.rangeTypes.length === 0
      ) {
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
        const t =
          typeof overrideSpec === 'object' && overrideSpec.type ? overrideSpec.type : 'string';
        const sql =
          typeof overrideSpec === 'object' && overrideSpec.sqlType ? overrideSpec.sqlType : 'TEXT';
        attributes.push({ name: attrName, type: t, sqlType: sql, isForeignKey: false });
        return;
      }

      const resolvedRangeTypes = this.ontology.resolveRangeTypes(
        restriction.rangeTypes,
        restriction
      );
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
          isForeignKey: false,
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
  computeAttributesForClass(
    className,
    classNames = [],
    extendsSuperName = null,
    includeSchemaFKs = false
  ) {
    const camel = (s) => (Config.camelCaseToSnakeCase ? Config.camelCaseToSnakeCase(s) : String(s));
    let attrs = [];
    this.ensureUri(attrs);
    this.ensureTemporal(attrs, className);

    const classInfo = this.ontology.classes.get(className);
    if (!classInfo) {
      if (
        className.endsWith('Identifier') &&
        this.identifierRelations &&
        this.identifierRelations.has(className.replace('Identifier', ''))
      ) {
        const parentClass = className.replace('Identifier', '');
        attrs = this.generateIdentifierAttributesForClass(parentClass) || [];
      } else if (className.endsWith('Metadata')) {
        const parentClass = className.replace('Metadata', '');
        attrs = this.generateMetadataAttributesForClass(parentClass) || [];
      } else {
        attrs = [];
        // Attempt to infer attributes for business-only classes (no classInfo)
        const inferred = new Map();
        this._inferBusinessConceptAttributes(inferred, null, className);
        if (inferred.size > 0) inferred.forEach((v) => attrs.push(v));
      }
    } else {
      const derived = this.deriveAttributes(classInfo, this.enumClasses, className) || [];
      attrs = derived;
    }

    // If we derived no attributes from classInfo, still attempt inference
    if ((!attrs || attrs.length === 0) && classInfo) {
      const inferred = new Map();
      this._inferBusinessConceptAttributes(inferred, classInfo, className);
      if (inferred.size > 0) {
        // merge inferred attributes avoiding duplicates
        const existing = new Set((attrs || []).map((a) => a && a.name));
        inferred.forEach((v) => {
          if (!existing.has(v.name)) attrs.push(v);
        });
      }
    }

    if (extendsSuperName) {
      const superInfo = this.ontology.classes.get(extendsSuperName);
      if (superInfo) {
        const superAttrs =
          this.deriveAttributes(superInfo, this.enumClasses, extendsSuperName) || [];
        const superNames = new Set(superAttrs.map((a) => a.name));
        attrs = attrs.filter((a) => !superNames.has(a.name));
        const camel = (s) =>
          Config.camelCaseToSnakeCase ? Config.camelCaseToSnakeCase(s) : String(s);
        const bizName = this.getBusinessClassName(extendsSuperName) || extendsSuperName;
        const fkCandidates = new Set([
          `${camel(bizName)}_id`,
          `${camel(bizName)}_uuid`,
          `${camel(extendsSuperName)}_id`,
          `${camel(extendsSuperName)}_uuid`,
        ]);
        attrs = attrs.filter((a) => {
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
        const derivedName =
          this.ontology && typeof this.ontology.deriveAttributeName === 'function'
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
          maxCardinality: undefined,
        });
      }
    }
    // NOTE: metadata companion classes are modelled as separate tables that
    // include an FK to their owning entity. Do not inject a virtual metadata
    // attribute on the owner class; the relationship will be synthesized
    // from `<Owner>Metadata` -> `Owner` so the FK appears on the metadata table.
    // Append any special relationships we injected (e.g. __system targets)
    if (this.relationships && typeof this.relationships.forEach === 'function') {
      this.relationships.forEach((rel) => {
        if (!rel || rel.from !== className) return;
        if (!rel.synthetic) return;
        // create attribute for this synthetic relationship
        const baseProp = String(rel.property).replace(/__system$/, '');
        const attrName = Config.camelCaseToSnakeCase
          ? Config.camelCaseToSnakeCase(`${baseProp}_system`)
          : `${baseProp}_system`;
        // avoid duplicates
        if ((attrs || []).some((a) => a && a.name === attrName)) return;
        // Use a unique internal propertyIri to avoid colliding with the original
        const internalPropIri = rel.property; // e.g. hasInputVar__system
        let propLocalJson =
          rel.propertyIriOriginal && this.ontology.extractLocalName
            ? this.ontology.extractLocalName(rel.propertyIriOriginal)
            : null;
        if (!propLocalJson)
          propLocalJson =
            rel.property && String(rel.property).length > 0 ? String(rel.property) : 'hasInputVar';
        let propLabel =
          rel.label && typeof rel.label === 'string' && rel.label.length > 0 ? rel.label : null;
        if (!propLabel) propLabel = propLocalJson + '_system';
        attrs.push({
          // exposed name used by generators as the business property name
          name: propLabel,
          type: 'string',
          sqlType: 'TEXT',
          comment: rel.label || rel.property,
          isForeignKey: true,
          // internal propertyIri distinct from original
          propertyIri: internalPropIri,
          // jsonName: the original property local name to use for JSON decorator
          jsonName: propLocalJson,
          targetClasses: [rel.to],
          minCardinality: rel.minCard,
          maxCardinality: rel.maxCard,
          synthetic: true,
        });
      });
    }

    // If this class inherits from an interface-like superclass (e.g. System)
    // ensure the concrete table contains an FK to the super-entity table so
    // relational consumers can directly join to the super-entity.
    if (classInfo && includeSchemaFKs) {
      const rawSupers = Array.isArray(classInfo.superClasses) ? classInfo.superClasses.slice() : [];
      // also include superClasses from IRIs if present
      if (Array.isArray(classInfo.superClassIris)) rawSupers.push(...classInfo.superClassIris);
      const extractLocalName =
        this.ontology && typeof this.ontology.extractLocalName === 'function'
          ? this.ontology.extractLocalName.bind(this.ontology)
          : null;
      const supers = rawSupers
        .map((s) => (extractLocalName ? extractLocalName(s) : s))
        .filter(Boolean);

      for (const s of supers) {
        const normalized = String(s).replace(/^I(?=[A-Z])/, '');
        if (
          Config.INTERFACE_CLASSES &&
          Config.INTERFACE_CLASSES instanceof Set &&
          (Config.INTERFACE_CLASSES.has(s) || Config.INTERFACE_CLASSES.has(normalized))
        ) {
          // candidate FK name
          const fkName = Config.camelCaseToSnakeCase(s) + '_uuid';
          if (!(attrs || []).some((a) => a && String(a.name) === fkName)) {
            attrs.push({
              name: fkName,
              type: 'string',
              sqlType: 'UUID',
              comment: s,
              isForeignKey: true,
              isPrimaryKey: false,
            });
          }
        }
      }
    }

    // No ad-hoc property-name based rewrites here; prefer configuration
    // and ontology-driven analysis for target resolution.

    // When interface-as-super-entities are enabled for schema generation,
    // concrete attributes that target configured interfaces (e.g. System)
    // should not be emitted on the concrete tables: schema will model
    // those via the super-entity/join tables instead.
    if (
      includeSchemaFKs &&
      Config.USE_INTERFACE_CLASSES_AS_SUPER_ENTITIES &&
      Config.INTERFACE_CLASSES &&
      Config.INTERFACE_CLASSES instanceof Set
    ) {
      const ifaceSet = Array.from(Config.INTERFACE_CLASSES).map((i) => String(i));
      attrs = (attrs || []).filter((a) => {
        if (!a || !a.isForeignKey || !Array.isArray(a.targetClasses)) return true;
        // keep attribute if none of its targetClasses is a configured interface
        for (const t of a.targetClasses) {
          const norm = String(t).replace(/^I(?=[A-Z])/, '');
          if (ifaceSet.includes(String(t)) || ifaceSet.includes(norm)) return false;
        }
        return true;
      });
    }

    // debug: computed attributes for class (silenced)
    // console.debug('computeAttributesForClass', className, attrs.map(a=>a.name));
    return attrs;
  }

  sortAttributes(attrs) {
    if (!Array.isArray(attrs)) return [];
    const priority = ['uri', 'geldig_van', 'aangemaakt_op'];
    return attrs.slice().sort((a, b) => {
      const aPri =
        priority.indexOf(a.name) >= 0 ? priority.indexOf(a.name) : Number.POSITIVE_INFINITY;
      const bPri =
        priority.indexOf(b.name) >= 0 ? priority.indexOf(b.name) : Number.POSITIVE_INFINITY;
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

  computeVisibleClasses(includeInterfaceClasses = false) {
    // Return local class names (not business display names). Other
    // generator internals expect local names for relationship/inheritance
    // lookups; display/business names are applied later when rendering.
    const classNames = Array.from(this.ontology.classes.keys())
      .filter((name) => {
        if (this.enumClasses.has(name)) return false;
        if (!this.ontology.isRelevantClassName(name)) return false;
        const info = this.ontology.classes.get(name);
        // Exclude external vocabulary classes (SOSA/PROV/GeoSPARQL/etc.)
        // unless they are explicitly a business concept target in the RIE mappings.
        if (info && info.external && !info.isBusinessConceptTarget) return false;
        if (this.utils.isTechnicalClass(name, info)) return false;
        return true;
      })
      // keep local names here; rendering layers will call `getBusinessClassName`
      .sort((a, b) => a.localeCompare(b));

    // Add identifier tables
    this.identifierRelations.forEach((restriction, classLocalName) => {
      const identifierTableName = `${classLocalName}Identifier`;
      if (!classNames.includes(identifierTableName)) {
        classNames.push(identifierTableName);
      }
    });

    // Add synthesized metadata companion classes for configured owners
    try {
      if (Config && Config.METADATA_CLASSES && Config.METADATA_CLASSES instanceof Set) {
        Array.from(Config.METADATA_CLASSES).forEach((owner) => {
          if (!owner) return;
          const metaName = `${owner}Metadata`;
          if (!classNames.includes(metaName)) classNames.push(metaName);
        });
      }
    } catch (e) {
      /* ignore */
    }

    // Optionally include configured interface classes when generating schema
    if (includeInterfaceClasses) {
      try {
        if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
          Array.from(Config.INTERFACE_CLASSES).forEach((iface) => {
            if (!iface) return;
            // Try local name, I-prefixed, and business name variants
            let foundLocal = null;
            for (const [local, info] of this.ontology.classes) {
              try {
                const biz =
                  info.iri && this.ontology.getBusinessNameForClass
                    ? this.ontology.getBusinessNameForClass(info.iri)
                    : null;
                if (
                  String(local).toLowerCase() === String(iface).toLowerCase() ||
                  String(local).toLowerCase() === `I${iface}`.toLowerCase() ||
                  (biz && String(biz).toLowerCase() === String(iface).toLowerCase())
                ) {
                  foundLocal = local;
                  break;
                }
              } catch (e) {
                /* ignore */
              }
            }
            const entry = foundLocal || iface;
            if (!classNames.includes(entry)) classNames.push(entry);
          });
        }
      } catch (e) {
        /* ignore */
      }
    }

    classNames.sort((a, b) => a.localeCompare(b));

    return classNames;
  }

  getDisplayName(className, classInfo = null) {
    if (!classInfo) {
      classInfo = this.ontology.classes.get(className);
    }
    // Decide display name:
    // - If the class is defined in our ontology and is internal, prefer
    //   the ontology local class name (`className`).
    // - If the class is external (imported), prefer the business/localized
    //   concept name when available (e.g. 'Adres' for locn:Address).
    // - If no class info is available, fall back to business name/label
    //   when the ontology provides one, otherwise use the provided name.
    let raw = className;
    if (classInfo) {
      try {
        if (classInfo.external) {
          // external class: prefer business name or label
          if (classInfo.iri && this.ontology.getBusinessNameForClass) {
            const bn = this.ontology.getBusinessNameForClass(classInfo.iri);
            if (bn) raw = bn;
            else if (classInfo.label) raw = classInfo.label;
            else raw = className;
          } else if (classInfo.label) {
            raw = classInfo.label;
          } else {
            raw = className;
          }
        } else {
          // internal class: use local ontology name
          raw = className;
        }
      } catch (e) {
        raw = className;
      }
    } else {
      // no class info present: attempt to resolve business name via ontology
      try {
        if (this.ontology.getBusinessNameForClass) {
          const maybe = this.ontology.getBusinessNameForClass(className);
          if (maybe) raw = maybe;
        }
      } catch (e) {
        /* ignore */
      }
    }
    // normalize to a safe mermaid identifier: replace non-alnum/underscore with underscore
    const cleaned = String(raw).replace(/[^A-Za-z0-9_]+/g, '_');
    // Try to use pascalCase helper if available
    if (typeof this.pascalCase === 'function') return this.pascalCase(cleaned);
    return cleaned.replace(/(^.|_.)/g, (s) => s.replace(/_/g, '').toUpperCase());
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
    // Prefer an explicit interface display override when configured
    try {
      const stripped = String(className).replace(/^I(?=[A-Z])/, '');
      if (
        Config &&
        Config.INTERFACE_CLASS_DISPLAY_NAMES &&
        Config.INTERFACE_CLASS_DISPLAY_NAMES instanceof Map
      ) {
        const maybe =
          Config.INTERFACE_CLASS_DISPLAY_NAMES.get(className) ||
          Config.INTERFACE_CLASS_DISPLAY_NAMES.get(stripped);
        if (maybe) return Config.camelCaseToSnakeCase(maybe);
      }
    } catch (e) {
      /* ignore */
    }

    const businessName = classInfo?.iri
      ? this.ontology.getBusinessNameForClass(classInfo.iri)
      : null;
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
   * Preferred business label for generating code (TypeScript names, imports).
   * Prefers explicit class label when present, then ontology business name,
   * then the local class name.
   */
  getPreferredBusinessName(className) {
    if (!className) return className;
    const info = this.ontology.classes.get(className);
    if (info) {
      // Prefer ontology/business name when available (localized/business concept)
      const businessName = info.iri ? this.ontology.getBusinessNameForClass(info.iri) : null;
      if (businessName) return businessName;
      if (info.label && typeof info.label === 'string' && info.label.length > 0) return info.label;
    }
    return className;
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

    const businessName = this.ontology.getBusinessNameForProperty(
      restriction.propertyIri,
      restriction.fromClass
    );
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
    // Accept either an Array of attributes or a Map(name->attribute).

    // Prefer ontology-driven PK selection using hydra IRI templates when available.
    // Retrieve hydra IRI template mappings for this class (if present).
    let hydraMappings = null;
    try {
      const tpl = this.ontology && typeof this.ontology.getIriTemplateForClass === 'function'
        ? this.ontology.getIriTemplateForClass(className)
        : null;
      hydraMappings = tpl && Array.isArray(tpl.mappings) ? tpl.mappings : null;
    } catch (e) {
      hydraMappings = null;
    }

    const _localName = (v) => {
      if (!v) return null;
      try {
        const s = String(v);
        // handle full IRIs and prefixed/local names
        if (s.includes('#')) return s.split('#').pop();
        if (s.includes('/')) return s.split('/').pop();
        if (s.includes(':')) return s.split(':').pop();
        return s;
      } catch (e) {
        return null;
      }
    };

    const hasHydraAdmsIdentifier =
      Array.isArray(hydraMappings) &&
      hydraMappings.some((m) => {
        if (!m || !m.propertyIri) return false;
        const s = String(m.propertyIri);
        if (s.includes(Config.NAMESPACES.adms)) return true;
        const local = _localName(s);
        return local === 'identifier' || local === 'identifiers';
      });

    // If hydra mapping lists versioning vars (dct:issued and dct:modified), include them.
    const hydraUsesIssued =
      Array.isArray(hydraMappings) &&
      hydraMappings.some((m) => {
        if (!m || !m.propertyIri) return false;
        const s = String(m.propertyIri);
        if (s === Config.NAMESPACES.dct + 'issued') return true;
        const local = _localName(s);
        return local === 'issued' || local === 'dateIssued' || local === 'date';
      });
    const hydraUsesModified =
      Array.isArray(hydraMappings) &&
      hydraMappings.some((m) => {
        if (!m || !m.propertyIri) return false;
        const s = String(m.propertyIri);
        if (s === Config.NAMESPACES.dct + 'modified') return true;
        const local = _localName(s);
        return local === 'modified' || local === 'dateModified';
      });

    const _applyToAttr = (attr) => {
      // Default: honor any explicit config-based rule
      let isPk = Config.isPrimaryKeyField(attr.name, classInfo, className);

      // If hydra indicates adms:identifier is part of the IRI, mark `uuid` as PK
      if (hasHydraAdmsIdentifier && attr.name === 'uuid') isPk = true;

      // If hydra indicates versioning via dct:issued/dct:modified, mark matching temporal attrs
      const propLocal = attr && attr.propertyIri ? String(attr.propertyIri) : null;
      const propLocalName = propLocal ? _localName(propLocal) : null;
      if (hydraUsesIssued && (propLocal === Config.NAMESPACES.dct + 'issued' || propLocalName === 'issued')) isPk = true;
      if (hydraUsesModified && (propLocal === Config.NAMESPACES.dct + 'modified' || propLocalName === 'modified')) isPk = true;

      attr.isPrimaryKey = Boolean(isPk);
      return attr;
    };

    if (attributes instanceof Map) {
      for (const [k, v] of attributes.entries()) {
        if (v) attributes.set(k, _applyToAttr(v));
      }
      return;
    }

    if (Array.isArray(attributes)) {
      attributes.forEach((attr) => _applyToAttr(attr));
    }
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
      isPrimaryKey: false,
    };
    const uriObj = {
      name: 'uri',
      type: 'string',
      sqlType: 'TEXT',
      comment: 'URI',
      isForeignKey: false,
      propertyIri: null,
      isPrimaryKey: false,
    };

    if (!attributes) return attributes;
    if (attributes instanceof Map) {
      if (!attributes.has(uuidName)) attributes.set(uuidName, uuidObj);
      if (!attributes.has('uri')) attributes.set('uri', uriObj);
      return attributes;
    }

    if (Array.isArray(attributes)) {
      const hasUuid = attributes.some((a) => a && a.name === uuidName);
      if (!hasUuid) attributes.unshift(uuidObj);
      const hasUri = attributes.some((a) => a && a.name === 'uri');
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
    // Ensure certain business classes (e.g. `Adres`) are treated as temporal
    const isTemporal =
      Config.isTemporalClass(className) ||
      Config.isTemporalClass(biz)
    if (!isTemporal) return;

    const van = {
      name: 'geldig_van',
      type: 'date',
      sqlType: 'DATE',
      comment: 'http://purl.org/dc/terms/issued',
      isForeignKey: false,
      isPrimaryKey: true,
      propertyIri: 'http://purl.org/dc/terms/issued',
      minCardinality: 1,
      maxCardinality: 1,
    };
    const aangemaakt = {
      name: 'aangemaakt_op',
      type: 'datetime',
      sqlType: 'TIMESTAMP',
      comment: 'http://purl.org/dc/terms/created',
      isForeignKey: false,
      isPrimaryKey: true,
      propertyIri: 'http://purl.org/dc/terms/created',
      minCardinality: 1,
      maxCardinality: 1,
    };
    const tot = {
      name: 'geldig_tot',
      type: 'date',
      sqlType: 'DATE',
      comment: 'http://purl.org/dc/terms/valid',
      isForeignKey: false,
      propertyIri: 'http://purl.org/dc/terms/valid',
      minCardinality: 0,
      maxCardinality: 1,
    };

    if (!attributes) return;
    if (attributes instanceof Map) {
      if (!attributes.has('geldig_van')) attributes.set('geldig_van', van);
      if (!attributes.has('aangemaakt_op')) attributes.set('aangemaakt_op', aangemaakt);
      if (!attributes.has('geldig_tot')) attributes.set('geldig_tot', tot);
      return;
    }

    if (Array.isArray(attributes)) {
      const names = new Set(attributes.map((a) => a && a.name));
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
    this._processPropertyRestrictions(
      classInfo,
      attributes,
      enumClasses,
      className,
      skipTechnicalFilters
    );

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
        maxCardinality: 1,
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
    const superClassNames = this.ontology.getSuperClassNames(classInfo) || [];
    superClassNames
      .filter((name) => !enumClasses.has(name))
      .filter((name) => {
        if (skipTechnicalFilters) return true;
        const info = this.ontology.classes.get(name);
        return !this.isTechnicalClass(name, info);
      })
      .forEach((name) => {
        const displayName = this.getBusinessClassName(name);
        const fkName = `${Config.camelCaseToSnakeCase(displayName)}_uuid`;
        if (!attributes.has(fkName)) {
          attributes.set(fkName, {
            name: fkName,
            type: 'string',
            sqlType: 'UUID',
            comment: displayName,
            isForeignKey: true,
            propertyIri: null,
          });
        }
      });

    // Additionally: if this class is a (transitive) subclass/implementer of any
    // configured interface-like classes (e.g. `System`), ensure a FK to that
    // interface is present on the concrete table. This covers cases where the
    // interface is not listed as a direct superClass but is present in the
    // ancestor chain or implied via ontology subclassing.
    try {
      if (classInfo && Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
        const classIri = classInfo.iri;
        for (const iface of Array.from(Config.INTERFACE_CLASSES)) {
          if (!iface) continue;
          // try to find the interface class info (allow I-prefixed variants)
          const candidates = [iface, String(iface).replace(/^I(?=[A-Z])/, '')];
          let ifaceInfo = null;
          for (const c of candidates) {
            ifaceInfo = this.ontology.classes.get(c);
            if (ifaceInfo) break;
          }
          if (!ifaceInfo || !classIri || !ifaceInfo.iri) continue;
          // If ontology provides isSubClassOf, use transitive check
          let isSub = false;
          try {
            if (typeof this.ontology.isSubClassOf === 'function') {
              isSub = Boolean(this.ontology.isSubClassOf(classIri, ifaceInfo.iri));
            } else {
              // fallback: check getSuperClassNames for presence
              const supers = this.ontology.getSuperClassNames(classInfo) || [];
              const norm = String(iface).replace(/^I(?=[A-Z])/, '');
              isSub = supers.includes(iface) || supers.includes(norm);
            }
          } catch (e) {
            isSub = false;
          }
          if (isSub) {
            const fkName = `${Config.camelCaseToSnakeCase(iface)}_uuid`;
            if (!attributes.has(fkName)) {
              attributes.set(fkName, {
                name: fkName,
                type: 'string',
                sqlType: 'UUID',
                comment: iface,
                isForeignKey: true,
                isPrimaryKey: false,
              });
            }
          }
        }
      }
    } catch (e) {
      /* ignore interface FK inference errors */
    }

    // Additionally: if an interface-configured relationship group (same `from`+`property`) has
    // multiple concrete `to` targets and this class is one of them, ensure the concrete class
    // still contains a direct FK to the interface. This covers cases where relationships
    // were collapsed to an interface and later rendered as a typed/super-entity join table.
    try {
      if (
        classInfo &&
        Config &&
        Config.INTERFACE_CLASSES &&
        Config.INTERFACE_CLASSES instanceof Set &&
        this.relationships &&
        typeof this.relationships.forEach === 'function'
      ) {
        const ifaceList = Array.from(Config.INTERFACE_CLASSES).map((i) => String(i));
        // build groups keyed by `from|propertyIri` for relationships originating from interfaces
        const groups = new Map();
        this.relationships.forEach((rel) => {
          if (!rel || !rel.from) return;
          const fromNorm = String(rel.from).replace(/^I(?=[A-Z])/, '');
          if (!ifaceList.includes(rel.from) && !ifaceList.includes(fromNorm)) return;
          const key = `${rel.from}|${rel.propertyIri || rel.property}`;
          if (!groups.has(key)) groups.set(key, new Set());
          groups.get(key).add(rel.to);
        });

        // For each group that contains multiple concrete targets, if this className
        // is among the targets, add the inferred FK to the interface.
        for (const [gk, targetSet] of groups.entries()) {
          if (!targetSet || targetSet.size <= 1) continue;
          if (!targetSet.has(classInfo.localName || classInfo.name || classInfo.label) &&
              !targetSet.has(classInfo?.localName) && !targetSet.has(classInfo?.name)) {
            // check by matching on visible class names: compare normalized business/local names
            const tnames = Array.from(targetSet).map((t) => String(t));
            const match = tnames.some((t) => String(t) === String(classInfo.localName) || String(t) === String(classInfo.name));
            if (!match) continue;
          }
          // determine interface name from group key
          const parts = gk.split('|');
          const iface = parts[0];
          if (!iface) continue;
          const fkName = `${Config.camelCaseToSnakeCase(iface)}_uuid`;
          if (!attributes.has(fkName)) {
            attributes.set(fkName, {
              name: fkName,
              type: 'string',
              sqlType: 'UUID',
              comment: iface,
              isForeignKey: true,
              isPrimaryKey: false,
            });
          }
        }
      }
    } catch (e) {
      /* ignore multi-target interface group errors */
    }
  }

  /**
   * Process property restrictions from `classInfo` and populate `attributes`.
   * @param {ClassInfo|null} classInfo
   * @param {Map<string,Attribute>} attributes
   * @param {Set<string>} enumClasses
   * @param {string} className
   * @param {boolean} skipTechnicalFilters
   */
  _processPropertyRestrictions(
    classInfo,
    attributes,
    enumClasses,
    className,
    skipTechnicalFilters
  ) {
    if (!classInfo || !Array.isArray(classInfo.restrictions)) return;
    classInfo.restrictions.forEach((restriction) => {
      // synthesize a human-readable comment summarizing the restriction
      const rComment =
        (restriction && restriction.comment && String(restriction.comment).trim()) ||
        `${restriction.propertyIri}${
          typeof restriction.minCardinality === 'number' && restriction.minCardinality > 0
            ? ' min:' + restriction.minCardinality
            : ''
        }${
          typeof restriction.maxCardinality === 'number' && restriction.maxCardinality >= 0
            ? ' max:' + restriction.maxCardinality
            : ''
        }${
          Array.isArray(restriction.rangeTypes) && restriction.rangeTypes.length > 0
            ? ' range:' + restriction.rangeTypes.join(',')
            : ''
        }`;
      if (
        restriction.property === 'identifier' &&
        restriction.propertyIri &&
        restriction.propertyIri.includes('adms#identifier')
      )
        return;
      if (!this.ontology.isRelevantPropertyIri(restriction.propertyIri)) return;

      // Special handling for dct:type
      if (restriction.propertyIri === `${Config.NAMESPACES.dct}type`) {
        const attrName = this.deriveAttributeName(restriction);
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(
          restriction.rangeTypes,
          restriction
        );
        // If any resolved range type is a subclass/instance of a configured
        // ENUMERABLE_CLASSES entry, treat this attribute as a single enum.
        if (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set) {
          let matched = null;
          for (const candidate of Array.from(Config.ENUMERABLE_CLASSES)) {
            const isMatch = resolvedRangeTypes.some((rt) => {
              if (!rt) return false;
              if (rt === candidate) return true;
              const info = this.ontology.classes.get(rt);
              if (info && info.iri) return this.ontology.isSubClassOf(info.iri, candidate);
              return false;
            });
            if (isMatch) {
              matched = candidate;
              break;
            }
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
                enumClass: matched,
              });
            }
            return;
          }
        }
        // If rangeTypes includes an enum class, treat as enum
        const enumTypes = resolvedRangeTypes.filter((type) => enumClasses.has(type));
        if (enumTypes.length > 0) {
          if (!attributes.has(attrName)) {
            attributes.set(attrName, {
              name: attrName,
              type: 'enum',
              sqlType: 'TEXT',
              comment: rComment,
              isForeignKey: false,
              propertyIri: restriction.propertyIri,
              enumClass: enumTypes[0],
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
              propertyIri: restriction.propertyIri,
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
          const t = typeof qudtSpec === 'object' && qudtSpec.type ? qudtSpec.type : 'string';
          const sql = typeof qudtSpec === 'object' && qudtSpec.sqlType ? qudtSpec.sqlType : 'TEXT';
          const comment =
            typeof qudtSpec === 'object' && qudtSpec.comment
              ? qudtSpec.comment
              : restriction.propertyIri;
          attributes.set(attrName, {
            name: attrName,
            type: t,
            sqlType: sql,
            comment: rComment,
            isForeignKey: false,
            propertyIri: restriction.propertyIri,
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
            maxCardinality: restriction.maxCardinality,
          });
        }
        return;
      }

      // Special handling for geometry properties - treat as TEXT datatype
      const geomSpec = this._isOverriddenProperty(restriction);
      if (geomSpec) {
        const attrName = this.deriveAttributeName(restriction);
        if (!attributes.has(attrName)) {
          const t = typeof geomSpec === 'object' && geomSpec.type ? geomSpec.type : 'string';
          const sql = typeof geomSpec === 'object' && geomSpec.sqlType ? geomSpec.sqlType : 'TEXT';
          const comment =
            typeof geomSpec === 'object' && geomSpec.comment
              ? geomSpec.comment
              : 'WKT (Well-Known Text) geometry representation';
          attributes.set(attrName, {
            name: attrName,
            type: t,
            sqlType: sql,
            comment: rComment,
            isForeignKey: false,
            propertyIri: restriction.propertyIri,
          });
        }
        return; // Skip further processing for geometry
      }

      const isDatatype = Config.isDatatypeRange(restriction.rangeTypes);

      if (restriction.rangeTypes.length > 0 && !isDatatype) {
        const resolvedRangeTypes = this.ontology.resolveRangeTypes(
          restriction.rangeTypes,
          restriction
        );
        const enumTypes = resolvedRangeTypes.filter((type) => enumClasses.has(type));
        const nonEnumTypes = resolvedRangeTypes
          .filter((type) => !enumClasses.has(type))
          .filter((type) => this.ontology.isRelevantClassName(type))
          .filter((type) => {
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
                .map((type) => Config.formatEnumValue(type))
                .join(', ');
              attributes.set(attrName, {
                name: attrName,
                type: 'enum',
                sqlType: 'TEXT',
                comment: rComment,
                isForeignKey: false,
                propertyIri: restriction.propertyIri,
              });
            }
          }
        }

        if (nonEnumTypes.length === 0) return;

        const isUnionLike =
          restriction.restrictionType === 'union' || restriction.restrictionType === 'list';

        // If an enum attribute for the same property was already derived,
        // prefer the enum and skip adding FK columns that would duplicate
        // the semantic 'type' attribute (prevents `Proces type` as FK).
        const derivedAttrName = this.ontology.deriveAttributeName(restriction);
        if (attributes.has(derivedAttrName) && attributes.get(derivedAttrName).type === 'enum')
          return;

        if (!isUnionLike || nonEnumTypes.length === 1) {
          // Single target type OR union with single non-enum: use simple FK column name
          const fkName = this.deriveFkName(restriction);
          if (!attributes.has(fkName)) {
            const displayTypes = nonEnumTypes.map((type) => this.getBusinessClassName(type));
            attributes.set(fkName, {
              name: fkName,
              type: 'string',
              sqlType: 'TEXT',
              comment: rComment,
              isForeignKey: true,
              propertyIri: restriction.propertyIri,
              targetClasses: nonEnumTypes,
              minCardinality: restriction.minCardinality,
              maxCardinality: restriction.maxCardinality,
            });
          }
        } else {
          // Union/list with multiple non-enum types: separate FK column per type
          nonEnumTypes.forEach((targetType) => {
            const fkName = `${this.deriveFkName(restriction)}_${Config.camelCaseToSnakeCase(
              this.getBusinessClassName(targetType)
            )}`;
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
                maxCardinality: restriction.maxCardinality,
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
          maxCardinality: restriction.maxCardinality,
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
          if (local && local.toLowerCase() === String(className).toLowerCase()) {
            classIri = subj;
            break;
          }
        } catch (e) {
          /* ignore */
        }
      }
    }
    if (!classIri) return;

    const domainPred = `${Config.NAMESPACES.rdfs}domain`;
    const eqPropPred = `${Config.NAMESPACES.owl}equivalentProperty`;

    const quads = store.getQuads(null, null, null) || [];
    const domainProps = new Set();
    const targetClassIris = new Set([classIri]);
    // include classes equivalent to this business concept (e.g. locn:Address)
    quads.forEach((q) => {
      if (q.predicate && q.predicate.value === `${Config.NAMESPACES.owl}equivalentClass`) {
        if (q.subject && q.subject.value === classIri && q.object && q.object.value)
          targetClassIris.add(q.object.value);
        else if (q.object && q.object.value === classIri && q.subject && q.subject.value)
          targetClassIris.add(q.subject.value);
      }
    });
    quads.forEach((q) => {
      if (
        q.predicate &&
        q.predicate.value === domainPred &&
        q.object &&
        q.object.value &&
        targetClassIris.has(q.object.value)
      ) {
        if (q.subject && q.subject.value) domainProps.add(q.subject.value);
      }
    });
    if (domainProps.size === 0) return;

    const businessProps = new Set();
    // find business properties that are equivalentProperty -> domainProp
    quads.forEach((q) => {
      if (
        q.predicate &&
        q.predicate.value === eqPropPred &&
        q.object &&
        domainProps.has(q.object.value)
      ) {
        if (q.subject && q.subject.value) businessProps.add(q.subject.value);
      }
    });

    // Keep only business-mapped properties:
    // - properties that are subjects of `owl:equivalentProperty` pointing to the domain prop
    // - OR domain properties that themselves have an associated business concept
    const filteredBusinessProps = new Set();
    businessProps.forEach((p) => {
      filteredBusinessProps.add(p);
    });
    domainProps.forEach((dp) => {
      const bn =
        this.ontology && typeof this.ontology.getBusinessNameForProperty === 'function'
          ? this.ontology.getBusinessNameForProperty(dp, className)
          : null;
      if (bn) filteredBusinessProps.add(dp);
    });

    if (filteredBusinessProps.size === 0) return;
    filteredBusinessProps.forEach((propIri) => {
      const propLocal = this.ontology.extractLocalName
        ? this.ontology.extractLocalName(propIri)
        : null;
      const bn = this.ontology.getBusinessNameForProperty
        ? this.ontology.getBusinessNameForProperty(propIri, className)
        : null;
      const base =
        bn ||
        propLocal ||
        String(propIri)
          .split(/[\/#!]/)
          .pop();
      const attrName = Config.camelCaseToSnakeCase
        ? Config.camelCaseToSnakeCase(base)
        : String(base);
      if (!attributes.has(attrName)) {
        attributes.set(attrName, {
          name: attrName,
          type: 'string',
          sqlType: 'TEXT',
          comment: propIri,
          isForeignKey: false,
          propertyIri: propIri,
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
        propertyIri: 'http://www.w3.org/2004/02/skos/core#inScheme',
      },
      {
        name: 'notation',
        type: 'string',
        sqlType: 'TEXT',
        comment: 'De identifier notatie',
        isPrimaryKey: true,
        propertyIri: 'http://www.w3.org/2004/02/skos/core#notation',
      },
      {
        name: 'geldig_tot',
        type: 'date',
        sqlType: 'DATE',
        comment: 'Einddatum geldigheid',
        propertyIri: 'http://purl.org/dc/terms/valid',
      },
      {
        name: 'value',
        type: 'string',
        sqlType: 'TEXT',
        comment: 'De identifier waarde',
        propertyIri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value',
      },
    ];
  }

  /**
   * Generate metadata companion table attributes for an owner class.
   * The metadata table is intended to store arbitrary key/value pairs
   * for the owning entity (non-temporal). Keys can be used as the
   * primary identifier for a metadata row when appropriate.
   */
  generateMetadataAttributesForClass(parentClass) {
    const base = Config.camelCaseToSnakeCase
      ? Config.camelCaseToSnakeCase(parentClass)
      : String(parentClass);

    // Attempt to copy primary key attributes from the parent class and
    // include them (prefixed) as foreign-key columns on the metadata table.
    // Always include `key` as part of the composite primary key so multiple
    // metadata entries can exist per owner.
    const attrs = [];
    attrs.push({
      name: 'key',
      type: 'string',
      sqlType: 'TEXT',
      comment: 'Metadata key',
      isPrimaryKey: true,
    });

    // gather parent attributes to determine primary keys
    try {
      const parentInfo = this.ontology.classes.get(parentClass);
      let parentAttrs = [];
      if (parentInfo) {
        parentAttrs = this.deriveAttributes(parentInfo, this.enumClasses, parentClass) || [];
      }

      // debug: inspect parent attribute names (remove or silence in production)
      // console.debug('generateMetadataAttributesForClass parentAttrs for', parentClass, ':', parentAttrs.map(a=>a.name));
      let pkAttrs = parentAttrs.filter((a) => {
        try {
          const nameStr = String(a.name || '').trim();
          const normalized = (Config && typeof Config.camelCaseToSnakeCase === 'function')
            ? String(Config.camelCaseToSnakeCase(nameStr)).toLowerCase()
            : nameStr.replace(/[^A-Za-z0-9]+/g, '_').toLowerCase();
          // Treat attributes as PK candidates when any of the following:
          // - explicitly considered primary by config
          // - matches a normalized primary field name (e.g. geldig_van)
          // - name is exactly 'uuid' (common per-entity PK)
          // - name ends with '_uuid'
          // - SQL type is UUID
          return (
            Config.isPrimaryKeyField(nameStr, parentInfo, parentClass) ||
            nameStr === 'uuid' ||
            (typeof nameStr === 'string' && nameStr.endsWith('_uuid')) ||
            (a.sqlType && String(a.sqlType).toUpperCase() === 'UUID')
          );
        } catch (e) {
          return false;
        }
      });

      // console.debug('generateMetadataAttributesForClass pkAttrs for', parentClass, ':', pkAttrs.map(a=>a.name));

      // If we found a UUID-like attribute among the PK candidates, prefer
      // UUID as the owner reference and drop any `uri` candidate to avoid
      // duplicating both `uuid` and `uri` as FK columns.
      if (pkAttrs.some(a => String(a.name) === 'uuid' || (a.sqlType && String(a.sqlType).toUpperCase() === 'UUID'))) {
        pkAttrs = pkAttrs.filter(a => String(a.name) !== 'uri');
      }

      if (pkAttrs.length > 0) {
        pkAttrs.forEach(pa => {
          const name = `${base}_${pa.name}`;
          attrs.push({
            name,
            type: pa.type || 'string',
            sqlType: pa.sqlType || (pa.type === 'date' ? 'DATE' : 'TEXT'),
            comment: `Reference to owning ${parentClass} (${pa.name})`,
            isForeignKey: true,
            isPrimaryKey: true,
          });
        });
      } else {
        // fallback: include owner uuid as FK and part of PK
        attrs.push({
          name: `${base}_uuid`,
          type: 'string',
          sqlType: 'UUID',
          comment: `Reference to owning ${parentClass} (UUID)`,
          isForeignKey: true,
          isPrimaryKey: true,
        });
      }
    } catch (e) {
      // best-effort; fall back to owner_uuid
      attrs.push({
        name: `${base}_uuid`,
        type: 'string',
        sqlType: 'UUID',
        comment: `Reference to owning ${parentClass} (UUID)`,
        isForeignKey: true,
        isPrimaryKey: true,
      });
    }

    // value column for the metadata entry
    attrs.push({
      name: 'value',
      type: 'string',
      sqlType: 'TEXT',
      comment: 'Metadata value',
    });

    // console.debug('generateMetadataAttributesForClass attrs for', parentClass, ':', attrs.map(a=>a.name));
    return attrs;
  }
}

export default BaseGenerator;
