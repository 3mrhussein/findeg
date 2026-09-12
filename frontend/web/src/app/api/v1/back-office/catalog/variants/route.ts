import { getWebRuntime } from '../../../../../../server/runtime';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../../server/session';

export async function GET(request: Request) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const result = await getWebRuntime().listCatalogVariants(await sessionToken());
  if (typeof result === 'object' && result !== null && 'status' in result) {
    if (result.status === 'authentication-required') return errorResponse(result.status, 401);
    if (result.status === 'authorization-denied') return errorResponse(result.status, 403);
  }
  return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
}

function response(result: { readonly status: string }) {
  switch (result.status) {
    case 'created':
      return Response.json(result, { status: 201, headers: { 'Cache-Control': 'no-store' } });
    case 'updated':
      return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
    case 'authentication-required':
      return errorResponse(result.status, 401);
    case 'authorization-denied':
      return errorResponse(result.status, 403);
    case 'product-not-found':
    case 'not-found':
      return errorResponse(result.status, 404);
    case 'invalid-input':
      return errorResponse(result.status, 400);
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  return response(
    await getWebRuntime().createCatalogVariant(
      await sessionToken(),
      await request.json().catch(() => null),
    ),
  );
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  return response(
    await getWebRuntime().updateCatalogVariant(
      await sessionToken(),
      await request.json().catch(() => null),
    ),
  );
}
