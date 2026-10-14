import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain';
import { OrderError } from '@findeg/domain';

describe('OrderError', () => {
  it('is a DomainError that carries its rule code and message', () => {
    const error = new OrderError('EMPTY_ORDER', 'An Order needs at least one line');

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('EMPTY_ORDER');
    expect(error.message).toBe('An Order needs at least one line');
  });
});
