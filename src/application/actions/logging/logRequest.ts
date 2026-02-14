"use server";

import { getServices } from "@/server/getServices";
import { LogMetadata } from "@/application/services/interfaces/ILoggerService";

/**
 * Log Request Action
 *
 * Server Action used to persist server call logs and user actions.
 * Can be called from middleware (proxy.ts) or client components.
 */
export async function logRequestAction(metadata: LogMetadata) {
  try {
    const { logger } = getServices();
    await logger.logRequest(metadata);
  } catch (error) {
    // Fail silently to avoid blocking the user request
    console.error("Critical logging failure:", error);
  }
}
