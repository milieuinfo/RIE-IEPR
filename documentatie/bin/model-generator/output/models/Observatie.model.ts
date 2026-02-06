
import { jsonObject, jsonMember, jsonArrayMember } from 'typedjson';

@jsonObject
export class Observatie {
  @jsonMember(String, { name: 'uri' })
  uri!: string;

  @jsonMember(Object, { name: 'hasFeatureOfInterest' })
  hasFeatureOfInterest!: IAgent;

  @jsonMember(String, { name: 'used' })
  used?: string;

  @jsonArrayMember(Object, { name: 'used' })
  used?: IAgent[][];

  @jsonArrayMember(Date, { name: 'endedAtTime' })
  endedAtTime?: Date[];

  @jsonArrayMember(Date, { name: 'startedAtTime' })
  startedAtTime?: Date[];

  @jsonArrayMember(Object, { name: 'correspondsToStep' })
  correspondsToStep?: IAgent[][];

}
