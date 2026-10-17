import { z } from 'zod';
import { createIdentityServices } from '@findeg/identity';
import { createSession } from '@lib/session';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { success: false, error: { code: 'INVALID_INPUT' } },
      { status: 400 },
    );
  }

  const result = await createIdentityServices().auth.login(
    parsed.data.email.trim().toLowerCase(),
    parsed.data.password,
  );
  if (!result.success || !result.session) {
    return Response.json(
      { success: false, error: { code: 'LOGIN_FAILED' } },
      { status: 401 },
    );
  }
  await createSession(result.session);
  return Response.json({ success: true, data: { user: result.user } });
}
