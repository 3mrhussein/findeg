import { describe, expect, it } from 'vitest';
import { PERMISSION_CODES } from '@findeg/db/types';
import { NotAuthorizedError } from '@findeg/domain-errors';
import { assertCanWriteOrders, canWriteOrders } from '../index';

describe('Order write permission', () => {
  it('lets a Staff member with the Orders write permission change Orders', () => {
    const actor = {
      kind: 'staff' as const,
      userId: 7,
      permissionCodes: [PERMISSION_CODES.ADMIN_ORDERS_WRITE],
    };
    expect(canWriteOrders(actor)).toBe(true);
    expect(() => {
      assertCanWriteOrders(actor);
    }).not.toThrow();
  });

  it('lets a system administrator change Orders without an explicit permission', () => {
    expect(canWriteOrders({ kind: 'staff', userId: 1, activeRoleIds: ['system_admin'] })).toBe(
      true,
    );
  });

  it.each([
    ['no actor', undefined],
    ['a non-Staff actor', { kind: 'customer', userId: 1 }],
    ['a non-positive user id', { kind: 'staff', userId: 0 }],
    ['an unsafe user id', { kind: 'staff', userId: 2 ** 60 }],
    ['a Staff member without the permission', { kind: 'staff', userId: 3, permissionCodes: [] }],
  ])('denies %s', (_label, actor) => {
    expect(canWriteOrders(actor as never)).toBe(false);
    expect(() => {
      assertCanWriteOrders(actor as never);
    }).toThrow(NotAuthorizedError);
  });
});
