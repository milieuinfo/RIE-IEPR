import fs from 'fs';
import path from 'path';
import { PATHS, NAMESPACES } from './config.js';
import * as Config from './config.js';
import { ClassGenerator } from './generators/class-generator.js';


export class TypeScriptGenerator extends ClassGenerator {
  constructor(ontology, { outputPath = path.join(PATHS.dataModels?.root || '.', 'output') } = {}) {
    super(ontology, { outputPath });
    this.outputPath = outputPath;
  }

  // TypeScript-specific helpers (moved here so they're not in shared ClassGenerator)
  // Collect mappings of configured interface-like local names to enum class lists
  collectInterfaceClasses() {
    const mappings = [];
    try {
      // Prefer explicit ENUMERABLE_CLASSES for enum synthesis; fall back to
      // INTERFACE_CLASSES for backward compatibility.
      const enumCandidates = (Config && Config.ENUMERABLE_CLASSES && Config.ENUMERABLE_CLASSES instanceof Set)
        ? Array.from(Config.ENUMERABLE_CLASSES)
        : (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) ? Array.from(Config.INTERFACE_CLASSES) : [];
      enumCandidates.forEach(localName => {
        const matched = Array.from(this.enumClasses || []).filter(ec => {
          try {
            const info = this.ontology.classes.get(ec);
            return info && info.iri && this.ontology.isSubClassOf(info.iri, localName);
          } catch (e) { return false; }
        });
        if (matched.length > 0) mappings.push({ localName, enumClasses: matched, tsName: (typeof this.pascalCase === 'function') ? this.pascalCase(localName) : localName });
      });
    } catch (e) { /* ignore */ }
    return mappings;
  }

  buildEnumFromClassList(localName, classList) {
    const enumName = (typeof this.pascalCase === 'function') ? this.pascalCase(localName) : localName;
    // Delegate member derivation to ClassGenerator helper so diagram and
    // TypeScript generation share the same formatting logic.
    const members = new Set(this.collectEnumerableMembers(localName || '') || []);
    if (members.size === 0) members.add('VALUE');
    let content = `// Auto-generated ${enumName} enum\n\n`;
    content += `export enum ${enumName} {\n`;
    Array.from(members).forEach(m => { content += `  ${m} = '${m}',\n`; });
    content += `}\n`;
    return { name: enumName, content };
  }

  buildEnumForClass(ec) {
    const enumName = this.pascalCase(ec);
    let values = this.ontology.deriveEnumMembers(ec) || [];
    if (!values || values.length === 0) {
      values = this.deriveAttributes(this.ontology.classes.get(ec), this.enumClasses, ec)
        .filter(a => a.type === 'enum')
        .map(a => a.name)
        .filter(Boolean);
    }
    if (values.length === 0) values.push('VALUE');
    let enumsContent = `// Auto-generated enum for ${ec}\n\n`;
    enumsContent += `export enum ${enumName} {\n`;
    values.forEach(v => {
      const key = String(v).replace(/[^0-9A-Za-z]/g, '_').toUpperCase();
      enumsContent += `  ${key} = '${v}',\n`;
    });
    enumsContent += `}\n`;
    return { enumName, content: enumsContent };
  }

  buildModelPreamble(enumFiles = [], interfaceImports = new Map(), needsArray = false) {
    const typedjsonImports = needsArray ? "import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';\n" : "import { jsonObject, jsonMember } from 'typedjson';\n";
    let preamble = typedjsonImports;
    // import enums by basename so we don't embed absolute paths
    enumFiles.forEach(e => {
      const importPath = `./${path.basename(e.file, '.ts')}`;
      preamble += `import { ${e.name} } from '${importPath}';\n`;
    });
    if (interfaceImports && interfaceImports.size > 0) {
      preamble += '\n';
      interfaceImports.forEach((iface, file) => {
        const ifaceFile = path.join(this.outputPath, `${file}.interface.ts`);
        if (fs.existsSync(ifaceFile)) {
          preamble += `import type { ${iface} } from './${file}.interface';\n`;
        }
      });
    }
    return preamble;
  }

  cleanupGeneratedTsFiles(outputPath) {
    if (!fs.existsSync(outputPath)) return;
    const existing = fs.readdirSync(outputPath).filter(f => f.endsWith('.ts'));
    existing.forEach(f => {
      if (!f.endsWith('.model.ts') && !f.endsWith('.enum.ts') && !f.endsWith('.interface.ts') && f !== 'index.ts' && f !== 'tsconfig.json' && f !== 'package.json') {
        try { fs.unlinkSync(path.join(outputPath, f)); } catch (e) { /* ignore */ }
      }
    });
  }

  writeIndexFile(outputPath, enumFiles = []) {
    const indexLines = ['// Auto-generated models'];
    const modelFiles = fs.readdirSync(outputPath).filter(f => f.endsWith('.model.ts'));
    modelFiles.forEach(f => indexLines.push(`export * from './${f.replace(/\.ts$/, '')}';`));
    enumFiles.forEach(e => {
      const bn = path.basename(e.file, '.ts');
      indexLines.push(`export * from './${bn}';`);
    });
    const interfaceFilesOnDisk = fs.readdirSync(outputPath).filter(f => f.endsWith('.interface.ts'));
    interfaceFilesOnDisk.forEach(f => indexLines.push(`export * from './${f.replace(/\.ts$/, '')}';`));
    fs.writeFileSync(path.join(outputPath, 'index.ts'), indexLines.join('\n') + '\n', 'utf8');
  }

  fixModelImportSpacing(outputPath) {
    if (!fs.existsSync(outputPath)) return;
    const modelFiles = fs.readdirSync(outputPath).filter(f => f.endsWith('.model.ts'));
    modelFiles.forEach(mf => {
      const p = path.join(outputPath, mf);
      try {
        let c = fs.readFileSync(p, 'utf8');
        const fixed = c.replace(/;import/g, ';\nimport');
        if (fixed !== c) fs.writeFileSync(p, 'utf8' === 'utf8' ? fixed : fixed, 'utf8');
      } catch (e) { /* ignore */ }
    });
  }

  cleanupUnusedImports(outputPath) {
    if (!fs.existsSync(outputPath)) return;
    const modelFiles = fs.readdirSync(outputPath).filter(f => f.endsWith('.model.ts'));
    modelFiles.forEach(mf => {
      const p = path.join(outputPath, mf);
      try {
        const c = fs.readFileSync(p, 'utf8');
        const lines = c.split(/\r?\n/);
        // Identify import lines (only those that import named specifiers)
        const importLineRegex = /^\s*import(?:\s+type)?\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"];?\s*$/;
        const importLines = [];
        lines.forEach((ln, idx) => {
          const m = ln.match(importLineRegex);
          if (m) importLines.push({ line: ln, spec: m[1], idx });
        });
        if (importLines.length === 0) return;
        // Build content without import lines for searching usages
        const contentWithoutImports = lines.filter((_, i) => !importLines.some(il => il.idx === i)).join('\n');
        let modified = false;
        importLines.reverse().forEach(il => {
          const names = il.spec.split(',').map(s => s.trim()).filter(Boolean);
          const used = names.filter(n => {
            const re = new RegExp('\\b' + n.replace(/[$()*+.?[\\\]^{}|]/g, '\\$&') + '\\b', 'g');
            return re.test(contentWithoutImports);
          });
          if (used.length === 0) {
            // remove the import line
            lines.splice(il.idx, 1);
            modified = true;
          } else if (used.length < names.length) {
            // replace specifier list
            const newLine = il.line.replace(il.spec, ' ' + used.join(', ') + ' ');
            lines.splice(il.idx, 1, newLine);
            modified = true;
          }
        });
        if (modified) {
          const out = lines.join('\n').replace(/\n{3,}/g, '\n\n');
          fs.writeFileSync(p, out, 'utf8');
        }
      } catch (e) { /* ignore */ }
    });
  }

  _cleanupImportsInContent(content) {
    if (!content || typeof content !== 'string') return content;
    // more permissive regex that matches imports even when spacing/linebreaks are odd
    // Simple pass: for each import line, remove it if none of the imported names
    // are referenced elsewhere in the file (outside the import lines).
    const lineImportRegex = /^.*import(?:\s+type)?\s*\{([^}]+)\}.*;.*$/gm;
    const importLines = [];
    while ((m = lineImportRegex.exec(content)) !== null) {
      importLines.push({ full: m[0], spec: m[1], index: m.index });
    }
    if (importLines.length === 0) return content;
    // Build content without import lines for searching usages
    let withoutImports = content;
    importLines.forEach(il => { withoutImports = withoutImports.replace(il.full, ''); });
    let out = content;
    importLines.reverse().forEach(il => {
      const names = il.spec.split(',').map(s => s.trim()).filter(Boolean);
      const anyUsed = names.some(n => {
        const re = new RegExp('\\b' + n.replace(/[$()*+.?[\\\]^{}|]/g, '\\$&') + '\\b', 'g');
        return re.test(withoutImports);
      });
      if (!anyUsed) {
        out = out.slice(0, il.index) + out.slice(il.index + il.full.length);
      } else if (names.length > 1) {
        // prune unused specifiers from the list
        const used = names.filter(n => {
          const re = new RegExp('\\b' + n.replace(/[$()*+.?[\\\]^{}|]/g, '\\$&') + '\\b', 'g');
          return re.test(withoutImports);
        });
        if (used.length < names.length) {
          const replacement = il.full.replace(il.spec, ' ' + used.join(', ') + ' ');
          out = out.slice(0, il.index) + replacement + out.slice(il.index + il.full.length);
        }
      }
    });
    out = out.replace(/\n{3,}/g, '\n\n');
    return out;
  }

  buildModelImports(modelImportsSet, currentClassName) {
    if (!modelImportsSet || modelImportsSet.size === 0) return '';
    const names = Array.from(modelImportsSet).filter(n => n && n !== currentClassName).sort();
    if (names.length === 0) return '';
    let importLines = '';
    names.forEach(mn => {
      // If an enum file exists for this name, avoid importing a model class
      // with the same identifier to prevent name collisions (enums are
      // imported separately by the preamble).
      try {
        const enumFile = path.join(this.outputPath, `${mn}.enum.ts`);
        if (fs.existsSync(enumFile)) return;
      } catch (e) { /* ignore */ }
      importLines += `import { ${this.pascalCase(mn)} } from './${mn}.model';\n`;
    });
    return importLines;
  }

  writeSharedInterfaces(sharedSupers, sharedInterfaceNames, usedSharedInterfaces, outputPath, classToSupers = new Map()) {
    if (!Array.isArray(sharedSupers) || !sharedInterfaceNames) return;
    const pascal = this.pascalCase.bind(this);
    const camel = this.toCamelCase.bind(this);
    sharedSupers.forEach(superName => {
      const ifaceName = sharedInterfaceNames.get(superName);
      if (!usedSharedInterfaces || !usedSharedInterfaces.has(ifaceName)) return;
      const superInfo = this.ontology.classes.get(superName);
      const ifaceFile = path.join(outputPath, `${superName}.interface.ts`);
      let extendsAgent = false;
      let agentLocal = 'Agent';
      try {
        if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
          const found = Array.from(Config.INTERFACE_CLASSES).find(k => /agent/i.test(k));
          if (found) agentLocal = found;
        }
        if (superInfo && superInfo.iri && this.ontology.isSubClassOf(superInfo.iri, agentLocal)) {
          extendsAgent = true;
        }
      } catch (e) { /* ignore */ }
      const { props, imports: ifaceImports } = this.renderSharedInterfaceProps(superName, sharedInterfaceNames, classToSupers);
      let ifaceContent = '';
      let importHeader = '';
      if (extendsAgent) importHeader += `import type { I${agentLocal} } from './${agentLocal}.interface';\n`;
      ifaceImports.forEach(n => { if (n !== agentLocal) importHeader += `import type { I${n} } from './${n}.interface';\n`; });
      // Header first, then imports so the auto-generated comment is the first line
      ifaceContent += `// Auto-generated shared interface for ${superName}\n\n`;
      if (importHeader) ifaceContent += importHeader + '\n';
      ifaceContent += `export interface ${ifaceName}` + (extendsAgent ? ` extends I${agentLocal}` : '') + ` {\n`;
      if (props.length > 0) {
        props.forEach(p => {
          const safeName = String(p.name).replace(/_+$/g, '').replace(/Id$/i, '');
          ifaceContent += `  ${safeName}?: ${p.type};\n`;
        });
      } else {
        ifaceContent += `  uri?: string;\n`;
      }
      ifaceContent += `}\n`;
      fs.writeFileSync(ifaceFile, ifaceContent, 'utf8');
    });
  }

  tsTypeForAttribute(attr) {
    if (!attr) return 'string';
    if (attr.type === 'enum') return attr.enumName || 'string';
    if (attr.type === 'date' || attr.type === 'datetime') return 'Date';
    if (attr.type === 'integer' || attr.type === 'float' || attr.type === 'double') return 'number';
    if (attr.type === 'boolean') return 'boolean';
    return 'string';
  }

  generate() {
    // Use BaseGenerator lifecycle to prepare ontology and relationships
    this.prepareOntology();
    this.buildRelationships(true);
    const ontology = this.ontology;

    if (!fs.existsSync(this.outputPath)) fs.mkdirSync(this.outputPath, { recursive: true });
    // write .gitkeep only (do not ignore generated .ts files)
    const gitkeep = path.join(this.outputPath, '.gitkeep');
    if (!fs.existsSync(gitkeep)) fs.writeFileSync(gitkeep, '', 'utf8');
    // Cleanup legacy files using TypeScript-specific helper
    this.cleanupGeneratedTsFiles(this.outputPath);

    // Compute classes to emit using BaseGenerator helper
    const classNames = this.computeVisibleClasses();

    // Prepare enums using ClassGenerator helpers and configured INTERFACE_CLASSES
    const enumFiles = [];
    const interfaceEnumMappings = this.collectInterfaceClasses();
    const mappedEnumClasses = new Set();
    interfaceEnumMappings.forEach(m => {
      const built = this.buildEnumFromClassList(m.localName, m.enumClasses);
      const enumFile = path.join(this.outputPath, `${m.tsName.toLowerCase()}.enum.ts`);
      fs.writeFileSync(enumFile, built.content, 'utf8');
      enumFiles.push({ file: enumFile, name: built.name });
      m.enumClasses.forEach(ec => mappedEnumClasses.add(ec));
    });

    const otherEnumClasses = Array.from(this.enumClasses).filter(ec => !mappedEnumClasses.has(ec));
    otherEnumClasses.sort().forEach(ec => {
      const built = this.buildEnumForClass(ec);
      const enumFile = path.join(this.outputPath, `${ec}.enum.ts`);
      fs.writeFileSync(enumFile, built.content, 'utf8');
      enumFiles.push({ file: enumFile, name: built.enumName });
    });

    const indexLines = [`// Auto-generated models`];
    // Build shared supers using generic helper (force SpatialObject when present)
    const forced = [];
    try {
      if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
        Array.from(Config.INTERFACE_CLASSES).forEach(k => { if (!forced.includes(k)) forced.push(k); });
      }
    } catch (e) { /* ignore */ }
    const { classToSupers, sharedSupers, sharedInterfaceNames } = this.computeSharedSupers(classNames, forced);
    // small shorthands for string helpers
    const pascal = this.pascalCase.bind(this);
    const camel = this.toCamelCase.bind(this);

    // Determine which shared interfaces are actually used (centralized helper)
    const usedSharedInterfaces = this.computeUsedSharedInterfaces(classNames, classToSupers, sharedInterfaceNames);

    // Build quick lookup for relationships -> resolved target (used for FK typing fallback)
    const relPropertyMap = new Map();
    Array.from(this.relationships.values()).forEach(rel => {
      const sharedIface = this.findSharedInterfaceForTargets([rel.to], classToSupers, sharedInterfaceNames);
      const toResolved = sharedIface || rel.to;
      relPropertyMap.set(`${rel.from}|${rel.property}`, toResolved);
    });

    // Emit only those shared interfaces that are actually used
    this.writeSharedInterfaces(sharedSupers, sharedInterfaceNames, usedSharedInterfaces, this.outputPath, classToSupers);
    // add shared interface exports to the index will happen via writeIndexFile

    // helper: for a list of target classes, return a shared interface name if they share a common super
    // helper moved to ClassGenerator as `this.findSharedInterfaceForTargets`

    classNames.forEach(className => {
      const classInfo = this.ontology.classes.get(className);
      const classTsName = pascal(className);
      const fileName = path.join(this.outputPath, `${className}.model.ts`);

      // determine if this class should implement a shared interface
      // or extend an internal superclass
      const supers = classToSupers.get(className) || [];
      let implementsIface = null;
      let extendsClass = null;
      let extendsSuperName = null;
      for (const s of supers) {
        const sinfo = this.ontology.classes.get(s);
        if (sinfo && !sinfo.external) {
          // internal superclass -> extend concrete model class
          extendsClass = pascal(s);
          extendsSuperName = s;
          break;
        }
      }
      // If no internal superclass to extend, fall back to shared interface if available
      // but do not implement technical/excluded supers (e.g. SpatialObject)
      if (!extendsClass) {
        for (const s of supers) {
          // If a shared interface exists for this super, implement it.
          if (sharedInterfaceNames.has(s)) {
            implementsIface = sharedInterfaceNames.get(s);
            break;
          }
        }
      }

      // Compute attributes for this class (centralized helper)
      const attrs = this.computeAttributesForClass(className, classNames, extendsSuperName);

      // Before preparing imports, collect any interface types referenced by attributes
      // (e.g. overrides that produce `ISystem`) so we emit type-only imports.
      const modelImports = new Set();
      const interfaceImports = new Map();
      try {
        attrs.forEach(a => {
          if (!a) return;
          const override = a.propertyIri ? Config.PROPERTY_TYPE_OVERRIDES.get(a.propertyIri) : null;
          if (override && override.type && /^I[A-Z]/.test(override.type)) {
            const iface = override.type;
            const local = iface.slice(1);
            const ifaceFile = path.join(this.outputPath, `${local}.interface.ts`);
            if (fs.existsSync(ifaceFile)) interfaceImports.set(local, iface);
          }
          if (a.type && /^I[A-Z]/.test(a.type)) {
            const iface = a.type;
            const local = iface.slice(1);
            const ifaceFile = path.join(this.outputPath, `${local}.interface.ts`);
            if (fs.existsSync(ifaceFile)) interfaceImports.set(local, iface);
          }
        });
      } catch (e) { /* ignore */ }

      // Prepare imports preamble using centralized helper
      if (implementsIface) {
        const superEntry = [...sharedInterfaceNames.entries()].find(([, val]) => val === implementsIface);
        if (superEntry) {
          const importSuper = superEntry[0];
          interfaceImports.set(importSuper, implementsIface);
        }
      }
      if (extendsClass) {
        const superName = supers.find(s => pascal(s) === extendsClass);
        if (superName) modelImports.add(superName);
      }

      // determine whether typedjson array import will be needed
      const needsArray = attrs.some(attr => {
        const resolvedTargets = attr.targetClasses || [];
        const isArray = this.isAttributeMultiValued(attr);
        return isArray;
      });

      // Determine which enums are actually used by this class and only import those
      const usedEnumNames = new Set();
      // Build quick lookup for configured interface enum mappings
      const interfaceEnumMap = new Map();
      interfaceEnumMappings.forEach(m => interfaceEnumMap.set(m.localName, m.tsName));
      attrs.forEach(attr => {
        if (!attr) return;
        if (attr.type === 'enum') {
          if (attr.propertyIri === `${Config.NAMESPACES.dct}type`) {
            // attribute.comment may reference the local configured name
            if (attr.comment) {
              Array.from(interfaceEnumMap.entries()).forEach(([local, ts]) => {
                if (attr.comment === local || attr.comment === ts) usedEnumNames.add(ts);
              });
            }
          } else {
            const enumClass = otherEnumClasses.find(ec => ec === attr.comment || ec === attr.propertyIri || pascal(ec) === pascal(attr.name));
            if (enumClass) usedEnumNames.add(pascal(enumClass));
          }
        }
      });
      const localEnumFiles = enumFiles.filter(e => usedEnumNames.has(e.name));

      // build preamble with typedjson + enum + interface imports (only needed enums)
      let content = this.buildModelPreamble(localEnumFiles, interfaceImports, needsArray) + '\n';

      // Inline `I<Class>` interfaces are not emitted here; shared interfaces are written separately.
      content += `@jsonObject\nexport class ${classTsName}`;
      if (extendsClass) content += ` extends ${extendsClass}`;
      else if (implementsIface) content += ` implements ${implementsIface}`;
      content += ` {\n`;

      if (needsArray) {
        // ensure jsonArrayMember is available by adding explicit import at top
        content = content.replace("import { jsonObject, jsonMember } from 'typedjson';\n", "import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';\n");
      }

      attrs.forEach(attr => {
        // official name
        // compute JSON property name early (used for decorators)
        // Use the predicate's local name when available (e.g. hasFeatureOfInterest)
        // so decorators reflect the original predicate names rather than
        // derived snake_case column names.
        const jsonName = (attr.propertyIri && typeof this.ontology.extractLocalName === 'function')
          ? this.ontology.extractLocalName(attr.propertyIri)
          : ((attr.name && String(attr.name).length > 0) ? attr.name : attr.propertyIri || '');
        const safeJsonName = String(jsonName).replace(/'/g, "\\'");
        let mapped = this.mapForeignKeyAttribute(attr, className);
        let officialName, baseType;
        if (mapped) {
          officialName = mapped.name;
          baseType = mapped.type;
          modelImports.add(attr.targetClasses[0]);
          // choose constructor for mapped FK baseType (avoid using interface types as constructors)
          let mappedMemberCtor = 'String';
          if (baseType === 'Date') mappedMemberCtor = 'Date';
          else if (baseType === 'number') mappedMemberCtor = 'Number';
          else if (baseType === 'boolean') mappedMemberCtor = 'Boolean';
          else if (/^[A-Z]/.test(String(baseType)) && !/^I[A-Z]/.test(String(baseType))) mappedMemberCtor = baseType;
          content += `  @jsonMember(${mappedMemberCtor}, { name: '${safeJsonName}' })\n`;
          content += `  ${officialName}!: ${baseType};\n\n`;
          return;
        } else {
          officialName = attr.name;
          if (attr.propertyIri) {
            // Prefer business (concept) name for variable naming when available
            officialName = this.ontology.getBusinessNameForProperty(attr.propertyIri, className) || this.ontology.extractLocalName(attr.propertyIri) || attr.name;
          }
          // baseType will be determined using ClassGenerator helper below
        }
        const safeOfficial = String(officialName).replace(/'/g, "\\'");

        // determine TypeScript type (non-array base)
        baseType = this.tsTypeForAttribute(attr);
        // Special-case: for Proces.wasDerivedFrom prefer Procedure enum
        try {
          const localProp = (attr.propertyIri && typeof this.ontology.extractLocalName === 'function') ? this.ontology.extractLocalName(attr.propertyIri) : attr.propertyIri;
          const propIriStr = attr.propertyIri ? String(attr.propertyIri) : '';
          // No hard-coded special-casing here; enum mapping happens below based on configured INTERFACE_CLASSES
        } catch (e) { /* ignore */ }
        // If this class implements a shared interface, prefer the shared-interface
        // declaration for properties that are defined on the super (prevent incompatible types)
        if (implementsIface) {
          const superEntry = [...sharedInterfaceNames.entries()].find(([, val]) => val === implementsIface);
              if (superEntry) {
            const superName = superEntry[0];
            const superInfo = this.ontology.classes.get(superName);
            if (superInfo) {
              const superAttrs = this.utils.deriveAttributes(superInfo, this.utils.enumClasses, superName) || [];
              const matching = superAttrs.find(sa => {
                  if (!sa) return false;
                  if (sa.name === attr.name) return true;
                  if (sa.propertyIri && attr.propertyIri && sa.propertyIri === attr.propertyIri) return true;
                  try {
                    const saLocal = sa.propertyIri ? this.ontology.extractLocalName(sa.propertyIri) : sa.name;
                    const aLocal = attr.propertyIri ? this.ontology.extractLocalName(attr.propertyIri) : attr.name;
                    if (saLocal && aLocal && saLocal === aLocal) return true;
                  } catch (e) { /* ignore */ }
                  return false;
              });
              if (matching) {
                let st = this.tsTypeForAttribute(matching);
                if (matching.type === 'enum') {
                  const enumClass = otherEnumClasses.find(ec => ec === matching.comment || ec === matching.propertyIri || pascal(ec) === pascal(matching.name));
                  if (enumClass) st = pascal(enumClass);
                }
                if (matching.isForeignKey && Array.isArray(matching.targetClasses) && matching.targetClasses.length === 1) {
                  const t0 = matching.targetClasses[0];
                  if (classNames.includes(t0)) st = 'string';
                }
                const isArraySuper = (typeof matching.maxCardinality === 'number' && matching.maxCardinality !== 1) || (matching.maxCardinality === undefined && matching.minCardinality !== 1 && !matching.isPrimaryKey && matching.isForeignKey);
                if (isArraySuper) st = `${st}[]`;
                baseType = st;
              } else {
                // Fallback: if no matching derived attribute, inspect the emitted shared interface file
                try {
                  const ifaceFile = path.join(this.outputPath, `${superName}.interface.ts`);
                  if (fs.existsSync(ifaceFile)) {
                    const ifaceContent = fs.readFileSync(ifaceFile, 'utf8');
                    const re = new RegExp(`\\b${officialName}\\b\\s*\\??\\s*:\\s*([^;\\n]+);`);
                    const m = ifaceContent.match(re);
                    if (m) {
                      const typeDecl = m[1] || '';
                      if (typeDecl.includes('[]')) {
                        // element type
                        const elem = typeDecl.replace(/\[\]/g, '').trim();
                        baseType = elem + '[]';
                      } else {
                        baseType = typeDecl.trim();
                      }
                    }
                  }
                } catch (e) { /* ignore */ }
              }
            }
          }
        }
        const resolvedTargets = attr.targetClasses || [];
        const hasMappedEnumTarget = resolvedTargets.some(tn => mappedEnumClasses && mappedEnumClasses.has(tn));
        if (attr.type === 'enum') {
          if (attr.propertyIri === `${Config.NAMESPACES.dct}type` && attr.comment) {
            // map dct:type to configured interface enum (if any)
            for (const m of interfaceEnumMappings) {
              if (attr.comment === m.localName || attr.comment === m.tsName) {
                baseType = m.tsName;
                break;
              }
            }
          } else {
            const enumClass = otherEnumClasses.find(ec => ec === attr.comment || ec === attr.propertyIri || pascal(ec) === pascal(attr.name));
            if (enumClass) baseType = pascal(enumClass);
          }
        }

        // is array?
        const isArray = this.isAttributeMultiValued(attr);

        // Special FK typing for known properties
        if (attr.isForeignKey && Array.isArray(attr.targetClasses) && attr.targetClasses.length >= 1) {

          const targets = attr.targetClasses.filter(t => classNames.includes(t));

          // Quick check: if relationships map knows a resolved target for this property, prefer it
          try {
            const localPropName = attr.propertyIri ? this.ontology.extractLocalName(attr.propertyIri) : attr.name;
            const relMapped = relPropertyMap.get(`${className}|${localPropName}`) || relPropertyMap.get(`${className}|${attr.name}`);
            if (relMapped) {
              if (/^I[A-Z]/.test(relMapped)) {
                baseType = relMapped + (isArray ? '[]' : '');
                const ifaceLocal = String(relMapped).replace(/^I/, '');
                interfaceImports.set(ifaceLocal, relMapped);
                targets.length = 0;
              } else {
                // Try to resolve a shared interface for the concrete target name
                const sharedIfaceForRel = this.findSharedInterfaceForTargets([relMapped], classToSupers, sharedInterfaceNames);
                if (sharedIfaceForRel) {
                  baseType = sharedIfaceForRel + (isArray ? '[]' : '');
                  const ifaceLocal = String(sharedIfaceForRel).replace(/^I/, '');
                  interfaceImports.set(ifaceLocal, sharedIfaceForRel);
                  targets.length = 0;
                } else {
                  baseType = pascal(relMapped) + (isArray ? '[]' : '');
                  modelImports.add(relMapped);
                  targets.length = 0;
                }
              }
            }
          } catch (e) { /* ignore */ }

          // If no explicit visible targets, try to infer target from relationship map
          if ((!targets || targets.length === 0) && attr.propertyIri) {
            try {
              const localProp = this.ontology.extractLocalName(attr.propertyIri);
              const mapped = relPropertyMap.get(`${className}|${localProp}`) || relPropertyMap.get(`${className}|${attr.name}`);
              if (mapped) {
                if (/^I[A-Z]/.test(mapped)) targets.push(String(mapped).replace(/^I/, ''));
                else targets.push(mapped);
              }
            } catch (e) { /* ignore */ }
          }
          const sharedIface = this.findSharedInterfaceForTargets(targets, classToSupers, sharedInterfaceNames);
          if (sharedIface) {
              // Only use shared interface type if the corresponding interface file exists
              const superEntry = [...sharedInterfaceNames.entries()].find(([, v]) => v === sharedIface);
              const superName = superEntry ? superEntry[0] : null;
              const ifaceFilePath = superName ? path.join(this.outputPath, `${superName}.interface.ts`) : null;
              if (ifaceFilePath && fs.existsSync(ifaceFilePath)) {
                baseType = sharedIface;
                interfaceImports.set(superName, sharedIface);
              } else if (targets.length === 1) {
                // fallback to concrete model type when interface not available
                const target = targets[0];
                baseType = pascal(target);
                modelImports.add(target);
              } else {
                baseType = 'string';
              }
            } else if (targets.length === 1) {
            const target = targets[0];
            baseType = pascal(target);
            modelImports.add(target);
          } else {
            // multiple concrete targets without common shared super -> keep as string
            baseType = 'string';
          }

          // If any of the concrete targets are a subclass of Agent, prefer the IAgent interface type
          try {
            // Respect explicit inline comments (display types) which often contain
            // the concrete target class names. If those indicate a single internal
            // target class, prefer that concrete class instead of collapsing to IAgent.
            const explicitFromComment = (attr.comment || '').split(',').map(s => s.trim()).filter(Boolean).filter(tn => classNames.includes(tn));
            if (explicitFromComment.length === 1) {
              const concrete = explicitFromComment[0];
              baseType = pascal(concrete);
              modelImports.add(concrete);
            }
            let agentLocal = 'Agent';
            try {
              if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
                const found = Array.from(Config.INTERFACE_CLASSES).find(k => /agent/i.test(k));
                if (found) agentLocal = found;
              }
            } catch (e) { /* ignore */ }
            const anyAgent = Array.isArray(targets) && targets.some(tn => {
              const ti = this.ontology.classes.get(tn);
              return ti && ti.iri && this.ontology.isSubClassOf(ti.iri, agentLocal);
            });
            // Only prefer the generic IAgent interface when there are no explicit
            // internal (non-external) concrete target classes. If the restriction
            // explicitly targets an internal class like `Exploitant`, keep that.
            const explicitTargets = Array.isArray(attr.targetClasses) ? attr.targetClasses.filter(t => classNames.includes(t)) : [];
            const hasInternalTarget = explicitTargets.some(tn => { const ti = this.ontology.classes.get(tn); return ti && !ti.external; });
            if (anyAgent && !hasInternalTarget) {
              // Only fall back to a generic Agent-like interface when no better baseType exists.
              if (!baseType || baseType === 'string' || baseType === 'object') {
                // Try to discover the shared interface name for Agent-like supers
                let agentIfaceName = null;
                try {
                  const agentEntryLocal = (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set)
                    ? Array.from(Config.INTERFACE_CLASSES).find(k => /agent/i.test(k)) || 'Agent'
                    : 'Agent';
                  const agentEntry = [...sharedInterfaceNames.entries()].find(([s, iface]) => s === agentEntryLocal || (this.ontology.classes.get(s) && this.ontology.isSubClassOf(this.ontology.classes.get(s).iri, agentEntryLocal)));
                  if (agentEntry) {
                    agentIfaceName = agentEntry[1];
                    agentLocal = agentEntry[0];
                  }
                } catch (e) { /* ignore */ }

                const attrIsArray = (typeof attr.maxCardinality === 'number' && attr.maxCardinality !== 1) || (attr.maxCardinality === undefined && attr.minCardinality !== 1 && !attr.isPrimaryKey && attr.isForeignKey);
                if (agentIfaceName) {
                  baseType = attrIsArray ? `${agentIfaceName}[]` : agentIfaceName;
                  interfaceImports.set(agentLocal, agentIfaceName);
                } else {
                  // fallback minimal interface name (avoid hardcoding 'IAgent' where possible)
                  const ifaceName = `I${agentLocal}`;
                  baseType = attrIsArray ? `${ifaceName}[]` : ifaceName;
                  interfaceImports.set(agentLocal, ifaceName);
                  const agentIfaceFile = path.join(this.outputPath, `${agentLocal}.interface.ts`);
                  if (!fs.existsSync(agentIfaceFile)) {
                    const agentContent = `// Auto-generated minimal ${agentLocal} interface\n\nexport interface ${ifaceName} {\n  uri?: string;\n}\n`;
                    fs.writeFileSync(agentIfaceFile, agentContent, 'utf8');
                  }
                }
              }
            }
          } catch (e) { /* ignore */ }
        }

        // Note: do not coerce foreign-key attributes to primitive ids here.
        // Interfaces emitted by writeSharedInterfaces should declare the
        // desired contract (e.g. IAgent) and the post-processing step will
        // align generated classes to those interface declarations.

        // Consult configured property overrides (or try to infer) for special types
        const propOverrideCls = Config.PROPERTY_TYPE_OVERRIDES.get(attr.propertyIri);
        if (propOverrideCls && propOverrideCls.interface) {
          const overrideBaseType = `I${propOverrideCls.interface}`;
          const ifaceFilePath = path.join(this.outputPath, `${propOverrideCls.interface}.interface.ts`);
          // Only use the interface type if the interface file will be present
          if (fs.existsSync(ifaceFilePath) || (usedSharedInterfaces && usedSharedInterfaces.has(overrideBaseType))) {
            interfaceImports.set(propOverrideCls.interface, overrideBaseType);
            baseType = overrideBaseType;
            if (implementsIface && propOverrideCls.dropId) {
              baseType = 'string';
            }
          } else {
            baseType = 'string';
          }
        }

        // choose constructor for typedjson
        let memberCtor = 'String';
        if (baseType === 'Date') memberCtor = 'Date';
        else if (baseType === 'number') memberCtor = 'Number';
        else if (baseType === 'boolean') memberCtor = 'Boolean';
        else if (/^[A-Z]/.test(String(baseType)) && !/^I[A-Z]/.test(String(baseType))) {
          // Distinguish enums vs concrete model classes: enums should be provided
          // as a lazy constructor function to typedjson: `() => Enum`.
          const isEnum = Array.isArray(localEnumFiles) && localEnumFiles.some(e => e.name === String(baseType));
          if (isEnum) {
            memberCtor = `() => ${baseType}`;
          } else {
            // Use model class constructor for concrete model types (e.g. InstallatieIdentifier)
            memberCtor = baseType;
          }
        }
        // If the type is an interface (I...), use Object as the runtime constructor
        // (interfaces are type-only; use Object so typedjson deserializes to plain objects)
        try {
          const ifaceMatch = String(baseType).match(/I[A-Z][A-Za-z0-9_]*/);
          if (ifaceMatch) {
            memberCtor = 'Object';
          }
        } catch (e) { /* ignore */ }

        // determine whether property should be definite-assigned (!) or optional (?) in class
        const requiredInClass = Boolean(attr.isPrimaryKey || (typeof attr.minCardinality === 'number' && attr.minCardinality >= 1));
        const classMarker = requiredInClass ? '!' : '?';

        // Use correct property name for special FKs
        let propName = camel(officialName);
        // decide decorator constructor text; prefer lazy enum constructors for enums
        let decoratorCtor = memberCtor;
        try {
          const elemType = String(baseType).replace(/\[\]$/, '');
          const isEnumElem = Array.isArray(localEnumFiles) && localEnumFiles.some(e => e.name === elemType);
          if (isEnumElem) {
            decoratorCtor = `() => ${elemType}`;
          }
        } catch (e) { /* ignore */ }

        if (isArray) {
          content += `  @jsonArrayMember(${decoratorCtor}, { name: '${safeJsonName}' })\n`;
          content += `  ${propName}${classMarker}: ${baseType}[];\n\n`;
        } else {
          content += `  @jsonMember(${decoratorCtor}, { name: '${safeJsonName}' })\n`;
          content += `  ${propName}${classMarker}: ${baseType};\n\n`;
        }
      });

      // Rebuild preamble now that per-attribute processing may have added
      // interface imports (interfaceImports may have been populated above).
      try {
        const updatedPreamble = this.buildModelPreamble(localEnumFiles, interfaceImports, needsArray) + '\n';
        const idx = content.indexOf('@jsonObject');
        if (idx >= 0) content = updatedPreamble + content.slice(idx);
      } catch (e) { /* ignore */ }

      // Always close the class
      if (!content.trim().endsWith('}')) {
        content += '}\n';
      }

      // Add model imports
      content = this.buildModelImports(modelImports, className) + '\n' + content;
      // interface imports are added to the preamble via buildModelPreamble

      // Post-process: if this class implements a shared interface, align property types
      // to the interface declaration (ensures class satisfies the interface contract).
      if (implementsIface) {
        try {
          const superEntry = [...sharedInterfaceNames.entries()].find(([, val]) => val === implementsIface);
          if (superEntry) {
            const superName = superEntry[0];
            const ifaceFile = path.join(this.outputPath, `${superName}.interface.ts`);
            if (fs.existsSync(ifaceFile)) {
              const ifaceContent = fs.readFileSync(ifaceFile, 'utf8');
              const propRe = /^\s*([A-Za-z0-9_]+)\s*\??\s*:\s*([^;]+);/gm;
              let m;
              while ((m = propRe.exec(ifaceContent)) !== null) {
                const prop = m[1];
                const itype = (m[2] || '').trim();
                if (!prop) continue;
                // replace the property type in the generated class
                const propTypeRe = new RegExp(`(\\b${prop}\\b\\s*[!?]:\\s*)([A-Za-z0-9_\\[\\]]+)`, 'g');
                content = content.replace(propTypeRe, `$1${itype}`);
                // adjust decorator to ArrayMember if interface declares an array
                const decoRe = new RegExp(`@json(Member|ArrayMember)\\(([^)]*)\\)\\s*\\n\\s*${prop}\\b`, 'g');
                if (itype.includes('[]')) {
                  content = content.replace(decoRe, (all, p1, args) => {
                    const optMatch = String(args).match(/(\{[^}]*\})/);
                    const opts = optMatch ? optMatch[1] : '{}';
                    const elem = itype.replace(/\[\]/g, '').trim();
                    let ctor = 'Object';
                    if (/^I[A-Z]/.test(elem)) ctor = 'Object';
                    else if (elem === 'string') ctor = 'String';
                    else if (elem === 'Date') ctor = 'Date';
                    else if (elem === 'number') ctor = 'Number';
                    else if (elem === 'boolean') ctor = 'Boolean';
                    else if (/^[A-Z]/.test(elem)) {
                      // prefer lazy enum constructor for enums
                      const isEnumElem = Array.isArray(localEnumFiles) && localEnumFiles.some(e => e.name === elem);
                      ctor = isEnumElem ? `() => ${elem}` : elem;
                    }
                    return `@jsonArrayMember(${ctor}, ${opts})\n  ${prop}`;
                  });
                } else {
                  content = content.replace(decoRe, (all, p1, args) => {
                    const optMatch = String(args).match(/(\{[^}]*\})/);
                    const opts = optMatch ? optMatch[1] : '{}';
                    const elem = itype.trim();
                    let ctor = 'Object';
                    if (/^I[A-Z]/.test(elem)) ctor = 'Object';
                    else if (elem === 'string') ctor = 'String';
                    else if (elem === 'Date') ctor = 'Date';
                    else if (elem === 'number') ctor = 'Number';
                    else if (elem === 'boolean') ctor = 'Boolean';
                    else if (/^[A-Z]/.test(elem)) {
                      const isEnumElem = Array.isArray(localEnumFiles) && localEnumFiles.some(e => e.name === elem);
                      ctor = isEnumElem ? `() => ${elem}` : elem;
                    }
                    return `@jsonMember(${ctor}, ${opts})\n  ${prop}`;
                  });
                }
              }
            }
          }
        } catch (e) { /* ignore */ }
      }

      // Post-process: if any interface types (I*) are used but no import/interface file is present,
      // fall back to primitive string/constructor to avoid emitting broken imports.
      const ifaceMatches = Array.from(content.matchAll(/\b(I[A-Z][A-Za-z0-9_]*)\b/g)).map(m => m[1]);
      ifaceMatches.forEach(iface => {
        const local = iface.slice(1);
        const hasImport = interfaceImports && Array.from(interfaceImports.values()).includes(iface);
        const ifaceFile = path.join(this.outputPath, `${local}.interface.ts`);
        if (!hasImport && !fs.existsSync(ifaceFile)) {
          // Replace decorator constructor usage: @jsonMember(IAgent, => @jsonMember(String,
          content = content.replace(new RegExp(`@json(Member|ArrayMember)\\(${iface}`, 'g'), '@json$1(String');
          // Replace property typing `: IAgent` -> `: string`
          content = content.replace(new RegExp(`: ${iface}(;|\]|\\s)`, 'g'), ': string$1');
          // Also replace standalone usages in type annotations
          content = content.replace(new RegExp('\\b' + iface + '\\b', 'g'), 'string');
        }
      });

      // Convert direct enum constructor usage to lazy constructors for typedjson
      try {
        if (Array.isArray(enumFiles) && enumFiles.length > 0) {
          enumFiles.forEach(e => {
            const en = e.name;
            const re = new RegExp(`@json(Member|ArrayMember)\\(\\s*${en}\\s*,`, 'g');
            content = content.replace(re, `@json$1(() => ${en},`);
          });
        }
      } catch (e) { /* ignore */ }

      // Remove unused imports from the in-memory content before writing
      try { content = this._cleanupImportsInContent(content); } catch (e) { /* ignore */ }
      // Strip leading blank lines
      content = content.replace(/^[\s\n\r]+/, '');
      // Prepend auto-generated comment like interfaces
      const header = `// Auto-generated models` + '\n\n';
      content = header + content;
      fs.writeFileSync(fileName, content, 'utf8');
      // Post-write: convert any direct enum constructor usages to lazy constructors
      try {
        if (Array.isArray(enumFiles) && enumFiles.length > 0) {
          let written = fs.readFileSync(fileName, 'utf8');
          enumFiles.forEach(e => {
            const en = e.name;
            const re = new RegExp(`@json(Member|ArrayMember)\\(\\s*${en}\\s*,`, 'g');
            written = written.replace(re, `@json$1(() => ${en},`);
          });
          fs.writeFileSync(fileName, written, 'utf8');
        }
      } catch (e) { /* ignore */ }
      
      console.log('Wrote TS model ->', fileName);
      indexLines.push(`export * from './${className}.model';`);
    });

    // Normalize import spacing in generated model files
    this.fixModelImportSpacing(this.outputPath);
    // Remove unused imports from generated model files
    this.cleanupUnusedImports(this.outputPath);

    // Ensure each generated model file has a standard header and no leading blanks
    this.ensureModelHeaders(this.outputPath);

    // also export enums
    enumFiles.forEach(e => {
      const bn = path.basename(e.file, '.ts');
      indexLines.push(`export * from './${bn}';`);
    });

    // export generated interface files (Agent.interface.ts, etc.)
    const interfaceFilesOnDisk = fs.readdirSync(this.outputPath).filter(f => f.endsWith('.interface.ts'));
    interfaceFilesOnDisk.forEach(f => {
      const bn = path.basename(f, '.ts');
      indexLines.push(`export * from './${bn}';`);
    });

    // Write index
    this.writeIndexFile(this.outputPath, enumFiles);
  }

  ensureModelHeaders(outputPath) {
    if (!fs.existsSync(outputPath)) return;
    const modelFiles = fs.readdirSync(outputPath).filter(f => f.endsWith('.model.ts'));
    modelFiles.forEach(mf => {
      const p = path.join(outputPath, mf);
      try {
        let c = fs.readFileSync(p, 'utf8');
        // Strip leading whitespace/newlines
        c = c.replace(/^[\s\r\n]+/, '');
        // If header missing, prepend it
        if (!c.startsWith('// Auto-generated')) {
          c = `// Auto-generated models\n\n` + c;
        }
        fs.writeFileSync(p, c, 'utf8');
      } catch (e) { /* ignore */ }
    });
  }
}

export default { TypeScriptGenerator };
