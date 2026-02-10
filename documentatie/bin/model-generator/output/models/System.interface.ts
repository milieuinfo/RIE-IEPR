// Auto-generated shared interface for System

import type { IAgent } from './Agent.interface';

export interface ISystem extends IAgent {
  uri?: string;
  afgeleidVan?: ISystem[];
  toegewezenAan?: IAgent[];
}
