import { describe, expect, it } from 'vitest';
import { DomainError, NotAuthorizedError } from '../index';

class TestError extends DomainError {
  constructor(metadata?: Record<string, unknown>) {
    super('TEST_CODE', 'Test message', metadata);
  }
}

describe('DomainError', () => {
  it('carries its code, message, metadata and subclass name', () => {
    const error = new TestError({ statusCode: 400, userId: '123' });

    expect(error.code).toBe('TEST_CODE');
    expect(error.message).toBe('Test message');
    expect(error.name).toBe('TestError');
    expect(error.metadata).toEqual({ statusCode: 400, userId: '123' });
  });

  it('reads the status code from metadata and defaults to 500', () => {
    expect(new TestError({ statusCode: 422 }).getStatusCode()).toBe(422);
    expect(new TestError({ statusCode: '422' }).getStatusCode()).toBe(500);
    expect(new TestError().getStatusCode()).toBe(500);
  });

  it('uses its message as the client message unless a subclass overrides it', () => {
    expect(new TestError().getClientMessage()).toBe('Test message');
  });

  it('serializes name, code, message and metadata', () => {
    expect(new TestError({ statusCode: 400 }).toJSON()).toEqual({
      name: 'TestError',
      code: 'TEST_CODE',
      message: 'Test message',
      metadata: { statusCode: 400 },
    });
  });

  it('keeps instanceof identity for subclasses', () => {
    const error = new TestError();

    expect(error).toBeInstanceOf(TestError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('NotAuthorizedError', () => {
  it('is a 403 NOT_AUTHORIZED domain error naming the action and resource', () => {
    const error = new NotAuthorizedError('delete product', 'Product #123');

    expect(error).toBeInstanceOf(NotAuthorizedError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe('NotAuthorizedError');
    expect(error.code).toBe('NOT_AUTHORIZED');
    expect(error.getStatusCode()).toBe(403);
    expect(error.action).toBe('delete product');
    expect(error.resource).toBe('Product #123');
    expect(error.metadata).toEqual({
      statusCode: 403,
      action: 'delete product',
      resource: 'Product #123',
    });
  });

  // Dashboard toasts show `error.message`; keep the wording stable.
  it('keeps the message wording the Dashboard toasts show', () => {
    expect(new NotAuthorizedError('change orders').message).toBe('Not authorized to change orders');
    expect(new NotAuthorizedError('edit', 'Product').message).toBe(
      'Not authorized to edit on Product',
    );
  });

  it('returns a generic client message', () => {
    expect(new NotAuthorizedError('change orders').getClientMessage()).toBe(
      "You don't have permission to perform this action.",
    );
  });
});
