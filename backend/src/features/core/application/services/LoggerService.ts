/**
 * Logger Service (Pure TypeScript)
 *
 * Implements ILoggerService by coordinating FileLogger and console output.
 * Database logging is delegated to the app layer via server actions with "use cache".
 * This keeps the backend pure and testable, following Clean Architecture.
 */

import { ILoggerService, LogLevel, LogMetadata } from '../interfaces/ILoggerService';
import { FileLogger } from '../../infrastructure/logging/FileLogger';
import env from '@findeg/env';

/**
 *
 */
export class LoggerService implements ILoggerService {
  private fileLogger: FileLogger;

  /**
   *
   */
  constructor() {
    this.fileLogger = new FileLogger();
  }

  /**
   *
   */
  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, metadata);
  }

  /**
   *
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, metadata);
  }

  /**
   *
   */
  error(message: string, metadata?: LogMetadata): void {
    this.log('error', message, metadata);
  }

  /**
   *
   */
  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, metadata);
  }

  /**
   * Primary logging method
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    // 1. Log to file (Reliable, fast)
    this.fileLogger.log(level, message, metadata);

    // 2. Log to console in development
    if (env.NODE_ENV !== 'production') {
      console.log(`[${level.toUpperCase()}] ${message}`, metadata || '');
    }
  }

  /**
   * Specialized method for server request logging.
   * 
   * Logs to file immediately for reliability.
   * Database persistence is handled at the app layer via server actions with "use cache".
   * 
   * To persist to database, create a separate app-level data layer action:
   *   @/data/logs/actions.ts → logRequest(metadata) → "use server" + updateTag('logs')
   */
  async logRequest(metadata: LogMetadata): Promise<void> {
    try {
      // Log to file for fast, reliable logging
      this.fileLogger.log(
        'info',
        `Request: ${metadata.method} ${metadata.path}`,
        metadata
      );

      // Log to console in development
      if (env.NODE_ENV !== 'production') {
        console.log(`[REQUEST] ${metadata.method} ${metadata.path}`, {
          duration: metadata.duration,
          statusCode: metadata.statusCode,
        });
      }

      // Database logging is now delegated to the app layer for better separation of concerns
    } catch (error) {
      // Fall back to console if file logging fails
      console.error('Failed to log request:', error);
    }
  }
}
