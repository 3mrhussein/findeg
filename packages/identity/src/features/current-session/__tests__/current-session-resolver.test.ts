import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userQueries } from '@findeg/db/queries';
import { CurrentSessionIdentityResolver } from '../helpers';

vi.mock('@findeg/db/queries', () => ({
  userQueries: { getById: vi.fn(), getAuthorizationContext: vi.fn() },
}));

const user = {
  id: 4,
  email: 'staff@example.com',
  firstName: null,
  lastName: 'Ali',
  portalRole: 'staff' as const,
  isActive: true,
  authorizationVersion: 6,
};

describe('CurrentSessionIdentityResolver', () => {
  let resolver: CurrentSessionIdentityResolver;

  beforeEach(() => {
    vi.clearAllMocks();
    resolver = new CurrentSessionIdentityResolver();
  });

  it('resolves the active identity with its authorization version', async () => {
    vi.mocked(userQueries.getById).mockResolvedValue(user as never);
    vi.mocked(userQueries.getAuthorizationContext).mockResolvedValue({
      activeRoleIds: ['catalog_manager'],
      permissionCodes: ['catalog.write'],
    } as never);

    const identity = await resolver.resolve(4);

    expect(identity?.authorizationVersion).toBe(6);
    expect(identity?.session).toMatchObject({
      userId: 4,
      portalRole: 'staff',
      activeRoleIds: ['catalog_manager'],
      tokenVersion: 6,
    });
  });

  it('returns null when the user is missing or inactive', async () => {
    vi.mocked(userQueries.getById).mockResolvedValueOnce(undefined as never);
    expect(await resolver.resolve(4)).toBeNull();

    vi.mocked(userQueries.getById).mockResolvedValueOnce({ ...user, isActive: false } as never);
    expect(await resolver.resolve(4)).toBeNull();
    expect(userQueries.getAuthorizationContext).not.toHaveBeenCalled();
  });
});
