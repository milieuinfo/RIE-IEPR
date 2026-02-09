// Auto-generated models

import { Ontrekkingspunt } from './Ontrekkingspunt.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Grondwaterput extends Ontrekkingspunt {
  @jsonMember(Number, { name: 'depth' })
  depth!: number;

}
