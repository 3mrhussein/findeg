import { createCheckoutService } from '@findeg/backend/features/checkout';
import { getSession } from '@lib/session';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json(
      { success: false, error: { message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  const session = await getSession();
  const userId = session?.userId ? Number(session.userId) : undefined;

  delete body.userId;

  const idempotencyKey =
    request.headers.get('idempotency-key') || request.headers.get('Idempotency-Key') || undefined;
  if (idempotencyKey && idempotencyKey.length > 255) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'invalid-idempotency-key',
          message: 'Idempotency-Key header must not exceed 255 characters',
        },
      },
      { status: 400 },
    );
  }

  const guestId =
    request.headers.get('x-guest-id') || request.headers.get('X-Guest-Id') || undefined;
  if (guestId && guestId.length > 200) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'invalid-guest-id',
          message: 'X-Guest-Id header must not exceed 200 characters',
        },
      },
      { status: 400 },
    );
  }

  const checkoutService = createCheckoutService();
  const result = await checkoutService.accept(body, {
    userId,
    guestId,
    idempotencyKey,
  });

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: result.status });
  }

  return Response.json({ success: true, data: result.data }, { status: result.status });
}
