import type { SessionPayload } from '@findeg/backend/features/core/domain/auth';
import type { ISessionProvider } from '@findeg/backend/features/core/application/interfaces/ISessionProvider';
import { type ICookieStore } from '../../application/services/CurrentSessionProvider';
import { JwtSessionManager } from './JwtSessionManager';

export type { ICookieStore } from '../../application/services/CurrentSessionProvider';

/**
 * @deprecated Use CurrentSessionProvider with a resolver that loads the current identity.
 * Kept only while portal adapters migrate; it is unrelated to the legacy access/refresh tokens.
 */
export class CookieSessionProvider implements ISessionProvider {
  private readonly sessionManager = new JwtSessionManager();

  constructor(private readonly cookieStore: ICookieStore) {}

  async createSession(payload: SessionPayload): Promise<void> {
    const token = await this.sessionManager.createToken(payload);
    const { name, options } = this.sessionManager.getCookieSettings();
    this.cookieStore.set(name, token, options);
  }

  async getSession(): Promise<SessionPayload | null> {
    const { name } = this.sessionManager.getCookieSettings();
    const token = this.cookieStore.get(name)?.value;
    if (!token) return null;

    return this.sessionManager.validateSession(
      new Request('http://localhost', { headers: { Cookie: `${name}=${token}` } }),
    );
  }

  async deleteSession(): Promise<void> {
    const { name } = this.sessionManager.getCookieSettings();
    this.cookieStore.delete(name);
  }
}
