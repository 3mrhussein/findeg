// Domain Errors - Base and Specific Error Types
export { DomainError } from "./DomainError";
export { NotAuthenticatedError } from "./NotAuthenticatedError";
export { NotAuthorizedError } from "./NotAuthorizedError";
export { ResourceNotFoundError } from "./ResourceNotFoundError";
export { ValidationError, ValidationErrors } from "./ValidationError";
export { ConflictError } from "./ConflictError";
export { BusinessRuleViolationError } from "./BusinessRuleViolationError";

// Error Catalog and Result Type
export * from "./error-catalog";
export * from "./result";
