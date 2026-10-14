import type { SessionPayload } from '@findeg/identity';

/** Cryptographic and cookie-policy boundary required by Current Session. */
export interface ICurrentSessionCodec {
  createToken(payload: SessionPayload): Promise<string>;
  validateSession(request: Request): Promise<SessionPayload | null>;
  getCookieSettings(): {
    name: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax' | 'strict' | 'none';
      maxAge: number;
      path: string;
    };
  };
}
