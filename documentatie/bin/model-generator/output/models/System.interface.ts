import type { IAgent } from './Agent.interface';

// Auto-generated shared interface for System

export interface ISystem extends IAgent {
  uri?: string;
  afgeleidVan?: string;
  toegewezenAan?: IAgent[];
}
