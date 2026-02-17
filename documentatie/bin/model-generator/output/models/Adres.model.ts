// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class Adres {
  @jsonMember(String, { name: 'uuid' })
  uuid?: string;

  @jsonMember(String, { name: 'uri' })
  uri?: string;

  @jsonMember(Date, { name: 'http://purl.org/dc/terms/issued' })
  geldigVan!: Date;

  @jsonMember(Date, { name: 'http://purl.org/dc/terms/created' })
  aangemaaktOp!: Date;

  @jsonMember(Date, { name: 'http://purl.org/dc/terms/valid' })
  geldigTot?: Date;

  @jsonMember(String, { name: 'https://data.riepr.omgeving.vlaanderen.be/id/concept/straat' })
  straat?: string;

  @jsonMember(String, { name: 'https://data.riepr.omgeving.vlaanderen.be/id/concept/stad' })
  stad?: string;

  @jsonMember(String, { name: 'https://data.riepr.omgeving.vlaanderen.be/id/concept/postcode' })
  postcode?: string;

}
