"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTheme } from "@/hooks";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { navigationSchema } from "@/lib/navigation";
import type { HeaderControllerVM } from "@/components/storefront/types";

/**
 * Encapsulates shell-level header logic and side effects.
 */
export function useHeaderController(): HeaderControllerVM {
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const { cartCount, isCartOpen, toggleCart } = useCart();
  const { isLoggedIn, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = navigationSchema.filter(
    (item) => isLoggedIn || (item.href !== "/my-account" && item.href !== "/dashboard"),
  );

  /**
   * Switches locale between English and Arabic while preserving current path.
   */
  const handleToggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  /**
   * Toggles visual theme for storefront shell.
   */
  const handleToggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  /**
   * Signs current user out and routes to storefront root.
   */
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  /**
   * Routes header search input to search results page.
   */
  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return {
    locale,
    theme,
    cartCount,
    isCartOpen,
    isLoggedIn,
    isMenuOpen,
    navItems,
    onToggleLanguage: handleToggleLanguage,
    onToggleTheme: handleToggleTheme,
    onLogout: handleLogout,
    onSearch: handleSearch,
    onToggleCart: toggleCart,
    onOpenMobileMenu: () => setIsMenuOpen(true),
    onCloseMobileMenu: () => setIsMenuOpen(false),
  };
}
