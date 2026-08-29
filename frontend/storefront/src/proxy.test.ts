import { beforeEach, describe, expect, it, vi } from 'vitest';

const proxyDependencies = vi.hoisted(() => ({
  createCurrentSessionProvider: vi.fn(),
  i18n: vi.fn(),
  getActivePortal: vi.fn(),
  getPortalHomeUrl: vi.fn(),
}));

vi.mock('@findeg/backend/features/core', () => ({
  createCurrentSessionProvider: proxyDependencies.createCurrentSessionProvider,
}));
vi.mock('@findeg/backend/features/identity', () => ({
  CurrentSessionIdentityResolver: class CurrentSessionIdentityResolver {},
}));
vi.mock('next-intl/middleware', () => ({ default: () => proxyDependencies.i18n }));
vi.mock('./i18n/routing', () => ({
  routing: { locales: ['en', 'ar'], defaultLocale: 'en' },
}));
vi.mock('@lib/portal-routing', () => ({
  STOREFRONT_PORTAL: 'storefront',
  getActivePortal: proxyDependencies.getActivePortal,
  getPortalHomeUrl: proxyDependencies.getPortalHomeUrl,
}));

describe('Storefront Current Session Proxy', () => {
  const response = { cookies: { delete: vi.fn(), set: vi.fn() } };
  const requestCookies = {
    delete: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  };
  const request = {
    cookies: requestCookies,
    nextUrl: { pathname: '/en' },
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    proxyDependencies.i18n.mockReturnValue(response);
    proxyDependencies.getActivePortal.mockReturnValue('storefront');
    proxyDependencies.getPortalHomeUrl.mockReturnValue('http://localhost:3001/en');
  });

  it('reconciles the Current Session before locale routing', async () => {
    const calls: string[] = [];
    proxyDependencies.createCurrentSessionProvider.mockReturnValue({
      getSession: async () => {
        calls.push('session');
        return null;
      },
    });
    proxyDependencies.i18n.mockImplementation(() => {
      calls.push('i18n');
      return response;
    });
    const { proxy } = await import('./proxy');

    await proxy(request as never);

    expect(calls).toEqual(['session', 'i18n']);
  });

  it('redirects a valid non-Storefront Current Session to its configured home', async () => {
    proxyDependencies.getActivePortal.mockReturnValue('dashboard');
    proxyDependencies.createCurrentSessionProvider.mockReturnValue({
      getSession: async () => ({ userId: 42, activePortal: 'dashboard' }),
    });
    const { proxy } = await import('./proxy');

    const result = await proxy(request as never);

    expect(result.headers.get('location')).toBe('http://localhost:3001/en');
    expect(proxyDependencies.i18n).not.toHaveBeenCalled();
  });
});
