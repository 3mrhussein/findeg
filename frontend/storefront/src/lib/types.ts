/**
 * UI / Presentation Types
 *
 * Types used by the presentation layer (components, hooks, providers).
 * These are NOT domain types — they describe UI concerns like navigation,
 * view modes, and theme preferences.
 *
 * Domain entities (Product, Category, User, etc.) live in src/domain/entities/.
 */

import React from 'react';
import type { Locale } from '@findeg/backend/features/core';

// Navigation Types
export interface NavigationSubLink {
  labelKey: string;
  href: string;
  iconName?: string;
}

export interface NavigationLink {
  labelKey: string;
  href: string;
  isNew?: boolean;
  subLinks?: NavigationSubLink[];
}

export interface MegaMenuColumn {
  titleKey: string;
  links: NavigationLink[];
}

export interface NavigationItem {
  id?: string;
  labelKey: string;
  href: string;
  isMegaMenu?: boolean;
  megaMenuColumns?: MegaMenuColumn[];
}

// Global State Types
export type Theme = 'light' | 'dark';
export type Language = Locale;

// Shop Page Types
export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';
export type ViewMode = 'grid' | 'list';

// Client-side User (used by UserProvider / RegistrationContent)
// This is NOT the domain User entity — it's a lightweight
// client-side representation for session state.
export interface ClientUser {
  name: string;
  email: string;
  wishlist: number[];
}
