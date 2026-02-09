// Auto-generated models

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

@jsonObject
export class Address {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonArrayMember(String, { name: 'thoroughfare' })
  straat?: string[];

  @jsonArrayMember(String, { name: 'postName' })
  stad?: string[];

  @jsonArrayMember(String, { name: 'postCode' })
  postcode?: string[];

}
