import { BaseGenerator } from './base-generator.js';
import * as Config from '../config.js';

export class ClassGenerator extends BaseGenerator {
  constructor(ontology, options = {}) {
    super(ontology, options);
  }

  pascalCase(name) {
    if (!name || typeof name !== 'string') return name;
    const parts = String(name).trim().replace(/[_\s-]+/g, ' ').split(/\s+/).filter(Boolean);
    return parts.map(p => p.replace(/[^a-zA-Z0-9]/g, '')).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  }

  toCamelCase(name) {
    if (!name || typeof name !== 'string') return name;
    const s = String(name).trim();
    if (!s) return s;
    // normalize separators to single underscore, remove repeated/leading/trailing underscores
    const cleaned = s.replace(/[-\s]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    const camel = cleaned.replace(/_([a-zA-Z0-9])/g, (_, ch) => ch.toUpperCase());
    return camel.replace(/^([A-Z])/, (m, c) => c.toLowerCase());
  }

  isIdentifierTable(className) {
    const parentClass = className.replace('Identifier', '');
    return this.identifierRelations && this.identifierRelations.has(parentClass);
  }

  isAttributeMultiValued(attr) {
    if (!attr) return false;
    // Treat 'rdfs:label' / local 'label' and business name 'benaming' as single-valued
    try {
      const local = (attr.propertyIri && typeof this.ontology.extractLocalName === 'function') ? this.ontology.extractLocalName(attr.propertyIri) : null;
      const biz = (attr.name && typeof attr.name === 'string') ? String(attr.name) : null;
      if (local === 'label' || biz === 'benaming' || String(attr.propertyIri).endsWith('/label') || String(attr.propertyIri).endsWith('#label')) return false;
    } catch (e) { /* ignore */ }
    // Treat negative or undefined maxCardinality (e.g. -1 meaning unspecified)
    // as "no explicit max" so the determination falls back to minCardinality
    // and FK status.
    const max = (typeof attr.maxCardinality === 'number' && attr.maxCardinality >= 0) ? attr.maxCardinality : undefined;
    return (typeof max === 'number' && max !== 1)
      || (max === undefined && attr.minCardinality !== 1 && !attr.isPrimaryKey && attr.isForeignKey);
  }

  mapForeignKeyAttribute(attr, className) {
    if (!attr || !attr.propertyIri) return null;

    return null;
  }

  renderSharedInterfaceProps(superName, sharedInterfaceNames, classToSupers = new Map()) {
    const props = [];
    const imports = new Set();
    const propMap = new Map();
    const superInfo = this.ontology.classes.get(superName);
    if (!superInfo) return { props, imports };
    const superAttrs = this.utils.deriveAttributes(superInfo, this.enumClasses, superName) || [];
    superAttrs.forEach(attr => {
      let t = 'string';
        if (attr.type === 'date' || attr.type === 'datetime') t = 'Date';
        else if (attr.type === 'integer' || attr.type === 'float' || attr.type === 'double' || attr.type === 'number') t = 'number';
      else if (attr.type === 'boolean') t = 'boolean';
      else if (attr.type === 'enum') {
        // Resolve enum class name (prefer explicit enum class, fallback to business name)
        let enumClass = null;
        try {
          if (this.enumClasses && typeof this.enumClasses[Symbol.iterator] === 'function') {
            enumClass = Array.from(this.enumClasses).find(ec => ec === attr.comment || ec === attr.propertyIri || this.pascalCase(ec) === this.pascalCase(attr.name));
          }
        } catch (e) { /* ignore */ }
        const enumName = enumClass ? this.pascalCase(enumClass) : ((attr.comment && typeof attr.comment === 'string' && !attr.comment.includes(',')) ? this.pascalCase(attr.comment) : this.pascalCase(attr.name));
        t = enumName || 'string';
      }

      if (attr.isForeignKey && Array.isArray(attr.targetClasses) && attr.targetClasses.length > 0) {
        // Prefer a single explicit internal concrete target when present.
        const targets = attr.targetClasses.slice();
        const explicitInternal = targets.filter(tn => {
          try {
            const ti = this.ontology.classes.get(tn);
            return ti && !ti.external;
          } catch (e) { return false; }
        });
        if (explicitInternal.length === 1) {
          const single = explicitInternal[0];
          t = this.pascalCase(single);
          imports.add(single);
        } else {
          // Prefer interface types for foreign-key properties on shared interfaces
          const sharedIface = this.findSharedInterfaceForTargets(targets, classToSupers || new Map(), sharedInterfaceNames);
          if (sharedIface) {
            t = sharedIface;
            const localName = String(sharedIface).replace(/^I/, '');
            imports.add(localName);
          } else if (targets.length === 1) {
            // Single concrete target -> prefer its interface (I<Class>) if available
            const single = targets[0];
            t = `I${this.pascalCase(single)}`;
            imports.add(this.pascalCase(single));
          } else {
            t = 'string';
          }
        }
      }

      // Determine arrayness for shared-interface properties by inspecting
      // implementing classes: if any implementing class defines the
      // corresponding attribute as multi-valued, expose it as an array
      // on the interface. Fall back to the attribute's own cardinality
      // when no implementer provides guidance.
      let isArray = false;
      try {
        const visible = Array.from(this.computeVisibleClasses() || []);
        const implementers = [];
        if (classToSupers && typeof classToSupers.forEach === 'function') {
          classToSupers.forEach((supers, cls) => {
            try {
              if (Array.isArray(supers) && supers.includes(superName) && cls !== superName) implementers.push(cls);
            } catch (e) { /* ignore */ }
          });
        }
        for (const impl of implementers) {
          try {
            const implAttrs = this.computeAttributesForClass(impl, visible) || [];
            const matching = implAttrs.find(a => {
              if (!a) return false;
              if (a.name === attr.name) return true;
              if (a.propertyIri && attr.propertyIri && a.propertyIri === attr.propertyIri) return true;
              try {
                const aLocal = a.propertyIri ? this.ontology.extractLocalName(a.propertyIri) : a.name;
                const attrLocal = attr.propertyIri ? this.ontology.extractLocalName(attr.propertyIri) : attr.name;
                if (aLocal && attrLocal && aLocal === attrLocal) return true;
                const aBiz = this.ontology.getBusinessNameForProperty ? this.ontology.getBusinessNameForProperty(a.propertyIri, impl) : null;
                const attrBiz = this.ontology.getBusinessNameForProperty ? this.ontology.getBusinessNameForProperty(attr.propertyIri, impl) : null;
                if (aBiz && attrBiz && aBiz === attrBiz) return true;
              } catch (e) { /* ignore */ }
              return false;
            });
            if (matching && this.isAttributeMultiValued(matching)) { isArray = true; break; }
          } catch (e) { /* ignore */ }
        }
        if (implementers.length === 0) {
          // No implementing classes found — conservative fallback to attribute metadata
          isArray = this.isAttributeMultiValued(attr);
        }
      } catch (e) {
        isArray = this.isAttributeMultiValued(attr);
      }
      const rawName = (attr.name && typeof attr.name === 'string') ? attr.name : (this.ontology.extractLocalName ? this.ontology.extractLocalName(attr.propertyIri) : null);
      let propName = this.toCamelCase(rawName);
      const base = propName.replace(/Id$/i, '');
      if (isArray) {
        t = `${t}[]`;
      }

      const existing = propMap.get(base);
      if (!existing) {
        propMap.set(base, { name: propName, type: t });
      } else {
        const existingIsIface = /^I[A-Z]/.test(existing.type);
        const newIsIface = /^I[A-Z]/.test(t);
        if (existing.name.endsWith('Id') && !propName.endsWith('Id')) {
          propMap.set(base, { name: propName, type: newIsIface ? t : existingIsIface ? existing.type : t });
        } else if (newIsIface && !existingIsIface) {
          propMap.set(base, { name: propName, type: t });
        } else {
          if (existing.type === 'object' && t !== 'object') propMap.set(base, { name: propName, type: t });
        }
      }
    });
    // Deduplicate and prefer interface-typed entries when multiple variants exist
    const byNorm = new Map();
    propMap.forEach(v => {
      const norm = String(v.name).replace(/_+$/g, '').replace(/Id$/i, '').toLowerCase();
      if (!byNorm.has(norm)) byNorm.set(norm, []);
      byNorm.get(norm).push(v);
    });
    byNorm.forEach(list => {
      if (list.length === 1) props.push(list[0]);
      else {
        // prefer entry with interface type (I... or I...[]), then array of interface, otherwise prefer non-enum over enum
        const iface = list.find(l => /^I[A-Z]/.test(l.type) || /^I[A-Z].*\[\]/.test(l.type));
        if (iface) props.push(iface);
        else {
          const nonEnum = list.find(l => !/[A-Za-z0-9_]+\[?\]?/.test(l.type) || !l.type.match(/^[A-Z][a-zA-Z0-9_]*/));
          props.push(nonEnum || list[0]);
        }
      }
    });
    return { props, imports };
  }

  /**
   * Normalize rendering information for a property for diagram-style outputs.
   * Returns { name, type, isArray, isForeignKey } or null to drop the property.
   */
  applyPropertyRenderOverride(attr, className, sharedInterfaceNames, classNames = [], classToSupers = null) {
    if (!attr) return null;

    const mapped = this.mapForeignKeyAttribute(attr, className);
    let name, type;
    if (mapped) {
      name = mapped.name; type = mapped.type;
    } else {
      const biz = this.ontology.getBusinessNameForProperty ? this.ontology.getBusinessNameForProperty(attr.propertyIri, className) : null;
      const rawName = biz || ((attr.name && typeof attr.name === 'string') ? attr.name : (this.ontology.extractLocalName ? this.ontology.extractLocalName(attr.propertyIri) : null));
      name = (typeof rawName === 'string' && rawName.length > 0) ? this.toCamelCase(rawName) : (rawName || '');
      if (attr.propertyIri === 'rdfs:label' || attr.propertyIri === `${Config.NAMESPACES.rdfs}label`) type = 'string';
      else if (attr.type === 'enum') {
        // Resolve enum class name for diagram rendering
        let enumClass = null;
        try {
          if (this.enumClasses && typeof this.enumClasses[Symbol.iterator] === 'function') {
            enumClass = Array.from(this.enumClasses).find(ec => ec === attr.comment || ec === attr.propertyIri || this.pascalCase(ec) === this.pascalCase(attr.name));
          }
        } catch (e) { /* ignore */ }
        const enumName = enumClass ? this.pascalCase(enumClass) : ((attr.comment && typeof attr.comment === 'string' && !attr.comment.includes(',')) ? this.pascalCase(attr.comment) : this.pascalCase(attr.name));
        type = enumName || 'enum';
      }
      else if (attr.type === 'date' || attr.type === 'datetime') type = 'Date';
      else if (attr.type === 'integer' || attr.type === 'float' || attr.type === 'double' || attr.type === 'number') type = attr.type;
      else if (attr.type === 'boolean') type = 'boolean';
      else type = 'string';
    }

    const isArray = this.isAttributeMultiValued(attr);

    if (attr.isForeignKey && Array.isArray(attr.targetClasses) && attr.targetClasses.length > 0) {
      // Prefer explicit internal concrete targets regardless of visible class list
      const explicitInternal = (attr.targetClasses || []).filter(tn => {
        try { const ti = this.ontology.classes.get(tn); return ti && !ti.external; } catch (e) { return false; }
      });
      if (explicitInternal.length === 1) {
        const target = explicitInternal[0];
        type = this.pascalCase(target);
      } else {
        const targets = attr.targetClasses.filter(t => {
          const isRelevant = (this.ontology.isRelevantClassName && this.ontology.isRelevantClassName(t));
          return isRelevant || classNames.includes(t);
        });
        if (!targets || targets.length === 0) {
          type = 'string';
        } else {
          // Prefer collapsing to a shared interface when possible (also for internal classes)
          const iface = this.findSharedInterfaceForTargets(targets, classToSupers || new Map(), sharedInterfaceNames);
          if (iface) {
            type = iface;
          } else if (targets.length === 1) {
            const target = targets[0];
            type = this.pascalCase(target);
          } else {
            type = 'object';
          }
        }
      }
      name = String(name).replace(/Id$/i, '');
      if (isArray) type = `${type}[]`;
      return { name, type, isArray, isForeignKey: true };
    }

    return { name, type, isArray, isForeignKey: !!attr.isForeignKey };
  }

  /**
   * Collect enumerable members for a configured local enumerable name.
   * Scans known enumClasses for subclasses of `localName` and derives
   * members using ontology hints (deriveEnumMembers, SKOS labels) and
   * falls back to formatted local class names. Returns an array of
   * unique UPPER_SNAKE_CASE member names.
   */
  collectEnumerableMembers(localName) {
    const members = new Set();
    try {
      const candidates = Array.from(this.enumClasses || []).filter(ec => {
        try {
          const info = this.ontology.classes.get(ec);
          return info && info.iri && this.ontology.isSubClassOf(info.iri, localName);
        } catch (e) { return false; }
      });
      candidates.forEach(ec => {
        let vals = this.ontology.deriveEnumMembers ? (this.ontology.deriveEnumMembers(ec) || []) : [];
        if (!vals || vals.length === 0) {
          // formatted fallback: strip common suffixes and convert to snake
          let formatted = String(ec).replace(/Procedure$/i, '');
          if (formatted.endsWith('s')) formatted = formatted.slice(0, -1);
          const snake = formatted.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^0-9A-Za-z_]/g, '_');
          vals = [snake.toUpperCase()];
        }
        if ((!vals || vals.length === 0) && this.ontology && this.ontology.store && this.ontology.classes) {
          const info = this.ontology.classes.get(ec);
          if (info && info.iri) {
            const iri = info.iri;
            const quads = this.ontology.store.getQuads(null, null, null) || [];
            const subjects = new Set();
            quads.forEach(q => {
              try {
                if (q.object && q.object.value === iri) {
                  const pred = String(q.predicate && q.predicate.value || '').toLowerCase();
                  if (pred.includes('broader') || pred.includes('inscheme')) subjects.add(q.subject);
                }
              } catch (e) { /* ignore */ }
            });
            if (subjects.size > 0) {
              vals = [];
              subjects.forEach(s => {
                const labelQuad = (this.ontology.store.getQuads(s, null, null) || []).find(lq => String(lq.predicate && lq.predicate.value || '').toLowerCase().includes('label'));
                if (labelQuad && labelQuad.object && labelQuad.object.value) vals.push(labelQuad.object.value);
                else if (s && s.termType === 'NamedNode') {
                  const local = this.ontology.extractLocalName ? this.ontology.extractLocalName(s.value) : (s.value.split(/[#\\/]/).pop());
                  if (local) vals.push(local);
                }
              });
            }
          }
        }
        (vals || []).forEach(v => {
          const id = String(v).replace(/[^0-9A-Za-z_]/g, '_').replace(/^_+|_+$/g, '');
          if (id) members.add(id.toUpperCase());
        });
      });
    } catch (e) { /* ignore */ }
    return Array.from(members);
  }

  findSharedInterfaceForTargets(targets, classToSupers, sharedInterfaceNames) {
    if (!Array.isArray(targets) || targets.length === 0) return null;
    // collect supers for each target
    const supersList = targets.map(t => {
      const list = (classToSupers.get(t) || []).slice();
      // include the target's own local name so a class that *is* the shared
      // super (e.g. Agent) will still resolve to the shared interface.
      if (!list.includes(t)) list.push(t);
      const tinfo = this.ontology.classes.get(t);
      if (tinfo && Array.isArray(tinfo.superClasses)) {
        tinfo.superClasses.forEach(si => {
          const local = this.ontology.extractLocalName(si);
          if (local && !list.includes(local)) list.push(local);
        });
      }
      return list;
    });
    if (supersList.length === 0) return null;
    const common = supersList.reduce((acc, cur) => acc.filter(x => cur.includes(x)), supersList[0].slice());
    for (const s of common) {
      if (sharedInterfaceNames.has(s)) return sharedInterfaceNames.get(s);
    }
    return null;
  }

}

export default ClassGenerator;
