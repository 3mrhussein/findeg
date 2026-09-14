import { getWebRuntime } from '../../../../../../../server/runtime';
import { partnerId, partnerResponse } from '../../../../../../../server/partner-api';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../../../server/session';

export async function POST(request: Request, context: { params: Promise<{ partnerId: string }> }) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const selected = partnerId((await context.params).partnerId);
  const input = await request.json().catch(() => null);
  if (!selected || !input || typeof input !== 'object') return errorResponse('invalid-input', 400);
  const token = await sessionToken();
  if (input.action === 'verify-bank-account') {
    const { action: _action, ...verification } = input;
    return partnerResponse(
      await getWebRuntime().partnerRewards.verifyBankAccount(token, selected, verification),
      201,
    );
  }
  return partnerResponse(await getWebRuntime().partnerRewards.correct(token, selected, input), 201);
}
