import fs from 'fs';
import { PATHS, NAMESPACES } from './config.js';
import * as Config from './config.js';
import { SchemaGenerator } from './generators/schema-generator.js';

export class ERDiagramGenerator extends SchemaGenerator {
  constructor(ontology, { outputPath = PATHS.dataModels.er } = {}) {
    super(ontology, { outputPath });
    this.outputPath = outputPath;
  }

  generate() {
    this.prepareOntology();
    this.buildRelationships(true, true);
    const diagram = this.generateMermaidDiagram();
    fs.writeFileSync(this.outputPath, diagram, 'utf-8');
  }

  generateMermaidDiagram() {
    let mermaid = `---\nconfig:\n  theme: default\n  layout: elk\n  elk:\n    nodePlacementStrategy: SIMPLE\n---\n%% Auto-generated from OWL/SHACL\nerDiagram\n`;

    const junctionTableNames = new Set();
    const junctionTableInfo = new Map();
    const joinTableMap = new Map();

    // Helper: try to abbreviate full IRIs using known namespace prefixes
    const abbreviateIri = (iri) => {
      if (!iri || typeof iri !== 'string') return iri;
      for (const prefix of Object.keys(NAMESPACES)) {
        const ns = NAMESPACES[prefix];
        if (typeof ns === 'string' && iri.startsWith(ns)) {
          return `${prefix}:${iri.slice(ns.length)}`;
        }
      }
      return iri;
    };

    // 1. Verzamel zichtbare klassen. Include configured interface classes
    // only when both interface-super and general super-entity flags are set.
    const includeInterfaceClasses =
      Config.USE_INTERFACE_CLASSES_AS_SUPER_ENTITIES && Config.USE_SUPER_ENTITY_FOR_MULTI_RELATIONS;
    let classNames = this.computeVisibleClasses(includeInterfaceClasses);

    // Ensure identifier relations are represented in the global relationships
    // map so ER rendering will draw links from entity -> Identifier tables.
    // (mirrors logic in class-diagram-generator)
    this.identifierRelations.forEach((restriction, parent) => {
      const idClass = `${parent}Identifier`;
      const key = `${parent}|${idClass}|identifier`;
      if (!this.relationships.has(key)) {
        const label =
          this.ontology && typeof this.ontology.deriveAttributeName === 'function'
            ? this.ontology.deriveAttributeName(restriction)
            : 'identifiers';
        this.relationships.set(key, {
          from: parent,
          to: idClass,
          property: 'identifier',
          label,
          minCard: restriction?.minCardinality,
          maxCard: restriction?.maxCardinality,
        });
      }
    });

    // 2. Gebruik gedeelde helper om join tables + junction info te berekenen
    // Filter relationships to those originating from visible classes so we don't
    // create junction tables for unrelated/external classes.
    const relsForJoin = Array.from(this.relationships.values()).filter(
      (rel) => classNames.includes(rel.from) || classNames.includes(rel.to)
    );
    const { joinTables, junctionTableInfo: computedJunctionInfo } = this.computeJoinTablesFor(
      relsForJoin,
      Config,
      new Set(classNames)
    );
    joinTables.forEach((jt) => {
      junctionTableNames.add(jt.name);
      classNames.push(jt.name);
      joinTableMap.set(jt.name, jt);
    });
    computedJunctionInfo.forEach((v, k) => junctionTableInfo.set(k, v));

    // 3. Verzamel alle klassen die daadwerkelijk gebruikt worden
    const usedClassSet = this.computeUsedClassSet(classNames, joinTables);

    // 4. Filter classNames op daadwerkelijk gebruikte klassen
    classNames = classNames.filter((cn) => usedClassSet.has(cn));

    // 5. Sorteer klassen
    classNames.sort((a, b) => a.localeCompare(b));

    classNames.forEach((className) => {
      const classInfo = this.ontology.classes.get(className);
      // Use schema helper to derive the table name (prefers interface
      // display overrides and business names). Display name for diagrams
      // stays derived via `getDisplayName`.
      const tableName = this.deriveSchemaTableName(className);
      const displayName = this.getDisplayName(className, classInfo);
      let attributes;

      // Speciale behandeling voor junction tables
      if (junctionTableNames.has(className)) {
        const info = junctionTableInfo.get(className) || {};

        // Variable relationship table
        if (className.endsWith('_variabele_relatie')) {
          const baseClass = className.replace('_variabele_relatie', '');
          const relatedClass = 'proces_variabele';
          attributes = [
            { name: `${baseClass}_uuid`, type: 'string', isForeignKey: true, isPrimaryKey: true },
            {
              name: `${relatedClass}_uuid`,
              type: 'string',
              isForeignKey: true,
              isPrimaryKey: true,
            },
            {
              name: 'relationship_type',
              type: 'enum',
              isForeignKey: false,
              isPrimaryKey: true,
              comment: 'INPUT_VAR, OUTPUT_VAR',
            },
          ];
        } else {
          // Prefer using computed join table attributes when available
          const jt = joinTableMap.get(className);
          if (jt && Array.isArray(jt.attributes) && jt.attributes.length > 0) {
            attributes = jt.attributes.slice();
          } else if (Array.isArray(info.to)) {
            // Consolidated junction table for multiple target types (e.g. toegeschreven aan)
            const fromTable = this.utils.deriveTableName(info.from);
            attributes = [
              { name: `${fromTable}_uuid`, type: 'string', isForeignKey: true, isPrimaryKey: true },
              {
                name: 'target_uuid',
                type: 'string',
                isForeignKey: false,
                isPrimaryKey: true,
                comment: (info.to || []).join(','),
              },
              {
                name: 'target_type',
                type: 'string',
                isForeignKey: false,
                isPrimaryKey: false,
                comment: (info.to || []).join(','),
              },
            ];
          } else {
            // Regular many-to-many junction table with single target
            const parts = className.split('_');
            const lastPart = parts[parts.length - 1];
            let leftCol = `${parts[0]}_uuid`;
            let rightCol = `${lastPart}_uuid`;
            if (leftCol === rightCol) {
              leftCol = `${parts[0]}_uuid_from`;
              rightCol = `${lastPart}_uuid_to`;
            }
            attributes = [
              { name: leftCol, type: 'string', isForeignKey: true, isPrimaryKey: true },
              { name: rightCol, type: 'string', isForeignKey: true, isPrimaryKey: true },
            ];
          }
        }

        mermaid += `    ${displayName}["${tableName}"] {\n`;
        attributes.forEach((attr) => {
          const markers = [];
          if (attr.isPrimaryKey) markers.push('PK');
          if (attr.isForeignKey) markers.push('FK');
          const markerText = markers.length > 0 ? `[${markers.join(',')}]` : '';
          const commentParts = [];
          const source = attr.propertyIri || attr.comment;
          if (source) commentParts.push(String(source));
          if (markerText) commentParts.push(markerText);
          const suffix = commentParts.length > 0 ? ` "${commentParts.join(' ')}"` : '';
          mermaid += `        ${attr.type} ${attr.name}${suffix}\n`;
        });
        mermaid += `    }\n`;
        return;
      }

      // Compute attributes using centralized helper (handles identifiers and superclass filtering)
      // includeSchemaFKs=true so ER/SQL schema generation may add schema-only FK attrs
      attributes = this.computeAttributesForClass(className, classNames, null, true);
      attributes = this.filterAndSortAttributes(attributes, className, classNames);

      mermaid += `    ${displayName}["${tableName}"] {\n`;
      attributes.forEach((attr) => {
        const markers = [];
        if (attr.isPrimaryKey) markers.push('PK');
        if (attr.isForeignKey) markers.push('FK');
        const markerText = markers.length > 0 ? `[${markers.join(',')}]` : '';
        const commentParts = [];
        // Prefer source property IRI when available (e.g. show dct:created)
        const source = attr.propertyIri || attr.comment;
        if (source) commentParts.push(abbreviateIri(source));
        if (markerText) commentParts.push(markerText);
        const suffix = commentParts.length > 0 ? ` "${commentParts.join(' ')}"` : '';
        mermaid += `        ${attr.type} ${attr.name}${suffix}\n`;
      });
      mermaid += `    }\n`;
    });

    // Generalized relationship filtering (like SQL generator)
    function shouldShowRelationship(rel, utils, ontology) {
      // Skip if target is only technical/abstract class
      const toInfo = ontology.classes.get(rel.to);
      if (utils.isTechnicalClass(rel.to, toInfo)) return false;
      // Skip if source is only technical/abstract class
      const fromInfo = ontology.classes.get(rel.from);
      if (utils.isTechnicalClass(rel.from, fromInfo)) return false;
      return true;
    }

    if (this.relationships.size > 0 || junctionTableInfo.size > 0) {
      mermaid += `\n    %% Relationships\n`;
      // Render only relationships where both endpoints are part of the visible class set
      const visibleSet = new Set(classNames);
      const emittedRelKeys = new Set();
      Array.from(this.relationships.values()).forEach((rel) => {
        if (!shouldShowRelationship(rel, this.utils, this.ontology)) return;
        if (!visibleSet.has(rel.from) || !visibleSet.has(rel.to)) return;
        // Avoid duplicating junction-table relationships; those are emitted from junctionTableInfo
        if (junctionTableNames.has(rel.to) || junctionTableNames.has(rel.from)) return;
        // If a junction table was configured to collapse multiple concrete
        // targets into a single interface-backed join, skip emitting the
        // individual relationship lines for those concrete targets.
        let coveredByCollapsed = false;
        for (const [jtName, info] of junctionTableInfo.entries()) {
          if (
            info &&
            info.from === rel.from &&
            Array.isArray(info.concreteTargets) &&
            info.concreteTargets.includes(rel.to)
          ) {
            coveredByCollapsed = true;
            break;
          }
        }
        if (coveredByCollapsed) return;
        const fromDisplay = this.getDisplayName(rel.from);
        const toDisplay = this.getDisplayName(rel.to);
        // Bepaal cardinaliteit aan beide kanten
        const cardFrom = rel.minCard === 1 && rel.maxCard === 1 ? 'one' : 'many';
        const cardTo = rel.maxCard === 1 ? 'one' : 'many';
        const relLabel =
          rel.label && String(rel.label).trim().length > 0
            ? String(rel.label).replace(/"/g, "'")
            : null;
        const labelSegment = relLabel ? ` : "${relLabel}"` : '';
        const relKey = `${fromDisplay}|${toDisplay}|${labelSegment}`;
        if (!emittedRelKeys.has(relKey)) {
          emittedRelKeys.add(relKey);
          mermaid += `    ${fromDisplay} ${cardFrom} to ${cardTo} ${toDisplay}${labelSegment}\n`;
        }
      });

      // Add junction table relationships (explicit table links)
      junctionTableInfo.forEach((info, junctionName) => {
        const junctionDisplay = this.getDisplayName(junctionName);
        const fromDisplay = this.getDisplayName(info.from);
        const relationLabel = info.label ? String(info.label).replace(/"/g, "'") : null;
        const relationLabelSeg = relationLabel ? ` : "${relationLabel}"` : '';
        const fromKey = `${fromDisplay}|${junctionDisplay}|${relationLabelSeg}`;
        if (!emittedRelKeys.has(fromKey)) {
          emittedRelKeys.add(fromKey);
          mermaid += `    ${fromDisplay} one to many ${junctionDisplay}${relationLabelSeg}\n`;
        }
        if (Array.isArray(info.to)) {
          info.to.forEach((t) => {
            const toDisplay = this.getDisplayName(t);
            const toKey = `${toDisplay}|${junctionDisplay}|${relationLabelSeg}`;
            if (!emittedRelKeys.has(toKey)) {
              emittedRelKeys.add(toKey);
              mermaid += `    ${toDisplay} one to many ${junctionDisplay}${relationLabelSeg}\n`;
            }
          });
        } else {
          const toDisplay = this.getDisplayName(info.to);
          const toKey = `${toDisplay}|${junctionDisplay}|${relationLabelSeg}`;
          if (!emittedRelKeys.has(toKey)) {
            emittedRelKeys.add(toKey);
            mermaid += `    ${toDisplay} one to many ${junctionDisplay}${relationLabelSeg}\n`;
          }
        }
      });
    }

    // Add styling using configured DIAGRAM_STYLES from config.
    mermaid += `\n    %% Styling\n`;
    // Compute shared supers so computeDiagramStyles can mark subclasses
    const { classToSupers } = this.computeSharedSupers(classNames);
    const { styleForClass, classDefToStyle } = this.computeDiagramStyles(classNames, classToSupers);
    for (const cn of classNames) {
      const info = this.ontology.classes.get(cn);
      const biz = this.getBusinessClassName ? this.getBusinessClassName(cn) : cn;
      const key = styleForClass.get(cn) || styleForClass.get(biz) || null;
      if (!key) continue;
      const spec = classDefToStyle.get(key) || {};
      // Build style string from spec with sensible defaults
      const fill = spec.fill || spec.color || '#cfc';
      const stroke = spec.stroke || '#333';
      const strokeWidth = spec.strokeWidth || spec.stroke_width || '1px';
      const styleStr = `fill:${fill},stroke:${stroke},stroke-width:${strokeWidth}`;
      const dn = this.getDisplayName(cn, info);
      mermaid += `    style ${dn} ${styleStr}\n`;
    }

    return mermaid;
  }

  humanizePropertyName(prop) {
    return prop;
  }
}
