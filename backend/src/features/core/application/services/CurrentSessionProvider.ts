import type { SessionPayload } from '@findeg/backend/features/core/domain/auth';
import {
  defaultActivePortalForRole,
  type ActivePortal,
} from '@findeg/db';
import type { ICurrentSessionCodec } from '../interfaces/ICurrentSessionCodec';

const AUTHORIZATION_VERSION_ONE = 1;

export type { ActivePortal } from '@findeg/db';

/** Framework adapter for request cookies. Portal code owns only this boundary. */
export interface ICookieStore {
  get(name: string): { value: string } | undefined;
  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
      maxAge?: number;
      path?: string;
    },
  ): void;
  delete(name: string): void;
}

/** The currently active identity and authorization context for a User. */
export interface CurrentSessionIdentity {
  authorizationVersion: number;
  session: SessionPayload;
  eligiblePortals: readonly ActivePortal[];
}

/** Returning null means the identity is absent or inactive and requires Session Invalidation. */
export interface ICurrentSessionIdentityResolver {
  resolve(userId: number, activePortal?: ActivePortal): Promise<CurrentSessionIdentity | null>;
}

/**
 * Establishes, resolves, renews, and invalidates the signed browser Current Session.
 * A provider instance belongs to exactly one request, so its memoization never crosses requests.
 */
export class CurrentSessionProvider {
  private resolvedSession?: Promise<SessionPayload | null>;

  constructor(
    private readonly cookieStore: ICookieStore,
    private readonly identityResolver: ICurrentSessionIdentityResolver,
    private readonly sessionCodec: ICurrentSessionCodec,
  ) {}

  /** Establishes a Current Session from the active identity, never a caller-supplied grant snapshot. */
  async establishSession(userId: number): Promise<SessionPayload | null> {
    const identity = await this.identityResolver.resolve(userId);
    if (!identity) return this.invalidate();

    const session = {
      ...this.normalizeSession(identity.session),
      tokenVersion: identity.authorizationVersion,
    };
    await this.issueSession(session);
    return session;
  }

  getSession(): Promise<SessionPayload | null> {
    this.resolvedSession ??= this.resolveCurrentSession();
    return this.resolvedSession;
  }

  async deleteSession(): Promise<void> {
    const { name } = this.sessionCodec.getCookieSettings();
    this.cookieStore.delete(name);
    this.resolvedSession = Promise.resolve(null);
  }

  /**
   * Selects an eligible Active Portal and renews the Current Session.
   * A denied switch preserves the valid Current Session and does not mutate its cookie.
   */
  async switchActivePortal(activePortal: ActivePortal): Promise<SessionPayload | null> {
    const currentSession = await this.getSession();
    if (!currentSession) return null;

    const identity = await this.identityResolver.resolve(currentSession.userId, activePortal);
    if (!identity) return this.invalidate();

    const session = this.normalizeSession(identity.session);
    if (!identity.eligiblePortals.includes(activePortal) || session.activePortal !== activePortal) {
      return currentSession;
    }

    const renewedSession = { ...session, tokenVersion: identity.authorizationVersion };
    await this.issueSession(renewedSession);
    return renewedSession;
  }

  private async resolveCurrentSession(): Promise<SessionPayload | null> {
    const { name } = this.sessionCodec.getCookieSettings();
    const token = this.cookieStore.get(name)?.value;
    if (!token) return null;

    const signedSession = await this.sessionCodec.validateSession(
      new Request('http://localhost', { headers: { Cookie: `${name}=${token}` } }),
    );
    if (!signedSession) return this.invalidate();

    const requestedPortal =
      signedSession.activePortal ?? defaultActivePortalForRole(signedSession.portalRole);
    const identity = await this.identityResolver.resolve(signedSession.userId, requestedPortal);
    if (!identity || identity.session.userId !== signedSession.userId) return this.invalidate();

    const signedAuthorizationVersion = signedSession.tokenVersion ?? AUTHORIZATION_VERSION_ONE;
    const authoritativeSession = this.normalizeSession(identity.session);
    if (
      signedAuthorizationVersion === identity.authorizationVersion &&
      requestedPortal === authoritativeSession.activePortal &&
      this.hasSameAuthorizationContext(signedSession, authoritativeSession)
    ) {
      return { ...signedSession, activePortal: requestedPortal };
    }

    const renewedSession = {
      ...authoritativeSession,
      tokenVersion: identity.authorizationVersion,
    };
    await this.issueSession(renewedSession);
    return renewedSession;
  }

  private async issueSession(payload: SessionPayload): Promise<void> {
    const session = {
      ...this.normalizeSession(payload),
      tokenVersion: payload.tokenVersion ?? AUTHORIZATION_VERSION_ONE,
    };
    const token = await this.sessionCodec.createToken(session);
    const { name, options } = this.sessionCodec.getCookieSettings();
    this.cookieStore.set(name, token, options);
    this.resolvedSession = Promise.resolve(session);
  }

  private normalizeSession(session: SessionPayload): SessionPayload {
    return {
      ...session,
      activePortal: session.activePortal ?? defaultActivePortalForRole(session.portalRole),
    };
  }

  private hasSameAuthorizationContext(
    signedSession: SessionPayload,
    authoritativeSession: SessionPayload,
  ): boolean {
    return (
      signedSession.portalRole === authoritativeSession.portalRole &&
      signedSession.organizationId === authoritativeSession.organizationId &&
      this.hasSameValues(signedSession.activeRoleIds, authoritativeSession.activeRoleIds) &&
      this.hasSameValues(signedSession.permissionCodes, authoritativeSession.permissionCodes)
    );
  }

  private hasSameValues(
    signedValues: readonly string[] | undefined,
    authoritativeValues: readonly string[] | undefined,
  ): boolean {
    const signed = [...new Set(signedValues ?? [])].sort();
    const authoritative = [...new Set(authoritativeValues ?? [])].sort();
    return signed.length === authoritative.length && signed.every((value, index) => value === authoritative[index]);
  }

  private async invalidate(): Promise<null> {
    await this.deleteSession();
    return null;
  }
}
