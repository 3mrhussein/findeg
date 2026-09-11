import { enterPortal } from '@findeg/backend/portal-entry';
import { readWebConfig } from './config.js';

export function createWebRuntime(environment: Readonly<Record<string, string | undefined>>) {
  const config = readWebConfig(environment);
  return {
    enterPortal,
    health: () => ({ process: 'web', revision: config.RELEASE_REVISION, status: 'alive' }),
  };
}
