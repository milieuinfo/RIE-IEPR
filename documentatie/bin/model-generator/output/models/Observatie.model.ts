// Auto-generated models

import { Meetpunt } from './Meetpunt.model';

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Observatie {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Meetpunt, { name: 'hasFeatureOfInterest' })
  hasFeatureOfInterest!: Meetpunt;

}
