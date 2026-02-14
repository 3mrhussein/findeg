/**
 * Session Provider Interface
 *
 * Abstraction for session storage. Currently implemented with cookies/JWT,
 * but can be swapped for Redis, DB sessions, or external auth service.
 */

import { SessionPayload } from "@/domain/types/admin";

export interface ISessionProvider {
  createSession(payload: SessionPayload): Promise<void>;
  getSession(): Promise<SessionPayload | null>;
  deleteSession(): Promise<void>;
}
