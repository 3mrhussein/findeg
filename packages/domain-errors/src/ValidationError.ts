import { DomainError } from './DomainError';

/**
 * Thrown when a single input field fails validation.
 *
 * App-layer should:
 * - Add field-specific error message to form errors
 * - Highlight the invalid field in the UI
 * - Return 400 Bad Request status
 *
 * @example
 * if (!email.includes("@")) {
 *   throw new ValidationError("email", "Email must be valid");
 * }
 */
export class ValidationError extends DomainError {
  public readonly field: string;
  public readonly invalidValue?: unknown;

  constructor(field: string, message: string, invalidValue?: unknown) {
    super('VALIDATION_ERROR', message, {
      statusCode: 400,
      field,
      invalidValue,
    });
    this.field = field;
    this.invalidValue = invalidValue;
  }

  getClientMessage(): string {
    return this.message;
  }
}

/**
 * Thrown when multiple input fields fail validation.
 *
 * App-layer should:
 * - Display all error messages to user
 * - Highlight all invalid fields in the UI
 * - Return 400 Bad Request status
 *
 * @example
 * const errors = [];
 * if (!email.includes("@")) errors.push({ field: "email", message: "Invalid email" });
 * if (password.length < 8) errors.push({ field: "password", message: "Too short" });
 * if (errors.length > 0) throw new ValidationErrors(errors);
 */
export class ValidationErrors extends DomainError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    const fieldNames = errors.map((e) => e.field).join(', ');
    super('VALIDATION_ERRORS', `Validation failed for: ${fieldNames}`, {
      statusCode: 400,
      errors,
    });
    this.errors = errors;
  }

  getClientMessage(): string {
    return 'Please fix the validation errors and try again.';
  }

  /**
   * Get errors grouped by field for form processing.
   * @returns Map of field name to array of error messages
   */
  getErrorsByField(): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const error of this.errors) {
      if (!map.has(error.field)) {
        map.set(error.field, []);
      }
      map.get(error.field)!.push(error.message);
    }
    return map;
  }
}
