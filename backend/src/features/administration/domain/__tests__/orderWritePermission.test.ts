import { describe, expect, it } from 'vitest';
import { DomainError, NotAuthorizedError } from '@findeg/domain-errors';
import { assertCanWriteOrders } from '../orderWritePermission';

describe('assertCanWriteOrders', () => {
  it('refuses with the shared NotAuthorizedError and the message Dashboard toasts show', () => {
    const refusal = (() => {
      try {
        assertCanWriteOrders({ kind: 'staff', userId: 7, permissionCodes: [] });
      } catch (error) {
        return error;
      }
    })();

    expect(refusal).toBeInstanceOf(NotAuthorizedError);
    expect(refusal).toBeInstanceOf(DomainError);
    expect(refusal).toMatchObject({
      code: 'NOT_AUTHORIZED',
      message: 'Not authorized to change orders',
    });
  });
});
