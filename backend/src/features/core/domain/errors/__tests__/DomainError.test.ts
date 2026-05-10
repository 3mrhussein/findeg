import { describe, it, expect } from 'vitest';
import {
  DomainError,
  NotAuthenticatedError,
  NotAuthorizedError,
  ResourceNotFoundError,
  ValidationError,
  ValidationErrors,
  ConflictError,
  BusinessRuleViolationError,
} from '../index';

describe('Domain Errors', () => {
  describe('DomainError base class', () => {
    it('creates a domain error with code and message', () => {
      class TestError extends DomainError {
        constructor() {
          super('TEST_CODE', 'Test message', { statusCode: 400 });
        }
      }

      const error = new TestError();
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.metadata?.statusCode).toBe(400);
    });

    it('returns correct HTTP status code', () => {
      class TestError extends DomainError {
        constructor(statusCode: number) {
          super('TEST_CODE', 'Test message', { statusCode });
        }
      }

      const error = new TestError(422);
      expect(error.getStatusCode()).toBe(422);
    });

    it('returns default status code 500 when not in metadata', () => {
      class TestError extends DomainError {
        constructor() {
          super('TEST_CODE', 'Test message');
        }
      }

      const error = new TestError();
      expect(error.getStatusCode()).toBe(500);
    });

    it('serializes to JSON correctly', () => {
      class TestError extends DomainError {
        constructor() {
          super('TEST_CODE', 'Test message', { statusCode: 400, userId: '123' });
        }
      }

      const error = new TestError();
      const json = error.toJSON();

      expect(json.code).toBe('TEST_CODE');
      expect(json.message).toBe('Test message');
      expect(json.metadata?.statusCode).toBe(400);
      expect(json.metadata?.userId).toBe('123');
    });
  });

  describe('NotAuthenticatedError', () => {
    it('has correct error code and status', () => {
      const error = new NotAuthenticatedError('Session expired');
      expect(error.code).toBe('NOT_AUTHENTICATED');
      expect(error.getStatusCode()).toBe(401);
    });

    it('provides redirect path', () => {
      const error = new NotAuthenticatedError();
      expect(error.getRedirectPath()).toBe('/login');
    });

    it('returns client-safe message', () => {
      const error = new NotAuthenticatedError('Custom message');
      const clientMsg = error.getClientMessage();
      expect(clientMsg).toContain('Session expired');
    });
  });

  describe('NotAuthorizedError', () => {
    it('has correct error code and status', () => {
      const error = new NotAuthorizedError('edit', 'Product');
      expect(error.code).toBe('NOT_AUTHORIZED');
      expect(error.getStatusCode()).toBe(403);
    });

    it('includes action and resource in message', () => {
      const error = new NotAuthorizedError('delete', 'User');
      expect(error.message).toContain('delete');
      expect(error.message).toContain('User');
    });

    it('works without resource', () => {
      const error = new NotAuthorizedError('access admin');
      expect(error.message).toContain('access admin');
    });

    it('stores action and resource in properties', () => {
      const error = new NotAuthorizedError('publish', 'Article');
      expect(error.action).toBe('publish');
      expect(error.resource).toBe('Article');
    });
  });

  describe('ResourceNotFoundError', () => {
    it('has correct error code and status', () => {
      const error = new ResourceNotFoundError('Product', 123);
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
      expect(error.getStatusCode()).toBe(404);
    });

    it('includes resource type and identifier in message', () => {
      const error = new ResourceNotFoundError('User', 'user@example.com');
      expect(error.message).toContain('User');
      expect(error.message).toContain('user@example.com');
    });

    it('stores resource type and identifier', () => {
      const error = new ResourceNotFoundError('Product', 456);
      expect(error.resourceType).toBe('Product');
      expect(error.identifier).toBe(456);
    });
  });

  describe('ValidationError', () => {
    it('has correct error code and status', () => {
      const error = new ValidationError('email', 'Invalid email format');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.getStatusCode()).toBe(400);
    });

    it('stores field and invalid value', () => {
      const error = new ValidationError('age', 'Must be >= 18', '15');
      expect(error.field).toBe('age');
      expect(error.invalidValue).toBe('15');
    });
  });

  describe('ValidationErrors (plural)', () => {
    it('has correct error code and status', () => {
      const errors = [
        { field: 'email', message: 'Required' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationErrors(errors);
      expect(error.code).toBe('VALIDATION_ERRORS');
      expect(error.getStatusCode()).toBe(400);
    });

    it('groups errors by field', () => {
      const errors = [
        { field: 'email', message: 'Required' },
        { field: 'email', message: 'Invalid format' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationErrors(errors);

      const byField = error.getErrorsByField();
      expect(byField.get('email')).toHaveLength(2);
      expect(byField.get('password')).toHaveLength(1);
    });

    it('stores all errors from construction', () => {
      const errors = [
        { field: 'name', message: 'Too short' },
        { field: 'age', message: 'Invalid' },
      ];
      const error = new ValidationErrors(errors);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('ConflictError', () => {
    it('has correct error code and status', () => {
      const error = new ConflictError('User', 'email', 'test@example.com');
      expect(error.code).toBe('CONFLICT_ERROR');
      expect(error.getStatusCode()).toBe(409);
    });

    it('includes resource, field, and value in message', () => {
      const error = new ConflictError('Product', 'sku', 'SKU-123');
      expect(error.message).toContain('Product');
      expect(error.message).toContain('sku');
      expect(error.message).toContain('SKU-123');
    });

    it('stores values for inspection', () => {
      const error = new ConflictError('Tag', 'name', 'featured');
      expect(error.resourceType).toBe('Tag');
      expect(error.field).toBe('name');
      expect(error.value).toBe('featured');
    });
  });

  describe('BusinessRuleViolationError', () => {
    it('has correct error code and status', () => {
      const error = new BusinessRuleViolationError('Cannot refund shipped orders');
      expect(error.code).toBe('BUSINESS_RULE_VIOLATION');
      expect(error.getStatusCode()).toBe(422);
    });

    it('preserves custom message', () => {
      const msg = 'You must have at least one product in a collection';
      const error = new BusinessRuleViolationError(msg);
      expect(error.message).toBe(msg);
      expect(error.getClientMessage()).toBe(msg);
    });
  });

  describe('Error instanceof checks', () => {
    it('supports instanceof for all error types', () => {
      const errors = [
        new NotAuthenticatedError(),
        new NotAuthorizedError('test'),
        new ResourceNotFoundError('Test', 1),
        new ValidationError('test', 'msg'),
        new ConflictError('Test', 'field', 'value'),
        new BusinessRuleViolationError('test'),
      ];

      for (const error of errors) {
        expect(error instanceof DomainError).toBe(true);
        expect(error instanceof Error).toBe(true);
      }
    });

    it('can distinguish between error types', () => {
      const notAuth = new NotAuthenticatedError();
      expect(notAuth instanceof NotAuthenticatedError).toBe(true);
      expect(notAuth instanceof NotAuthorizedError).toBe(false);
    });
  });
});
