// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class MeetpuntIdentifier {
  @jsonMember(Date, { name: 'issued' })
  geldigVan!: Date;

  @jsonMember(String, { name: 'inScheme' })
  inScheme!: string;

  @jsonMember(String, { name: 'notation' })
  notation!: string;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonMember(String, { name: 'value' })
  value?: string;

}
