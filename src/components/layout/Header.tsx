"use client";

import React, { useState, useEffect } from "react";
import { navigationSchema } from "@/lib/navigation";
import { CartDrawer } from "@/components/common/CartDrawer";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@/hooks";
import { HeaderLogo } from "./Header/HeaderLogo";
import { HeaderNav } from "./Header/HeaderNav";
import { HeaderSearch } from "./Header/HeaderSearch";
import { HeaderActions } from "./Header/HeaderActions";
import { MobileMenu } from "./Header/MobileMenu";

interface HeaderUIProps {
  handleSearch: (query: string) => void;
  language: string;
  onToggleLanguage: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  cartCount: number;
  isCartOpen: boolean;
  onToggleCart: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

/**
 * The main header component for the application.
 *
 * This component acts as a orchestrator for smaller, dedicated header components.
 * It manages the state for the mobile menu and search, and passes down necessary props
 * to children like `HeaderLogo`, `HeaderNav`, `HeaderSearch`, and `HeaderActions`.
 *
 * @param {HeaderUIProps} props - The component props.
 */
export const HeaderUI: React.FC<HeaderUIProps> = ({
  handleSearch,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  cartCount,
  isCartOpen,
  onToggleCart,
  isLoggedIn,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // Prevent scrolling when menu or cart is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isCartOpen ? "hidden" : "auto";
  }, [isMenuOpen, isCartOpen]);

  // Filter navigation items based on auth state
  const mainNavItems = navigationSchema.filter(
    (item) => isLoggedIn || (item.href !== "/my-account" && item.href !== "/dashboard"),
  );

  return (
    <>
      <header className="bg-card/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex w-full justify-between items-center py-4 gap-4">
            {/* Logo */}
            <HeaderLogo />

            {/* Desktop Navigation */}
            <HeaderNav items={mainNavItems} />

            {/* Actions & Search */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex">
                <HeaderSearch onSearch={handleSearch} />
              </div>

              <HeaderActions
                language={language}
                onToggleLanguage={onToggleLanguage}
                theme={theme}
                onToggleTheme={onToggleTheme}
                cartCount={cartCount}
                onToggleCart={onToggleCart}
                isLoggedIn={isLoggedIn}
                onLogout={onLogout}
                onToggleMobileMenu={() => setIsMenuOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={mainNavItems}
        onSearch={handleSearch}
        language={language}
        onToggleLanguage={onToggleLanguage}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isLoggedIn={isLoggedIn}
        onLogout={() => {
          setIsMenuOpen(false);
          onLogout();
        }}
      />

      {/* Cart Drawer is global but placed here for context */}
      <CartDrawer />
    </>
  );
};

/**
 * Container component for the Header.
 * Handles all business logic, hook connections, and state management.
 */
export const Header: React.FC = () => {
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const { cartCount, isCartOpen, toggleCart } = useCart();
  const { isLoggedIn, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Toggles the application language between English and Arabic.
   */
  const handleToggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  /**
   * Toggles the application theme between Light and Dark.
   */
  const handleToggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  /**
   * Logs the user out and redirects to the home page.
   */
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  /**
   * Navigates to the search page with the query.
   */
  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <HeaderUI
      handleSearch={handleSearch}
      language={locale}
      onToggleLanguage={handleToggleLanguage}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      cartCount={cartCount}
      isCartOpen={isCartOpen}
      onToggleCart={toggleCart}
      isLoggedIn={isLoggedIn}
      onLogout={handleLogout}
    />
  );
};
