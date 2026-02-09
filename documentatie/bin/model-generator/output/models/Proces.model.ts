// Auto-generated models

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

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(ExploitatieLocatie, { name: 'atLocation' })
  locatie!: ExploitatieLocatie;

  @jsonArrayMember(Object, { name: 'wasAttributedTo' })
  toegewezenAan?: IAgent[];

  @jsonMember(String, { name: 'wasDerivedFrom' })
  type?: string;

  @jsonArrayMember(ProcesVariabele, { name: 'hasInputVar' })
  hasInputVar?: ProcesVariabele[];

  @jsonArrayMember(ProcesVariabele, { name: 'hasOutputVar' })
  hasOutputVar?: ProcesVariabele[];

  @jsonMember(Proces, { name: 'isStepOfPlan' })
  onderdeelVan?: Proces;

  @jsonArrayMember(Proces, { name: 'isPrecededBy' })
  gaatVoorafAan?: Proces[];

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonArrayMember(ProcesIdentifier, { name: 'identifier' })
  identifier?: ProcesIdentifier[];

}
