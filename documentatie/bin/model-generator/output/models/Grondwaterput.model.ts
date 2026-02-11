// Auto-generated models

import { Onttrekkingspunt } from './Onttrekkingspunt.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Grondwaterput extends Onttrekkingspunt {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Number, { name: 'depth' })
  diepte!: number;

}
