// Auto-generated models

import { Emissiepunt } from './Emissiepunt.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Schouw extends Emissiepunt {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Number, { name: 'diameter' })
  diameter!: number;

  @jsonMember(Number, { name: 'height' })
  hoogte!: number;

}
