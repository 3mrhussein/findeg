import { ZodError, type ZodIssue } from 'zod';
import { DomainError } from './DomainError';

/**
 * Structured field error extracted from a Zod validation issue.
 */
export interface QueryValidationIssue {
  /** Dot-separated path to the invalid field (e.g., "totalProducts" or "0.productCount") */
  path: string;
  /** Human-readable error message for this field */
  message: string;
  /** Zod issue code (e.g., "invalid_type", "too_small") */
  code: string;
  /** The value that was received (if available) */
  received?: unknown;
  /** The value that was expected (if available) */
  expected?: unknown;
}

/**
 * Error thrown when raw database output fails Zod schema validation.
 *
 * This indicates a **data integrity** problem — the database returned a shape
 * that doesn't match the expected contract. Unlike `ValidationError` (user input),
 * this is an internal system failure that should be logged and investigated.
 *
 * App-layer should:
 * - Return a generic 500 to the client (never expose DB schema details)
 * - Log the full `issues` array for debugging
 * - Alert if this happens in production (indicates schema drift or migration issue)
 *
 * @example
 * try {
 *   return CatalogHealthRawSchema.parse(rawResult);
 * } catch (error) {
 *   throw QueryValidationError.fromZodError(error, "CatalogHealthRaw");
 * }
 */
export class QueryValidationError extends DomainError {
  /** Structured list of validation failures */
  public readonly issues: QueryValidationIssue[];

  /** The schema/query name that failed validation */
  public readonly schemaName: string;

  constructor(schemaName: string, issues: QueryValidationIssue[], metadata?: Record<string, unknown>) {
    const fieldSummary = issues.map((i) => `${i.path}: ${i.message}`).join('; ');
    super(
      'QUERY_VALIDATION_ERROR',
      `DB result validation failed for "${schemaName}": ${fieldSummary}`,
      { statusCode: 500, schemaName, issueCount: issues.length, ...metadata },
    );
    this.issues = issues;
    this.schemaName = schemaName;
  }

  /**
   * Creates a QueryValidationError from a ZodError.
   *
   * Call this in catch blocks where `.parse()` may throw.
   * Non-ZodError instances are re-thrown as-is.
   *
   * @param error - The caught error (should be a ZodError)
   * @param schemaName - Human-readable name for the schema that failed (for logging)
   * @returns A QueryValidationError if the error is a ZodError
   * @throws The original error if it is not a ZodError
   *
   * @example
   * try {
   *   return MySchema.parse(dbResult);
   * } catch (error) {
   *   throw QueryValidationError.fromZodError(error, "MySchema");
   * }
   */
  static fromZodError(error: unknown, schemaName: string): QueryValidationError {
    if (error instanceof ZodError) {
      const issues = error.issues.map(
        (issue: ZodIssue): QueryValidationIssue => ({
          path: issue.path.join('.') || '(root)',
          message: issue.message,
          code: issue.code,
          received: 'received' in issue ? issue.received : undefined,
          expected: 'expected' in issue ? issue.expected : undefined,
        }),
      );
      return new QueryValidationError(schemaName, issues);
    }
    // Not a ZodError — caller should handle or re-throw
    throw error;
  }

  /**
   * Returns a safe client message that doesn't leak DB internals.
   */
  getClientMessage(): string {
    return 'An internal data consistency error occurred. Please try again later.';
  }

  /**
   * Returns detailed info for structured logging / observability.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      schemaName: this.schemaName,
      issues: this.issues,
    };
  }
}
