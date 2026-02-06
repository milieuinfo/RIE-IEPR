import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export function resolveProjectPath(...segments) {
  return path.resolve(PROJECT_ROOT, ...segments);
}

/**
 * Common path configuration for RIE-IEPR tools
 */
export const PATHS = {
  ontology: resolveProjectPath(
    'src/main/resources/be/vlaanderen/omgeving/riepr/data/ns/riepr/riepr.ttl'
  ),
  rules: resolveProjectPath(
    'src/main/resources/be/vlaanderen/omgeving/riepr/data/id/rule/domain-range-subproperty.n3'
  ),
  shapes: resolveProjectPath('src/main/resources/generated-shapes.ttl'),
  dataModels: {
    er: resolveProjectPath('documentatie/datamodel/ER-generated.mmd'),
    class: resolveProjectPath('documentatie/datamodel/Class-generated.mmd'),
    sql: resolveProjectPath('documentatie/datamodel/schema-generated.sql')
  },
  visualization: {
    activity: resolveProjectPath('documentatie/visualization/activity-generated.mmd')
  }
};
