import { ValidationError, ConflictError } from '../features/core/domain/errors';
import { AppError } from './errors';

/**
 * Postgres Error Codes
 */
const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
} as const;

interface PostgresError {
  code?: string;
  detail?: string;
  column?: string;
  message?: string;
  nativeError?: {
    code?: string;
    detail?: string;
  };
}

/**
 * Handles Database specific errors (Postgres/Drizzle) and maps them to Application Errors.
 * 
 * @param error - The raw error from the database driver or Drizzle
 * @param resourceName - Optional name of the resource being operated on for better error messages
 * @returns An AppError or DomainError instance
 */
export function handleDBError(error: unknown, resourceName: string = 'Resource'): Error {
  // If it's already an AppError or DomainError, just return it
  if (error instanceof AppError || (error as Record<string, unknown>).isDomainError) {
    return error as Error;
  }

  const pgError = error as PostgresError;
  const code = pgError.code || pgError.nativeError?.code;
  const detail = pgError.detail || pgError.nativeError?.detail || '';

  // 1. Unique Violation (23505)
  if (code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
    // Try to extract field name from detail: "Key (email)=(test@example.com) already exists."
    const fieldMatch = detail.match(/Key \((.*?)\)=\((.*?)\) already exists/);
    if (fieldMatch) {
      const [, field, value] = fieldMatch;
      return new ConflictError(resourceName, field, value);
    }
    return new ConflictError(resourceName, 'unknown field', 'unknown value');
  }

  // 2. Foreign Key Violation (23503)
  if (code === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
    return new ValidationError('id', `Referenced ${resourceName.toLowerCase()} does not exist or is still in use.`);
  }

  // 3. Not Null Violation (23502)
  if (code === PG_ERROR_CODES.NOT_NULL_VIOLATION) {
    const field = pgError.column || 'unknown';
    return new ValidationError(field, `${field} is required.`);
  }

  // 4. Check Violation (23514)
  if (code === PG_ERROR_CODES.CHECK_VIOLATION) {
    return new ValidationError('unknown', `Value violates database constraints for ${resourceName.toLowerCase()}.`);
  }

  // Fallback to a generic database error or rethrow
  console.error('[DB Error Handler] Unhandled database error:', error);
  return new AppError(`Database operation failed: ${pgError.message || 'Unknown error'}`, 500);
}
