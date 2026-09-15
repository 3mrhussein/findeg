/**
 * Legacy schema/type barrel retained for compatibility callers.
 * Browser code must not import @findeg/db, including this entry point (ADR 0001).
 * Target persistence uses the explicit module-schema, modules/*, and runtime
 * exports through injected adapters. See db/README.md and the retirement
 * boundaries in docs/package-guidance.md.
 */

export * from './types';
export * from './schema';
