// Auto-generated models

import { ProcesIdentifier } from './ProcesIdentifier.model';
import { ProcesVariabele } from './ProcesVariabele.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Procedure } from './procedure.enum';

import type { ISystem } from './System.interface';
import type { IAgent } from './Agent.interface';

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

  @jsonArrayMember(Object, { name: 'implementedBy' })
  geimplenteerdDoor?: IAgent[];

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

  @jsonMember(AfgeleidVan, { name: 'wasDerivedFrom' })
  afgeleidVan?: AfgeleidVan;

  @jsonArrayMember(() => Procedure, { name: 'wasDerivedFrom' })
  afgeleidVan?: AfgeleidVan;

  @jsonArrayMember(String, { name: 'wasAttributedTo' })
  toegewezenAan?: string[];

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonArrayMember(ProcesIdentifier, { name: 'identifier' })
  identifier?: ProcesIdentifier[];

}
