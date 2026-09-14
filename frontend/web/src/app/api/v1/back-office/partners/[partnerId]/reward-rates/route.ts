import { getWebRuntime } from '../../../../../../../server/runtime';
import { partnerId, partnerResponse } from '../../../../../../../server/partner-api';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../../../server/session';
export async function POST(request: Request, context: { params: Promise<{ partnerId: string }> }) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const id = partnerId((await context.params).partnerId);
  if (!id) return errorResponse('invalid-input', 400);
  const result = await getWebRuntime().rewardRates.configure(
    await sessionToken(),
    id,
    await request.json().catch(() => null),
  );
  if (result.status === 'idempotency-conflict') return errorResponse(result.status, 409);
  return partnerResponse(result, 201);
}
