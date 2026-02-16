// Auto-generated models

// URI template: https://data.riepr.omgeving.vlaanderen.be/id/proces/{exploitatielocatie}/{localId}
// Mapping: {exploitatielocatie} -> identifier (required)
// Mapping: {localId} -> identifier (required)

// Auto-generated models

import { ProcesVariabele } from './ProcesVariabele.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Procedure } from './procedure.enum';

import type { ISysteem } from './Systeem.interface';

@jsonObject
export class Proces {
  // PK (primary key from ontology/hydra string)
  @jsonMember(String, { name: 'uuid' })
  uuid!: string;

  @jsonMember(String, { name: 'uri' })
  uri?: string;

  @jsonMember(Proces, { name: 'http://www.w3.org/ns/prov#wasRevisionOf' })
  revisieVan?: Proces;

  @jsonMember(Date, { name: 'http://purl.org/dc/terms/modified' })
  aangepastOp!: Date;

  @jsonMember(Date, { name: 'http://purl.org/dc/terms/created' })
  aangemaaktOp!: Date;

  @jsonMember(String, { name: 'http://www.w3.org/2000/01/rdf-schema#label' })
  benaming!: string;

  @jsonMember(() => Procedure, { name: 'http://purl.org/dc/terms/type' })
  type?: Procedure;

  @jsonMember(Object, { name: 'http://www.w3.org/ns/ssn/implementedBy' })
  geimplementeerdDoor?: ISysteem;

  @jsonArrayMember(ProcesVariabele, { name: 'http://purl.org/net/p-plan#hasInputVar' })
  heeftInvoer?: ProcesVariabele[];

  @jsonArrayMember(ProcesVariabele, { name: 'http://purl.org/net/p-plan#hasOutputVar' })
  heeftUitvoer?: ProcesVariabele[];

  @jsonArrayMember(Proces, { name: 'http://purl.org/net/p-plan#isStepOfPlan' })
  onderdeelVan?: Proces[];

  /**
   * Demonstration: generate a `uri` from the configured string template.
   * Does not override an existing `uri`. For demonstration purposes only.
   * @returns {string|undefined} the generated or existing uri
   */
  generateUri(): string | undefined {
    if (this.uri) return this.uri;
    let uri = 'https://data.riepr.omgeving.vlaanderen.be/id/proces/{exploitatielocatie}/{localId}';
    let exploitatielocatie = '' as any;
    try {
      // try direct property first
      let v = (this as any)['identifier'];
      // if not found, search nested objects for likely identifier properties
      if (!v) {
        for (const k of Object.keys(this)) {
          try { const o = (this as any)[k]; if (o && typeof o === 'object') { if (o['identifier']) { v = o['identifier']; break; } if (o['identifier']) { v = o['identifier']; break; } if (o['value']) { v = o['value']; break; } if (o['notation']) { v = o['notation']; break; } if (o['uri']) { v = o['uri']; break; } } } catch (e) { /* ignore */ }
        }
      }
      if (Array.isArray(v)) v = v.length>0 ? v[0] : null;
      if (v) {
        if (typeof v === 'string') exploitatielocatie = v;
        else if (v.value) exploitatielocatie = v.value;
        else if (v.notation) exploitatielocatie = v.notation;
        else if (v.uri) exploitatielocatie = v.uri;
        else if (v.id) exploitatielocatie = v.id;
      }
    } catch (e) { /* ignore */ }
    uri = uri.replace('{exploitatielocatie}', encodeURIComponent(String(exploitatielocatie || '')));
    let localId = '' as any;
    try {
      // try direct property first
      let v = (this as any)['identifier'];
      // if not found, search nested objects for likely identifier properties
      if (!v) {
        for (const k of Object.keys(this)) {
          try { const o = (this as any)[k]; if (o && typeof o === 'object') { if (o['identifier']) { v = o['identifier']; break; } if (o['identifier']) { v = o['identifier']; break; } if (o['value']) { v = o['value']; break; } if (o['notation']) { v = o['notation']; break; } if (o['uri']) { v = o['uri']; break; } } } catch (e) { /* ignore */ }
        }
      }
      if (Array.isArray(v)) v = v.length>0 ? v[0] : null;
      if (v) {
        if (typeof v === 'string') localId = v;
        else if (v.value) localId = v.value;
        else if (v.notation) localId = v.notation;
        else if (v.uri) localId = v.uri;
        else if (v.id) localId = v.id;
      }
    } catch (e) { /* ignore */ }
    uri = uri.replace('{localId}', encodeURIComponent(String(localId || '')));
    this.uri = uri;
    return this.uri;
  }

}
