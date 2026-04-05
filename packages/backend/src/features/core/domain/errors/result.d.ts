import { z, ZodTypeAny } from "zod";
import { AppErrorCode } from "./error-catalog";
export type Result<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: ResultError;
};
export interface ResultError {
    code: AppErrorCode;
    message: string;
    details?: Record<string, unknown>;
}
/**
 * Creates a successful Result.
 */
export declare function ok<T>(value: T): Result<T>;
/**
 * Creates a failed Result from the shared error catalog.
 */
export declare function fail<T>(code: AppErrorCode, details?: Record<string, unknown>): Result<T>;
/**
 * Validates input with Zod and returns a non-throwing Result.
 */
export declare function validateWithResult<TSchema extends ZodTypeAny>(schema: TSchema, input: unknown, invalidCode?: AppErrorCode): Result<z.output<TSchema>>;
