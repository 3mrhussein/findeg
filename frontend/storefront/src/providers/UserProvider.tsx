'use client';

import React, { createContext, useState, useEffect } from 'react';
import type { ClientUser as User } from '@lib/types';

export interface UserContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

import { getCurrentUserAction } from '@data/user/actions';

// ... (types)

/**
 * Global User State Provider
 *
 * Manages the current user session on the client.
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     *
     */
    const fetchSession = async () => {
      try {
        const data = await getCurrentUserAction();
        if (data) {
          const session = data;
          setCurrentUser({
            name: session.user.firstName || session.user.email,
            email: session.user.email,
          });
        }
      } catch (error) {
        console.error('Failed to hydrate user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

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
    <UserContext.Provider value={{ currentUser, isLoggedIn, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
