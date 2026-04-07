/**
 * Pure TypeScript logging action (backend - framework-agnostic)
 * 
 * Apps should wrap this with "use server" in their own server actions.
 * Backend exports pure business logic only.
 * 
 * Usage in dashboard:
 * ```ts
 * "use server";
 * import { logRequestAction } from '@backend/features/core';
 * export async function logRequest(data: any) {
 *   return logRequestAction(data);
 * }
 * ```
 */

import { container } from "@features/core/infrastructure/di/ServiceContainer";

/**
 * usage by client components to log specific events or errors to the server.
 *
 * @param data - The payload to log (can be an object, string, or error).
 */
export async function logRequestAction(data: any) {
  const service = container.loggerService;
  // Handle logging logic here if service supports it
  // For now just a stub if service doesn't have direct "logRequest"
  // service.info("Request action triggered", data);
}
