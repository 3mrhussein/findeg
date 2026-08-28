import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionPayload } from '@findeg/backend/features/core/domain/auth';
import {
  CurrentSessionProvider,
  type CurrentSessionIdentity,
  type ICookieStore,
  type ICurrentSessionIdentityResolver,
} from '../CurrentSessionProvider';
import { CookieSessionProvider } from '../../../infrastructure/auth/CookieSessionProvider';
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

function identity(version: number, session = versionOneSession): CurrentSessionIdentity {
  return { authorizationVersion: version, session };
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
    const issuer = new CookieSessionProvider(cookieStore);
    await issuer.createSession(versionOneSession);
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
      await new CookieSessionProvider(cookieStore).createSession(versionOneSession);
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

  it('memoizes resolution within one provider instance but not another request', async () => {
    await new CookieSessionProvider(cookieStore).createSession(versionOneSession);
    const request = provider();

    await request.getSession();
    await request.getSession();
    await provider().getSession();

    expect(identityResolver.resolve).toHaveBeenCalledTimes(2);
  });
});
