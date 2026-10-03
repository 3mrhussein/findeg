/**
 * Server-only logger entry point. Kept out of the core barrel because LoggerService reaches
 * `node:fs`, which must never enter a Client Component bundle (ADR-0001).
 */
import type { ILoggerService } from './application/interfaces/ILoggerService';
import { LoggerService } from './application/services/LoggerService';

/** Creates the structured logger (file + console) without exposing its concrete implementation. */
export function createLogger(): ILoggerService {
  return new LoggerService();
}
