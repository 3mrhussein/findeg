import { DomainError } from "./DomainError";

/**
 * Thrown when a requested resource does not exist.
 *
 * App-layer should:
 * - Log the not-found error
 * - Call notFound() to render 404 page, or return 404 JSON response
 * - Display user-friendly message
 *
 * @example
 * const product = await repo.findById(id);
 * if (!product) {
 *   throw new ResourceNotFoundError("Product", id);
 * }
 */
export class ResourceNotFoundError extends DomainError {
  public readonly resourceType: string;
  public readonly identifier: string | number;

  constructor(resourceType: string, identifier: string | number) {
    const message = `${resourceType} with identifier "${identifier}" not found`;
    super("RESOURCE_NOT_FOUND", message, {
      statusCode: 404,
      resourceType,
      identifier,
    });
    this.resourceType = resourceType;
    this.identifier = identifier;
  }

  getClientMessage(): string {
    return "The requested resource could not be found.";
  }
}
