// Auto-generated models

// URI template: https://data.riepr.omgeving.vlaanderen.be/id/observatie/{uuid}
// Mapping: {uuid} -> identifier (required)

// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

import type { ISysteem } from './Systeem.interface';

@jsonObject
export class Observatie {
  // PK (primary key from ontology/hydra string)
  @jsonMember(String, { name: 'uuid' })
  uuid!: string;

  @jsonMember(String, { name: 'uri' })
  uri?: string;

  @jsonMember(Object, { name: 'http://www.w3.org/ns/sosa/hasFeatureOfInterest' })
  hasFeatureOfInterest!: ISysteem;

  /**
   * Demonstration: generate a `uri` from the configured string template.
   * Does not override an existing `uri`. For demonstration purposes only.
   * @returns {string|undefined} the generated or existing uri
   */
  generateUri(): string | undefined {
    if (this.uri) return this.uri;
    let uri = 'https://data.riepr.omgeving.vlaanderen.be/id/observatie/{uuid}';
    let uuid = '' as any;
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
        if (typeof v === 'string') uuid = v;
        else if (v.value) uuid = v.value;
        else if (v.notation) uuid = v.notation;
        else if (v.uri) uuid = v.uri;
        else if (v.id) uuid = v.id;
      }
    } catch (e) { /* ignore */ }
    uri = uri.replace('{uuid}', encodeURIComponent(String(uuid || '')));
    this.uri = uri;
    return this.uri;
  }

}
