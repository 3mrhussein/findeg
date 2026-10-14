import { describe, expect, it } from 'vitest';
import { DomainError, ValidationError, ValidationErrors } from '../index';

describe('ValidationError', () => {
  it('is a 400 domain error naming the field and the invalid value', () => {
    const error = new ValidationError('email', 'Email must be valid', 'nope');
    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.field).toBe('email');
    expect(error.invalidValue).toBe('nope');
    expect(error.getClientMessage()).toBe('Email must be valid');
  });
});

describe('ValidationErrors', () => {
  it('lists every field error and groups messages by field', () => {
    const error = new ValidationErrors([
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
      { field: 'email', message: 'Already taken' },
    ]);
    expect(error.code).toBe('VALIDATION_ERRORS');
    expect(error.message).toBe('Validation failed for: email, password, email');
    expect(error.getClientMessage()).toBe('Please fix the validation errors and try again.');
    expect(error.getErrorsByField()).toEqual(
      new Map([
        ['email', ['Invalid email', 'Already taken']],
        ['password', ['Too short']],
      ]),
    );
  });
});
