import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain';
import { InventoryError } from '@findeg/domain';

describe('InventoryError', () => {
  it('is a DomainError that carries its rule code and message', () => {
    const error = new InventoryError('INVALID_QUANTITY', 'A stock line holds 1 to 999 units');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('INVALID_QUANTITY');
    expect(error.message).toBe('A stock line holds 1 to 999 units');
  });
});
