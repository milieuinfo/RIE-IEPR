import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Parser, Store } from 'n3';
import { spawnSync } from 'child_process';
import { PATHS, NAMESPACES, resolveProjectPath } from '../../common/src/config.js';

const RDF_TYPE = `${NAMESPACES.rdf}type`;
const RDFS_LABEL = `${NAMESPACES.rdfs}label`;
const RIEPR = NAMESPACES.riepr;
const SSN = NAMESPACES.ssn;
const PPLAN = NAMESPACES.pplan;
const RDF_VALUE = `${NAMESPACES.rdf}value`;
const APPARAAT_NS = NAMESPACES.apparaat;
const EMISSIE_NS = NAMESPACES.emissiepunt;
const ONT_NS = NAMESPACES.onttrekkingspunt;
const DCT = NAMESPACES.dct;
const DCT_TYPE = `${DCT}type`;

// PNG output resolution (can be overridden via env vars)
const DEFAULT_PNG_WIDTH = process.env.MERMAID_PNG_WIDTH ? parseInt(process.env.MERMAID_PNG_WIDTH, 10) : 3840;
const DEFAULT_PNG_HEIGHT = process.env.MERMAID_PNG_HEIGHT ? parseInt(process.env.MERMAID_PNG_HEIGHT, 10) : 2160;

function idFor(uri) {
  return uri.replace(/[^a-zA-Z0-9]/g, '_');
}

// Convert a full URI to a prefixed form using NAMESPACES (e.g. aparat:0001)
function toPrefixed(uri) {
  if (!uri || typeof uri !== 'string') return uri;
  for (const [prefix, ns] of Object.entries(NAMESPACES)) {
    if (uri.startsWith(ns)) {
      const local = uri.slice(ns.length);
      return `${prefix}:${local}`;
    }
  }
  const parts = uri.split('/');
  const last = parts.pop() || parts.pop();
  return last && last.includes(':') ? last : last;
}

function idForPrefixed(uri) {
  const pref = toPrefixed(uri);
  return idFor(pref);
}

function literalValue(term) {
  if (!term) return null;
  if (term.termType === 'Literal') return term.value;
  return term.id || term.value || String(term);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MermaidRenderer {
  constructor(width = DEFAULT_PNG_WIDTH, height = DEFAULT_PNG_HEIGHT) {
    this.width = width;
    this.height = height;
    this.localMmdc = path.resolve(process.cwd(), 'node_modules', '.bin', 'mmdc');
  }

  renderSync(mmdPath, pngPath) {
    try {
      const which = spawnSync(this.localMmdc, ['-v'], { stdio: 'ignore' });
      if (which.status === 0) {
        const r = spawnSync(this.localMmdc, ['-i', mmdPath, '-o', pngPath, '-w', String(this.width), '-H', String(this.height)]);
        return r.status === 0;
      }
    } catch (e) {}
    return false;
  }

  renderWithNpx(mmdPath, pngPath) {
    const r = spawnSync('npx', ['-y', '@mermaid-js/mermaid-cli', 'mmdc', '-i', mmdPath, '-o', pngPath, '-w', String(this.width), '-H', String(this.height)], { stdio: 'inherit' });
    return r.status === 0;
  }
}

class ActiviteitVisualizer {
  constructor(options = {}) {
    this.ttlPath = options.ttlPath || resolveProjectPath('src/main/input/activiteit/03-staalfabriek.ttl');
    this.outDir = options.outDir || path.resolve(__dirname, '../diagrams');
    this.renderer = options.renderer || new MermaidRenderer();
  }

  shortLabelFromUri(uri) {
    if (!uri) return '';
    if (uri.includes('#')) return uri.split('#').pop();
    const parts = uri.split('/');
    let last = parts.pop() || parts.pop();
    if (last && last.includes(':')) last = last.split(':').pop();
    return last;
  }

  getNodeLabel(store, term, defaultId) {
    const labelQuad = store.getQuads(term, RDFS_LABEL, null, null)[0];
    if (labelQuad) return labelQuad.object.value;
    const uri = literalValue(term.id || term.value || term) || defaultId || '';
    const short = this.shortLabelFromUri(uri);
    if (short && short !== uri) return short;
    if (defaultId && typeof defaultId === 'string') return defaultId.split('/').pop();
    return uri;
  }

  async generate() {
    await fs.mkdir(this.outDir, { recursive: true });

    const ttl = await fs.readFile(this.ttlPath, 'utf8');
    const parser = new Parser();
    const quads = parser.parse(ttl);
    const store = new Store(quads);

    const exploitatieQuads = store.getQuads(null, RDF_TYPE, RIEPR + 'Exploitatie', null);
    if (!exploitatieQuads.length) {
      console.error('No Exploitatie instances found in TTL.');
      return;
    }

    for (const exQuad of exploitatieQuads) {
      const exSubj = exQuad.subject;
      const exId = literalValue(exSubj.id || exSubj.value || exSubj);
      const impl = store.getQuads(exSubj, SSN + 'implements', null, null);
      if (!impl.length) {
        console.warn('No ssn:implements for', exId);
        continue;
      }

      for (const implQuad of impl) {
        const proc = implQuad.object;
        const procId = literalValue(proc.id || proc.value || proc);

        const nodes = new Map();
        const procLabel = this.getNodeLabel(store, proc, procId);

        const queue = [proc];
        const seen = new Set();
        const planIds = new Set();
        planIds.add(procId);
        const stepTerms = [];
        while (queue.length) {
          const planTerm = queue.shift();
          const planTermId = literalValue(planTerm.id || planTerm.value || planTerm);
          planIds.add(planTermId);
          const stepQuadsForPlan = store.getQuads(null, PPLAN + 'isStepOfPlan', planTerm, null);
          for (const sq of stepQuadsForPlan) {
            const step = sq.subject;
            const stepId = literalValue(step.id || step.value || step);
            if (seen.has(stepId)) continue;
            seen.add(stepId);
            stepTerms.push(step);
            queue.push(step);
          }
        }

        const edges = [];

        const systemToSteps = new Map();
        for (const step of stepTerms) {
          const stepId = literalValue(step.id || step.value || step);
          const label = this.getNodeLabel(store, step, stepId);
          let finalLabel = label;
          const inputVars = store.getQuads(step, PPLAN + 'hasInputVar', null, null);
          for (const iv of inputVars) {
            const varNode = iv.object;
            const valQuad = store.getQuads(varNode, RDF_VALUE, null, null)[0];
            if (valQuad) {
              const val = valQuad.object.value || literalValue(valQuad.object);
              if (val && val.startsWith(APPARAAT_NS)) {
                const apparaatTerm = valQuad.object;
                const apparaatId = literalValue(apparaatTerm.id || apparaatTerm.value || apparaatTerm);
                const apparaatLabelQuad = store.getQuads(apparaatTerm, RDFS_LABEL, null, null)[0];
                const apparaatLabel = apparaatLabelQuad ? apparaatLabelQuad.object.value : this.shortLabelFromUri(val);
                finalLabel = `${finalLabel}\nApparaat: ${apparaatLabel}`;
                // do not create a separate apparaat node here — the apparaat
                // is merged into the step label. We only record the mapping
                // so steps can be grouped under installations that include the apparaat.
                // record that this step depends on this apparaat
                if (!systemToSteps.has(apparaatId)) systemToSteps.set(apparaatId, []);
                systemToSteps.get(apparaatId).push(stepId);
                break;
              }
              if (val && val.startsWith(EMISSIE_NS)) {
                const epId = literalValue(valQuad.object.id || valQuad.object.value || valQuad.object);
                if (!nodes.has(epId)) {
                  const epLabelQuad = store.getQuads(valQuad.object, RDFS_LABEL, null, null)[0];
                  const epLabel = epLabelQuad ? epLabelQuad.object.value : this.shortLabelFromUri(val);
                  nodes.set(epId, { id: idFor(epId), label: epLabel });
                }
                edges.push({ from: stepId, to: epId });
                // record that this step references this emissionpoint system
                if (!systemToSteps.has(epId)) systemToSteps.set(epId, []);
                systemToSteps.get(epId).push(stepId);
              }
              if (val && val.startsWith(ONT_NS)) {
                const opId = literalValue(valQuad.object.id || valQuad.object.value || valQuad.object);
                if (!nodes.has(opId)) {
                  const opLabelQuad = store.getQuads(valQuad.object, RDFS_LABEL, null, null)[0];
                  const opLabel = opLabelQuad ? opLabelQuad.object.value : this.shortLabelFromUri(val);
                  nodes.set(opId, { id: idFor(opId), label: opLabel });
                }
                edges.push({ from: opId, to: stepId });
                // record that this step references this onttrekkingspunt system
                if (!systemToSteps.has(opId)) systemToSteps.set(opId, []);
                systemToSteps.get(opId).push(stepId);
              }
            } else {
              const varUri = literalValue(varNode.id || varNode.value || varNode) || '';
              const varLabelQuad = store.getQuads(varNode, RDFS_LABEL, null, null)[0];
              const varLabel = varLabelQuad ? varLabelQuad.object.value : '';
              if (varUri.includes('emissie') || /emissie/i.test(varLabel)) {
                const m = varUri.match(/(\d{7})_?(\d{7})?_?(\d{7,})?|(\d{7,})/);
                let suffix = null;
                if (m) suffix = m[0];
                const emissieQuads = store.getQuads(null, RDF_TYPE, RIEPR + 'Emissiepunt', null);
                for (const eq of emissieQuads) {
                  const s = literalValue(eq.subject.id || eq.subject.value || eq.subject);
                  if (suffix && s.includes(suffix)) {
                    const epId = s;
                    if (!nodes.has(epId)) {
                      const epLabelQuad = store.getQuads(eq.subject, RDFS_LABEL, null, null)[0];
                      const epLabel = epLabelQuad ? epLabelQuad.object.value : this.shortLabelFromUri(s);
                      nodes.set(epId, { id: idFor(epId), label: epLabel });
                    }
                    edges.push({ from: stepId, to: epId });
                    // record mapping step -> emissionpoint system
                    if (!systemToSteps.has(epId)) systemToSteps.set(epId, []);
                    systemToSteps.get(epId).push(stepId);
                    break;
                  }
                }
              }
              if (varUri.includes('onttrek') || /onttrekk/i.test(varLabel)) {
                for (const q of quads) {
                  if (q.predicate.value === PPLAN + 'isStepOfPlan') {
                    const childId = literalValue(q.subject.id || q.subject.value || q.subject);
                    const parentId = literalValue(q.object.id || q.object.value || q.object);
                    // Only group children under parent plans that belong to the
                    // current plan chain (planIds). This avoids showing unrelated
                    // parent plans (e.g. 2026) inside other plan outputs (e.g. 2020).
                    if (planIds.has(parentId) && nodes.has(childId)) {
                      if (!parentChildren.has(parentId)) parentChildren.set(parentId, []);
                      parentChildren.get(parentId).push(childId);
                    }
                  }
                }
              }
            }
          }

          nodes.set(stepId, { id: idFor(stepId), label: finalLabel, term: step });
        }

        for (const q of quads) {
          if (q.predicate.value === PPLAN + 'isPrecededBy') {
            const subj = q.subject;
            const obj = q.object;
            const subjId = literalValue(subj.id || subj.value || subj);
            const objId = literalValue(obj.id || obj.value || obj);
            if (nodes.has(subjId) && nodes.has(objId)) {
              edges.push({ from: objId, to: subjId });
            }
          }
        }

        const safeTitle = procLabel.replace(/"/g, '\\"');
        const lines = [
          '---',
          `title: "${safeTitle}"`,
          '---',
          'flowchart LR'
        ];

        const parentChildren = new Map();
        for (const q of quads) {
          // group steps under parent plans
          if (q.predicate.value === PPLAN + 'isStepOfPlan') {
            const childId = literalValue(q.subject.id || q.subject.value || q.subject);
            const parentId = literalValue(q.object.id || q.object.value || q.object);
            if (nodes.has(childId) && nodes.has(parentId)) {
              if (!parentChildren.has(parentId)) parentChildren.set(parentId, []);
              parentChildren.get(parentId).push(childId);
            }
          }

          // also group subsystems under installations (sosa:hasSubSystem or ssn:hasSubSystem)
          try {
            const sosaHas = NAMESPACES.sosa ? NAMESPACES.sosa + 'hasSubSystem' : null;
            const ssnHas = SSN + 'hasSubSystem';
            if ((sosaHas && q.predicate.value === sosaHas) || q.predicate.value === ssnHas) {
              const parentId = literalValue(q.subject.id || q.subject.value || q.subject);
              const childId = literalValue(q.object.id || q.object.value || q.object);
              if (nodes.has(childId)) {
                if (!parentChildren.has(parentId)) parentChildren.set(parentId, []);
                parentChildren.get(parentId).push(childId);
                // ensure parent installation node exists so it can be rendered as subgraph
                if (!nodes.has(parentId)) {
                  const parentLabel = this.getNodeLabel(store, q.subject, parentId);
                  nodes.set(parentId, { id: idFor(parentId), label: parentLabel, term: q.subject });
                }
              }
                // include steps that reference this subsystem (apparaat/emissie/etc.)
              if (systemToSteps.has(childId)) {
                if (!parentChildren.has(parentId)) parentChildren.set(parentId, []);
                for (const sid of systemToSteps.get(childId)) {
                  if (!parentChildren.get(parentId).includes(sid) && nodes.has(sid)) parentChildren.get(parentId).push(sid);
                }
                if (!nodes.has(parentId)) {
                  const parentLabel = this.getNodeLabel(store, q.subject, parentId);
                  nodes.set(parentId, { id: idFor(parentId), label: parentLabel, term: q.subject });
                }
              }
            }
          } catch (e) {
            // ignore if NAMESPACES.sosa undefined
          }
        }

        const emitted = new Set();
        for (const [parentId, children] of parentChildren) {
          const parentNode = nodes.get(parentId);
          const parentLabel = parentNode ? parentNode.label.replace(/"/g, '\\"') : this.shortLabelFromUri(parentId);
          const parentNodeId = idForPrefixed(parentId);
          lines.push(`subgraph ${parentNodeId}["${parentLabel}"]`);
          for (const childId of children) {
            const child = nodes.get(childId);
            if (!child) continue;
            const childLabel = child.label.replace(/"/g, '\\"');
            const childNodeId = idForPrefixed(childId);
            lines.push(`${childNodeId}["${childLabel}"]`);
            child._nodeId = childNodeId;
            emitted.add(childId);
          }
          lines.push('end');
        }

        for (const parentId of parentChildren.keys()) nodes.delete(parentId);

        for (const [k, v] of nodes) {
          if (emitted.has(k)) continue;
          if (parentChildren.has(k)) continue;
          const safeLabel = v.label.replace(/"/g, '\\"');
          const nodeId = idForPrefixed(k);
          lines.push(`${nodeId}["${safeLabel}"]`);
          v._nodeId = nodeId;
        }

        if (edges.length === 0) {
          const stepKeys = Array.from(nodes.keys()).filter(k => k !== procId);
          for (const sk of stepKeys) {
            lines.push(`${idForPrefixed(procId)} --> ${nodes.get(sk)._nodeId}`);
          }
        } else {
          for (const e of edges) {
            lines.push(`${idForPrefixed(e.from)} --> ${idForPrefixed(e.to)}`);
          }
        }

        const mmd = lines.join('\n');
        const baseName = `${toPrefixed(exId).replace(/[:#\\/]/g, '_')}_${toPrefixed(procId).replace(/[:#\\/]/g, '_')}`;
        const mmdPath = path.join(this.outDir, `${baseName}.mmd`);
        const pngPath = path.join(this.outDir, `${baseName}.png`);
        await fs.writeFile(mmdPath, mmd, 'utf8');
        console.log('Wrote', mmdPath);

        let rendered = this.renderer.renderSync(mmdPath, pngPath);
        if (!rendered) {
          console.log('Attempting to render PNG via npx @mermaid-js/mermaid-cli (may download package)');
          rendered = this.renderer.renderWithNpx(mmdPath, pngPath);
          if (rendered) console.log('Wrote', pngPath, `( ${this.renderer.width}x${this.renderer.height} )`);
          else console.warn('PNG rendering failed (mmdc). You can render manually with: npx @mermaid-js/mermaid-cli -i', mmdPath, '-o', pngPath);
        } else {
          console.log('Wrote', pngPath, `( ${this.renderer.width}x${this.renderer.height} )`);
        }

        // Variant generation (transport -> labeled edges, uitstoot -> dashed)
        try {
          const variantSuffix = '_transport';
          const nodesV = new Map(nodes);
          let edgesV = edges.map(e => ({ ...e }));

          // parent ids (those used to group children into subgraphs)
          const parentIds = new Set(parentChildren.keys());

          const transportType = RIEPR + 'overbrengingsProces';
          const uitstootType = RIEPR + 'uitstootProces';
          const transportNodes = new Set();
          const uitstootNodes = new Set();
          for (const [nid, nobj] of nodesV) {
            if (!nobj.term) continue;
            const typeQuads = store.getQuads(nobj.term, DCT_TYPE, null, null);
            for (const tq of typeQuads) {
              const tv = tq.object.value || literalValue(tq.object);
              if (tv === transportType) transportNodes.add(nid);
              if (tv === uitstootType) uitstootNodes.add(nid);
            }
          }

          const nodesToSplice = new Set([...transportNodes, ...Array.from(uitstootNodes)]);
          for (const t of Array.from(nodesToSplice)) {
            // find incoming edges (include those from parent plans so transport
            // nodes that are preceded by a parent plan are still spliced)
            const incoming = edgesV.filter(e => e.to === t);
            const outgoing = edgesV.filter(e => e.from === t);
            if (incoming.length && outgoing.length) {
              for (const inc of incoming) {
                for (const out of outgoing) {
                  const label = (nodesV.get(t) && nodesV.get(t).label) || '';
                  const dashed = uitstootNodes.has(t);
                  edgesV.push({ from: inc.from, to: out.to, label, dashed });
                }
              }
            }
            for (let i = edgesV.length - 1; i >= 0; i--) {
              if (edgesV[i].from === t || edgesV[i].to === t) edgesV.splice(i, 1);
            }
            nodesV.delete(t);
          }

          // deduplicate edges (from,to,label,dashed)
          const seen = new Set();
          const deduped = [];
          for (const ev of edgesV) {
            const key = `${ev.from}||${ev.to}||${ev.label||''}||${ev.dashed?1:0}`;
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push(ev);
          }
          edgesV = deduped;

          const parentChildrenV = new Map();
          for (const q of quads) {
            if (q.predicate.value === PPLAN + 'isStepOfPlan') {
              const childId = literalValue(q.subject.id || q.subject.value || q.subject);
              const parentId = literalValue(q.object.id || q.object.value || q.object);
              // For transport variant also ensure the parent plan is part of
              // the current plan chain before grouping children under it.
              if (planIds.has(parentId) && nodesV.has(childId)) {
                if (!parentChildrenV.has(parentId)) parentChildrenV.set(parentId, []);
                parentChildrenV.get(parentId).push(childId);
              }
            }

            // Also group subsystems under installations for the variant view
            try {
              const sosaHas = NAMESPACES.sosa ? NAMESPACES.sosa + 'hasSubSystem' : null;
              const ssnHas = SSN + 'hasSubSystem';
              if ((sosaHas && q.predicate.value === sosaHas) || q.predicate.value === ssnHas) {
                const parentId = literalValue(q.subject.id || q.subject.value || q.subject);
                const childId = literalValue(q.object.id || q.object.value || q.object);
                if (nodesV.has(childId)) {
                  if (!parentChildrenV.has(parentId)) parentChildrenV.set(parentId, []);
                  parentChildrenV.get(parentId).push(childId);
                  if (!nodesV.has(parentId)) {
                    const parentLabel = this.getNodeLabel(store, q.subject, parentId);
                    nodesV.set(parentId, { id: idFor(parentId), label: parentLabel, term: q.subject });
                  }
                }
                // include steps that reference this subsystem (apparaat/emissie/etc.) in variant
                if (systemToSteps.has(childId)) {
                  if (!parentChildrenV.has(parentId)) parentChildrenV.set(parentId, []);
                  for (const sid of systemToSteps.get(childId)) {
                    if (!parentChildrenV.get(parentId).includes(sid) && nodesV.has(sid)) parentChildrenV.get(parentId).push(sid);
                  }
                  if (!nodesV.has(parentId)) {
                    const parentLabel = this.getNodeLabel(store, q.subject, parentId);
                    nodesV.set(parentId, { id: idFor(parentId), label: parentLabel, term: q.subject });
                  }
                }
              }
            } catch (e) {
              // ignore if NAMESPACES.sosa undefined
            }
          }

          const vlines = [
            '---',
            `title: "${safeTitle} (transport as edges)"`,
            '---',
            'flowchart LR'
          ];
          const vemitted = new Set();
          for (const [parentId, children] of parentChildrenV) {
            if (parentId === procId) continue; // top-level process is the document title, don't render as subgraph
            const parentNode = nodesV.get(parentId);
            let parentLabel;
            if (parentNode && parentNode.label) {
              parentLabel = parentNode.label.replace(/"/g, '\\"');
            } else {
              // try to find a subject term in the quads that matches this parentId and read its rdfs:label
              const subjQuad = quads.find(q => {
                const s = literalValue(q.subject.id || q.subject.value || q.subject);
                return s === parentId;
              });
              if (subjQuad) {
                const parentTerm = subjQuad.subject;
                const labelQuad = store.getQuads(parentTerm, RDFS_LABEL, null, null)[0];
                parentLabel = labelQuad ? labelQuad.object.value.replace(/"/g, '\\"') : this.shortLabelFromUri(parentId);
              } else {
                parentLabel = this.shortLabelFromUri(parentId);
              }
            }
            const parentNodeId = idForPrefixed(parentId);
            vlines.push(`subgraph ${parentNodeId}["${parentLabel}"]`);
            // emit unique children only
            const seenChildren = new Set();
            for (const childId of children) {
              if (seenChildren.has(childId)) continue;
              seenChildren.add(childId);
              const child = nodesV.get(childId);
              if (!child) continue;
              const childLabel = child.label.replace(/"/g, '\\"');
              const childNodeId = idForPrefixed(childId);
              vlines.push(`${childNodeId}["${childLabel}"]`);
              child._nodeId = childNodeId;
              vemitted.add(childId);
            }
            vlines.push('end');
          }
          for (const [k, v] of nodesV) {
            if (vemitted.has(k)) continue;
            const safeLabel = v.label.replace(/"/g, '\\"');
            const nodeId = idForPrefixed(k);
            vlines.push(`${nodeId}["${safeLabel}"]`);
            v._nodeId = nodeId;
          }
          if (edgesV.length === 0) {
            const stepKeys = Array.from(nodesV.keys()).filter(k => k !== procId);
            for (const sk of stepKeys) {
              vlines.push(`${idForPrefixed(procId)} --> ${nodesV.get(sk)._nodeId}`);
            }
          } else {
            for (const e of edgesV) {
              const fromId = idForPrefixed(e.from);
              const toId = idForPrefixed(e.to);
              if (e.label) {
                const safe = e.label.replace(/"/g, '\\"');
                if (e.dashed) vlines.push(`${fromId} -. "${safe}" .-> ${toId}`);
                else vlines.push(`${fromId} -- "${safe}" --> ${toId}`);
              } else {
                vlines.push(`${fromId} --> ${toId}`);
              }
            }
          }

          const vmmd = vlines.join('\n');
          const vmmdPath = path.join(this.outDir, `${baseName}${variantSuffix}.mmd`);
          const vpngPath = path.join(this.outDir, `${baseName}${variantSuffix}.png`);
          await fs.writeFile(vmmdPath, vmmd, 'utf8');
          console.log('Wrote', vmmdPath);
          let renderedV = this.renderer.renderSync(vmmdPath, vpngPath);
          if (!renderedV) {
            renderedV = this.renderer.renderWithNpx(vmmdPath, vpngPath);
            if (renderedV) console.log('Wrote', vpngPath);
          } else {
            console.log('Wrote', vpngPath);
          }
        } catch (e) {
          console.warn('Variant generation failed:', e.message || e);
        }
      }
    }
  }
}

(new ActiviteitVisualizer()).generate().catch(err => { console.error(err); process.exit(1); });
