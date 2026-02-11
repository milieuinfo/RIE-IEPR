// Auto-generated models

import { ExploitatieLocatie } from './ExploitatieLocatie.model';

import { jsonObject, jsonMember } from 'typedjson';

import type { ISystem } from './System.interface';

@jsonObject
export class Onttrekkingspunt implements ISystem {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(String, { name: 'label' })
  benaming!: string;

  @jsonMember(String, { name: 'type' })
  type?: string;

  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'created' })
  aangemaaktOp!: Date;

  @jsonMember(ExploitatieLocatie, { name: 'isHostedBy' })
  locatie!: ExploitatieLocatie;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

}
