import fs from 'fs';
import path from 'path';
import { PATHS, NAMESPACES } from './config.js';
import * as Config from './config.js';
import { ClassGenerator } from './generators/class-generator.js';
import { info } from './utils/log.js';


export class TypeScriptGenerator extends ClassGenerator {
  constructor(ontology, { outputPath = path.join(PATHS.dataModels?.root || '.', 'output') } = {}) {
    super(ontology, { outputPath });
    this.outputPath = outputPath;
  }

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
    sharedSupers.forEach(superName => {
      const ifaceName = sharedInterfaceNames.get(superName);
      if (!usedSharedInterfaces || !usedSharedInterfaces.has(ifaceName)) return;
      const superInfo = this.ontology.classes.get(superName);
      const ifaceFile = path.join(outputPath, `${superName}.interface.ts`);
      const { props, imports: ifaceImports } = this.renderSharedInterfaceProps(superName, sharedInterfaceNames, classToSupers);
      let ifaceContent = '';
      let importHeader = '';
      // Import concrete model types for shared interface dependencies
      // (prefer concrete models to avoid mismatches between `I...` imports
      // and concrete types used inside the shared interface props).
      ifaceImports.forEach(n => {
        const local = String(n);
        const pascal = this.pascalCase ? this.pascalCase(local) : local;
        importHeader += `import { ${pascal} } from './${local}.model';\n`;
      });
      // Header first, then imports so the auto-generated comment is the first line
      ifaceContent += `// Auto-generated shared interface for ${superName}\n\n`;
      if (importHeader) ifaceContent += importHeader + '\n';
      ifaceContent += `export interface ${ifaceName}` + ` {\n`;
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
    if (attr.type === 'enum') return attr.enumName || 'string';
    if (attr.type === 'date' || attr.type === 'datetime') return 'Date';
    if (attr.type === 'integer' || attr.type === 'float' || attr.type === 'double' || attr.type === 'number') return 'number';
    if (attr.type === 'boolean') return 'boolean';
    return 'string';
  }

  generate() {
    // Orchestrate smaller steps implemented as helpers below.
    this.prepareOntology();
    this.buildRelationships(true);
    const classNames = this.computeVisibleClasses();
    if (!fs.existsSync(this.outputPath)) fs.mkdirSync(this.outputPath, { recursive: true });
    const gitkeep = path.join(this.outputPath, '.gitkeep');
    if (!fs.existsSync(gitkeep)) fs.writeFileSync(gitkeep, '', 'utf8');
    this.cleanupGeneratedTsFiles(this.outputPath);

    const enumState = this._emitEnums(classNames);
    const indexLines = [`// Auto-generated models`];

    const sharedState = this._computeSharedStructures(classNames);
    this.writeSharedInterfaces(sharedState.sharedSupers, sharedState.sharedInterfaceNames, sharedState.usedSharedInterfaces, this.outputPath, sharedState.classToSupers);

    // Emit models
    const modelIndexEntries = this._emitModels(classNames, enumState.enumFiles, enumState.otherEnumClasses, enumState.interfaceEnumMappings, sharedState);
    modelIndexEntries.forEach(e => indexLines.push(e));

    // Post processing and index
    this.fixModelImportSpacing(this.outputPath);
    this.cleanupUnusedImports(this.outputPath);
    this.ensureModelHeaders(this.outputPath);
    enumState.enumFiles.forEach(e => indexLines.push(`export * from './${path.basename(e.file, '.ts')}';`));
    const interfaceFilesOnDisk = fs.readdirSync(this.outputPath).filter(f => f.endsWith('.interface.ts'));
    interfaceFilesOnDisk.forEach(f => indexLines.push(`export * from './${f.replace(/\.ts$/, '')}';`));
    this.writeIndexFile(this.outputPath, enumState.enumFiles);
  }

  _emitEnums(classNames) {
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
    return { enumFiles, otherEnumClasses, interfaceEnumMappings };
  }

  _computeSharedStructures(classNames) {
    const forced = [];
    try {
      if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) {
        Array.from(Config.INTERFACE_CLASSES).forEach(k => { if (!forced.includes(k)) forced.push(k); });
      }
    } catch (e) { /* ignore */ }
    const { classToSupers, sharedSupers, sharedInterfaceNames } = this.computeSharedSupers(classNames, forced);
    const usedSharedInterfaces = this.computeUsedSharedInterfaces(classNames, classToSupers, sharedInterfaceNames);
    const relPropertyMap = new Map();
    Array.from(this.relationships.values()).forEach(rel => {
      const sharedIface = this.findSharedInterfaceForTargets([rel.to], classToSupers, sharedInterfaceNames);
      const toResolved = sharedIface || rel.to;
      relPropertyMap.set(`${rel.from}|${rel.property}`, toResolved);
    });
    return { classToSupers, sharedSupers, sharedInterfaceNames, usedSharedInterfaces, relPropertyMap };
  }

  _emitModels(classNames, enumFiles, otherEnumClasses, interfaceEnumMappings, sharedState) {
    const indexEntries = [];
    const pascal = this.pascalCase.bind(this);
    const camel = this.toCamelCase.bind(this);
    const { classToSupers, sharedInterfaceNames, usedSharedInterfaces, relPropertyMap } = sharedState;
    classNames.forEach(className => {
      // Reuse original per-class generation logic by delegating to the existing
      // implementation inside generate; keep the body minimal here by calling
      // a small inline function that captures the original behaviour.
      let classInfo = this.ontology.classes.get(className);
      // If className is a business name (not the ontology local name),
      // find the original local name to compute attributes from.
      let sourceLocalName = className;
      if (!classInfo) {
        for (const [ln, info] of this.ontology.classes) {
          try {
            const bn = this.getBusinessNameForClass(info.iri);
            if (bn === className) { classInfo = info; sourceLocalName = ln; break; }
          } catch (e) { /* ignore */ }
        }
      } else {
        sourceLocalName = className;
      }
      const classTsName = pascal(className);
      const fileName = path.join(this.outputPath, `${className}.model.ts`);

      // determine supers and impl/extends
      const supers = classToSupers.get(className) || [];
      let implementsIface = null;
      let extendsClass = null;
      let extendsSuperName = null;
      for (const s of supers) {
        const sinfo = this.ontology.classes.get(s);
        if (sinfo && !sinfo.external) { extendsClass = pascal(s); extendsSuperName = s; break; }
      }
      if (!extendsClass) {
        for (const s of supers) { if (sharedInterfaceNames.has(s)) { implementsIface = sharedInterfaceNames.get(s); break; } }
      }

      const attrs = this.computeAttributesForClass(sourceLocalName, classNames, extendsSuperName);
      
      const modelImports = new Set();
      const interfaceImports = new Map();
      try {
        attrs.forEach(a => {
          if (!a) return;
          if (a.type && /^I[A-Z]/.test(a.type)) {
            const iface = a.type; const local = iface.slice(1); const ifaceFile = path.join(this.outputPath, `${local}.interface.ts`);
            if (fs.existsSync(ifaceFile)) interfaceImports.set(local, iface);
          }
        });
      } catch (e) { /* ignore */ }

      if (implementsIface) {
        const superEntry = [...sharedInterfaceNames.entries()].find(([, val]) => val === implementsIface);
        if (superEntry) { const importSuper = superEntry[0]; interfaceImports.set(importSuper, implementsIface); }
      }
      if (extendsClass) {
        const superName = supers.find(s => pascal(s) === extendsClass);
        if (superName) modelImports.add(superName);
      }

      const needsArray = attrs.some(attr => this.isAttributeMultiValued(attr));

      const usedEnumNames = new Set();
      const interfaceEnumMap = new Map(); interfaceEnumMappings.forEach(m => interfaceEnumMap.set(m.localName, m.tsName));
      attrs.forEach(attr => {
        if (!attr) return;
        if (attr.type === 'enum') {
          if (attr.propertyIri === `${Config.NAMESPACES.dct}type`) {
            if (attr.comment) { Array.from(interfaceEnumMap.entries()).forEach(([local, ts]) => { if (attr.comment === local || attr.comment === ts) usedEnumNames.add(ts); }); }
          } else {
            const enumClass = otherEnumClasses.find(ec => ec === attr.comment || ec === attr.propertyIri || pascal(ec) === pascal(attr.name));
            if (enumClass) usedEnumNames.add(pascal(enumClass));
          }
        }
      });
      const localEnumFiles = enumFiles.filter(e => usedEnumNames.has(e.name));

      let content = this.buildModelPreamble(localEnumFiles, interfaceImports, needsArray) + '\n';
      content += `@jsonObject\nexport class ${classTsName}`;
      if (extendsClass) content += ` extends ${extendsClass}`;
      else if (implementsIface) content += ` implements ${implementsIface}`;
      content += ` {\n`;
      if (needsArray) content = content.replace("import { jsonObject, jsonMember } from 'typedjson';\n", "import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';\n");

      // attribute processing (kept intact but scoped)
      attrs.forEach(attr => {
        const jsonName = (attr.propertyIri && typeof this.ontology.extractLocalName === 'function') ? this.ontology.extractLocalName(attr.propertyIri) : ((attr.name && String(attr.name).length > 0) ? attr.name : attr.propertyIri || '');
        const safeJsonName = String(jsonName).replace(/'/g, "\\'");
        let mapped = this.mapForeignKeyAttribute(attr, className);
        let officialName, baseType;
        if (mapped) {
          officialName = mapped.name; baseType = mapped.type; modelImports.add(attr.targetClasses[0]);
          let mappedMemberCtor = 'String'; if (baseType === 'Date') mappedMemberCtor = 'Date'; else if (baseType === 'number') mappedMemberCtor = 'Number'; else if (baseType === 'boolean') mappedMemberCtor = 'Boolean'; else if (/^[A-Z]/.test(String(baseType)) && !/^I[A-Z]/.test(String(baseType))) mappedMemberCtor = baseType;
          content += `  @jsonMember(${mappedMemberCtor}, { name: '${safeJsonName}' })\n`;
          content += `  ${officialName}!: ${baseType};\n\n`;
          return;
        } else {
          officialName = attr.name; if (attr.propertyIri) officialName = this.ontology.getBusinessNameForProperty(attr.propertyIri, className) || this.ontology.extractLocalName(attr.propertyIri) || attr.name;
        }
        baseType = this.tsTypeForAttribute(attr);
        // prefer shared-interface types if present
        if (implementsIface) {
          const superEntry = [...sharedInterfaceNames.entries()].find(([, val]) => val === implementsIface);
          if (superEntry) {
            const superName = superEntry[0]; const superInfo = this.ontology.classes.get(superName);
            if (superInfo) {
              const superAttrs = this.utils.deriveAttributes(superInfo, this.utils.enumClasses, superName) || [];
              const matching = superAttrs.find(sa => {
                if (!sa) return false; if (sa.name === attr.name) return true; if (sa.propertyIri && attr.propertyIri && sa.propertyIri === attr.propertyIri) return true;
                try { const saLocal = sa.propertyIri ? this.ontology.extractLocalName(sa.propertyIri) : sa.name; const aLocal = attr.propertyIri ? this.ontology.extractLocalName(attr.propertyIri) : attr.name; if (saLocal && aLocal && saLocal === aLocal) return true; } catch (e) { }
                return false;
              });
              if (matching) {
                let st = this.tsTypeForAttribute(matching);
                if (matching.type === 'enum') {
                  const enumClass = otherEnumClasses.find(ec => ec === matching.comment || ec === matching.propertyIri || pascal(ec) === pascal(matching.name)); if (enumClass) st = pascal(enumClass);
                }
                if (matching.isForeignKey && Array.isArray(matching.targetClasses) && matching.targetClasses.length === 1) { const t0 = matching.targetClasses[0]; if (classNames.includes(t0)) st = 'string'; }
                const matchingMax = (typeof matching.maxCardinality === 'number' && matching.maxCardinality >= 0) ? matching.maxCardinality : undefined;
                const isArraySuper = (typeof matchingMax === 'number' && matchingMax !== 1) || (matchingMax === undefined && matching.minCardinality !== 1 && !matching.isPrimaryKey && matching.isForeignKey);
                if (isArraySuper) st = `${st}[]`;
                baseType = st;
              } else {
                try {
                  const ifaceFile = path.join(this.outputPath, `${superName}.interface.ts`);
                  if (fs.existsSync(ifaceFile)) {
                    const ifaceContent = fs.readFileSync(ifaceFile, 'utf8'); const re = new RegExp(`\\b${officialName}\\b\\s*\\??\\s*:\\s*([^;\\n]+);`);
                    const m = ifaceContent.match(re);
                    if (m) { const typeDecl = m[1] || ''; if (typeDecl.includes('[]')) { const elem = typeDecl.replace(/\\[\\]/g, '').trim(); baseType = elem + '[]'; } else { baseType = typeDecl.trim(); } }
                  }
                } catch (e) { }
              }
            }
          }
        }

        const resolvedTargets = attr.targetClasses || [];
        if (attr.type === 'enum') {
          if (attr.propertyIri === `${Config.NAMESPACES.dct}type` && attr.comment) {
            for (const m of interfaceEnumMappings) { if (attr.comment === m.localName || attr.comment === m.tsName) { baseType = m.tsName; break; } }
          } else { const enumClass = otherEnumClasses.find(ec => ec === attr.comment || ec === attr.propertyIri || pascal(ec) === pascal(attr.name)); if (enumClass) baseType = pascal(enumClass); }
        }

        const isArray = this.isAttributeMultiValued(attr);

        if (attr.isForeignKey && Array.isArray(attr.targetClasses) && attr.targetClasses.length >= 1) {
          const targets = attr.targetClasses.filter(t => classNames.includes(t));
          try {
            const localPropName = attr.propertyIri ? this.ontology.extractLocalName(attr.propertyIri) : attr.name;
            const relMapped = relPropertyMap.get(`${className}|${localPropName}`) || relPropertyMap.get(`${className}|${attr.name}`);
            if (relMapped) {
              if (/^I[A-Z]/.test(relMapped)) { baseType = relMapped + (isArray ? '[]' : ''); const ifaceLocal = String(relMapped).replace(/^I/, ''); interfaceImports.set(ifaceLocal, relMapped); targets.length = 0; }
              else { const sharedIfaceForRel = this.findSharedInterfaceForTargets([relMapped], classToSupers, sharedInterfaceNames); if (sharedIfaceForRel) { baseType = sharedIfaceForRel + (isArray ? '[]' : ''); const ifaceLocal = String(sharedIfaceForRel).replace(/^I/, ''); interfaceImports.set(ifaceLocal, sharedIfaceForRel); targets.length = 0; } else { baseType = pascal(relMapped) + (isArray ? '[]' : ''); modelImports.add(relMapped); targets.length = 0; } }
            }
          } catch (e) { }

          if ((!targets || targets.length === 0) && attr.propertyIri) {
            try { const localProp = this.ontology.extractLocalName(attr.propertyIri); const mapped = relPropertyMap.get(`${className}|${localProp}`) || relPropertyMap.get(`${className}|${attr.name}`); if (mapped) { if (/^I[A-Z]/.test(mapped)) targets.push(String(mapped).replace(/^I/, '')); else targets.push(mapped); } } catch (e) { }
          }
          const sharedIface = this.findSharedInterfaceForTargets(targets, classToSupers, sharedInterfaceNames);
          if (sharedIface) {
            const superEntry = [...sharedInterfaceNames.entries()].find(([, v]) => v === sharedIface); const superName = superEntry ? superEntry[0] : null; const ifaceFilePath = superName ? path.join(this.outputPath, `${superName}.interface.ts`) : null;
            if (ifaceFilePath && fs.existsSync(ifaceFilePath)) { baseType = sharedIface; interfaceImports.set(superName, sharedIface); }
            else if (targets.length === 1) { const target = targets[0]; baseType = pascal(target); modelImports.add(target); } else { baseType = 'string'; }
          } else if (targets.length === 1) { const target = targets[0]; baseType = pascal(target); modelImports.add(target); } else { baseType = 'string'; }

          try {
            const explicitFromComment = (attr.comment || '').split(',').map(s => s.trim()).filter(Boolean).filter(tn => classNames.includes(tn)); if (explicitFromComment.length === 1) { const concrete = explicitFromComment[0]; baseType = pascal(concrete); modelImports.add(concrete); }
            let agentLocal = 'Agent'; try { if (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) { const found = Array.from(Config.INTERFACE_CLASSES).find(k => /agent/i.test(k)); if (found) agentLocal = found; } } catch (e) { }
            const anyAgent = Array.isArray(targets) && targets.some(tn => { const ti = this.ontology.classes.get(tn); return ti && ti.iri && this.ontology.isSubClassOf(ti.iri, agentLocal); });
            const explicitTargets = Array.isArray(attr.targetClasses) ? attr.targetClasses.filter(t => classNames.includes(t)) : []; const hasInternalTarget = explicitTargets.some(tn => { const ti = this.ontology.classes.get(tn); return ti && !ti.external; });
            if (anyAgent && !hasInternalTarget) {
              if (!baseType || baseType === 'string' || baseType === 'object') {
                let agentIfaceName = null;
                try {
                  const agentEntryLocal = (Config && Config.INTERFACE_CLASSES && Config.INTERFACE_CLASSES instanceof Set) ? Array.from(Config.INTERFACE_CLASSES).find(k => /agent/i.test(k)) || 'Agent' : 'Agent';
                  const agentEntry = [...sharedInterfaceNames.entries()].find(([s, iface]) => s === agentEntryLocal || (this.ontology.classes.get(s) && this.ontology.isSubClassOf(this.ontology.classes.get(s).iri, agentEntryLocal)));
                  if (agentEntry) { agentIfaceName = agentEntry[1]; agentLocal = agentEntry[0]; }
                } catch (e) { }
                const attrMax = (typeof attr.maxCardinality === 'number' && attr.maxCardinality >= 0) ? attr.maxCardinality : undefined;
                const attrIsArray = (typeof attrMax === 'number' && attrMax !== 1) || (attrMax === undefined && attr.minCardinality !== 1 && !attr.isPrimaryKey && attr.isForeignKey);
                if (agentIfaceName) { baseType = attrIsArray ? `${agentIfaceName}[]` : agentIfaceName; interfaceImports.set(agentLocal, agentIfaceName); }
                else { const ifaceName = `I${agentLocal}`; baseType = attrIsArray ? `${ifaceName}[]` : ifaceName; interfaceImports.set(agentLocal, ifaceName); const agentIfaceFile = path.join(this.outputPath, `${agentLocal}.interface.ts`); if (!fs.existsSync(agentIfaceFile)) { const agentContent = `// Auto-generated minimal ${agentLocal} interface\n\nexport interface ${ifaceName} {\n  uri?: string;\n}\n`; fs.writeFileSync(agentIfaceFile, agentContent, 'utf8'); } }
              }
            }
          } catch (e) { }
        }

        let memberCtor = 'String'; if (baseType === 'Date') memberCtor = 'Date'; else if (baseType === 'number') memberCtor = 'Number'; else if (baseType === 'boolean') memberCtor = 'Boolean'; else if (/^[A-Z]/.test(String(baseType)) && !/^I[A-Z]/.test(String(baseType))) { const isEnum = Array.isArray(localEnumFiles) && localEnumFiles.length > 0 && localEnumFiles.some(e => e.name === String(baseType)); if (isEnum) memberCtor = `() => ${baseType}`; else memberCtor = baseType; }
        try { const ifaceMatch = String(baseType).match(/I[A-Z][A-Za-z0-9_]*/); if (ifaceMatch) memberCtor = 'Object'; } catch (e) { }

        const requiredInClass = Boolean(attr.isPrimaryKey || (typeof attr.minCardinality === 'number' && attr.minCardinality >= 1)); const classMarker = requiredInClass ? '!' : '?';
        let propName = camel(officialName);
        let decoratorCtor = memberCtor;
        try { const elemType = String(baseType).replace(/\[\]$/, ''); const isEnumElem = Array.isArray(localEnumFiles) && localEnumFiles.length > 0 && localEnumFiles.some(e => e.name === elemType); if (isEnumElem) decoratorCtor = `() => ${elemType}`; } catch (e) { }
        if (isArray) { content += `  @jsonArrayMember(${decoratorCtor}, { name: '${safeJsonName}' })\n`; content += `  ${propName}${classMarker}: ${baseType}[];\n\n`; } else { content += `  @jsonMember(${decoratorCtor}, { name: '${safeJsonName}' })\n`; content += `  ${propName}${classMarker}: ${baseType};\n\n`; }
      });

      try { const updatedPreamble = this.buildModelPreamble(localEnumFiles, interfaceImports, needsArray) + '\n'; const idx = content.indexOf('@jsonObject'); if (idx >= 0) content = updatedPreamble + content.slice(idx); } catch (e) { }
      if (!content.trim().endsWith('}')) content += '}\n';
      content = this.buildModelImports(modelImports, className) + '\n' + content;

      if (implementsIface) {
        try {
          const superEntry = [...sharedInterfaceNames.entries()].find(([, val]) => val === implementsIface);
          if (superEntry) {
            const superName = superEntry[0]; const ifaceFile = path.join(this.outputPath, `${superName}.interface.ts`);
            if (fs.existsSync(ifaceFile)) {
              const ifaceContent = fs.readFileSync(ifaceFile, 'utf8');
              const propRe = /^\s*([A-Za-z0-9_]+)\s*\??\s*:\s*([^;]+);/gm; let m;
              while ((m = propRe.exec(ifaceContent)) !== null) {
                const prop = m[1]; const itype = (m[2] || '').trim(); if (!prop) continue;
                const propTypeRe = new RegExp(`(\\b${prop}\\b\\s*[!?]:\\s*)([A-Za-z0-9_\\[\\]]+)`, 'g'); content = content.replace(propTypeRe, `$1${itype}`);
                const decoRe = new RegExp(`@json(Member|ArrayMember)\\(([^)]*)\\)\\s*\\n\\s*${prop}\\b`, 'g');
                // If the concrete class defines this attribute, respect its cardinality.
                let classAttr = null;
                try {
                  classAttr = (attrs || []).find(a => {
                    if (!a) return false;
                    if (a.name === prop) return true;
                    // Match by property IRI local name
                    try {
                      if (a.propertyIri) {
                        const aLocal = this.ontology.extractLocalName(a.propertyIri);
                        if (aLocal === prop) return true;
                        // Also match by business label used when deriving attribute names
                        const aBiz = this.ontology.getBusinessNameForProperty ? this.ontology.getBusinessNameForProperty(a.propertyIri, className) : null;
                        if (aBiz === prop) return true;
                        // Finally, compare derived official attribute name
                        const aOfficial = aBiz || (a.propertyIri ? this.ontology.extractLocalName(a.propertyIri) : a.name);
                        if (aOfficial === prop) return true;
                      }
                    } catch (e) { /* ignore */ }
                    return false;
                  });
                } catch (e) { /* ignore */ }
                const classIsArray = classAttr ? this.isAttributeMultiValued(classAttr) : null;
                const wantArray = itype.includes('[]');
                const useArray = classIsArray === null ? wantArray : classIsArray;
                if (useArray) {
                  content = content.replace(decoRe, (all, p1, args) => {
                    const optMatch = String(args).match(/(\{[^}]*\})/); const opts = optMatch ? optMatch[1] : '{}';
                    const elem = itype.replace(/\\[\\]/g, '').trim();
                    let ctor = 'Object';
                    if (/^I[A-Z]/.test(elem)) ctor = 'Object';
                    else if (elem === 'string') ctor = 'String';
                    else if (elem === 'Date') ctor = 'Date';
                    else if (elem === 'number') ctor = 'Number';
                    else if (elem === 'boolean') ctor = 'Boolean';
                    else if (/^[A-Z]/.test(elem)) {
                      const isEnumElem = Array.isArray(localEnumFiles) && localEnumFiles.length > 0 && localEnumFiles.some(e => e.name === elem);
                      ctor = isEnumElem ? `() => ${elem}` : elem;
                    }
                    return `@jsonArrayMember(${ctor}, ${opts})
  ${prop}`;
                  });
                } else {
                  content = content.replace(decoRe, (all, p1, args) => {
                    const optMatch = String(args).match(/(\{[^}]*\})/); const opts = optMatch ? optMatch[1] : '{}';
                    const elem = itype.replace(/\[\]$/g, '').trim();
                    let ctor = 'Object';
                    if (/^I[A-Z]/.test(elem)) ctor = 'Object';
                    else if (elem === 'string') ctor = 'String';
                    else if (elem === 'Date') ctor = 'Date';
                    else if (elem === 'number') ctor = 'Number';
                    else if (elem === 'boolean') ctor = 'Boolean';
                    else if (/^[A-Z]/.test(elem)) {
                      const isEnumElem = Array.isArray(localEnumFiles) && localEnumFiles.length > 0 && localEnumFiles.some(e => e.name === elem);
                      ctor = isEnumElem ? `() => ${elem}` : elem;
                    }
                    return `@jsonMember(${ctor}, ${opts})
  ${prop}`;
                  });
                  // If the concrete class defines the attribute as single-valued,
                  // ensure the property type is not left as an array (remove trailing []).
                  try {
                    if (classAttr) {
                      const typeCleanupRe = new RegExp(`(\\b${prop}\\b\\s*[!?]:\\s*([A-Za-z0-9_]+))\\[\\];`, 'g');
                      content = content.replace(typeCleanupRe, '$1;');
                    }
                  } catch (e) { /* ignore */ }
                }
              }
            }
          }
        } catch (e) { }
      }

      const ifaceMatches = Array.from(content.matchAll(/\b(I[A-Z][A-Za-z0-9_]*)\b/g)).map(m => m[1]);
      ifaceMatches.forEach(iface => {
        const local = iface.slice(1); const hasImport = interfaceImports && Array.from(interfaceImports.values()).includes(iface); const ifaceFile = path.join(this.outputPath, `${local}.interface.ts`);
        if (!hasImport && !fs.existsSync(ifaceFile)) {
          content = content.replace(new RegExp(`@json(Member|ArrayMember)\\(${iface}`, 'g'), '@json$1(String');
          content = content.replace(new RegExp(`: ${iface}(;|\\]|\\s)`, 'g'), ': string$1');
          content = content.replace(new RegExp('\\b' + iface + '\\b', 'g'), 'string');
        }
      });

      try { if (Array.isArray(enumFiles) && enumFiles.length > 0) { enumFiles.forEach(e => { const en = e.name; const re = new RegExp(`@json(Member|ArrayMember)\\(\\s*${en}\\s*,`, 'g'); content = content.replace(re, `@json$1(() => ${en},`); }); } } catch (e) { }

      try { content = this._cleanupImportsInContent(content); } catch (e) { }
      content = content.replace(/^[\s\n\r]+/, '');
      const header = `// Auto-generated models` + '\n\n'; content = header + content;
      fs.writeFileSync(fileName, content, 'utf8');
      try { if (Array.isArray(enumFiles) && enumFiles.length > 0) { let written = fs.readFileSync(fileName, 'utf8'); enumFiles.forEach(e => { const en = e.name; const re = new RegExp(`@json(Member|ArrayMember)\\(\\s*${en}\\s*,`, 'g'); written = written.replace(re, `@json$1(() => ${en},`); }); fs.writeFileSync(fileName, written, 'utf8'); } } catch (e) { }
      info('Wrote TS model ->', fileName);
        // If there exist original ontology local names that map to this
        // business class name, generate small alias model files so both
        // the business-local and original local names have model entries.
        try {
          for (const [localName, info] of this.ontology.classes) {
            try {
              const bn = this.getBusinessNameForClass(info.iri);
              if (bn === className && localName !== className) {
                const aliasFile = path.join(this.outputPath, `${localName}.model.ts`);
                if (!fs.existsSync(aliasFile)) {
                  const aliasTs = this.pascalCase(localName);
                  const targetTs = this.pascalCase(className);
                  const aliasContent = `// Auto-generated alias for ${localName}\n\nexport { ${targetTs} as ${aliasTs} } from './${className}.model';\n`;
                  fs.writeFileSync(aliasFile, aliasContent, 'utf8');
                  info('Wrote TS alias model ->', aliasFile);
                  indexEntries.push(`export * from './${localName}.model';`);
                }
              }
            } catch (e) { /* ignore per-class alias errors */ }
          }
        } catch (e) { /* ignore alias generation errors */ }
      indexEntries.push(`export * from './${className}.model';`);
    });
    return indexEntries;
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
