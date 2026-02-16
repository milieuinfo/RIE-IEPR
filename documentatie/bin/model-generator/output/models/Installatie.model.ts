// Auto-generated models

// URI template: https://data.riepr.omgeving.vlaanderen.be/id/installatie/{uuid}/{issued}/{modified}
// Mapping: {uuid} -> identifier (required)
// Mapping: {issued} -> issued (required)
// Mapping: {modified} -> modified (required)

// Auto-generated models

import { ExploitatieLocatie } from './ExploitatieLocatie.model';
import { InstallatieIdentifier } from './InstallatieIdentifier.model';
import { Proces } from './Proces.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

import type { ISysteem } from './Systeem.interface';

@jsonObject
export class Installatie implements ISysteem {
  // PK (primary key from ontology/hydra string)
  @jsonMember(String, { name: 'uuid' })
  uuid!: string;

  @jsonMember(String, { name: 'uri' })
  uri?: string;

  @jsonArrayMember(Object, { name: 'http://www.w3.org/ns/ssn/hasSubSystem' })
  heeftSubSysteem?: ISysteem[];

  @jsonArrayMember(Proces, { name: 'http://www.w3.org/ns/ssn/implements' })
  implementeert?: Proces[];

  @jsonMember(String, { name: 'http://www.w3.org/2000/01/rdf-schema#label' })
  benaming!: string;

  // PK (primary key from ontology/hydra string)
  @jsonMember(Date, { name: 'http://purl.org/dc/terms/modified' })
  aangepastOp!: Date;

  @jsonMember(Date, { name: 'http://purl.org/dc/terms/created' })
  aangemaaktOp!: Date;

  // PK (primary key from ontology/hydra string)
  @jsonMember(Date, { name: 'http://purl.org/dc/terms/issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'http://purl.org/dc/terms/valid' })
  geldigTot?: Date;

  @jsonMember(ExploitatieLocatie, { name: 'http://www.w3.org/ns/sosa/isHostedBy' })
  locatie!: ExploitatieLocatie;

  @jsonMember(Object, { name: 'http://www.w3.org/ns/prov#wasRevisionOf' })
  revisieVan?: ISysteem;

  @jsonArrayMember(InstallatieIdentifier, { name: 'http://www.w3.org/ns/adms#identifier' })
  identifier?: InstallatieIdentifier[];

  /**
   * Demonstration: generate a `uri` from the configured string template.
   * Does not override an existing `uri`. For demonstration purposes only.
   * @returns {string|undefined} the generated or existing uri
   */
  generateUri(): string | undefined {
    if (this.uri) return this.uri;
    let uri = 'https://data.riepr.omgeving.vlaanderen.be/id/installatie/{uuid}/{issued}/{modified}';
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
    let issued = '' as any;
    try {
      // try direct property first
      let v = (this as any)['issued'];
      // if not found, search nested objects for likely identifier properties
      if (!v) {
        for (const k of Object.keys(this)) {
          try { const o = (this as any)[k]; if (o && typeof o === 'object') { if (o['issued']) { v = o['issued']; break; } if (o['identifier']) { v = o['identifier']; break; } if (o['value']) { v = o['value']; break; } if (o['notation']) { v = o['notation']; break; } if (o['uri']) { v = o['uri']; break; } } } catch (e) { /* ignore */ }
        }
      }
      if (Array.isArray(v)) v = v.length>0 ? v[0] : null;
      if (v) {
        if (typeof v === 'string') issued = v;
        else if (v.value) issued = v.value;
        else if (v.notation) issued = v.notation;
        else if (v.uri) issued = v.uri;
        else if (v.id) issued = v.id;
      }
    } catch (e) { /* ignore */ }
    uri = uri.replace('{issued}', encodeURIComponent(String(issued || '')));
    let modified = '' as any;
    try {
      // try direct property first
      let v = (this as any)['modified'];
      // if not found, search nested objects for likely identifier properties
      if (!v) {
        for (const k of Object.keys(this)) {
          try { const o = (this as any)[k]; if (o && typeof o === 'object') { if (o['modified']) { v = o['modified']; break; } if (o['identifier']) { v = o['identifier']; break; } if (o['value']) { v = o['value']; break; } if (o['notation']) { v = o['notation']; break; } if (o['uri']) { v = o['uri']; break; } } } catch (e) { /* ignore */ }
        }
      }
      if (Array.isArray(v)) v = v.length>0 ? v[0] : null;
      if (v) {
        if (typeof v === 'string') modified = v;
        else if (v.value) modified = v.value;
        else if (v.notation) modified = v.notation;
        else if (v.uri) modified = v.uri;
        else if (v.id) modified = v.id;
      }
    } catch (e) { /* ignore */ }
    uri = uri.replace('{modified}', encodeURIComponent(String(modified || '')));
    this.uri = uri;
    return this.uri;
  }

}
