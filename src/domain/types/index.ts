/**
 * Domain Types
 *
 * Core types and interfaces used across the domain layer.
 * These are business-level types, not UI-specific.
 */

import React from 'react';

// Navigation Types
export interface NavigationSubLink {
  labelKey: string;
  href: string;
  icon?: React.ReactNode;
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
  labelKey: string;
  href: string;
  isMegaMenu?: boolean;
  megaMenuColumns?: MegaMenuColumn[];
}

// Category Type
export interface Category {
  name: string;
  description: string;
  imageUrl: string;
  count: number;
}

// User Type
export interface User {
  name: string;
  email: string;
  wishlist: number[]; // Array of product IDs
}

// Order Type
export interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

// Review Type
export interface Review {
  id: number;
  productId: number;
  author: string;
  rating: number; // 1-5
  date: string; // ISO date string
  comment: string;
}

// Global State Types
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ar';

// Shop Page Types
export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';
export type ViewMode = 'grid' | 'list';
