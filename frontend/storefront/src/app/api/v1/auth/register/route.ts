import { RegisterInputSchema } from '@findeg/backend/features/identity';
import { createIdentityServices } from '@findeg/backend/features/identity';
import { NextResponse } from 'next/server';
import { establishSession } from '@lib/session';

/** Registers a customer and establishes the HTTP-only Current Session. */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Invalid request body' } }, { status: 400 });
  }

  const input = RegisterInputSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { success: false, error: { message: input.error.issues[0]?.message ?? 'Invalid registration details' } },
      { status: 400 },
    );
  }

  const { auth } = createIdentityServices();
  const result = await auth.register(input.data);
  if (!result.success || !result.user) {
    return NextResponse.json(
      { success: false, error: { message: result.error ?? 'Registration failed' } },
      { status: 400 },
    );
  }

  const session = await establishSession(result.user.id);
  if (!session) {
    return NextResponse.json(
      { success: false, error: { message: 'Account is not active' } },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true });
}
