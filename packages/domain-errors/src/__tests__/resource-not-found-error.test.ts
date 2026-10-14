import { describe, expect, it } from 'vitest';
import { DomainError, ResourceNotFoundError } from '../index';

describe('ResourceNotFoundError', () => {
  it('is a DomainError that reports a 404 with its resource and identifier', () => {
    const error = new ResourceNotFoundError('Product', 42);

    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('RESOURCE_NOT_FOUND');
    expect(error.message).toBe('Product with identifier "42" not found');
    expect(error.resourceType).toBe('Product');
    expect(error.identifier).toBe(42);
    expect(error.getStatusCode()).toBe(404);
    expect(error.metadata).toEqual({ statusCode: 404, resourceType: 'Product', identifier: 42 });
  });

  it('returns a generic client message that does not reveal the identifier', () => {
    expect(new ResourceNotFoundError('User', 'abc').getClientMessage()).toBe(
      'The requested resource could not be found.',
    );
  });
});
