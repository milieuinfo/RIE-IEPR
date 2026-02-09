// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

import type { ISystem } from './System.interface';

@jsonObject
export class Emissiepunt implements ISystem {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(String, { name: 'type' })
  type?: string;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(String, { name: 'atLocation' })
  locatie!: string;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
