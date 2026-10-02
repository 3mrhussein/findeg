import { z } from 'zod';
import { createIdentityServices } from '@findeg/backend/features/identity';
import { createSession } from '@lib/session';

const registrationSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { message: 'Invalid registration details.' } },
      { status: 400 },
    );
  }

  const result = await createIdentityServices().auth.register({
    ...parsed.data,
    email: parsed.data.email.trim().toLowerCase(),
  });
  if (!result.success || !result.session) {
    return Response.json(
      { success: false, error: { message: result.error ?? 'Unable to register.' } },
      { status: 409 },
    );
  }
  await createSession(result.session);
  return Response.json({ success: true, data: { user: result.user } }, { status: 201 });
}
