// Auto-generated models

import { jsonObject, jsonMember } from 'typedjson';

@jsonObject
export class InstallatieIdentifier {
  @jsonMember(String, { name: 'http://www.w3.org/2004/02/skos/core#inScheme' })
  inScheme?: string;

  // PK (primary key from ontology/hydra string)
  @jsonMember(String, { name: 'http://www.w3.org/2004/02/skos/core#notation' })
  notatie!: string;

  @jsonMember(Date, { name: 'http://purl.org/dc/terms/valid' })
  geldigTot?: Date;

  @jsonMember(String, { name: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value' })
  value?: string;

}
