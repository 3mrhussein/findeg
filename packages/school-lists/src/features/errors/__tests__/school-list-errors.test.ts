import { describe, expect, it } from 'vitest';
import { SupplyListError } from '@findeg/domain';
import { schoolListFailure } from '../index';

describe('schoolListFailure', () => {
  it('maps a Domain rejection to its public application code', () => {
    expect(
      schoolListFailure(new SupplyListError('NOT_DRAFT', 'A list must be a draft to change')),
    ).toEqual({
      success: false,
      error: 'not-draft',
    });
  });

  it('rethrows technical errors so the transaction rolls back', () => {
    const technical = new Error('connection lost');
    expect(() => schoolListFailure(technical)).toThrow(technical);
  });
});
