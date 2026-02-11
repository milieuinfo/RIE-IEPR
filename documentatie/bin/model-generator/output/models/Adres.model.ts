// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Adres {
  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(String, { name: 'straat' })
  straat?: string;

  @jsonMember(String, { name: 'stad' })
  stad?: string;

  @jsonMember(String, { name: 'postcode' })
  postcode?: string;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
