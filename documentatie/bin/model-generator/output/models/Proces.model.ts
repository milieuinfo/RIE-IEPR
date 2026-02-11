// Auto-generated models

// URI template: https://data.riepr.omgeving.vlaanderen.be/id/proces/{exploitatielocatie}/{localId}
// Mapping: {exploitatielocatie} -> identifier (required)
// Mapping: {localId} -> identifier (required)

// Auto-generated models

import { ExploitatieLocatie } from './ExploitatieLocatie.model';
import { ProcesIdentifier } from './ProcesIdentifier.model';
import { ProcesVariabele } from './ProcesVariabele.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Procedure } from './procedure.enum';

import type { ISystem } from './System.interface';

@jsonObject
export class Proces implements ISystem {
  @jsonMember(String, { name: 'uuid' })
  uuid!: string;

  @jsonMember(String, { name: 'uri' })
  uri?: string;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonMember(ExploitatieLocatie, { name: 'isHostedBy' })
  locatie!: ExploitatieLocatie;

  @jsonArrayMember(Object, { name: 'implementedBy' })
  geimplenteerdDoor?: ISystem[];

  @jsonMember(() => Procedure, { name: 'type' })
  type?: Procedure;

  @jsonArrayMember(ProcesVariabele, { name: 'hasInputVar' })
  heeftInvoer?: ProcesVariabele[];

  @jsonArrayMember(ProcesVariabele, { name: 'hasOutputVar' })
  heeftUitvoer?: ProcesVariabele[];

  @jsonMember(Proces, { name: 'isStepOfPlan' })
  onderdeelVan?: Proces;

  @jsonArrayMember(ProcesIdentifier, { name: 'identifier' })
  identifier?: ProcesIdentifier[];


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
