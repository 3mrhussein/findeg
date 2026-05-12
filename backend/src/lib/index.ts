/**
 * Backend Library Utilities
 *
 * Re-export all utility functions for easy import.
 * Usage: import { formatCurrency } from '@findeg/backend/lib'
 *
 * Note: ValidationError and ConflictError domain errors should be imported from core:
 *       import { ValidationError, ConflictError } from '@findeg/backend'
 */

export * from './i18n';
export * from './db-error-handler';
export * from './avatar-color';
export * from './slugify';
export * from './theme';
export * from './sanitize-html';
export * from './clientLogger';

// Re-export HTTP error classes only (AppError-based)
// Domain errors (ValidationError, ConflictError) come from core
export {
  AppError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  ServiceUnavailableError,
  operationalError,
} from './errors';
