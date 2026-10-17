'use client';

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ClientUser as User } from '@lib/types';
import { getCurrentUserAction } from '@data/user/actions';

export interface UserContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

// ... (types)

/**
 * Global User State Provider
 *
 * Manages the current user session on the client.
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshRequest = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++refreshRequest.current;
    try {
      const data = await getCurrentUserAction();
      const sessionUser = data?.user;
      if (requestId === refreshRequest.current) {
        setCurrentUser(
          sessionUser
            ? {
                name:
                  [sessionUser.firstName, sessionUser.lastName].filter(Boolean).join(' ').trim() ||
                  sessionUser.email,
                email: sessionUser.email,
              }
            : null,
        );
      }
    } catch (error) {
      console.error('Failed to hydrate user session:', error);
      throw error;
    } finally {
      if (requestId === refreshRequest.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh().catch(() => {
      // Ignore initial session hydration error to leave user as null
    });
  }, [refresh]);

  /**
   *
   */
  const login = (user: User) => {
    setCurrentUser(user);
  };

  /**
   *
   */
  const logout = () => {
    setCurrentUser(null);
  };

  /**
   *
   */
  const isLoggedIn = !!currentUser;

  return (
    <UserContext.Provider value={{ currentUser, isLoggedIn, isLoading, login, logout, refresh }}>
      {children}
    </UserContext.Provider>
  );
};
