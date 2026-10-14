import { describe, expect, it, vi } from 'vitest';
import { publicUrls, setEnvironment, useIsolatedEnvironment } from './helpers';

describe('web environment', () => {
  useIsolatedEnvironment();

  it('loads with only the public URLs and does not require database or backend settings', async () => {
    setEnvironment({ ...publicUrls });

    const { env } = await import('../web');

    expect(env.NEXT_PUBLIC_APP_URL).toBe(publicUrls.NEXT_PUBLIC_APP_URL);
    expect(env.NEXT_PUBLIC_SITE_URL).toBe(publicUrls.NEXT_PUBLIC_SITE_URL);
  });

  it('reports a missing public URL by name', async () => {
    setEnvironment({ NEXT_PUBLIC_APP_URL: publicUrls.NEXT_PUBLIC_APP_URL });

    await expect(import('../web')).rejects.toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it('returns the raw process environment in the browser without throwing', async () => {
    vi.stubGlobal('window', {});
    setEnvironment({});

    const { env } = await import('../web');

    expect(env).toBe(process.env);
  });
});
