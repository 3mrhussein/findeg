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
   * Log an informational message
   */
  info(message: string, metadata?: LogMetadata): void;

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: LogMetadata): void;

  /**
   * Log an error message
   */
  error(message: string, metadata?: LogMetadata): void;

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: LogMetadata): void;

  /**
   * Log a specifically structured server request/response
   */
  logRequest(metadata: LogMetadata): Promise<void>;
}
