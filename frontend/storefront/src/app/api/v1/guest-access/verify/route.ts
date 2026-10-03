import { cookies } from 'next/headers';
import {
  GUEST_ORDER_COOKIE,
  createGuestAccessService,
} from '@findeg/backend/features/guest-access';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = await createGuestAccessService().verify(body);

  if (!result.success) {
    const invalidInput = result.reason === 'invalid-input';
    return Response.json(
      {
        success: false,
        error: { message: invalidInput ? 'Invalid request' : 'Invalid or expired code' },
      },
      { status: invalidInput ? 400 : 401 },
    );
  }

  // Scoped to one Order: the token names the reference it unlocks.
  (await cookies()).set(GUEST_ORDER_COOKIE, result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: result.maxAgeSeconds,
  });

  return Response.json({ success: true, data: { orderReference: result.orderReference } });
}
