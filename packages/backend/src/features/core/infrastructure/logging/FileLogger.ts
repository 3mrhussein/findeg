/**
 * File Logger
 *
 * Handles writing logs to the filesystem with size-based rotation.
 * 
 * Note: Intended for server-side use only (requires filesystem access).
 */

import * as fs from "fs";
import * as path from "path";
import { LogLevel, LogMetadata } from "../../application/interfaces/ILoggerService";

const LOG_DIRECTORY = path.join(process.cwd(), "logs");
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const CURRENT_LOG_FILE = path.join(LOG_DIRECTORY, "app.log");

/**
 *
 */
export class FileLogger {
  /**
   *
   */
  constructor() {
    this.ensureDirectoryExists();
  }

  /**
   *
   */
  private ensureDirectoryExists() {
    if (!fs.existsSync(LOG_DIRECTORY)) {
      fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
    }
  }

  /**
   * Writes a log entry to the file
   */
  public log(level: LogLevel, message: string, metadata?: LogMetadata): void {
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({
      timestamp,
      level,
      message,
      ...metadata,
    });

    this.rotateIfNecessary();

    try {
      fs.appendFileSync(CURRENT_LOG_FILE, logEntry + "\n", "utf8");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  /**
   * Rotates the log file if it exceeds the size limit
   */
  private rotateIfNecessary() {
    try {
      if (!fs.existsSync(CURRENT_LOG_FILE)) return;

      const stats = fs.statSync(CURRENT_LOG_FILE);
      if (stats.size >= MAX_FILE_SIZE_BYTES) {
        const timestamp = new Date().getTime();
        const archivedFile = path.join(LOG_DIRECTORY, `app.${timestamp}.log`);
        fs.renameSync(CURRENT_LOG_FILE, archivedFile);

        // Optional: Keep only last N rotated files if needed
      }
    } catch (error) {
      console.error("Log rotation failed:", error);
    }
  }
}
