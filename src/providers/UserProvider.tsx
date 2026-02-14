"use client";

import React, { createContext, useState, useMemo } from "react";
import type { ClientUser as User } from "@/lib/types";

interface UserContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  toggleWishlistItem: (productId: number) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 *
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
    setCurrentUser((prevUser) => {
      if (!prevUser) return null;

      const newWishlist = prevUser.wishlist.includes(productId)
        ? prevUser.wishlist.filter((id) => id !== productId)
        : [...prevUser.wishlist, productId];

      return { ...prevUser, wishlist: newWishlist };
    });
  };

  const isLoggedIn = useMemo(() => !!currentUser, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, isLoggedIn, login, logout, toggleWishlistItem }}>
      {children}
    </UserContext.Provider>
  );
};
