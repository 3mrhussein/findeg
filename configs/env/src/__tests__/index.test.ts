import { describe, expect, it } from 'vitest';
import { backendOnlyDatabase, publicUrls, setEnvironment, useIsolatedEnvironment } from './helpers';

describe('package entry', () => {
  useIsolatedEnvironment();

  it('default export is the backend environment', async () => {
    setEnvironment({ DATABASE_URL: backendOnlyDatabase, ...publicUrls });

    const entry = await import('../index');
    const backend = await import('../backend');

    expect(entry.default).toBe(backend.default);
    expect(entry.default.DATABASE_URL).toBe(backendOnlyDatabase);
  });
});
