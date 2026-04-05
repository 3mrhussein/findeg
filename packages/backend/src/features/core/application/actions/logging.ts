"use server";

import { container } from "@/features/core/infrastructure/di/ServiceContainer";

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
