/**
 * Type-safe error handling utilities.
 */

/**
 * Extracts a human-readable message from an unknown error object.
 *
 * @param error - The error object trapped in a catch block
 * @returns A string representation of the error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Type guard to check if an error is an instance of Error
 */
export function error(error: unknown): error is Error {
  return error instanceof Error;
}
