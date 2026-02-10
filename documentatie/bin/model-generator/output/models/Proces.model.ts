// Auto-generated models

import { Agent } from './Agent.model';
import { ExploitatieLocatie } from './ExploitatieLocatie.model';
import { ProcesIdentifier } from './ProcesIdentifier.model';
import { ProcesVariabele } from './ProcesVariabele.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Procedure } from './procedure.enum';

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

  @jsonArrayMember(Agent, { name: 'wasImplementedBy' })
  geimplenteerdDoor?: Agent[];

  @jsonMember(() => Procedure, { name: 'type' })
  type?: Procedure;

  @jsonArrayMember(ProcesVariabele, { name: 'hasInputVar' })
  heeftInvoer?: ProcesVariabele[];

  @jsonArrayMember(ProcesVariabele, { name: 'hasOutputVar' })
  heeftUitvoer?: ProcesVariabele[];

  @jsonMember(Proces, { name: 'isStepOfPlan' })
  onderdeelVan?: Proces;

  @jsonArrayMember(Proces, { name: 'isPrecededBy' })
  gaatVoorafAan?: Proces[];

  @jsonArrayMember(ExploitatieLocatie, { name: 'wasDerivedFrom' })
  type?: ExploitatieLocatie[];

  @jsonArrayMember(Object, { name: 'wasAttributedTo' })
  toegewezenAan?: IAgent[];

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonArrayMember(ProcesIdentifier, { name: 'identifier' })
  identifier?: ProcesIdentifier[];

}
