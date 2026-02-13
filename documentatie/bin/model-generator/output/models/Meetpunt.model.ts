// Auto-generated models

// URI template: https://data.riepr.omgeving.vlaanderen.be/id/meetpunt/{id}
// Mapping: {id} -> identifier (required)

// Auto-generated models

import { MeetpuntIdentifier } from './MeetpuntIdentifier.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

import type { IAgent } from './Agent.interface';

@jsonObject
export class Meetpunt implements IAgent {
  @jsonMember(String, { name: 'uuid' })
  uuid!: string;

  @jsonMember(String, { name: 'uri' })
  uri?: string;

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonMember(String, { name: 'type' })
  type?: string;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonMember(String, { name: 'hasGeometry' })
  geometrie?: string;

  @jsonArrayMember(MeetpuntIdentifier, { name: 'identifier' })
  identifier?: MeetpuntIdentifier[];


  /**
   * Demonstration: generate a `uri` from the configured string template.
   * Does not override an existing `uri`. For demonstration purposes only.
   * @returns {string|undefined} the generated or existing uri
   */
  generateUri(): string | undefined {
    if (this.uri) return this.uri;
    let uri = 'https://data.riepr.omgeving.vlaanderen.be/id/meetpunt/{id}';
    let id = '' as any;
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
        if (typeof v === 'string') id = v;
        else if (v.value) id = v.value;
        else if (v.notation) id = v.notation;
        else if (v.uri) id = v.uri;
        else if (v.id) id = v.id;
      }
    } catch (e) { /* ignore */ }
    uri = uri.replace('{id}', encodeURIComponent(String(id || '')));
    this.uri = uri;
    return this.uri;
  }

}
