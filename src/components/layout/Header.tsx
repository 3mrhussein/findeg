"use client";

import { HeaderView } from "./Header/HeaderView";
import { useHeaderController } from "./Header/useHeaderController";

/**
 * Storefront shell header container.
 */
export function Header() {
  const controller = useHeaderController();

  return (
    <HeaderView
      handleSearch={controller.onSearch}
      language={controller.locale}
      onToggleLanguage={controller.onToggleLanguage}
      theme={controller.theme}
      onToggleTheme={controller.onToggleTheme}
      cartCount={controller.cartCount}
      onToggleCart={controller.onToggleCart}
      isLoggedIn={controller.isLoggedIn}
      onLogout={controller.onLogout}
      isMenuOpen={controller.isMenuOpen}
      onOpenMenu={controller.onOpenMobileMenu}
      onCloseMenu={controller.onCloseMobileMenu}
      navItems={controller.navItems}
    />
  );
}
