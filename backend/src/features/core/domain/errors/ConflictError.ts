import { DomainError } from './DomainError';

/**
 * Thrown when an operation creates a resource that already exists (conflict).
 *
 * Common scenarios:
 * - Creating a duplicate product SKU
 * - Creating a user with an existing email
 * - Adding a duplicate item to cart (when duplicates not allowed)
 *
 * App-layer should:
 * - Log the conflict
 * - Return 409 Conflict status
 * - Display message suggesting user check existing resources
 *
 * @example
 * const existing = await repo.findByEmail(email);
 * if (existing) {
 *   throw new ConflictError("User", "email", email);
 * }
 */
export class ConflictError extends DomainError {
  public readonly resourceType: string;
  public readonly field: string;
  public readonly value: unknown;

  constructor(resourceType: string, field: string, value: unknown) {
    const message = `${resourceType} with ${field} "${value}" already exists`;
    super('CONFLICT_ERROR', message, {
      statusCode: 409,
      resourceType,
      field,
      value,
    });
    this.resourceType = resourceType;
    this.field = field;
    this.value = value;
  }

  getClientMessage(): string {
    return `This ${this.resourceType.toLowerCase()} already exists. Please check your entries.`;
  }
}
