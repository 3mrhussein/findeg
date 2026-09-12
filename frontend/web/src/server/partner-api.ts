import 'server-only';
import { isPartnerRole } from '@findeg/runtime';
import { getWebRuntime } from './runtime';
import { errorResponse, sameOrigin, sessionToken } from './session';

export function partnerResponse(result: { status: string }, success = 200) {
  const errors: Record<string, number> = {
    'authentication-required': 401,
    'authorization-denied': 403,
    'invalid-input': 400,
    'not-found': 404,
    'invitation-unavailable': 409,
    'membership-exists': 409,
    'last-administrator': 409,
    'invalid-transition': 409,
    'partner-unavailable': 409,
    'code-unavailable': 409,
  };
  const status = errors[result.status];
  return status
    ? errorResponse(result.status, status)
    : Response.json(result, { status: success, headers: { 'Cache-Control': 'no-store' } });
}
export function partnerId(value: string) {
  const id = Number(value);
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(id) ? id : undefined;
}
export async function accessGet(portal: 'partner' | 'back-office', id: string) {
  const selected = partnerId(id);
  if (!selected) return errorResponse('invalid-input', 400);
  return partnerResponse(
    await getWebRuntime().partners.accessOverview(await sessionToken(), portal, selected),
  );
}
export async function accessPost(request: Request, portal: 'partner' | 'back-office', id: string) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const selected = partnerId(id);
  const input = await request.json().catch(() => null);
  if (!selected || !input || typeof input !== 'object') return errorResponse('invalid-input', 400);
  const runtime = getWebRuntime().partners;
  const token = await sessionToken();
  if (
    input.action === 'invite' &&
    typeof input.email === 'string' &&
    Array.isArray(input.roles) &&
    input.roles.every(isPartnerRole)
  )
    return partnerResponse(
      await runtime.invite(token, portal, selected, { email: input.email, roles: input.roles }),
      201,
    );
  if (input.action === 'revoke' && Number.isSafeInteger(input.invitationId))
    return partnerResponse(
      await runtime.revokeInvitation(token, portal, selected, input.invitationId),
    );
  if (
    input.action === 'membership' &&
    Number.isSafeInteger(input.membershipId) &&
    Array.isArray(input.roles) &&
    input.roles.every(isPartnerRole) &&
    ['active', 'suspended', 'ended'].includes(input.status)
  )
    return partnerResponse(
      await runtime.updateMembership(token, portal, selected, input.membershipId, {
        roles: input.roles,
        status: input.status,
      }),
    );
  return errorResponse('invalid-input', 400);
}
