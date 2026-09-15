import { getWebRuntime } from '../../../../../../../server/runtime';
import { partnerId, partnerResponse } from '../../../../../../../server/partner-api';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../../../server/session';
export async function POST(request: Request, context: { params: Promise<{ partnerId: string }> }) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const selected = partnerId((await context.params).partnerId);
  const input = await request.json().catch(() => null);
  if (!selected || !input || !['active', 'suspended', 'closed'].includes(input.status))
    return errorResponse('invalid-input', 400);
  return partnerResponse(
    await getWebRuntime().partners.changePartnerStatus(
      await sessionToken(),
      selected,
      input.status,
    ),
  );
}
