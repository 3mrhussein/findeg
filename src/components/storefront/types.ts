import type { MouseEvent } from "react";
import type { NavigationItem, Theme } from "@/lib/types";

export interface ProductActionHandlers {
  onAddToCart: (event: MouseEvent) => void;
  onCardClick: () => void;
  onToggleWishlist?: (event: MouseEvent) => void;
}

export interface HeaderActionHandlers {
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onToggleCart: () => void;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
  onCloseMobileMenu: () => void;
  onSearch: (query: string) => void;
}

export interface ProductCardControllerVM extends ProductActionHandlers {
  isSaved: boolean;
  isAddingToCart: boolean;
}

export interface ProductListItemControllerVM extends ProductActionHandlers {
  isAddingToCart: boolean;
}

export interface HeaderControllerVM extends HeaderActionHandlers {
  locale: string;
  theme: Theme;
  cartCount: number;
  isCartOpen: boolean;
  isLoggedIn: boolean;
  isMenuOpen: boolean;
  navItems: NavigationItem[];
}
