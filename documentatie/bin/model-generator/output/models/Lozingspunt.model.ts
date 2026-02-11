// Auto-generated models

import { Emissiepunt } from './Emissiepunt.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Lozingspunt extends Emissiepunt {
  @jsonMember(Number, { name: 'depth' })
  diepte?: number;

}
