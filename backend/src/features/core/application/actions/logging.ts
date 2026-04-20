/**
 * Pure TypeScript logging action (backend - framework-agnostic)
 */

import { type ILoggerService } from "@findeg/backend/features/core";

/**
 * usage by client components to log specific events or errors to the server.
 *
 * @param logger - Injected logger service
 * @param data - The payload to log (can be an object, string, or error).
 */
export async function logRequestAction(logger: ILoggerService, data: any) {
  // Handle logging logic here if service supports it
  if (data?.level === "error") {
    logger.error(data.message || "Client error", data);
  } else {
    logger.info(data.message || "Client action", data);
  }
}
