import { isLocale as isDomainLocale } from "../value-objects/Locale";
/**
 * Type-safe check if a value is defined (not null or undefined).
 */
export declare function isDefined<T>(val: T | null | undefined): val is T;
/**
 * Type-safe check if an object has a specific property.
 */
export declare function hasProperty<T extends object, K extends PropertyKey>(obj: T, key: K): obj is T & Record<K, unknown>;
/**
 * Validates if a value is a non-empty string.
 */
export declare function isNonEmptyString(val: unknown): val is string;
/**
 * Domain-specific guard for IDs.
 */
export declare function isId(val: unknown): val is number;
/**
 * Domain-specific guard for emails.
 */
export declare function isEmail(val: unknown): val is string;
/**
 * Re-export locale guard for consistency in utils.
 */
export declare const isLocale: typeof isDomainLocale;
