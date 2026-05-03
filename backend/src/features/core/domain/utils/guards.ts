import { EmailSchema, IdSchema } from '../types/common';
import { valid } from '../value-objects/Locale';
import type { Locale } from '../value-objects/Locale';

/**
 * Type-safe check if a value is defined (not null or undefined).
 */
export function isDefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

/**
 * Type-safe check if an object has a specific property.
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
): obj is T & Record<K, unknown> {
  return key in obj;
}

/**
 * Validates if a value is a non-empty string.
 */
export function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Domain-specific guard for IDs.
 */
export function isId(val: unknown): val is number {
  return IdSchema.safeParse(val).success;
}

/**
 * Domain-specific guard for emails.
 */
export function isEmail(val: unknown): val is string {
  return EmailSchema.safeParse(val).success;
}

/**
 * Checks if a given string is a supported domain locale.
 *
 * @param value - The string to validate.
 * @returns True if the value matches one of the supported locales.
 *
 * @example
 * if (isLocale("en")) { ... }
 */
export const isLocale = valid;
export type { Locale };
