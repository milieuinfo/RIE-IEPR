// Auto-generated models

import { Onttrekkingspunt } from './Onttrekkingspunt.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Grondwaterput extends Onttrekkingspunt {
  @jsonMember(Number, { name: 'depth' })
  diepte!: number;

}
