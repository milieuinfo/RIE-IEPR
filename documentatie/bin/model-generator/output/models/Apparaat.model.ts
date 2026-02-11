// Auto-generated models

import { ExploitatieLocatie } from './ExploitatieLocatie.model';

import { jsonObject, jsonMember } from 'typedjson';

import type { ISystem } from './System.interface';

@jsonObject
export class Apparaat implements ISystem {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(ExploitatieLocatie, { name: 'isHostedBy' })
  locatie!: ExploitatieLocatie;

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonMember(String, { name: 'hasGeometry' })
  geometrie?: string;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
