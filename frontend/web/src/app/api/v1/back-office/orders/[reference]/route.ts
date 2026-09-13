import { getWebRuntime } from '../../../../../../server/runtime';
import { errorResponse, sameOrigin, sessionToken } from '../../../../../../server/session';

function response(result: { status: string }) {
  const errors: Record<string, number> = {
    'authentication-required': 401,
    'authorization-denied': 403,
    'invalid-input': 400,
    'not-found': 404,
    'idempotency-conflict': 409,
    'already-delivered': 409,
    'already-paid': 409,
    'delivery-required': 409,
    'amount-mismatch': 409,
    'reservation-unavailable': 409,
  };
  const status = errors[result.status];
  return status
    ? errorResponse(result.status, status)
    : Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
export async function GET(_request: Request, context: { params: Promise<{ reference: string }> }) {
  return response(
    await getWebRuntime().orderLifecycle.read(
      await sessionToken(),
      (await context.params).reference,
    ),
  );
}
export async function POST(request: Request, context: { params: Promise<{ reference: string }> }) {
  if (!sameOrigin(request)) return errorResponse('origin-denied', 403);
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== 'object') return errorResponse('invalid-input', 400);
  const { action, ...value } = input;
  const reference = (await context.params).reference;
  const token = await sessionToken();
  if (action === 'deliver')
    return response(await getWebRuntime().orderLifecycle.deliver(token, reference, value));
  if (action === 'pay')
    return response(await getWebRuntime().orderLifecycle.pay(token, reference, value));
  return errorResponse('invalid-input', 400);
}
