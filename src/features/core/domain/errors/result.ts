import { z, ZodTypeAny } from "zod";
import { AppErrorCode, getErrorDefinition } from "./error-catalog";

export type Result<T> = { ok: true; value: T } | { ok: false; error: ResultError };

export interface ResultError {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Creates a successful Result.
 */
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

/**
 * Creates a failed Result from the shared error catalog.
 */
export function fail<T>(code: AppErrorCode, details?: Record<string, unknown>): Result<T> {
  return {
    ok: false,
    error: {
      code,
      message: getErrorDefinition(code).message,
      details,
    },
  };
}

/**
 * Validates input with Zod and returns a non-throwing Result.
 */
export function validateWithResult<TSchema extends ZodTypeAny>(
  schema: TSchema,
  input: unknown,
  invalidCode: AppErrorCode = "VALIDATION_INVALID_REQUEST",
): Result<z.output<TSchema>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return fail(invalidCode, { issues: parsed.error.issues });
  }
  return ok(parsed.data);
}
