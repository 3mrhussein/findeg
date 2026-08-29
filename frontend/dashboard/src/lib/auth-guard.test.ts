import { beforeEach, describe, expect, it, vi } from 'vitest';

const guard = vi.hoisted(() => ({
  deleteSession: vi.fn(),
  getSession: vi.fn(),
  redirect: vi.fn(),
  getActivePortal: vi.fn(),
  redirectToActivePortalHome: vi.fn(),
}));

vi.mock('@lib/session', () => ({
  deleteSession: guard.deleteSession,
  getSession: guard.getSession,
}));
vi.mock('@i18n/navigation', () => ({ redirect: guard.redirect }));
vi.mock('@findeg/backend/features/core', () => ({ adminSession: () => true }));
vi.mock('@lib/portal-routing', () => ({
  DASHBOARD_PORTAL: 'dashboard',
  getActivePortal: guard.getActivePortal,
  redirectToActivePortalHome: guard.redirectToActivePortalHome,
}));

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
    guard.getActivePortal.mockReturnValue('dashboard');
    guard.redirect.mockImplementation(() => {
      throw new Error('redirect');
    });
    guard.redirectToActivePortalHome.mockImplementation(() => {
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

  it('routes a valid non-Dashboard Current Session to its Active Portal home', async () => {
    guard.getActivePortal.mockReturnValue('storefront');
    const { requireAdmin } = await import('./auth-guard');

    await expect(requireAdmin('en')).rejects.toThrow('redirect');

    expect(guard.redirectToActivePortalHome).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 42 }),
      'en',
    );
    expect(guard.deleteSession).not.toHaveBeenCalled();
  });
});
