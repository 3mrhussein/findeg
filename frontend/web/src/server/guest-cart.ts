import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

const cookieName = 'findeg_guest_cart';

export function guestCartOwner(request: Request) {
  const cookies =
    request.headers
      .get('cookie')
      ?.split(';')
      .map((part) => part.trim()) ?? [];
  const existing = cookies
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  const valid = existing !== undefined && /^[a-f0-9]{64}$/.test(existing);
  const token = valid ? existing : randomBytes(32).toString('hex');
  return {
    digest: createHash('sha256').update(token).digest('hex'),
    setCookie: valid
      ? undefined
      : `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000`,
  };
}

export function withGuestCookie(response: Response, setCookie: string | undefined) {
  response.headers.set('Cache-Control', 'no-store');
  if (setCookie) response.headers.set('Set-Cookie', setCookie);
  return response;
}
