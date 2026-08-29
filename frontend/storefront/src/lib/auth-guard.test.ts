import { beforeEach, describe, expect, it, vi } from 'vitest';

const guard = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn(),
  getActivePortal: vi.fn(),
  redirectToActivePortalHome: vi.fn(),
}));

vi.mock('@data/auth/queries', () => ({ getRequestSession: guard.getSession }));
vi.mock('@i18n/navigation', () => ({ redirect: guard.redirect }));
vi.mock('@findeg/backend/features/core', () => ({
  adminSession: vi.fn(() => true),
}));
vi.mock('@lib/portal-routing', () => ({
  STOREFRONT_PORTAL: 'storefront',
  getActivePortal: guard.getActivePortal,
  redirectToActivePortalHome: guard.redirectToActivePortalHome,
}));

describe('Storefront authorization guard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    guard.getSession.mockResolvedValue({
      userId: 42,
      portalRole: 'customer',
    });
    guard.getActivePortal.mockReturnValue('storefront');
    guard.redirect.mockImplementation(() => {
      throw new Error('redirect');
    });
    guard.redirectToActivePortalHome.mockImplementation(() => {
      throw new Error('redirect');
    });
  });

  it('allows a Current Session whose Active Portal is Storefront', async () => {
    const { requireAuth } = await import('./auth-guard');

    await expect(requireAuth('en')).resolves.toMatchObject({ userId: 42 });
  });

  it('routes a valid non-Storefront Current Session to its Active Portal home', async () => {
    guard.getActivePortal.mockReturnValue('dashboard');
    const { requireAuth } = await import('./auth-guard');

    await expect(requireAuth('en')).rejects.toThrow('redirect');

    expect(guard.redirectToActivePortalHome).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 42 }),
      'en',
    );
  });
});
