import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  establishSession: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock('@findeg/backend/features/identity', () => ({
  RegisterInputSchema: {
    safeParse: (value: unknown) => {
      if (
        !value ||
        typeof value !== 'object' ||
        typeof (value as { email?: unknown }).email !== 'string' ||
        typeof (value as { password?: unknown }).password !== 'string'
      ) {
        return { success: false, error: { issues: [{ message: 'Invalid registration details' }] } };
      }
      return { success: true, data: value };
    },
  },
  createIdentityServices: () => ({
    auth: {
      login: auth.login,
      register: auth.register,
    },
  }),
}));
vi.mock('@lib/session', () => ({
  deleteSession: auth.deleteSession,
  establishSession: auth.establishSession,
}));
vi.mock('@i18n/navigation', () => ({ redirect: vi.fn() }));

describe('Storefront authentication actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    auth.establishSession.mockResolvedValue({ userId: 42, portalRole: 'customer' });
  });

  it('establishes the canonical Current Session after successful login without returning a token', async () => {
    auth.login.mockResolvedValue({
      success: true,
      user: { id: 42, email: 'customer@findeg.test', portalRole: 'customer' },
    });
    const { loginAction } = await import('./actions');

    await expect(loginAction(' customer@findeg.test ', 'correct-password')).resolves.toEqual({
      success: true,
    });

    expect(auth.login).toHaveBeenCalledWith('customer@findeg.test', 'correct-password');
    expect(auth.establishSession).toHaveBeenCalledWith(42);
  });

  it('does not establish a Current Session when login credentials are rejected', async () => {
    auth.login.mockResolvedValue({ success: false, error: 'Invalid credentials' });
    const { loginAction } = await import('./actions');

    await expect(loginAction('customer@findeg.test', 'wrong-password')).resolves.toEqual({
      success: false,
      error: 'Invalid credentials',
    });

    expect(auth.establishSession).not.toHaveBeenCalled();
  });

  it('establishes the canonical Current Session after successful registration', async () => {
    auth.register.mockResolvedValue({
      success: true,
      user: { id: 42, email: 'new@findeg.test', portalRole: 'customer' },
    });
    const { registerAction } = await import('./actions');
    const input = {
      email: 'new@findeg.test',
      password: 'correct-password',
      firstName: 'New',
      lastName: 'Customer',
    };

    await expect(registerAction(input)).resolves.toEqual({ success: true });

    expect(auth.register).toHaveBeenCalledWith(input);
    expect(auth.establishSession).toHaveBeenCalledWith(42);
  });

  it('rejects malformed registration data before calling the identity service', async () => {
    const { registerAction } = await import('./actions');

    await expect(registerAction({ email: 'not-an-email' } as never)).resolves.toEqual({
      success: false,
      error: 'Invalid registration details',
    });

    expect(auth.register).not.toHaveBeenCalled();
  });
});
