import { beforeEach, describe, expect, it, vi } from 'vitest';

const guard = vi.hoisted(() => ({
  deleteSession: vi.fn(),
  getSession: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@lib/session', () => ({
  deleteSession: guard.deleteSession,
  getSession: guard.getSession,
}));
vi.mock('@i18n/navigation', () => ({ redirect: guard.redirect }));
vi.mock('@findeg/backend/features/core', () => ({ adminSession: () => true }));

describe('Dashboard authorization guard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    guard.getSession.mockResolvedValue({
      userId: 42,
      portalRole: 'staff',
      user: { email: 'staff@findeg.test', fullName: 'Staff User' },
      permissionCodes: [],
    });
    guard.redirect.mockImplementation(() => {
      throw new Error('redirect');
    });
  });

  it('redirects a denied operation without invalidating the Current Session', async () => {
    const { requirePermission } = await import('./auth-guard');

    await expect(requirePermission('en', { permission: 'catalog.write' })).rejects.toThrow('redirect');

    expect(guard.deleteSession).not.toHaveBeenCalled();
  });

  it('redirects protected routes when no Current Session exists', async () => {
    guard.getSession.mockResolvedValue(null);
    const { requireAdmin } = await import('./auth-guard');

    await expect(requireAdmin('en')).rejects.toThrow('redirect');
  });
});
