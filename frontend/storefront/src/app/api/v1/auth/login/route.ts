import { createIdentityServices } from '@findeg/backend/features/identity';
import { NextResponse } from 'next/server';
import { establishSession } from '@lib/session';

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

/** Authenticates a Storefront User and establishes the HTTP-only Current Session. */
export async function POST(request: Request): Promise<NextResponse> {
  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Invalid request body' } }, { status: 400 });
  }

  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json(
      { success: false, error: { message: 'Email and password are required' } },
      { status: 400 },
    );
  }

  const { auth } = createIdentityServices();
  const result = await auth.login(body.email.trim(), body.password);
  if (!result.success || !result.user) {
    return NextResponse.json(
      { success: false, error: { message: result.error ?? 'Invalid credentials' } },
      { status: 401 },
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
