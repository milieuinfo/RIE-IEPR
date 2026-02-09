// Auto-generated models

import { ExploitatieLocatie } from './ExploitatieLocatie.model';
import { InstallatieIdentifier } from './InstallatieIdentifier.model';

import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

import type { ISystem } from './System.interface';

@jsonObject
export class Installatie implements ISystem {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonArrayMember(String, { name: 'hasSubSystem' })
  hasSubSystem?: string[];

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(ExploitatieLocatie, { name: 'atLocation' })
  locatie!: ExploitatieLocatie;

  @jsonArrayMember(Object, { name: 'wasDerivedFrom' })
  afgeleidVan?: ISystem[];

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonArrayMember(InstallatieIdentifier, { name: 'identifier' })
  identifier?: InstallatieIdentifier[];

}
