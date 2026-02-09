// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class ProcesVariabele {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(String, { name: 'type' })
  type?: string;

  @jsonMember(String, { name: 'hasUnit' })
  eenheid?: string;

  @jsonMember(String, { name: 'hasNumericValue' })
  waarde?: string;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
