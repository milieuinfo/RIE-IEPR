import { ExploitatieLocatie } from './ExploitatieLocatie.model';
import { ProcesIdentifier } from './ProcesIdentifier.model';
import { ProcesVariabele } from './ProcesVariabele.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

import type { IAgent } from './Agent.interface';
import type { ISystem } from './System.interface';

@jsonObject
export class Proces implements ISystem {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(String, { name: 'atLocation' })
  locatie!: string;

  @jsonArrayMember(Object, { name: 'wasAttributedTo' })
  toegewezenAan!: IAgent[];

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

  @jsonArrayMember(String, { name: 'identifier' })
  identifier?: string[];

}
