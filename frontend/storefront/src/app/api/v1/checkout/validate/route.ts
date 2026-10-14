import { createCheckoutService } from '@findeg/orders';
import { enqueue } from '@findeg/backend/features/outbox';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const checkoutService = createCheckoutService({ enqueue });
  const result = await checkoutService.validate(body);

  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: result.status });
  }

  return Response.json({ success: true, data: result.data }, { status: 200 });
}
