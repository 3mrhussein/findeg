import { DomainError } from './DomainError';

/**
 * Error thrown when a CQRS query fails to execute.
 *
 * Used for database connection issues, query timeouts, or data corruption
 * discovered during read model construction.
 */
export class QueryError extends DomainError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super('QUERY_ERROR', message, { statusCode: 500, ...metadata });
  }
}
