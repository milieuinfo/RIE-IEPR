// Auto-generated models

import { ProcesIdentifier } from './ProcesIdentifier.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

import type { ISystem } from './System.interface';

@jsonObject
export class Proces implements ISystem {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonArrayMember(String, { name: 'label' })
  benaming!: string[];

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(String, { name: 'atLocation' })
  locatie!: string;

  @jsonArrayMember(String, { name: 'wasAttributedTo' })
  toegewezenAan?: string[];

  @jsonMember(String, { name: 'wasDerivedFrom' })
  type?: string;

  @jsonArrayMember(String, { name: 'hasInputVar' })
  hasInputVar?: string[];

  @jsonArrayMember(String, { name: 'hasOutputVar' })
  hasOutputVar?: string[];

  @jsonMember(String, { name: 'isStepOfPlan' })
  onderdeelVan?: string;

  @jsonArrayMember(String, { name: 'isPrecededBy' })
  gaatVoorafAan?: string[];

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonArrayMember(ProcesIdentifier, { name: 'identifier' })
  identifier?: ProcesIdentifier[];

}
