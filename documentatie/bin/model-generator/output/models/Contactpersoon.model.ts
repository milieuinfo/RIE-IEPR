// Auto-generated models

import { Address } from './Address.model';
import { Exploitant } from './Exploitant.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

@jsonObject
export class Contactpersoon {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Exploitant, { name: 'memberOf' })
  memberOf!: Exploitant;

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonArrayMember(String, { name: 'mbox' })
  mbox?: string[];

  @jsonArrayMember(String, { name: 'phone' })
  phone?: string[];

  @jsonArrayMember(String, { name: 'hasRole' })
  hasRole!: string[];

  @jsonMember(Address, { name: 'address' })
  address?: Address;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonArrayMember(String, { name: 'name' })
  name!: string[];

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
