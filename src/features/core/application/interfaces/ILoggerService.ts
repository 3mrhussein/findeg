/**
 * Logger Service Interface
 *
 * Defines the contract for application-wide logging.
 * Supports multiple levels and structured metadata.
 */

export interface LogMetadata extends Record<string, unknown> {
  requestId?: string;
  userId?: number;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface ILoggerService {
  /**
   * Logs an informational message.
   *
   * @param message - The message to record.
   * @param metadata - Optional structured data to accompany the log.
   */
  info(message: string, metadata?: LogMetadata): void;

  /**
   * Logs a warning message indicating a potential issue.
   *
   * @param message - The warning description.
   * @param metadata - Optional structured data to accompany the log.
   */
  warn(message: string, metadata?: LogMetadata): void;

  /**
   * Logs an error message representing a failure or exception.
   *
   * @param message - The error description.
   * @param metadata - Optional structured data to accompany the log.
   */
  error(message: string, metadata?: LogMetadata): void;

  /**
   * Logs a diagnostic message for development and debugging purposes.
   *
   * @param message - The debug message.
   * @param metadata - Optional structured data to accompany the log.
   */
  debug(message: string, metadata?: LogMetadata): void;

  /**
   * Records a specifically structured server request/response entry.
   * Useful for auditing and performance monitoring.
   *
   * @param metadata - The request data to log.
   */
  logRequest(metadata: LogMetadata): Promise<void>;
}
