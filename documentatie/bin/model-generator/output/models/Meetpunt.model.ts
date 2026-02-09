// Auto-generated models

import { MeetpuntIdentifier } from './MeetpuntIdentifier.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

import type { ISystem } from './System.interface';

@jsonObject
export class Meetpunt implements ISystem {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(String, { name: 'type' })
  type?: string;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonArrayMember(MeetpuntIdentifier, { name: 'identifier' })
  identifier?: MeetpuntIdentifier[];

}
