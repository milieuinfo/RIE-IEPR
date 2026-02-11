// Auto-generated models

import { ExploitatieLocatie } from './ExploitatieLocatie.model';
import { ProcesIdentifier } from './ProcesIdentifier.model';
import { ProcesVariabele } from './ProcesVariabele.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';
import { Procedure } from './procedure.enum';

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

  @jsonMember(ExploitatieLocatie, { name: 'isHostedBy' })
  locatie!: ExploitatieLocatie;

  @jsonArrayMember(Object, { name: 'implementedBy' })
  geimplenteerdDoor?: ISystem[];

  @jsonMember(() => Procedure, { name: 'type' })
  type?: Procedure;

  @jsonArrayMember(ProcesVariabele, { name: 'hasInputVar' })
  heeftInvoer?: ProcesVariabele[];

  @jsonArrayMember(ProcesVariabele, { name: 'hasOutputVar' })
  heeftUitvoer?: ProcesVariabele[];

  @jsonMember(Proces, { name: 'isStepOfPlan' })
  onderdeelVan?: Proces;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonArrayMember(ProcesIdentifier, { name: 'identifier' })
  identifier?: ProcesIdentifier[];

}
