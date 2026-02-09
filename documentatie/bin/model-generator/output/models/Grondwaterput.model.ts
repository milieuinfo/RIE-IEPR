// Auto-generated models

import { Ontrekkingspunt } from './Ontrekkingspunt.model';

import { jsonObject, jsonArrayMember } from 'typedjson';

@jsonObject
export class Grondwaterput extends Ontrekkingspunt {
  @jsonArrayMember(String, { name: 'depth' })
  depth!: string[];

}
