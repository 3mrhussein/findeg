import { describe, expect, it } from 'vitest';
import { backendOnlyDatabase, setEnvironment, useIsolatedEnvironment } from './helpers';

describe('database environment', () => {
  useIsolatedEnvironment();

  it('loads with only DATABASE_URL and does not require backend or web settings', async () => {
    setEnvironment({ DATABASE_URL: backendOnlyDatabase });

    const { env } = await import('../database');

    expect(env.DATABASE_URL).toBe(backendOnlyDatabase);
    expect(env.NODE_ENV).toBe('development');
  });

  it('reports a missing DATABASE_URL by name', async () => {
    setEnvironment({});

    await expect(import('../database')).rejects.toThrow(/DATABASE_URL/);
  });

  it('parses DB_PORT as a number and leaves unset optional settings undefined', async () => {
    setEnvironment({ DATABASE_URL: backendOnlyDatabase, DB_PORT: '6543' });

    const { env } = await import('../database');

    expect(env.DB_PORT).toBe(6543);
    expect(env.DB_HOST).toBeUndefined();
    expect(env.DB_SSL).toBeUndefined();
  });

  it.each([
    ['false', false],
    ['true', true],
  ])('reads DB_SSL=%s as %s', async (raw, expected) => {
    setEnvironment({ DATABASE_URL: backendOnlyDatabase, DB_SSL: raw });

    const { env } = await import('../database');

    expect(env.DB_SSL).toBe(expected);
  });
});

describe('database DB_SSL coercion beyond true and false', () => {
  useIsolatedEnvironment();

  it('passes other values through boolean coercion', async () => {
    setEnvironment({ DATABASE_URL: backendOnlyDatabase, DB_SSL: 'yes' });

    const { env } = await import('../database');

    expect(env.DB_SSL).toBe(true);
  });
});
