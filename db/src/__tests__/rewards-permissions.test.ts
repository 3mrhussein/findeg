import { describe, expect, it } from 'vitest';
import permissions from '../../seeds/data/permissions.json';
import rolePermissions from '../../seeds/data/role_permissions.json';
import roles from '../../seeds/data/roles.json';

describe('Partner Rewards seed permissions', () => {
  it('seeds the four permissions on exactly the specified Staff roles', () => {
    const rewardPermissions = permissions.filter(({ code }) => code.startsWith('rewards.'));
    expect(rewardPermissions.map(({ code }) => code).sort()).toEqual([
      'rewards.adjust',
      'rewards.rates.manage',
      'rewards.settle',
      'rewards.view',
    ]);

    const permissionById = new Map(
      permissions.map((permission) => [permission.id, permission.code]),
    );
    const roleById = new Map(roles.map((role) => [role.id, role.code]));
    const assignments = rolePermissions
      .map(({ roleId, permissionId }) => ({
        role: roleById.get(roleId),
        permission: permissionById.get(permissionId),
      }))
      .filter(({ permission }) => permission?.startsWith('rewards.'));

    expect(assignments).toEqual(
      expect.arrayContaining([
        { role: 'system_admin', permission: 'rewards.view' },
        { role: 'system_admin', permission: 'rewards.rates.manage' },
        { role: 'system_admin', permission: 'rewards.adjust' },
        { role: 'system_admin', permission: 'rewards.settle' },
        { role: 'operations_manager', permission: 'rewards.view' },
        { role: 'operations_manager', permission: 'rewards.adjust' },
        { role: 'operations_manager', permission: 'rewards.settle' },
        { role: 'business_analyst', permission: 'rewards.view' },
        { role: 'school_liaison', permission: 'rewards.view' },
      ]),
    );
    expect(assignments).toHaveLength(9);
  });
});
