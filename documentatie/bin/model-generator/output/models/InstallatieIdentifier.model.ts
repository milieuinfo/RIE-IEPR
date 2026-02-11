// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class InstallatieIdentifier {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(String, { name: 'inScheme' })
  inScheme?: string;

  @jsonMember(String, { name: 'notation' })
  notation!: string;

  @jsonMember(Date, { name: 'valid' })
  geldigTot?: Date;

  @jsonMember(String, { name: 'value' })
  value?: string;

}
