import { describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';
import { PERMISSION_CODES } from '../../../domain/auth/authorization';
import { JwtSessionManager } from '../JwtSessionManager';

const user = {
  email: 'person@test.local',
  firstName: 'Per',
  lastName: 'Son',
  fullName: 'Per Son',
};

async function requestWithToken(claims: Record<string, unknown>): Promise<Request> {
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));
  return new Request('http://localhost', { headers: { Cookie: `admin_session=${token}` } });
}

describe('JwtSessionManager.validateSession', () => {
  it('accepts a session with a current portal role', async () => {
    const request = await requestWithToken({
      userId: 1,
      portalRole: 'staff',
      user,
      permissionCodes: [PERMISSION_CODES.ADMIN_PORTAL],
    });

    const session = await new JwtSessionManager().validateSession(request);

    expect(session?.portalRole).toBe('staff');
  });

  it('rejects a signed session whose portal role has been retired', async () => {
    const request = await requestWithToken({
      userId: 1,
      portalRole: 'school_staff',
      user,
      permissionCodes: [PERMISSION_CODES.ADMIN_PORTAL],
    });

    const session = await new JwtSessionManager().validateSession(request);

    expect(session).toBeNull();
  });
});
