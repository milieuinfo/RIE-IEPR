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
    this.buildRelationships(true);
    const diagram = this.generateMermaidDiagram();
    fs.writeFileSync(this.outputPath, diagram, 'utf-8');
  }

  generateMermaidDiagram() {
    let mermaid = `%% Auto-generated from OWL/SHACL\nerDiagram\n`;

    const junctionTableNames = new Set();
    const junctionTableInfo = new Map();

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

    // 1. Verzamel zichtbare klassen
    let classNames = this.computeVisibleClasses();

    // Ensure identifier relations are represented in the global relationships
    // map so ER rendering will draw links from entity -> Identifier tables.
    // (mirrors logic in class-diagram-generator)
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

    // 2. Gebruik gedeelde helper om join tables + junction info te berekenen
    // Filter relationships to those originating from visible classes so we don't
    // create junction tables for unrelated/external classes.
    const relsForJoin = Array.from(this.relationships.values()).filter(rel => classNames.includes(rel.from) || classNames.includes(rel.to));
    const { joinTables, junctionTableInfo: computedJunctionInfo } = this.computeJoinTablesFor(relsForJoin, Config, new Set(classNames));
    joinTables.forEach(jt => {
      junctionTableNames.add(jt.name);
      classNames.push(jt.name);
    });
    computedJunctionInfo.forEach((v, k) => junctionTableInfo.set(k, v));

    // 3. Verzamel alle klassen die daadwerkelijk gebruikt worden
    const usedClassSet = new Set();
    classNames.forEach(className => {
      const classInfo = this.ontology.classes.get(className);
      if (!classInfo) {
        // Include identifier tables even when no explicit class info exists
        if (String(className).endsWith('Identifier') && this.utils.isIdentifierTable(className)) {
          usedClassSet.add(className);
        }
        return;
      }
      const attrs = this.utils.deriveAttributes(classInfo, this.enumClasses, className);
      if (attrs && attrs.length > 0) usedClassSet.add(className);
    });
    this.relationships.forEach(rel => {
      usedClassSet.add(rel.from);
      usedClassSet.add(rel.to);
    });
    joinTables.forEach(jt => usedClassSet.add(jt.name));

    // 4. Filter classNames op daadwerkelijk gebruikte klassen
    classNames = classNames.filter(cn => usedClassSet.has(cn));

    // 5. Sorteer klassen
    classNames.sort((a, b) => a.localeCompare(b));

    classNames.forEach(className => {
      const classInfo = this.ontology.classes.get(className);
      const tableName = this.utils.deriveTableName(className);
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
            { name: `${baseClass}_uri`, type: 'string', isForeignKey: true, isPrimaryKey: true },
            { name: `${relatedClass}_uri`, type: 'string', isForeignKey: true, isPrimaryKey: true },
            { name: 'relationship_type', type: 'enum', isForeignKey: false, isPrimaryKey: true, comment: 'INPUT_VAR, OUTPUT_VAR' }
          ];
        }
        else if (Array.isArray(info.to)) {
          // Consolidated junction table for multiple target types (e.g. toegeschreven aan)
          const fromTable = this.utils.deriveTableName(info.from);
          attributes = [
            { name: `${fromTable}_uri`, type: 'string', isForeignKey: true, isPrimaryKey: true },
            { name: 'target_uri', type: 'string', isForeignKey: false, isPrimaryKey: true, comment: (info.to || []).join(',') },
            { name: 'target_type', type: 'string', isForeignKey: false, isPrimaryKey: false, comment: (info.to || []).join(',') }
          ];
        } else {
          // Regular many-to-many junction table with single target
          const parts = className.split('_');
          const lastPart = parts[parts.length - 1];
          let leftCol = `${parts[0]}_uri`;
          let rightCol = `${lastPart}_uri`;
          if (leftCol === rightCol) {
            leftCol = `${parts[0]}_uri_from`;
            rightCol = `${lastPart}_uri_to`;
          }
          attributes = [
            { name: leftCol, type: 'string', isForeignKey: true, isPrimaryKey: true },
            { name: rightCol, type: 'string', isForeignKey: true, isPrimaryKey: true }
          ];
        }

        mermaid += `    ${displayName}["${tableName}"] {\n`;
        attributes.forEach(attr => {
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
      attributes = this.computeAttributesForClass(className, classNames, null);

      // Verwijder attributen die via many-to-many relaties worden gemodelleerd
      attributes = attributes.filter(attr => !Config.isManyToManyProperty(attr.propertyIri, attr.name));

      // Remove virtual identifier attribute from main entity rendering; identifiers
      // are displayed as separate identifier tables instead.
      if (!className.endsWith('Identifier')) {
        attributes = attributes.filter(attr => {
          if (!attr.propertyIri) return true;
          return !String(attr.propertyIri).includes('adms#identifier');
        });
      }

      // Verwijder FK-attributen die enkel verwijzen naar puur
      // technische/abstracte klassen.
      attributes = attributes.filter(attr => {
        if (!attr.isForeignKey || !attr.comment) return true;
        const targets = String(attr.comment)
          .split(',')
          .map(s => s.trim())
          .filter(s => !!s);
        if (targets.length === 0) return true;
        const allTechnical = targets.every(t => {
          const info = this.ontology.classes.get(t);
          return this.utils.isTechnicalClass(t, info);
        });
        return !allTechnical;
      });

      // Sort attributes: PK fields first, then geldig_tot, then others
      const pkFieldOrder = ['uri', 'geldig_van', 'aangemaakt_op'];
      attributes.sort((a, b) => {
        // PK fields first (in defined order)
        const aIndex = pkFieldOrder.indexOf(a.name);
        const bIndex = pkFieldOrder.indexOf(b.name);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // geldig_tot comes after PK fields
        if (a.name === 'geldig_tot') return -1;
        if (b.name === 'geldig_tot') return 1;
        
        // All other fields in original order
        return 0;
      });

      mermaid += `    ${displayName}["${tableName}"] {\n`;
      attributes.forEach(attr => {
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
      // Skip many-to-many (junctions get their own tables)
      if (Config.isManyToManyProperty(rel.propertyIri || '', rel.property)) return false;
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
      Array.from(this.relationships.values()).forEach(rel => {
        if (!shouldShowRelationship(rel, this.utils, this.ontology)) return;
        if (!visibleSet.has(rel.from) || !visibleSet.has(rel.to)) return;
        const fromDisplay = this.getDisplayName(rel.from);
        const toDisplay = this.getDisplayName(rel.to);
        // Bepaal cardinaliteit aan beide kanten
        const cardFrom = rel.minCard === 1 && rel.maxCard === 1 ? 'one' : 'many';
        const cardTo = rel.maxCard === 1 ? 'one' : 'many';
        mermaid += `    ${fromDisplay} ${cardFrom} to ${cardTo} ${toDisplay} : "${rel.label}"\n`;
      });

      // Add junction table relationships (explicit table links)
      junctionTableInfo.forEach((info, junctionName) => {
        const junctionDisplay = this.getDisplayName(junctionName);
        const fromDisplay = this.getDisplayName(info.from);
        const relationLabel = info.label ? info.label.replace(/"/g, "'") : '';
        mermaid += `    ${fromDisplay} one to many ${junctionDisplay} : "${relationLabel}"\n`;
        if (Array.isArray(info.to)) {
          info.to.forEach(t => {
            const toDisplay = this.getDisplayName(t);
            mermaid += `    ${toDisplay} one to many ${junctionDisplay} : ""\n`;
          });
        } else {
          const toDisplay = this.getDisplayName(info.to);
          mermaid += `    ${toDisplay} one to many ${junctionDisplay} : ""\n`;
        }
      });
    }

    return mermaid;
  }

  humanizePropertyName(prop) {
    return prop;
  }
}
