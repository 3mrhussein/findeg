import { beforeEach, describe, expect, it, vi } from 'vitest';

const access = vi.hoisted(() => ({
  createRole: vi.fn(),
  getSession: vi.fn(),
  permissionService: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@findeg/backend/features/core', () => ({
  adminSession: () => true,
  PERMISSION_CODES: {
    ADMIN_ROLES_WRITE: 'admin.roles.write',
    ADMIN_USERS_WRITE: 'admin.users.write',
  },
}));
vi.mock('@findeg/backend/features/identity', () => ({
  createIdentityServices: () => ({
    adminRoles: { createRole: access.createRole },
    adminUsers: {},
    permissions: {
      hasPermission: access.permissionService,
    },
  }),
}));
vi.mock('@lib/session', () => ({ getSession: access.getSession }));
vi.mock('@lib/type-guards', () => ({
  getErrorMessage: (error: unknown) => (error instanceof Error ? error.message : 'Unknown error'),
}));
vi.mock('next/cache', () => ({ revalidateTag: access.revalidateTag }));

describe('Dashboard access actions', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('rejects a role mutation without a Current Session permission', async () => {
    access.getSession.mockResolvedValue(null);
    const { createRoleAction } = await import('./actions');

    await expect(createRoleAction('catalog_editor', 'Catalog editor', [])).resolves.toEqual({
      success: false,
      error: 'Forbidden: Missing permission admin.roles.write',
    });

    expect(access.createRole).not.toHaveBeenCalled();
  });

  it('rejects a role mutation when the permission service denies it', async () => {
    access.getSession.mockResolvedValue({ userId: 42 });
    access.permissionService.mockResolvedValue(false);
    const { createRoleAction } = await import('./actions');

    await expect(createRoleAction('catalog_editor', 'Catalog editor', [])).resolves.toEqual({
      success: false,
      error: 'Forbidden: Missing permission admin.roles.write',
    });

    expect(access.permissionService).toHaveBeenCalledWith(42, 'admin.roles.write');
    expect(access.createRole).not.toHaveBeenCalled();
  });
});
