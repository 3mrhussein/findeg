import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWebRuntime } from './runtime';
import type { Portal } from '@findeg/runtime';

export const sessionCookie = 'findeg_session';
export async function sessionToken() {
  return (await cookies()).get(sessionCookie)?.value;
}
export async function setSessionCookie(token: string, expires: Date) {
  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });
}
export async function requirePortal(portal: Portal, locale: string) {
  const result = await getWebRuntime().currentSession(await sessionToken(), portal);
  if (result.status === 'authentication-required') redirect(`/${locale}/${portal}/sign-in`);
  return result;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    // Next's internal request URL can use the listening hostname. Match the incoming Host.
    return (
      parsed.origin === origin &&
      parsed.host === request.headers.get('host') &&
      parsed.protocol === new URL(request.url).protocol
    );
  } catch {
    return false;
  }
}
export function errorResponse(errorCode: string, status: number) {
  return Response.json(
    { errorCode, message: errorCode },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

/** Both web transports use the same browser credential replacement sequence. */
export async function signInBrowserSession(email: string, password: string) {
  const runtime = getWebRuntime();
  const result = await runtime.signIn(email, password);
  if (result.status === 'authenticated') {
    await runtime.signOut(await sessionToken());
    await setSessionCookie(result.token, result.expiresAt);
  }
  return result.status;
}
