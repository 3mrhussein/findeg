/**
 * Backend Library Utilities
 *
 * Re-export all utility functions for easy import.
 * Usage: import { formatCurrency, UnauthorizedError } from '@findeg/backend/lib'
 */

export * from "./i18n";

// Re-export error classes with explicit names to avoid conflicts
export {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  InternalServerError,
  ServiceUnavailableError,
  isOperationalError,
} from "./errors";
