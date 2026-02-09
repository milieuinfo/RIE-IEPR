import { BaseGenerator } from './base-generator.js';
import * as Config from '../config.js';

export class ClassGenerator extends BaseGenerator {
  constructor(ontology, options = {}) {
    super(ontology, options);
  }

  pascalCase(name) {
    if (!name || typeof name !== 'string') return name;
    return name.replace(/(^.|_.)/g, s => s.replace(/_/g, '').toUpperCase());
  }

  toCamelCase(name) {
    if (!name || typeof name !== 'string') return name;
    const cleaned = name.replace(/[- ]+/g, '_');
    return cleaned.replace(/_([a-zA-Z0-9])/g, (_, ch) => ch.toUpperCase())
      .replace(/^([A-Z])/, (m, c) => c.toLowerCase());
  }

  isIdentifierTable(className) {
    const parentClass = className.replace('Identifier', '');
    return this.identifierRelations && this.identifierRelations.has(parentClass);
  }

  mapForeignKeyAttribute(attr, className) {
    if (!attr || !attr.propertyIri) return null;
    const override = Config.PROPERTY_TYPE_OVERRIDES.get(attr.propertyIri);
    if (override) {
      // If the attribute explicitly targets an internal (non-external)
      // concrete class, prefer the concrete target and skip the override
      // which typically maps to a generic interface (e.g. IAgent).
      if (Array.isArray(attr.targetClasses) && attr.targetClasses.length > 0) {
        for (const t of attr.targetClasses) {
          const ti = this.ontology.classes.get(t);
          if (ti && !ti.external) return null;
        }
      }
      // If no targetClasses were provided on the derived attribute, attempt
      // to inspect the original class definition's restrictions to see if
      // it explicitly targets an internal class; if so, skip the override.
      try {
        if ((!attr.targetClasses || attr.targetClasses.length === 0) && className) {
          const classInfo = this.ontology.classes.get(className);
          if (classInfo && Array.isArray(classInfo.restrictions)) {
            const matching = classInfo.restrictions.find(r => r.propertyIri === attr.propertyIri);
            if (matching) {
              const resolved = (typeof this.ontology.resolveRangeTypes === 'function') ? this.ontology.resolveRangeTypes(matching.rangeTypes || [], matching) : (matching.rangeTypes || []);
              for (const t of resolved) {
                const ti = this.ontology.classes.get(t);
                if (ti && !ti.external) return null;
              }
            }
          }
        }
      } catch (e) { /* ignore */ }
      const biz = this.ontology.getBusinessNameForProperty ? this.ontology.getBusinessNameForProperty(attr.propertyIri, className) : null;
      const fallback = (attr.name && typeof attr.name === 'string') ? attr.name : (this.ontology.extractLocalName ? this.ontology.extractLocalName(attr.propertyIri) : null);
      const name = override.name || biz || fallback || '';
      const type = override.type || 'object';
      return { name, type };
    }
    return null;
  }

  renderSharedInterfaceProps(superName, sharedInterfaceNames) {
    const props = [];
    const imports = new Set();
    const propMap = new Map();
    const superInfo = this.ontology.classes.get(superName);
    if (!superInfo) return { props, imports };
    const superAttrs = this.utils.deriveAttributes(superInfo, this.enumClasses, superName) || [];
    superAttrs.forEach(attr => {
      const override = attr.propertyIri ? Config.PROPERTY_TYPE_OVERRIDES.get(attr.propertyIri) : null;
      let t = 'string';
      if (attr.type === 'date' || attr.type === 'datetime') t = 'Date';
      else if (attr.type === 'integer' || attr.type === 'float' || attr.type === 'double') t = 'number';
      else if (attr.type === 'boolean') t = 'boolean';
      else if (attr.type === 'enum') t = 'string';

      if (attr.isForeignKey && Array.isArray(attr.targetClasses) && attr.targetClasses.length === 1) {
        const target = attr.targetClasses[0];
        if (Array.from(this.ontology.classes.keys()).includes(target)) t = 'string';
      }

      const isArray = (typeof attr.maxCardinality === 'number' && attr.maxCardinality !== 1)
        || (attr.maxCardinality === undefined && attr.minCardinality !== 1 && !attr.isPrimaryKey && attr.isForeignKey);
      const rawName = (attr.name && typeof attr.name === 'string') ? attr.name : (this.ontology.extractLocalName ? this.ontology.extractLocalName(attr.propertyIri) : null);
      let propName = this.toCamelCase(rawName);
      const base = propName.replace(/Id$/i, '');
      if (override && override.dropId) propName = base;

      if (override && override.interface) {
        const iface = `I${override.interface}` + (isArray ? '[]' : '');
        t = iface;
        imports.add(override.interface);
      } else if (isArray) {
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
    propMap.forEach(v => props.push(v));
    return { props, imports };
  }

  /**
   * Normalize rendering information for a property for diagram-style outputs.
   * Returns { name, type, isArray, isForeignKey } or null to drop the property.
   */
  applyPropertyRenderOverride(attr, className, sharedInterfaceNames, classNames = []) {
    if (!attr) return null;
    // honor explicit render overrides (allow caller to have filtered earlier)
    if (Config.PROPERTY_RENDER_OVERRIDES && Config.PROPERTY_RENDER_OVERRIDES.has(className)) {
      const propMap = Config.PROPERTY_RENDER_OVERRIDES.get(className);
      if (propMap && propMap.has(attr.propertyIri) && propMap.get(attr.propertyIri) === false) return null;
    }

    const mapped = this.mapForeignKeyAttribute(attr, className);
    let name, type;
    if (mapped) {
      name = mapped.name; type = mapped.type;
    } else {
      const biz = this.ontology.getBusinessNameForProperty ? this.ontology.getBusinessNameForProperty(attr.propertyIri, className) : null;
      const rawName = biz || ((attr.name && typeof attr.name === 'string') ? attr.name : (this.ontology.extractLocalName ? this.ontology.extractLocalName(attr.propertyIri) : null));
      name = (typeof rawName === 'string' && rawName.length > 0) ? this.toCamelCase(rawName) : (rawName || '');
      if (attr.propertyIri === 'rdfs:label' || attr.propertyIri === `${Config.NAMESPACES.rdfs}label`) type = 'string';
      else if (attr.type === 'enum') type = 'enum';
      else if (attr.type === 'date' || attr.type === 'datetime') type = 'Date';
      else if (attr.type === 'integer' || attr.type === 'float' || attr.type === 'double') type = 'number';
      else if (attr.type === 'boolean') type = 'boolean';
      else type = 'string';
    }

    const isArray = (typeof attr.maxCardinality === 'number' && attr.maxCardinality !== 1)
      || (attr.maxCardinality === undefined && attr.minCardinality !== 1 && !attr.isPrimaryKey && attr.isForeignKey);

    const override = Config.PROPERTY_TYPE_OVERRIDES.get(attr.propertyIri);
    if (override && override.dropId) {
      name = String(name).replace(/Id$/i, '');
      if (override && override.type) type = override.type;
      else {
        let ifaceName = null;
        if (override && override.interface) ifaceName = `I${override.interface}`;
        if (!ifaceName) {
          const agentEntry = [...sharedInterfaceNames.entries()].find(([s, iface]) => s === 'Agent' || (this.ontology.classes.get(s) && this.ontology.isSubClassOf(this.ontology.classes.get(s).iri, 'Agent')));
          if (agentEntry) ifaceName = agentEntry[1];
        }
        type = ifaceName || 'object';
      }
      if (isArray) type = `${type}[]`;
      return { name, type, isArray, isForeignKey: !!attr.isForeignKey };
    }

    if (attr.isForeignKey && Array.isArray(attr.targetClasses) && attr.targetClasses.length > 0) {
      const targets = attr.targetClasses.filter(t => {
        const isRelevant = (this.ontology.isRelevantClassName && this.ontology.isRelevantClassName(t));
        return isRelevant || classNames.includes(t);
      });
      if (targets.length === 1) {
        const target = targets[0];
        type = this.pascalCase(target);
      } else if (targets.length > 1) {
        type = 'object';
      } else {
        type = 'string';
      }
      name = String(name).replace(/Id$/i, '');
      if (isArray) type = `${type}[]`;
      return { name, type, isArray, isForeignKey: true };
    }

    return { name, type, isArray, isForeignKey: !!attr.isForeignKey };
  }

  tsTypeForAttribute(attr) {
    // TypeScript typing moved to TypeScriptHelper
    if (!attr) return 'string';
    if (attr.type === 'enum') return attr.enumName || 'string';
    if (attr.type === 'date' || attr.type === 'datetime') return 'Date';
    if (attr.type === 'integer' || attr.type === 'float' || attr.type === 'double') return 'number';
    if (attr.type === 'boolean') return 'boolean';
    return 'string';
  }

  findSharedInterfaceForTargets(targets, classToSupers, sharedInterfaceNames) {
    if (!Array.isArray(targets) || targets.length === 0) return null;
    // If any of the concrete targets is an internal (non-external) class,
    // prefer the concrete target rather than collapsing to a shared interface.
    for (const t of targets) {
      const tinfo = this.ontology.classes.get(t);
      if (tinfo && !tinfo.external) return null;
    }
    // collect supers for each target
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
    if (supersList.length === 0) return null;
    const common = supersList.reduce((acc, cur) => acc.filter(x => cur.includes(x)), supersList[0].slice());
    for (const s of common) {
      if (sharedInterfaceNames.has(s)) return sharedInterfaceNames.get(s);
    }
    return null;
  }
  
}

export default ClassGenerator;
