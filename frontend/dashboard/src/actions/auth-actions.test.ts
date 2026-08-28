import { beforeEach, describe, expect, it, vi } from 'vitest';

const action = vi.hoisted(() => ({
  adminSession: vi.fn(),
  authLogin: vi.fn(),
  deleteSession: vi.fn(),
  establishSession: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@findeg/backend/features/core', () => ({
  adminSession: action.adminSession,
}));
vi.mock('@findeg/backend/features/identity', () => ({
  createIdentityServices: () => ({ auth: { login: action.authLogin } }),
}));
vi.mock('@lib/session', () => ({
  deleteSession: action.deleteSession,
  establishSession: action.establishSession,
}));
vi.mock('@i18n/navigation', () => ({ redirect: action.redirect }));

describe('Dashboard login action', () => {
  const staffSession = {
    userId: 42,
    portalRole: 'staff',
    user: { email: 'staff@findeg.test', fullName: 'Staff User' },
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    action.authLogin.mockResolvedValue({
      success: true,
      user: { id: 42, email: 'staff@findeg.test', portalRole: 'staff' },
    });
    action.establishSession.mockResolvedValue(staffSession);
    action.adminSession.mockReturnValue(true);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    action.redirect.mockImplementation(() => {
      const error = new Error('redirect');
      Object.assign(error, { digest: 'NEXT_REDIRECT' });
      throw error;
    });
  });

  it('establishes the canonical Current Session after staff authentication', async () => {
    const { loginAction } = await import('./auth-actions');
    const formData = new FormData();
    formData.set('email', 'staff@findeg.test');
    formData.set('password', 'correct-password');

    await expect(loginAction(formData)).rejects.toMatchObject({ digest: 'NEXT_REDIRECT' });

    expect(action.establishSession).toHaveBeenCalledWith(42);
  });

  it('preserves the Current Session when Dashboard access is denied', async () => {
    action.adminSession.mockReturnValue(false);
    const { loginAction } = await import('./auth-actions');
    const formData = new FormData();
    formData.set('email', 'staff@findeg.test');
    formData.set('password', 'correct-password');

    await expect(loginAction(formData)).rejects.toThrow('Forbidden');

    expect(action.deleteSession).not.toHaveBeenCalled();
  });
});
