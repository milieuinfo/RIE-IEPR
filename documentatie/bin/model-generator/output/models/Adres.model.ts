// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Adres {
  @jsonMember(String, { name: 'uuid' })
  uuid!: string;

  @jsonMember(String, { name: 'uri' })
  uri?: string;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonMember(String, { name: 'straat' })
  straat?: string;

  @jsonMember(String, { name: 'stad' })
  stad?: string;

  @jsonMember(String, { name: 'postcode' })
  postcode?: string;

}
