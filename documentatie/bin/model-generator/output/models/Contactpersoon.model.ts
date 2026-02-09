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

  @jsonArrayMember(Address, { name: 'address' })
  address?: Address[];

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
