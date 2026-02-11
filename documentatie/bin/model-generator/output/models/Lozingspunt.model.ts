// Auto-generated models

import { Emissiepunt } from './Emissiepunt.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Lozingspunt extends Emissiepunt {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Number, { name: 'depth' })
  diepte?: number;

}
