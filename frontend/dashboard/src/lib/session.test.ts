import { beforeEach, describe, expect, it, vi } from 'vitest';

const currentSession = vi.hoisted(() => ({
  create: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: currentSession.cookies }));
vi.mock('@findeg/backend/features/core', () => ({
  createCurrentSessionProvider: currentSession.create,
}));
vi.mock('@findeg/backend/features/identity', () => ({
  CurrentSessionIdentityResolver: class CurrentSessionIdentityResolver {},
}));

describe('Dashboard Current Session adapter', () => {
  const staffSession = {
    userId: 42,
    portalRole: 'staff',
    user: { email: 'staff@findeg.test', fullName: 'Staff User' },
  };
  const cookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };
  const provider = {
    getSession: vi.fn(),
    establishSession: vi.fn(),
    deleteSession: vi.fn(),
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    currentSession.cookies.mockResolvedValue(cookieStore);
    currentSession.create.mockReturnValue(provider);
  });

  it('resolves the shared Current Session for the active request', async () => {
    provider.getSession.mockResolvedValue(staffSession);
    const { getSession } = await import('./session');

    await expect(getSession()).resolves.toEqual(staffSession);
  });

  it('establishes the shared Current Session from the authenticated User', async () => {
    provider.establishSession.mockResolvedValue(staffSession);
    const { establishSession } = await import('./session');

    await expect(establishSession(42)).resolves.toEqual(staffSession);
  });

  it('returns refreshed grants from the shared Current Session', async () => {
    const refreshedSession = { ...staffSession, permissionCodes: ['catalog.write'], tokenVersion: 2 };
    provider.getSession.mockResolvedValue(refreshedSession);
    const { getSession } = await import('./session');

    await expect(getSession()).resolves.toEqual(refreshedSession);
  });

  it('returns unauthenticated after the shared Current Session invalidates the cookie', async () => {
    provider.getSession.mockImplementation(async () => {
      cookieStore.delete('admin_session');
      return null;
    });
    const { getSession } = await import('./session');

    await expect(getSession()).resolves.toBeNull();

    expect(cookieStore.delete).toHaveBeenCalledWith('admin_session');
  });
});
