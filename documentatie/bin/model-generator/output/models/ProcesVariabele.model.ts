// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class ProcesVariabele {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonMember(String, { name: 'type' })
  type?: string;

  @jsonMember(Number, { name: 'hasUnit' })
  eenheid?: number;

  @jsonMember(Number, { name: 'hasNumericValue' })
  waarde?: number;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
