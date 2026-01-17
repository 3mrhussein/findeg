import React from "react";

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
  labelKey:string;
  href: string;
  isMegaMenu?: boolean;
  megaMenuColumns?: MegaMenuColumn[];
}

// Product & Category Types
export interface ProductVariant {
  id: string;
  name: string; // e.g., 'Color'
  value: string; // e.g., 'Red'
  stock: number;
}
export interface Product {
  id: number;
  name: string;
  price: number;
  strikePrice?: number;
  description: string;
  longDescription: string;
  imageUrl: string;
  images: string[];
  category: string;
  isNew?: boolean;
  variants?: {
    [key: string]: {
      name: string;
      options: { value: string; stock: number; }[];
    }
  };
}

export interface Category {
  name: string;
  description: string;
  imageUrl: string;
}

// Cart Types
export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: { [key: string]: string };
}

// User type
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
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
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

// Router props
export type Page = 'home' | 'shop' | 'product' | 'checkout' | 'registration' | 'about' | 'search' | 'categories' | 'my-account' | 'dashboard' | 'brand-kit' | 'error';
export type NavigateTo = (page: Page, productId?: number) => void;
export interface PageProps {
  navigateTo: NavigateTo;
}