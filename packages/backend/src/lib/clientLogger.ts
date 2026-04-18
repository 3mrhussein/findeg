"use client";

import { logRequestAction } from "@backend/features/core/application/actions/logging";

/**
 * Client Logger
 *
 * Utility for logging user actions from the frontend to the server.
 */
export const clientLogger = {
  /**
   * Log a user action
   */
  async logAction(action: string, metadata: Record<string, unknown> = {}) {
    const logData = {
      level: "info" as const,
      message: `User Action: ${action}`,
      ...metadata,
      path: typeof window !== "undefined" ? window.location.pathname : "unknown",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    };

    // Use console for client logging
    console.info(`[ClientLogger] ${action}`, logData);
  },

  /**
   * Log an error from the client
   */
  async logError(error: Error | string, context: string) {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(`[ClientLogger] Error in ${context}: ${message}`, { error_stack: stack });
  },
};
