import fs from 'fs';
import { PATHS } from './config.js';
import * as Config from './config.js';
import { ClassGenerator } from './generators/class-generator.js';

export class ClassDiagramGenerator extends ClassGenerator {
  constructor(ontology, { outputPath = PATHS.dataModels.class } = {}) {
    super(ontology, { outputPath });
    this.outputPath = outputPath;
  }

  generate() {
    this.prepareOntology();
    this.buildRelationships(true);
    const diagram = this.generateMermaidDiagram();
    // Post-process diagram for a few edge-cases then write
    const finalDiagram = this._postprocessMermaid ? this._postprocessMermaid(diagram) : diagram;
    fs.writeFileSync(this.outputPath, finalDiagram, 'utf-8');
  }

  generateMermaidDiagram() {
    let mermaid = `---\nconfig:\n  theme: default\n  layout: elk\n  elk:\n    nodePlacementStrategy: SIMPLE\n---\n%% Auto-generated from OWL/SHACL\nclassDiagram\n`;

    const classNames = this.computeVisibleClasses();
    const { classToSupers, sharedSupers, sharedInterfaceNames } = this._computeShared(classNames);
    // ensure interface nodes are present in classNames so they get rendered
    Array.from(sharedInterfaceNames.values()).forEach(ifaceNode => { if (!classNames.includes(ifaceNode)) classNames.push(ifaceNode); });

    // join table detection removed: not needed for class diagrams

    // Build a quick lookup for property -> resolved target (used to display FK attributes as interfaces)
    // Add multiple keys (raw property, camel-cased property, camel-cased label, id-stripped variants)
    const relPropertyMap = new Map();
    const normalize = s => (this.utils && typeof this.utils.normalizeString === 'function') ? this.utils.normalizeString(s) : (s || '').toString().toLowerCase();

    Array.from(this.relationships.values()).forEach(rel => {
      // Prefer concrete targets when configured or for synthetic/override cases
      let toResolved = null;
      if (this.utils && typeof this.utils.shouldPreferConcreteTarget === 'function' && this.utils.shouldPreferConcreteTarget(rel)) {
        toResolved = rel.to;
      } else {
        const sharedIface = this.findSharedInterfaceForTargets([rel.to], classToSupers, sharedInterfaceNames);
        toResolved = sharedIface || rel.to;
      }
      const toResolvedName = this.getBusinessClassName ? this.getBusinessClassName(toResolved) || toResolved : toResolved;
      const rawKey = `${rel.from}|${rel.property}`;
      // Prefer enum targets (e.g. Procedure) when multiple relationships
      // share the same source+property. Avoid silently overwriting a
      // previously-determined enum mapping with a concrete class.
      const existing = relPropertyMap.get(rawKey);
      const enumSet = (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set) ? Config.ENUMERABLE_CLASSES : null;
      const isEnumTarget = enumSet ? enumSet.has(toResolved) : (this.enumClasses && this.enumClasses.has(toResolved));
      const existingIsEnum = existing ? (enumSet ? enumSet.has(existing) : (this.enumClasses && this.enumClasses.has(existing))) : false;
      if (!existing || (!existingIsEnum && isEnumTarget)) relPropertyMap.set(rawKey, toResolvedName);

      const camelProp = (typeof rel.property === 'string') ? this.toCamelCase(rel.property) : null;
      if (camelProp) {
        const key1 = `${rel.from}|${camelProp}`;
        const key2 = `${rel.from}|${camelProp.replace(/Id$/i, '')}`;
        if (!relPropertyMap.has(key1) || (!relPropertyMap.has(key1) && isEnumTarget)) relPropertyMap.set(key1, toResolvedName);
        if (!relPropertyMap.has(key2) || (!relPropertyMap.has(key2) && isEnumTarget)) relPropertyMap.set(key2, toResolvedName);
      }

      if (rel.label && typeof rel.label === 'string') {
        const camelLabel = this.toCamelCase(rel.label);
        const keyA = `${rel.from}|${camelLabel}`;
        const keyB = `${rel.from}|${camelLabel.replace(/Id$/i, '')}`;
        if (!relPropertyMap.has(keyA) || (!relPropertyMap.has(keyA) && isEnumTarget)) relPropertyMap.set(keyA, toResolvedName);
        if (!relPropertyMap.has(keyB) || (!relPropertyMap.has(keyB) && isEnumTarget)) relPropertyMap.set(keyB, toResolvedName);
      }

      // normalized variants (strip diacritics and non-alphanumerics)
      const normProp = normalize(rel.property);
      if (normProp) {
        const k = `${rel.from}|${normProp}`;
        if (!relPropertyMap.has(k) || (!relPropertyMap.has(k) && isEnumTarget)) relPropertyMap.set(k, toResolvedName);
      }
      if (camelProp) {
        const kc = `${rel.from}|${normalize(camelProp)}`;
        if (!relPropertyMap.has(kc) || (!relPropertyMap.has(kc) && isEnumTarget)) relPropertyMap.set(kc, toResolvedName);
      }
      if (rel.label) {
        const normLabel = normalize(rel.label);
        const kl = `${rel.from}|${normLabel}`;
        if (!relPropertyMap.has(kl) || (!relPropertyMap.has(kl) && isEnumTarget)) relPropertyMap.set(kl, toResolvedName);
      }
    });

    // render nodes
    classNames.forEach(className => {
      // interface nodes
      if (className.startsWith('I') && className.length > 1 && className[1] === className[1].toUpperCase()) {
        const matched = Array.from(sharedInterfaceNames.entries()).find(([, iface]) => iface === className);
        mermaid += this._renderInterfaceNode(className, matched, sharedInterfaceNames, classToSupers);
        return;
      }
      mermaid += this._renderClassNode(className, sharedInterfaceNames, sharedSupers, classToSupers, classNames, relPropertyMap);
    });

    // Emit explicit relationship lines for FK attributes referencing other visible classes (robust matching)
    // Build a normalized lookup for classNames
    const normalizedClassMap = new Map();
    classNames.forEach(cn => {
      normalizedClassMap.set(String(cn).toLowerCase(), cn);
    });

    classNames.forEach(className => {
      const classInfo = this.ontology.classes.get(className);
      if (!classInfo) return;
      const attrs = this.computeAttributesForClass(className, classNames) || [];
      attrs.forEach(attr => {
        if (attr.isForeignKey && typeof attr.type === 'string') {
          let targetClass = attr.type.replace(/\[\]$/, '').replace(/\s*\(FK\)\s*$/, '');
          let normTarget = String(targetClass).replace(/^I/, '').toLowerCase();
          let foundClass = normalizedClassMap.get(normTarget);
          // Debug output
          if (typeof console !== 'undefined' && console.log) {
            console.log(`[MermaidGen] FK: ${className} -> ${targetClass} (normalized: ${normTarget}) | found: ${!!foundClass}`);
          }
          if (foundClass) {
            mermaid += `    ${this.getDisplayName(className)} --> ${this.getDisplayName(foundClass)} : ${attr.name}\n`;
          }
        }
      });
    });

    // Synthesize enumerated classes from configured ENUMERABLE_CLASSES
    if (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set) {
      Array.from(Config.ENUMERABLE_CLASSES).forEach(localName => {
        const memberList = this.collectEnumerableMembers(localName) || [];
        if (memberList.length === 0) return;
        const members = new Set(memberList);
        if (members.size > 0) {
          const enumClassName = (typeof this.pascalCase === 'function') ? this.pascalCase(localName) : localName;
          mermaid += `    class ${enumClassName} {\n`;
          mermaid += `        <<enumerable>>\n`;
          Array.from(members).forEach(m => { mermaid += `        ${m}\n`; });
          mermaid += `    }\n`;
          // Link any classes that have an enum attribute referring to this enumerable
          Array.from(classNames || []).forEach(cn => {
            const ci = this.ontology.classes.get(cn);
            const attrs = this.deriveAttributes(ci, this.enumClasses, cn) || [];
            const hasEnumAttr = attrs.some(a => a && a.type === 'enum' && (a.comment === localName || (a.propertyIri && this.ontology.extractLocalName && this.ontology.extractLocalName(a.propertyIri) === 'type')));
            if (hasEnumAttr) {
              mermaid += `    ${this.getDisplayName(cn)} --> ${enumClassName} : type\n`;
            }
          });
        }
      });
    }

    // Add identifier relations as explicit relationships so identifier classes are linked
    // to their parent classes in the class diagram. identifierRelations map keys are
    // parent class local names -> restriction objects.
    this.identifierRelations.forEach((restriction, parent) => {
      const idClass = `${parent}Identifier`;
      const key = `${parent}|${idClass}|identifier`;
      if (!this.relationships.has(key)) {
        const label = (this.ontology && typeof this.ontology.deriveAttributeName === 'function')
          ? this.ontology.deriveAttributeName(restriction)
          : 'identifiers';
        this.relationships.set(key, {
          from: parent,
          to: idClass,
          property: 'identifier',
          label,
          minCard: restriction?.minCardinality,
          maxCard: restriction?.maxCardinality
        });
      }
    });

    if (this.inheritance.size > 0 || this.relationships.size > 0) {
      mermaid += `\n`;
    }

    // relationships: inheritance and implementations
    const visibleSet = new Set(classNames);
    this.inheritance.forEach(rel => {
      if (!visibleSet.has(rel.from) || !visibleSet.has(rel.to)) return;
      const fromDisplay = this.getDisplayName(rel.from);
      const toDisplay = this.getDisplayName(rel.to);
      mermaid += `    ${fromDisplay} <|-- ${toDisplay}\n`;
    });

    // Render implementation relationships for shared interfaces
    sharedInterfaceNames.forEach((iface, superName) => {
      classToSupers.forEach((supers, cn) => {
        if (supers.includes(superName) && visibleSet.has(cn)) {
          const ifaceDisplay = iface;
          const classDisplay = this.getDisplayName(cn);
          mermaid += `    ${ifaceDisplay} <|.. ${classDisplay}\n`;
        }
      });
    });

    // render object relationships
    const renderRelMap = new Map();

    // If there exists an explicit relationship from the same source+property to multiple targets that share a common interface, prefer rendering a single relationship to that shared interface (e.g. Sensor -> IAgent instead of Sensor -> Person, Sensor -> Organization)
    const groupMap = new Map();
    Array.from(this.relationships.values()).forEach(rel => {
      if (!visibleSet.has(rel.from) || !visibleSet.has(rel.to)) return;
      // If there exists an enum-targeting relationship for the same
      // source+property, prefer that and skip non-enum targets to avoid
      // duplicate `Proces -> Proces : type` when `Procedure` is the enum.
      try {
        const enumSet = (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set) ? Config.ENUMERABLE_CLASSES : null;
        if (enumSet) {
          const propLocal = rel.property ? String(rel.property).toLowerCase() : (rel.propertyIri && this.ontology && typeof this.ontology.extractLocalName === 'function' ? String(this.ontology.extractLocalName(rel.propertyIri)).toLowerCase() : null);
          if (propLocal) {
            const hasEnumTarget = Array.from(this.relationships.values()).some(r2 => {
              if (!r2 || r2.from !== rel.from) return false;
              const r2PropLocal = r2.property ? String(r2.property).toLowerCase() : (r2.propertyIri && this.ontology && typeof this.ontology.extractLocalName === 'function' ? String(this.ontology.extractLocalName(r2.propertyIri)).toLowerCase() : null);
              return r2PropLocal === propLocal && enumSet.has(r2.to);
            });
            const isEnum = enumSet.has(rel.to);
            if (hasEnumTarget && !isEnum) return; // skip non-enum target when enum exists
          }
        }
      } catch (e) { /* ignore */ }
      const labelKey = `${rel.from}|${rel.label || rel.property}`;
      if (!groupMap.has(labelKey)) groupMap.set(labelKey, []);
      groupMap.get(labelKey).push(rel);
    });

    const interfaceTargetMap = new Map();
    groupMap.forEach((rels, labelKey) => {
      for (const r of rels) {
        // Do not collapse relationships that prefer concrete targets to interfaces
        if (this.utils && typeof this.utils.shouldPreferConcreteTarget === 'function' && this.utils.shouldPreferConcreteTarget(r)) continue;
        const sharedIface = this.findSharedInterfaceForTargets([r.to], classToSupers, sharedInterfaceNames);
        if (sharedIface) { interfaceTargetMap.set(labelKey, sharedIface); break; }
      }
    });

    Array.from(this.relationships.values()).forEach(rel => {
      if (!visibleSet.has(rel.from) || !visibleSet.has(rel.to)) return;
      // Filter out certain inferred/undesired relationships for specific classes (e.g. Proces)
      {
        const relNorm = (rel.property && typeof rel.property === 'string') ? rel.property : (rel.label || '');
        const norm = normalize(relNorm);
        const propStr = String(rel.property || '').toLowerCase();
        if (rel.from === 'Proces' && (norm === 'afgeleidvan' || norm === 'wasattributedto' || propStr.includes('wasderivedfrom') || propStr.includes('wasattributedto'))) {
          return;
        }
      }
      // If we have an interface target for this (from,property), always use it
      const ifaceKey = `${rel.from}|${rel.label || rel.property}`;
      const forcedIface = interfaceTargetMap.get(ifaceKey);
      if (forcedIface) {
        const key = `${rel.from}|${forcedIface}|${rel.property}`;
        if (!renderRelMap.has(key)) {
          renderRelMap.set(key, Object.assign({}, rel, { toResolved: forcedIface }));
        }
        return; // skip concrete target
      }

      // Ask ClassGenerator helper whether these targets share a common interface
      // Skip interface collapsing for relationships that prefer concrete targets
      let sharedIface = null;
      if (!(this.utils && typeof this.utils.shouldPreferConcreteTarget === 'function' && this.utils.shouldPreferConcreteTarget(rel))) {
        sharedIface = this.findSharedInterfaceForTargets([rel.to], classToSupers, sharedInterfaceNames);
      }
      const toResolved = sharedIface || rel.to;
      const key = `${rel.from}|${toResolved}|${rel.property}`;
      if (!renderRelMap.has(key)) {
        renderRelMap.set(key, Object.assign({}, rel, { toResolved }));
      }
    });

    Array.from(renderRelMap.values()).forEach(rel => {
      const fromDisplay = this.getDisplayName(rel.from);
      const toDisplay = this.getDisplayName(rel.toResolved || rel.to);
      const label = (rel.label || '').replace(/\n|\r|\r\n/g, ' ').replace(/\s+/g, ' ').trim();
      mermaid += `    ${fromDisplay} --> ${toDisplay} : ${label}\n`;
    });

    return mermaid;
  }

  // Post-process mermaid output to correct a few known rendering edge-cases
  // (fallback fixes in case relationship collapsing produced undesired targets).
  _postprocessMermaid(mermaid) {
    if (!mermaid || typeof mermaid !== 'string') return mermaid;
    try {
      const lines = String(mermaid).split(/\r?\n/);
      const enumSet = (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set) ? Config.ENUMERABLE_CLASSES : null;
      const knownEnums = new Set(enumSet ? Array.from(enumSet).map(e => (typeof this.pascalCase === 'function' ? this.pascalCase(e) : e)) : (this.enumClasses ? Array.from(this.enumClasses) : []));

      // Collect enum-targeting relationships: map key -> enumTarget
      const enumRelMap = new Map();
      const relRe = /^\s*([^\s]+)\s*-->\s*([^\s]+)\s*:\s*(.+)$/;
      for (const l of lines) {
        const m = relRe.exec(l);
        if (!m) continue;
        const from = m[1]; const to = m[2]; const label = (m[3] || '').trim();
        const labelKey = `${from}|${String(label).toLowerCase()}`;
        if (knownEnums.has(to)) enumRelMap.set(labelKey, to);
      }

      const out = [];
      let currentClass = null;
      let inClassBlock = false;
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        // detect class block start
        const classStart = l.match(/^\s*class\s+(\S+)\s*\{/);
        if (classStart) { currentClass = classStart[1]; inClassBlock = true; out.push(l); continue; }
        if (inClassBlock && /^\s*\}/.test(l)) { inClassBlock = false; currentClass = null; out.push(l); continue; }

        if (inClassBlock && currentClass) {
          // attribute line like: "        Type name" or "        Type[] name (FK)"
          const attrMatch = l.match(/^\s*([A-Za-z0-9_\[\]]+)\s+(.+?)$/);
          if (attrMatch) {
            const attrType = attrMatch[1];
            const attrName = attrMatch[2].replace(/\s*\([^)]*\)\s*$/,'').trim();
            const labelKey = `${currentClass}|${String(attrName).toLowerCase()}`;
            const enumTarget = enumRelMap.get(labelKey);
            if (enumTarget && attrType !== enumTarget) {
              // replace type with enumTarget (preserve indentation)
              const indent = l.match(/^(\s*)/)[1] || '';
              // preserve any trailing FK marker
              const fk = l.includes('(FK)') ? ' (FK)' : '';
              out.push(`${indent}${enumTarget} ${attrName}${fk}`);
              continue;
            }
          }
          out.push(l);
          continue;
        }

        // Outside class blocks: filter relationship lines where an enum-targeting
        // relationship exists for same source+label; skip the non-enum duplicate.
        const relMatch = relRe.exec(l);
        if (relMatch) {
          const from = relMatch[1]; const to = relMatch[2]; const label = (relMatch[3] || '').trim();
          const labelKey = `${from}|${String(label).toLowerCase()}`;
          const enumTarget = enumRelMap.get(labelKey);
          if (enumTarget && enumTarget !== to) {
            // skip this non-enum relationship
            continue;
          }
        }

        out.push(l);
      }

      return out.join('\n');
    } catch (e) {
      return mermaid;
    }
  }

  _computeShared(classNames) {
    const forced = [];
    if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
      Array.from(Config.INTERFACE_CLASSES).forEach(k => { if (!forced.includes(k)) forced.push(k); });
    }
    // map incoming visible class names (which may be business names) to local ontology names
    const localNames = [];
    for (const [local, info] of this.ontology.classes) {
      const biz = this.getBusinessClassName ? this.getBusinessClassName(local) : local;
      if (classNames.includes(biz) || classNames.includes(local)) {
        localNames.push(local);
      }
    }
    const { classToSupers, sharedSupers, sharedInterfaceNames } = this.computeSharedSupers(localNames, forced);
    // expose classToSupers keyed by both local name and business name for downstream callers
    const dualMap = new Map();
    for (const [local, supers] of classToSupers.entries()) {
      const biz = this.getBusinessClassName ? this.getBusinessClassName(local) : local;
      dualMap.set(local, supers);
      if (biz && biz !== local) dualMap.set(biz, supers);
    }
    return { classToSupers: dualMap, sharedSupers, sharedInterfaceNames };
  }

  // join table helper removed — join tables are not needed in class diagrams

  _renderInterfaceNode(className, matched, sharedInterfaceNames, classToSupers) {
    let mermaid = '';
    const displayName = this.getDisplayName(className);
    mermaid += `    class ${displayName} {\n`;
    mermaid += `        <<interface>>\n`;
      if (matched) {
      const superName = matched[0];
      const { props } = this.renderSharedInterfaceProps(superName, sharedInterfaceNames, classToSupers);
      if (props && props.length > 0) {
        props.forEach(p => {
          // Do not include long comments in class diagram; keep only type + name
          mermaid += `        ${p.type} ${p.name}\n`;
        });
      } else {
        mermaid += `        string uri\n`;
      }
    }
    mermaid += `    }\n`;
    return mermaid;
  }

  _renderClassNode(className, sharedInterfaceNames, sharedSupers, classToSupers, classNames, relPropertyMap = new Map()) {
    let mermaid = '';
    const classInfo = this.ontology.classes.get(className);
    const displayName = this.getDisplayName(className, classInfo);
    // Determine a direct internal superclass (if any) so computeAttributesForClass
    // can filter out attributes inherited from that superclass (avoid duplicate FKs)
    let extendsSuperName = null;
    const supers = classToSupers.get(className) || [];
    for (const s of supers) {
      const info = this.ontology.classes.get(s);
      if (info && !info.external && classNames.includes(s)) { extendsSuperName = s; break; }
    }

    // Resolve business class name to ontology local name when possible so
    // attribute computation has access to classInfo (temporal attrs, etc.).
    let sourceLocalName = className;
    let classInfoLocal = this.ontology.classes.get(className);
    if (!classInfoLocal) {
      for (const [ln, info] of this.ontology.classes) {
        try {
          const bn = this.ontology.getBusinessNameForClass(info.iri);
          if (bn === className) { classInfoLocal = info; sourceLocalName = ln; break; }
        } catch (e) { /* ignore */ }
      }
    } else {
      sourceLocalName = className;
    }

    // Use centralized attribute computation (handles identifier relations and superclass filtering)
    let attrsRaw = this.computeAttributesForClass(sourceLocalName, classNames, extendsSuperName) || [];
    // debug logging removed
    // Merge any CODE_ADDED_ATTRIBUTES while avoiding duplicates
    let extraAttrs = [];
    if (Config.CODE_ADDED_ATTRIBUTES && Config.CODE_ADDED_ATTRIBUTES.has(className)) {
      extraAttrs = Config.CODE_ADDED_ATTRIBUTES.get(className);
    }
    const seen = new Set();
    attrsRaw.forEach(a => seen.add(a.propertyIri || a.name));
    extraAttrs.forEach(a => { if (!seen.has(a.propertyIri || a.name)) attrsRaw.push(a); });

    const attributes = attrsRaw.map(attr => {
      // Normalize property rendering for diagrams using centralized helper
      const resolved = this.applyPropertyRenderOverride(attr, className, sharedInterfaceNames, classNames, classToSupers);
      if (!resolved) return null;
      const { name, type, isArray, isForeignKey, comment } = resolved;
      return { name, type, isForeignKey, isArray, comment: comment || null };
    });

    // Deduplicate attributes by name: prefer interface or concrete types over generic 'object'/'string' entries
    const attrByName = new Map();
    attributes.filter(Boolean).forEach(a => {
      const n = a.name || '';
      if (!attrByName.has(n)) { attrByName.set(n, a); return; }
      const existing = attrByName.get(n);
      const isPreferred = t => (typeof t === 'string' && (/^I[A-Z]/.test(t) || /^[A-Z][a-zA-Z0-9]/.test(t)));
      if (isPreferred(a.type) && !isPreferred(existing.type)) attrByName.set(n, a);
      else if (a.type && existing.type === 'object') attrByName.set(n, a);
    });
    const finalAttributes = Array.from(attrByName.values());

    mermaid += `    class ${displayName} {
`;
    finalAttributes.forEach(attr => {
      // Skip certain inferred/undesired attributes for specific classes
      if (className === 'Proces' && (attr.name === 'afgeleidVan' || attr.name === 'wasAttributedTo')) return;

      const displayAttrName = attr.isForeignKey ? `${attr.name} (FK)` : attr.name;
      // If there is a known relationship mapping for this class+property, prefer that resolved target
      let mapped = relPropertyMap.get(`${className}|${attr.name}`) || relPropertyMap.get(`${className}|${attr.name.replace(/Id$/i, '')}`) || null;
      if (!mapped) mapped = relPropertyMap.get(`${className}|${this.toCamelCase(attr.name)}`) || null;
      if (!mapped) {
        const norm = n => { try { return String(n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^0-9A-Za-z]/g,'').toLowerCase(); } catch (e) { return String(n||'').replace(/[^0-9A-Za-z]/g,'').toLowerCase(); } };
        mapped = relPropertyMap.get(`${className}|${norm(attr.name)}`) || relPropertyMap.get(`${className}|${norm(this.toCamelCase(attr.name))}`) || null;
      }

      // Fallback: try to find a matching relationship by fuzzy normalized match between attribute name and relationship label/property
      if (!mapped) {
        const aNorm = String(attr.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^0-9A-Za-z]/g, '').toLowerCase();
        for (const r of Array.from(this.relationships.values())) {
          if (r.from !== className) continue;
          const rNorm = String(r.label || r.property || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^0-9A-Za-z]/g, '').toLowerCase();
          if (!rNorm) continue;
          const lcsMatch = (() => {
            if (!aNorm || !rNorm) return false;
            const minLen = 4;
            for (let i = 0; i + minLen <= aNorm.length; i++) {
              const sub = aNorm.substr(i, minLen);
              if (sub && rNorm.indexOf(sub) >= 0) return true;
            }
            return false;
          })();
          if (rNorm.includes(aNorm) || aNorm.includes(rNorm) || rNorm.startsWith(aNorm) || aNorm.startsWith(rNorm) || lcsMatch) {
            mapped = this.findSharedInterfaceForTargets([r.to], classToSupers, sharedInterfaceNames) || r.to;
            break;
          }
        }
      }

      let displayType = attr.type;
      if (mapped) {
        // If the mapped target looks like an interface (I... with upper-case second letter) keep as-is
        if (typeof mapped === 'string' && /^I[A-Z]/.test(mapped)) {
          displayType = mapped + (attr.isArray ? '[]' : '');
        } else {
          // otherwise normalize to pascal-cased class name
          displayType = this.pascalCase(mapped) + (attr.isArray ? '[]' : '');
        }
      }
      // Do not render attribute comments in class diagram; keep only type + name
      mermaid += `        ${displayType} ${displayAttrName}\n`;
    });
    mermaid += `    }
  `;
    return mermaid;
  }

}
