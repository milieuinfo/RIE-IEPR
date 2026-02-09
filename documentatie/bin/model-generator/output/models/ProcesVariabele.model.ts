// Auto-generated models

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

@jsonObject
export class ProcesVariabele {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonArrayMember(String, { name: 'label' })
  benaming!: string[];

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
