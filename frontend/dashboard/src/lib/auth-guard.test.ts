import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionPayload } from '@findeg/identity';
import { PERMISSION_CODES } from '@findeg/identity/types';
import { NotAuthorizedError } from '@findeg/domain-errors';

const { getSession, redirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@lib/session', () => ({ getSession }));
vi.mock('@i18n/navigation', () => ({ redirect }));

import { requireStaffAction, requirePermission } from './auth-guard';

function staffSession(permissionCodes: string[], activeRoleIds: string[] = []): SessionPayload {
  return {
    userId: 42,
    user: { id: 42, email: 'staff@example.com' },
    portalRole: 'staff',
    permissionCodes,
    activeRoleIds,
  } as unknown as SessionPayload;
}

function customerSession(permissionCodes: string[] = []): SessionPayload {
  return {
    userId: 99,
    user: { id: 99, email: 'customer@example.com' },
    portalRole: 'customer',
    permissionCodes,
    activeRoleIds: [],
  } as unknown as SessionPayload;
}

describe('requireStaffAction (shared guard for server actions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotAuthorizedError when unauthenticated (no session)', async () => {
    getSession.mockResolvedValue(null);

    await expect(
      requireStaffAction(PERMISSION_CODES.ADMIN_PRODUCTS_WRITE, 'manage products'),
    ).rejects.toThrow(NotAuthorizedError);
  });

  it('throws NotAuthorizedError when authenticated as a customer even with permission', async () => {
    getSession.mockResolvedValue(customerSession([PERMISSION_CODES.ADMIN_PRODUCTS_WRITE]));

    await expect(
      requireStaffAction(PERMISSION_CODES.ADMIN_PRODUCTS_WRITE, 'manage products'),
    ).rejects.toThrow(NotAuthorizedError);
  });

  it('throws NotAuthorizedError when staff lacks the required permission', async () => {
    getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_PRODUCTS_READ]));

    await expect(
      requireStaffAction(PERMISSION_CODES.ADMIN_PRODUCTS_WRITE, 'manage products'),
    ).rejects.toThrow(NotAuthorizedError);
  });

  it('returns the session when staff has the required permission', async () => {
    const session = staffSession([PERMISSION_CODES.ADMIN_PRODUCTS_WRITE]);
    getSession.mockResolvedValue(session);

    const result = await requireStaffAction(
      PERMISSION_CODES.ADMIN_PRODUCTS_WRITE,
      'manage products',
    );
    expect(result).toBe(session);
  });

  it('bypasses permission checks for system_admin role', async () => {
    const session = staffSession([], ['system_admin']);
    getSession.mockResolvedValue(session);

    const result = await requireStaffAction(
      PERMISSION_CODES.ADMIN_PRODUCTS_WRITE,
      'manage products',
    );
    expect(result).toBe(session);
  });

  it('allows access when any of the requested permissions is held', async () => {
    const session = staffSession([PERMISSION_CODES.ADMIN_PRODUCTS_READ]);
    getSession.mockResolvedValue(session);

    const result = await requireStaffAction(
      [PERMISSION_CODES.ADMIN_PRODUCTS_WRITE, PERMISSION_CODES.ADMIN_PRODUCTS_READ],
      'view or manage products',
    );
    expect(result).toBe(session);
  });
});

describe('requirePermission (page guard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to / when staff lacks permission', async () => {
    getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_PRODUCTS_READ]));

    await requirePermission('en', { permission: PERMISSION_CODES.ADMIN_PRODUCTS_WRITE });
    expect(redirect).toHaveBeenCalledWith({ href: '/', locale: 'en' });
  });

  it('allows access without redirect when staff holds the permission', async () => {
    getSession.mockResolvedValue(staffSession([PERMISSION_CODES.ADMIN_PRODUCTS_WRITE]));

    await requirePermission('en', { permission: PERMISSION_CODES.ADMIN_PRODUCTS_WRITE });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('allows system_admin without redirect', async () => {
    getSession.mockResolvedValue(staffSession([], ['system_admin']));

    await requirePermission('en', { permission: PERMISSION_CODES.ADMIN_PRODUCTS_WRITE });
    expect(redirect).not.toHaveBeenCalled();
  });
});
