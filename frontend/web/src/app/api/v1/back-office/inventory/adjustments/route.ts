import { getWebRuntime } from '../../../../../../server/runtime';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../../server/session';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const result = await getWebRuntime().adjustInventory(
    await sessionToken(),
    await request.json().catch(() => null),
  );
  switch (result.status) {
    case 'adjusted':
      return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
    case 'authentication-required':
      return errorResponse(result.status, 401);
    case 'authorization-denied':
      return errorResponse(result.status, 403);
    case 'variant-not-found':
    case 'not-found':
      return errorResponse(result.status, 404);
    case 'insufficient-stock':
      return errorResponse(result.status, 409);
    case 'invalid-input':
      return errorResponse(result.status, 400);
  }
}
