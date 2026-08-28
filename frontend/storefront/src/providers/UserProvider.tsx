'use client';

import React, { createContext, useState, useMemo, useEffect } from 'react';
import type { ClientUser as User } from '@lib/types';

export interface UserContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  toggleWishlistItem: (productId: number) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

import { getCurrentUser } from '@data/user/queries';

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
        const data = await getCurrentUser();
        if (data) {
          const session = data;
          setCurrentUser({
            name: session.user.firstName || session.user.email,
            email: session.user.email,
            wishlist: [], // TODO: Potentially fetch from profile
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
  const toggleWishlistItem = (productId: number) => {
    setCurrentUser((prevUser: User | null) => {
      if (!prevUser) return null;

      const newWishlist = prevUser.wishlist.includes(productId)
        ? prevUser.wishlist.filter((id: number) => id !== productId)
        : [...prevUser.wishlist, productId];

      return { ...prevUser, wishlist: newWishlist };
    });
  };

  /**
   *
   */
  const isLoggedIn = !!currentUser;

  return (
    <UserContext.Provider
      value={{ currentUser, isLoggedIn, isLoading, login, logout, toggleWishlistItem }}
    >
      {children}
    </UserContext.Provider>
  );
};
