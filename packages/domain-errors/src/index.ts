/**
 * Shared domain error constructors (`@findeg/domain-errors`).
 *
 * Each constructor is defined once here so `instanceof` holds across every package that
 * throws or catches it. This package imports no environment, session, database or Backend
 * code; Backend's other error classes extend `DomainError` from here.
 */
export { DomainError } from './DomainError';
export { NotAuthorizedError } from './NotAuthorizedError';
