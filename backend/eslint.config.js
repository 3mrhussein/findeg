import { readFileSync } from 'node:fs';
import { backend } from '@findeg/config/eslint/backend';
import { featureImportConfigs } from './feature-import-policy.mjs';
const allowlist = JSON.parse(
  readFileSync(new URL('./feature-import-allowlist.json', import.meta.url), 'utf8'),
);
export default [...backend, ...featureImportConfigs(allowlist)];
