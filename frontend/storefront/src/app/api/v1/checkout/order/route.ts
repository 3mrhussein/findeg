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

  const checkoutService = createCheckoutService();
  const result = await checkoutService.accept(body, { userId });

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: result.status });
  }

  return Response.json({ success: true, data: result.data }, { status: result.status });
}
