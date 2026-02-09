// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Grondwaterput {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Number, { name: 'depth' })
  depth!: number;

}
