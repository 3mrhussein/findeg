'use client';

import { logRequestAction } from '@actions/admin-actions';

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
      level: 'info' as const,
      message: `User Action: ${action}`,
      ...metadata,
      path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    // Use fire-and-forget to avoid blocking UI
    logRequestAction(logData).catch((err: unknown) => {
      // Last resort fallback
      console.error('Client logging failed:', err);
    });
  },

  /**
   * Log an error from the client
   */
  async logError(error: Error | string, context: string) {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    logRequestAction({
      level: 'error',
      message: `Client Error in ${context}: ${message}`,
      error_stack: stack,
      path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    }).catch(() => {});
  },
};
