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

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(String, { name: 'atLocation' })
  locatie!: string;

  @jsonMember(String, { name: 'wasDerivedFrom' })
  afgeleidVan?: string;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonArrayMember(String, { name: 'identifier' })
  identifier?: string[];

}
