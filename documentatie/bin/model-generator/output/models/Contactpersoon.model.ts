// Auto-generated models

import { Exploitant } from './Exploitant.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Contactpersoon {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Exploitant, { name: 'memberOf' })
  exploitant!: Exploitant;

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonMember(String, { name: 'mbox' })
  email?: string;

  @jsonMember(String, { name: 'phone' })
  telefoonnummer?: string;

  @jsonMember(String, { name: 'hasRole' })
  hasRole!: string;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(String, { name: 'name' })
  name!: string;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
