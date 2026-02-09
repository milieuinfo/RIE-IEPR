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
    Array.from(this.relationships.values()).forEach(rel => {
      if (!visibleSet.has(rel.from) || !visibleSet.has(rel.to)) return;
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
    this.ontology.classes.forEach((ci) => {
      (ci.superClasses || []).forEach(si => {
        const local = this.ontology.extractLocalName(si);
        if (local === 'SpatialObject' && !forced.includes(local)) forced.push(local);
      });
    });
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
      if (Config.PROPERTY_RENDER_OVERRIDES.has(className)) {
        const propMap = Config.PROPERTY_RENDER_OVERRIDES.get(className);
        if (propMap && propMap.has(attr.propertyIri) && propMap.get(attr.propertyIri) === false) return null;
      }
      // Normalize property rendering for diagrams using centralized helper
      const resolved = this.applyPropertyRenderOverride(attr, className, sharedInterfaceNames, classNames, classToSupers);
      if (!resolved) return null;
      const { name, type, isArray, isForeignKey } = resolved;
      return { name, type, isForeignKey, isArray };
    });

    mermaid += `    class ${displayName} {
`;
    attributes.filter(Boolean).forEach(attr => {
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
