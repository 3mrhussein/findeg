import { describe, expect, it } from 'vitest';
import { DomainError } from '@findeg/domain';

class ListLockedError extends DomainError<'LIST_LOCKED'> {
  constructor() {
    super('LIST_LOCKED', 'The list is locked');
  }
}

describe('DomainError', () => {
  it('carries a stable code and a message', () => {
    const error = new ListLockedError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(ListLockedError);
    expect(error.code).toBe('LIST_LOCKED');
    expect(error.message).toBe('The list is locked');
    expect(error.name).toBe('ListLockedError');
  });

  it('has no HTTP semantics: the application layer decides how to present it', () => {
    const error = new ListLockedError();
    expect(error).not.toHaveProperty('statusCode');
    expect(error).not.toHaveProperty('metadata');
    expect('getStatusCode' in error).toBe(false);
    expect('getClientMessage' in error).toBe(false);
  });
});
