import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../helpers';
import { userQueries } from '@findeg/db/queries';

vi.mock('@findeg/db/queries', () => ({
  userQueries: {
    update: vi.fn(),
    getById: vi.fn(),
  },
  listAdminUserIdsRaw: vi.fn(),
  getAdminUsersSnapshotRaw: vi.fn(),
  createAdminUserRaw: vi.fn(),
  updateAdminUserRaw: vi.fn(),
  setAdminPermissionOverridesRaw: vi.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  const mockUpdate = vi.mocked(userQueries.update);

  beforeEach(() => {
    userService = new UserService();
    mockUpdate.mockReset();
  });

  describe('updateProfile', () => {
    it('calls userQueries.update with name and phone', async () => {
      mockUpdate.mockResolvedValue(undefined as never);

      await userService.updateProfile(42, {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+201012345678',
      });

      expect(mockUpdate).toHaveBeenCalledWith(42, {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+201012345678',
      });
    });
  });
});
