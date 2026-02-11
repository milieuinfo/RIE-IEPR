// Auto-generated models

import { Emissiepunt } from './Emissiepunt.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class AbstractEmissiepunt extends Emissiepunt {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

}
