const SESSION_COOKIE_NAME = "admin_session";

/**
 * Persists a JWT token in the same cookie name expected by the session provider.
 */
export function persistSessionToken(token: string): void {
  if (!token) return;
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
}
