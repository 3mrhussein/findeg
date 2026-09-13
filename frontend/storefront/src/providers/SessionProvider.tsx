/**
 * SessionContext
 *
 * Provides session data to client components.
 * Wraps the session payload for client-side access.
 */

'use client';

import * as React from 'react';
import type { SessionPayload } from '@findeg/backend/features/core';

interface SessionContextValue {
  session: SessionPayload;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export interface SessionProviderProps {
  session: SessionPayload;
  children: React.ReactNode;
}

/**
 * SessionProvider — Provides session data to client components
 */
export function SessionProvider({ session, children }: SessionProviderProps) {
  const value = React.useMemo<SessionContextValue>(() => ({ session }), [session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * useSession — Access session data from client components
 */
export function useSession(): SessionPayload {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession() must be used inside <SessionProvider>');
  }
  return ctx.session;
}
