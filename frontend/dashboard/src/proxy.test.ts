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
vi.mock('./i18n/routing', () => ({ routing: { locales: ['en', 'ar'], defaultLocale: 'en' } }));
vi.mock('@lib/portal-routing', () => ({
  DASHBOARD_PORTAL: 'dashboard',
  getActivePortal: proxyDependencies.getActivePortal,
  getPortalHomeUrl: proxyDependencies.getPortalHomeUrl,
}));

describe('Dashboard Current Session Proxy', () => {
  const responseCookies = { delete: vi.fn(), set: vi.fn() };
  const response = { cookies: responseCookies };
  const requestCookies = {
    delete: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  };
  const request = {
    cookies: requestCookies,
    headers: new Headers({ cookie: 'admin_session=stale-token' }),
    nextUrl: { pathname: '/en' },
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    proxyDependencies.i18n.mockReturnValue(response);
    proxyDependencies.getActivePortal.mockReturnValue('dashboard');
    proxyDependencies.getPortalHomeUrl.mockReturnValue('http://localhost:3000/en');
  });

  it('clears an invalid Current Session before protected rendering', async () => {
    proxyDependencies.createCurrentSessionProvider.mockImplementation((cookieStore) => ({
      getSession: async () => {
        cookieStore.delete('admin_session');
        return null;
      },
    }));
    const { proxy } = await import('./proxy');

    await proxy(request as never);

    expect(requestCookies.delete).toHaveBeenCalledWith('admin_session');
    expect(responseCookies.delete).toHaveBeenCalledWith('admin_session');
  });

  it('reissues a refreshed Current Session before protected rendering', async () => {
    proxyDependencies.createCurrentSessionProvider.mockImplementation((cookieStore) => ({
      getSession: async () => {
        cookieStore.set('admin_session', 'renewed-token', {
          httpOnly: true,
          maxAge: 60 * 60 * 24,
          path: '/',
          sameSite: 'lax',
          secure: false,
        });
        return { userId: 42 };
      },
    }));
    const { proxy } = await import('./proxy');

    await proxy(request as never);

    expect(requestCookies.set).toHaveBeenCalledWith('admin_session', 'renewed-token');
    expect(responseCookies.set).toHaveBeenCalledWith(
      'admin_session',
      'renewed-token',
      expect.objectContaining({ httpOnly: true, maxAge: 60 * 60 * 24 }),
    );
  });

  it('reconciles the request before locale routing', async () => {
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

  it('redirects a valid non-Dashboard Current Session to its configured home', async () => {
    proxyDependencies.getActivePortal.mockReturnValue('storefront');
    proxyDependencies.createCurrentSessionProvider.mockReturnValue({
      getSession: async () => ({ userId: 42, activePortal: 'storefront' }),
    });
    const { proxy } = await import('./proxy');

    const result = await proxy(request as never);

    expect(result.headers.get('location')).toBe('http://localhost:3000/en');
    expect(proxyDependencies.i18n).not.toHaveBeenCalled();
  });
});
