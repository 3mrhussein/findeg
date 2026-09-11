import { cookies } from 'next/headers';
import { getWebRuntime } from '../../../../../server/runtime';
import { errorResponse, sessionCookie, sessionToken } from '../../../../../server/session';

export async function GET(_request: Request, context: { params: Promise<{ portal: string }> }) {
  const { portal } = await context.params;
  if (portal !== 'storefront' && portal !== 'back-office' && portal !== 'partner')
    return errorResponse('not-found', 404);
  const result = await getWebRuntime().currentSession(await sessionToken(), portal);
  if (result.status === 'authentication-required') {
    (await cookies()).delete(sessionCookie);
    return errorResponse(result.status, 401);
  }
  if (result.status === 'authorization-denied') return errorResponse(result.status, 403);
  return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
