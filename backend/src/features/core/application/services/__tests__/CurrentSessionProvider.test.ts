import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionPayload } from '@findeg/backend/features/core/domain/auth';
import {
  CurrentSessionProvider,
  type ActivePortal,
  type CurrentSessionIdentity,
  type ICookieStore,
  type ICurrentSessionIdentityResolver,
} from '../CurrentSessionProvider';
import { JwtSessionManager } from '../../../infrastructure/auth/JwtSessionManager';

class MemoryCookieStore implements ICookieStore {
  readonly set = vi.fn((name: string, value: string, options?: Parameters<ICookieStore['set']>[2]) => {
    this.cookies.set(name, { value, options });
  });
  readonly delete = vi.fn((name: string) => {
    this.cookies.delete(name);
  });
  readonly get = vi.fn((name: string) => this.cookies.get(name));

  private readonly cookies = new Map<
    string,
    { value: string; options?: Parameters<ICookieStore['set']>[2] }
  >();
}

const versionOneSession: SessionPayload = {
  userId: 123,
  portalRole: 'staff',
  user: {
    email: 'admin@test.local',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
  },
  activeRoleIds: ['admin'],
};

function identity(
  version: number,
  session = versionOneSession,
  eligiblePortals: ActivePortal[] = ['dashboard'],
): CurrentSessionIdentity {
  return { authorizationVersion: version, session, eligiblePortals };
}

async function issueCookie(cookieStore: ICookieStore, session: SessionPayload): Promise<void> {
  const codec = new JwtSessionManager();
  const settings = codec.getCookieSettings();
  cookieStore.set(settings.name, await codec.createToken(session), settings.options);
}

describe('CurrentSessionProvider', () => {
  let cookieStore: MemoryCookieStore;
  let identityResolver: ICurrentSessionIdentityResolver;
  let sessionCodec: JwtSessionManager;

  beforeEach(() => {
    cookieStore = new MemoryCookieStore();
    identityResolver = { resolve: vi.fn(async () => identity(1)) };
    sessionCodec = new JwtSessionManager();
  });

  function provider() {
    return new CurrentSessionProvider(cookieStore, identityResolver, sessionCodec);
  }

  it('accepts a valid version-1 browser cookie without renewing it', async () => {
    await issueCookie(cookieStore, versionOneSession);
    cookieStore.set.mockClear();

    const session = await provider().getSession();

    expect(session).toMatchObject(versionOneSession);
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it('establishes a 24-hour Current Session from the active identity', async () => {
    const session = await provider().establishSession(123);

    expect(session).toMatchObject({ ...versionOneSession, tokenVersion: 1 });
    expect(cookieStore.set).toHaveBeenCalledWith(
      'admin_session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24, path: '/' }),
    );
  });

  it('clears a malformed browser cookie and resolves unauthenticated', async () => {
    cookieStore.set('admin_session', 'not-a-jwt');

    await expect(provider().getSession()).resolves.toBeNull();

    expect(cookieStore.delete).toHaveBeenCalledWith('admin_session');
  });

  it('clears an expired browser cookie and resolves unauthenticated', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    try {
      await issueCookie(cookieStore, versionOneSession);
      vi.setSystemTime(new Date('2026-01-02T00:00:01Z'));

      await expect(provider().getSession()).resolves.toBeNull();

      expect(cookieStore.delete).toHaveBeenCalledWith('admin_session');
    } finally {
      vi.useRealTimers();
    }
  });

  it('invalidates the Current Session after a User is deactivated', async () => {
    let currentIdentity: CurrentSessionIdentity | null = identity(1);
    identityResolver = { resolve: vi.fn(async () => currentIdentity) };
    await provider().establishSession(123);
    currentIdentity = null;

    await expect(provider().getSession()).resolves.toBeNull();

    expect(cookieStore.delete).toHaveBeenCalledWith('admin_session');
  });

  it('refreshes grants on the next Current Session resolution after an administrative access change', async () => {
    let currentIdentity = identity(1);
    identityResolver = { resolve: vi.fn(async () => currentIdentity) };
    await provider().establishSession(123);
    const refreshedSession = { ...versionOneSession, permissionCodes: ['catalog.write'] };
    currentIdentity = identity(2, refreshedSession);
    cookieStore.set.mockClear();

    const session = await provider().getSession();

    expect(session).toMatchObject({ ...refreshedSession, tokenVersion: 2 });
    expect(cookieStore.set).toHaveBeenCalledWith(
      'admin_session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24, path: '/' }),
    );
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });

  it('renews when the authoritative authorization context changes even at the same version', async () => {
    await issueCookie(cookieStore, versionOneSession);
    const refreshedSession = { ...versionOneSession, permissionCodes: ['catalog.write'] };
    identityResolver = { resolve: vi.fn(async () => identity(1, refreshedSession)) };

    await expect(provider().getSession()).resolves.toMatchObject(refreshedSession);

    expect(cookieStore.set).toHaveBeenCalledWith(
      'admin_session',
      expect.any(String),
      expect.objectContaining({ maxAge: 60 * 60 * 24 }),
    );
  });

  it('memoizes resolution within one provider instance but not another request', async () => {
    await issueCookie(cookieStore, versionOneSession);
    const request = provider();

    await request.getSession();
    await request.getSession();
    await provider().getSession();

    expect(identityResolver.resolve).toHaveBeenCalledTimes(2);
  });

  it('switches Active Portal by reissuing the Current Session', async () => {
    identityResolver = {
      resolve: vi.fn(async (_userId, activePortal?: ActivePortal) =>
        identity(
          1,
          { ...versionOneSession, activePortal: activePortal ?? 'dashboard' },
          ['storefront', 'dashboard'],
        ),
      ),
    };
    const request = provider();
    await request.establishSession(123);
    cookieStore.set.mockClear();

    await expect(request.switchActivePortal('storefront')).resolves.toMatchObject({
      userId: 123,
      activePortal: 'storefront',
    });

    expect(cookieStore.set).toHaveBeenCalledWith(
      'admin_session',
      expect.any(String),
      expect.objectContaining({ maxAge: 60 * 60 * 24 }),
    );

    await expect(provider().getSession()).resolves.toMatchObject({
      userId: 123,
      activePortal: 'storefront',
    });
  });

  it('preserves a valid Current Session when Active Portal switching is denied', async () => {
    const request = provider();
    await request.establishSession(123);
    cookieStore.set.mockClear();

    await expect(request.switchActivePortal('storefront')).resolves.toMatchObject({
      userId: 123,
      portalRole: 'staff',
    });

    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });

  it('invalidates the Current Session when its User is deactivated during a portal switch', async () => {
    let currentIdentity: CurrentSessionIdentity | null = identity(1);
    identityResolver = { resolve: vi.fn(async () => currentIdentity) };
    const request = provider();
    await request.establishSession(123);
    currentIdentity = null;

    await expect(request.switchActivePortal('storefront')).resolves.toBeNull();

    expect(cookieStore.delete).toHaveBeenCalledWith('admin_session');
  });
});
