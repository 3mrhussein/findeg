import { getWebRuntime } from '../../../../../server/runtime';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../server/session';
import { isStaffRole } from '@findeg/runtime';

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const input: unknown = await request.json().catch(() => null);
  if (
    !input ||
    typeof input !== 'object' ||
    !('userId' in input) ||
    !('roles' in input) ||
    !('isActive' in input) ||
    typeof input.userId !== 'number' ||
    !Array.isArray(input.roles) ||
    !input.roles.every(isStaffRole) ||
    typeof input.isActive !== 'boolean'
  )
    return errorResponse('invalid-input', 400);
  const roles = input.roles.filter(isStaffRole);
  const result = await getWebRuntime().updateStaffAccess(
    await sessionToken(),
    'back-office',
    input.userId,
    roles,
    input.isActive,
  );
  switch (result.status) {
    case 'updated':
      return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
    case 'authentication-required':
      return errorResponse(result.status, 401);
    case 'authorization-denied':
      return errorResponse(result.status, 403);
    case 'not-found':
      return errorResponse(result.status, 404);
    case 'invalid-input':
      return errorResponse(result.status, 400);
  }
}
