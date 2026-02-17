"use client";

import { CartDrawer } from "@/components/common/CartDrawer";
import { HeaderLogo } from "./HeaderLogo";
import { HeaderNav } from "./HeaderNav";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderActions } from "./HeaderActions";
import { MobileMenu } from "./MobileMenu";
import type { NavigationItem } from "@/lib/types";

interface HeaderViewProps {
  handleSearch: (query: string) => void;
  language: string;
  onToggleLanguage: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  cartCount: number;
  onToggleCart: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  navItems: NavigationItem[];
}

/**
 * Pure view for storefront header shell.
 */
export function HeaderView({
  handleSearch,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  cartCount,
  onToggleCart,
  isLoggedIn,
  onLogout,
  isMenuOpen,
  onOpenMenu,
  onCloseMenu,
  navItems,
}: HeaderViewProps) {
  return (
    <>
      <header className="bg-card/80 backdrop-blur-lg sticky top-0 z-40 shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex w-full justify-between items-center py-4 gap-4">
            <HeaderLogo />
            <HeaderNav items={navItems} />
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
                onToggleMobileMenu={onOpenMenu}
              />
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={onCloseMenu}
        items={navItems}
        onSearch={handleSearch}
        language={language}
        onToggleLanguage={onToggleLanguage}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isLoggedIn={isLoggedIn}
        onLogout={() => {
          onCloseMenu();
          onLogout();
        }}
      />

      <CartDrawer />
    </>
  );
}
