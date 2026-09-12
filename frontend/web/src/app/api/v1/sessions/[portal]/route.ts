import { cookies } from 'next/headers';
import { getWebRuntime } from '../../../../../server/runtime';
import { errorResponse, sessionCookie, sessionToken } from '../../../../../server/session';

export async function GET(request: Request, context: { params: Promise<{ portal: string }> }) {
  const { portal } = await context.params;
  if (portal !== 'storefront' && portal !== 'back-office' && portal !== 'partner')
    return errorResponse('not-found', 404);
  const raw = new URL(request.url).searchParams.get('businessPartnerId');
  const selected = raw === null ? undefined : Number(raw);
  if (raw !== null && (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(selected)))
    return errorResponse('invalid-input', 400);
  const result = await getWebRuntime().currentSession(await sessionToken(), portal, selected);
  if (result.status === 'authentication-required') {
    (await cookies()).delete(sessionCookie);
    return errorResponse(result.status, 401);
  }
  if (result.status === 'workspace-selection-required')
    return Response.json(result, { status: 409, headers: { 'Cache-Control': 'no-store' } });
  if (result.status === 'authorization-denied') return errorResponse(result.status, 403);
  return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
