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
    fs.writeFileSync(this.outputPath, diagram, 'utf-8');
  }

  generateMermaidDiagram() {
    let mermaid = `%% Auto-generated from OWL/SHACL\nclassDiagram\n`;

    const classNames = this.computeVisibleClasses();
    const { classToSupers, sharedSupers, sharedInterfaceNames } = this._computeShared(classNames);
    // ensure interface nodes are present in classNames so they get rendered
    Array.from(sharedInterfaceNames.values()).forEach(ifaceNode => { if (!classNames.includes(ifaceNode)) classNames.push(ifaceNode); });

    // join table detection removed: not needed for class diagrams

    // Build a quick lookup for property -> resolved target (used to display FK attributes as interfaces)
    // Add multiple keys (raw property, camel-cased property, camel-cased label, id-stripped variants)
    const relPropertyMap = new Map();
    const normalize = s => {
      if (!s || typeof s !== 'string') return '';
      // prefer Unicode normalization when available, otherwise fall back
      if (typeof String.prototype.normalize === 'function') {
        return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^0-9A-Za-z]/g, '').toLowerCase();
      }
      return s.replace(/[^0-9A-Za-z]/g, '').toLowerCase();
    };

    Array.from(this.relationships.values()).forEach(rel => {
      const sharedIface = this.findSharedInterfaceForTargets([rel.to], classToSupers, sharedInterfaceNames);
      const toResolved = sharedIface || rel.to;
      const toResolvedName = this.getBusinessClassName ? this.getBusinessClassName(toResolved) || toResolved : toResolved;
      const rawKey = `${rel.from}|${rel.property}`;
      relPropertyMap.set(rawKey, toResolvedName);

      const camelProp = (typeof rel.property === 'string') ? this.toCamelCase(rel.property) : null;
      if (camelProp) {
        relPropertyMap.set(`${rel.from}|${camelProp}`, toResolved);
        relPropertyMap.set(`${rel.from}|${camelProp.replace(/Id$/i, '')}`, toResolved);
      }

      if (rel.label && typeof rel.label === 'string') {
        const camelLabel = this.toCamelCase(rel.label);
        relPropertyMap.set(`${rel.from}|${camelLabel}`, toResolved);
        relPropertyMap.set(`${rel.from}|${camelLabel.replace(/Id$/i, '')}`, toResolvedName);
      }

      // normalized variants (strip diacritics and non-alphanumerics)
      const normProp = normalize(rel.property);
      if (normProp) relPropertyMap.set(`${rel.from}|${normProp}`, toResolvedName);
      if (camelProp) relPropertyMap.set(`${rel.from}|${normalize(camelProp)}`, toResolvedName);
      if (rel.label) {
        const normLabel = normalize(rel.label);
        relPropertyMap.set(`${rel.from}|${normLabel}`, toResolvedName);
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
      const labelKey = `${rel.from}|${rel.label || rel.property}`;
      if (!groupMap.has(labelKey)) groupMap.set(labelKey, []);
      groupMap.get(labelKey).push(rel);
    });

    const interfaceTargetMap = new Map();
    groupMap.forEach((rels, labelKey) => {
      for (const r of rels) {
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
      const sharedIface = this.findSharedInterfaceForTargets([rel.to], classToSupers, sharedInterfaceNames);
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

  _computeShared(classNames) {
    const forced = [];
    if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
      Array.from(Config.INTERFACE_CLASSES).forEach(k => { if (!forced.includes(k)) forced.push(k); });
    }
    return this.computeSharedSupers(classNames, forced);
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

    // Use centralized attribute computation (handles identifier relations and superclass filtering)
    let attrsRaw = this.computeAttributesForClass(className, classNames, extendsSuperName) || [];
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
