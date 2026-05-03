import { DomainError } from './DomainError';

/**
 * Thrown when an operation violates a business rule enforced by the domain model.
 *
 * This is distinct from validation errors (input format) and distinguishes
 * domain rule violations (business logic constraints).
 *
 * Common scenarios:
 * - Refunding an order that's already been processed
 * - Setting a discount greater than the product price
 * - Canceling an order that's already started shipping
 * - Setting a future end date before the start date
 *
 * App-layer should:
 * - Log the business rule violation
 * - Return 422 Unprocessable Entity status
 * - Display message explaining why the action isn't allowed
 *
 * @example
 * if (order.status === "shipped") {
 *   throw new BusinessRuleViolationError(
 *     "Cannot refund an order that's already shipped"
 *   );
 * }
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super('BUSINESS_RULE_VIOLATION', message, { statusCode: 422 });
  }

  getClientMessage(): string {
    return this.message;
  }
}
