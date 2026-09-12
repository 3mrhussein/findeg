import { cookies } from 'next/headers';
import { getWebRuntime } from '../../../../server/runtime';
import {
  errorResponse,
  sameOrigin,
  sessionCookie,
  sessionToken,
  signInBrowserSession,
} from '../../../../server/session';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const input: unknown = await request.json().catch(() => null);
  if (
    !input ||
    typeof input !== 'object' ||
    !('email' in input) ||
    !('password' in input) ||
    typeof input.email !== 'string' ||
    typeof input.password !== 'string'
  )
    return errorResponse('invalid-input', 400);
  const status = await signInBrowserSession(input.email, input.password);
  if (status !== 'authenticated') return errorResponse('invalid-credentials', 401);
  return Response.json(
    { status: 'authenticated' },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  );
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  await getWebRuntime().signOut(await sessionToken());
  (await cookies()).delete(sessionCookie);
  return new Response(null, { status: 204 });
}
