import { after } from 'next/server';
import { createCheckoutService } from '@findeg/backend/features/checkout';
import { createLogger } from '@findeg/backend/features/core';
import { drainOutbox } from '@findeg/backend/features/outbox';
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

  // Length validation of both headers lives in the checkout service.
  const idempotencyKey = request.headers.get('idempotency-key') || undefined;
  const guestId = request.headers.get('x-guest-id') || undefined;

  const checkoutService = createCheckoutService();
  const result = await checkoutService.accept(body, {
    userId,
    guestId,
    idempotencyKey,
  });

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: result.status });
  }

  // Deliver the confirmation email once the response is sent; the sweeper retries on failure.
  after(() =>
    drainOutbox().catch((err) => {
      createLogger().error('Outbox drain failed', {
        feature: 'checkout',
        error: err instanceof Error ? err.message : String(err),
      });
    }),
  );

  return Response.json({ success: true, data: result.data }, { status: result.status });
}
