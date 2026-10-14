import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, vi } from 'vitest';

export const backendOnlyDatabase = 'postgres://user:pass@localhost:5432/findeg';
export const publicUrls = {
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3001',
};

/**
 * Isolates each test from the developer's real environment: process.env is replaced
 * with the given values, and the working directory points at an empty folder so
 * `loadEnv()` finds no `.env` file to merge in.
 */
export function useIsolatedEnvironment() {
  const original = process.env;
  const emptyDirectory = mkdtempSync(join(tmpdir(), 'findeg-env-test-'));

  beforeEach(() => {
    vi.resetModules();
    vi.spyOn(process, 'cwd').mockReturnValue(emptyDirectory);
    process.env = {};
  });

  afterEach(() => {
    process.env = original;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
}

export function setEnvironment(values: Record<string, string>) {
  process.env = { ...values };
}
