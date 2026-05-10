/**
 * Pure TypeScript logging action (backend - framework-agnostic)
 */

import { type ILoggerService, type LogMetadata } from '@findeg/backend/features/core';

/**
 * usage by client components to log specific events or errors to the server.
 *
 * @param logger - Injected logger service
 * @param data - The payload to log (can be an object, string, or error).
 */
export async function logRequestAction(logger: ILoggerService, data: unknown) {
  const payload = data as Record<string, unknown>;
  if (payload?.level === 'error') {
    logger.error((payload.message as string) || 'Client error', payload as LogMetadata);
  } else {
    logger.info((payload.message as string) || 'Client action', payload as LogMetadata);
  }
}
