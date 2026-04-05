/**
 * Ensures the input is always an array.
 */
export declare function asArray<T>(val: T | T[] | null | undefined): T[];
/**
 * Deduplicates an array based on a key selector function.
 */
export declare function uniqueBy<T, K>(arr: T[], fn: (item: T) => K): T[];
/**
 * Groups an array of objects by a key selector function.
 */
export declare function groupBy<T, K extends PropertyKey>(arr: T[], fn: (item: T) => K): Record<K, T[]>;
