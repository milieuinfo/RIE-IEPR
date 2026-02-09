// Auto-generated models

import { Emissiepunt } from './Emissiepunt.model';

import { jsonObject, jsonArrayMember } from 'typedjson';

@jsonObject
export class Schouw extends Emissiepunt {
  @jsonArrayMember(String, { name: 'diameter' })
  diameter!: string[];

  @jsonArrayMember(String, { name: 'height' })
  hoogte!: string[];

}
