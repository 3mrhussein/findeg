// Domain Errors - Base and Specific Error Types
// DomainError and NotAuthorizedError are defined once in @findeg/domain-errors; this is a
// temporary reexport of the same constructors, not a second implementation. Remove it when
// the legacy Order seams are removed (#368) and importers use the package directly.
export { DomainError, NotAuthorizedError } from '@findeg/domain-errors';
export { NotAuthenticatedError } from './NotAuthenticatedError';
export { ResourceNotFoundError } from './ResourceNotFoundError';
export { ValidationError, ValidationErrors } from './ValidationError';
export { ConflictError } from './ConflictError';
export { BusinessRuleViolationError } from './BusinessRuleViolationError';
export { QueryError } from './QueryError';
export { QueryValidationError } from './QueryValidationError';
export type { QueryValidationIssue } from './QueryValidationError';

// Error Catalog and Result Type
export * from './error-catalog';
export * from './result';
