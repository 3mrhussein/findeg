import { getErrorDefinition } from "./error-catalog";
/**
 * Creates a successful Result.
 */
export function ok(value) {
    return { ok: true, value };
}
/**
 * Creates a failed Result from the shared error catalog.
 */
export function fail(code, details) {
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
export function validateWithResult(schema, input, invalidCode = "VALIDATION_INVALID_REQUEST") {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
        return fail(invalidCode, { issues: parsed.error.issues });
    }
    return ok(parsed.data);
}
