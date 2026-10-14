import { describe, expect, it } from 'vitest';
import { backendOnlyDatabase, publicUrls, setEnvironment, useIsolatedEnvironment } from './helpers';

describe('backend environment', () => {
  useIsolatedEnvironment();

  it('loads with only the settings every backend process needs', async () => {
    setEnvironment({ DATABASE_URL: backendOnlyDatabase, ...publicUrls });

    const { env } = await import('../backend');

    expect(env.DATABASE_URL).toBe(backendOnlyDatabase);
    expect(env.NODE_ENV).toBe('development');
    expect(env.EMAIL_FROM).toBe('no-reply@findeg.com');
    expect(env.EMAIL_FROM_NAME).toBe('Findeg');
    expect(env.JWT_SECRET).toBeUndefined();
  });

  it('reports the missing required setting by name', async () => {
    setEnvironment({ ...publicUrls });

    await expect(import('../backend')).rejects.toThrow(/DATABASE_URL/);
  });

  it('rejects a public URL that is not a URL', async () => {
    setEnvironment({
      DATABASE_URL: backendOnlyDatabase,
      NEXT_PUBLIC_APP_URL: 'not-a-url',
      NEXT_PUBLIC_SITE_URL: publicUrls.NEXT_PUBLIC_SITE_URL,
    });

    await expect(import('../backend')).rejects.toThrow(/NEXT_PUBLIC_APP_URL/);
  });

  it('rejects an optional secret that is present but too short', async () => {
    setEnvironment({
      DATABASE_URL: backendOnlyDatabase,
      ...publicUrls,
      JWT_SECRET: 'too-short',
    });

    await expect(import('../backend')).rejects.toThrow(/JWT_SECRET/);
  });

  it('accepts optional secrets at their minimum length', async () => {
    setEnvironment({
      DATABASE_URL: backendOnlyDatabase,
      ...publicUrls,
      JWT_SECRET: 'j'.repeat(32),
    });

    const { env } = await import('../backend');

    expect(env.JWT_SECRET).toBe('j'.repeat(32));
  });
});
