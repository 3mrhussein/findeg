/**
 * Logger Service
 *
 * Implements ILoggerService by coordinating FileLogger and Database logging.
 */

import { ILoggerService, LogLevel, LogMetadata } from "../interfaces/ILoggerService";
import { FileLogger } from "../../infrastructure/logging/FileLogger";
import { db } from "../../infrastructure/persistence";
import { serverLogs } from "@findeg/db/schema";
import env from "@findeg/env";

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
    this.log("info", message, metadata);
  }

  /**
   *
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log("warn", message, metadata);
  }

  /**
   *
   */
  error(message: string, metadata?: LogMetadata): void {
    this.log("error", message, metadata);
  }

  /**
   *
   */
  debug(message: string, metadata?: LogMetadata): void {
    this.log("debug", message, metadata);
  }

  /**
   * Primary logging method
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    // 1. Log to file (Reliable, fast)
    this.fileLogger.log(level, message, metadata);

    // 2. Log to console in development
    if (env.NODE_ENV !== "production") {
      console.log(`[${level.toUpperCase()}] ${message}`, metadata || "");
    }
  }

  /**
   * Specialized method for server request logging
   * Persists to Database for better analysis/support
   */
  async logRequest(metadata: LogMetadata): Promise<void> {
    // Always log to file first
    this.fileLogger.log("info", `Request: ${metadata.method} ${metadata.path}`, metadata);

    // Log to DB for persistent analysis
    try {
      await db.insert(serverLogs).values({
        requestId: metadata.requestId || "unknown",
        userId: metadata.userId,
        method: metadata.method,
        path: metadata.path,
        statusCode: metadata.statusCode,
        duration: metadata.duration,
        level: "info",
        message: `HTTP ${metadata.method} ${metadata.path}`,
        metadata: metadata as Record<string, unknown>,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        sessionId: metadata.sessionId,
      });
    } catch (error) {
      this.fileLogger.log("error", "Failed to persist log to database", { error: String(error) });
    }
  }
}
