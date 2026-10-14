import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveServerUrl } from '../server';

// Keep the developer's repo-root .env out of these tests.
vi.mock('node:process', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:process')>()),
  loadEnvFile: vi.fn(),
}));

const keys = [
  'INTEGRATION_DATABASE_URL',
  'DATABASE_URL',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
] as const;

describe('resolveServerUrl', () => {
  const saved: Partial<Record<(typeof keys)[number], string>> = {};

  beforeEach(() => {
    for (const key of keys) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it('prefers INTEGRATION_DATABASE_URL', () => {
    process.env.INTEGRATION_DATABASE_URL = 'postgres://ci@db:5432/ci';
    process.env.DB_USER = 'dev';
    process.env.DB_NAME = 'dev';
    process.env.DATABASE_URL = 'postgres://app@localhost:5432/app';
    expect(resolveServerUrl()).toBe('postgres://ci@db:5432/ci');
  });

  it('prefers DB_* over DATABASE_URL', () => {
    process.env.DB_USER = 'dev';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_NAME = 'findeg';
    process.env.DATABASE_URL = 'postgres://app@localhost:5432/app';
    expect(resolveServerUrl()).toBe('postgres://dev:secret@localhost:5432/findeg');
  });

  it('falls back to DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgres://app@localhost:5432/app';
    expect(resolveServerUrl()).toBe('postgres://app@localhost:5432/app');
  });

  it('throws when no Postgres is configured', () => {
    expect(() => resolveServerUrl()).toThrow(/DATABASE_URL/);
  });
});
