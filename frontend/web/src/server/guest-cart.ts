import { createHash, randomBytes } from 'node:crypto';

const cookieName = 'findeg_guest_cart';

export function guestCartOwner(request: Request) {
  const cookies = request.headers.get('cookie')?.split(';').map((part) => part.trim()) ?? [];
  const existing = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const token = existing && /^[a-f0-9]{64}$/.test(existing) ? existing : randomBytes(32).toString('hex');
  return {
    digest: createHash('sha256').update(token).digest('hex'),
    setCookie: existing
      ? undefined
      : `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=2592000`,
  };
}

export function withGuestCookie(response: Response, setCookie: string | undefined) {
  if (setCookie) response.headers.set('Set-Cookie', setCookie);
  return response;
}
