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
    // use BaseGenerator lifecycle
    this.prepareOntology();
    this.buildRelationships(true);
    const diagram = this.generateMermaidDiagram();
    fs.writeFileSync(this.outputPath, diagram, 'utf-8');
  }

  // buildRelationships inherited from BaseGenerator

  generateMermaidDiagram() {
    // build top-level mermaid document and assemble using helpers
    let mermaid = `%% Auto-generated from OWL/SHACL\nclassDiagram\n`;

    const classNames = this.computeVisibleClasses();
    const { classToSupers, sharedSupers, sharedInterfaceNames } = this._computeShared(classNames);
    // ensure interface nodes are present in classNames so they get rendered
    Array.from(sharedInterfaceNames.values()).forEach(ifaceNode => { if (!classNames.includes(ifaceNode)) classNames.push(ifaceNode); });

    const relsForJoin = Array.from(this.relationships.values()).filter(rel => classNames.includes(rel.from) || classNames.includes(rel.to));
    const { joinTables } = this.computeJoinTablesFor(relsForJoin, Config, new Set(classNames));
    const joinTableMap = new Map();
    joinTables.forEach(jt => joinTableMap.set(jt.name, jt));

    // Build a quick lookup for property -> resolved target (used to display FK attributes as interfaces)
    const relPropertyMap = new Map();
    Array.from(this.relationships.values()).forEach(rel => {
      const sharedIface = this.findSharedInterfaceForTargets([rel.to], classToSupers, sharedInterfaceNames);
      const toResolved = sharedIface || rel.to;
      relPropertyMap.set(`${rel.from}|${rel.property}`, toResolved);
    });

    // render nodes
    classNames.forEach(className => {
      // interface nodes
      if (className.startsWith('I') && className.length > 1 && className[1] === className[1].toUpperCase()) {
        const matched = Array.from(sharedInterfaceNames.entries()).find(([, iface]) => iface === className);
        mermaid += this._renderInterfaceNode(className, matched, sharedInterfaceNames, classToSupers);
        return;
      }
      // skip join table nodes
      if (joinTableMap.has(className)) return;
      mermaid += this._renderClassNode(className, joinTableMap, sharedInterfaceNames, sharedSupers, classToSupers, classNames, relPropertyMap);
    });

    // Synthesize enumerated classes from configured ENUMERABLE_CLASSES
    try {
      if (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set) {
        Array.from(Config.ENUMERABLE_CLASSES).forEach(localName => {
          try {
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
                try {
                  const ci = this.ontology.classes.get(cn);
                  const attrs = this.deriveAttributes(ci, this.enumClasses, cn) || [];
                  const hasEnumAttr = attrs.some(a => a && a.type === 'enum' && (a.comment === localName || (a.propertyIri && this.ontology.extractLocalName && this.ontology.extractLocalName(a.propertyIri) === 'type')));
                  if (hasEnumAttr) {
                    mermaid += `    ${this.getDisplayName(cn)} --> ${enumClassName} : type\n`;
                  }
                } catch (e) { /* ignore */ }
              });
            }
          } catch (e) { /* ignore */ }
        });
      }
    } catch (e) { /* ignore */ }

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
    // Collapse relationships that target a shared interface (e.g., multiple Agent subtypes -> IAgent)
    const renderRelMap = new Map();

    // If there exists an explicit relationship from the same source+property
    // that targets an interface, prefer that interface and drop concrete
    // target relations (avoids duplicate edges like ``Proces -> ISystem`` and
    // ``Proces -> Schouw`` when Schouw implements ISystem).
    // Build groups by (from, label/property) so we can decide per-group
    // whether any target resolves to a shared interface. If so, prefer
    // that interface for the entire group.
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
    try {
      if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
        Array.from(Config.INTERFACE_CLASSES).forEach(k => { if (!forced.includes(k)) forced.push(k); });
      }
    } catch (e) { /* ignore */ }
    return this.computeSharedSupers(classNames, forced);
  }

  _buildJoinTableMap(relsForJoin, classNames) {
    const { joinTables } = this.computeJoinTablesFor(relsForJoin, Config, new Set(classNames));
    const joinTableMap = new Map();
    joinTables.forEach(jt => joinTableMap.set(jt.name, jt));
    return joinTableMap;
  }

  _renderInterfaceNode(className, matched, sharedInterfaceNames, classToSupers) {
    let mermaid = '';
    const displayName = this.getDisplayName(className);
    mermaid += `    class ${displayName} {\n`;
    mermaid += `        <<interface>>\n`;
    if (matched) {
      const superName = matched[0];
      const { props } = this.renderSharedInterfaceProps(superName, sharedInterfaceNames, classToSupers);
      if (props && props.length > 0) {
        props.forEach(p => { mermaid += `        ${p.type} ${p.name}\n`; });
      } else {
        mermaid += `        string uri\n`;
      }
    }
    mermaid += `    }\n`;
    return mermaid;
  }

  _renderClassNode(className, joinTableMap, sharedInterfaceNames, sharedSupers, classToSupers, classNames, relPropertyMap = new Map()) {
    let mermaid = '';
    const classInfo = this.ontology.classes.get(className);
    const displayName = this.getDisplayName(className, classInfo);
    // Determine a direct internal superclass (if any) so computeAttributesForClass
    // can filter out attributes inherited from that superclass (avoid duplicate FKs)
    let extendsSuperName = null;
    try {
      const supers = classToSupers.get(className) || [];
      for (const s of supers) {
        const info = this.ontology.classes.get(s);
        if (info && !info.external && classNames.includes(s)) { extendsSuperName = s; break; }
      }
    } catch (e) {
      extendsSuperName = null;
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
      const { name, type, isArray, isForeignKey } = resolved;
      return { name, type, isForeignKey, isArray };
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
      const displayAttrName = attr.isForeignKey ? `${attr.name} (FK)` : attr.name;
      // If there is a known relationship mapping for this class+property, prefer that resolved target
      const mapped = relPropertyMap.get(`${className}|${attr.name}`) || null;
      let displayType = attr.type;
      if (mapped) {
        displayType = mapped + (attr.isArray ? '[]' : '');
      }
      mermaid += `        ${displayType} ${displayAttrName}
`;
    });
    mermaid += `    }
  `;
    return mermaid;
    }

  }
