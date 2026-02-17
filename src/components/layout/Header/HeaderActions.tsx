"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/Icon";
import { IndicatorCircle } from "@/components/common/IndicatorCircle";
import { useTranslations } from "next-intl";
import { Theme } from "@/lib/types";
import { HeaderLocaleThemeControls } from "./HeaderLocaleThemeControls";
import { useHeaderActionsController } from "./useHeaderActionsController";

interface HeaderActionsProps {
  language: string;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  cartCount: number;
  onToggleCart: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
}

/**
 *
 */
export const HeaderActions: React.FC<HeaderActionsProps> = ({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  cartCount,
  onToggleCart,
  isLoggedIn,
  onLogout,
  onToggleMobileMenu,
}) => {
  const t = useTranslations();
  const { onGoToSchoolLists, onGoToAuth, onLogoutClick } = useHeaderActionsController({ onLogout });

  return (
    <div className="flex items-center space-x-2">
      <HeaderLocaleThemeControls
        language={language}
        onToggleLanguage={onToggleLanguage}
        theme={theme}
        onToggleTheme={onToggleTheme}
        className="hidden sm:flex items-center space-x-1"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCart}
        className="relative h-10 w-10"
        aria-label={t("Layout.Header.CartButton")}
      >
        <Icon name="shoppingCart" className="w-6 h-6 text-foreground" />
        {cartCount > 0 && <IndicatorCircle count={cartCount} />}
      </Button>
      <div className="hidden sm:flex items-center gap-2">
        <Button variant="outline" onClick={onGoToSchoolLists}>
          {t("Nav.SchoolLists")}
        </Button>
        {!isLoggedIn ? (
          <>
            <Button variant="ghost" onClick={onGoToAuth}>
              {t("Pages.Auth.LoginTitle")}
            </Button>
            <Button onClick={onGoToAuth}>{t("Pages.Auth.RegistrationTitle")}</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onLogoutClick}>
              {t("Pages.MyAccount.Logout")}
            </Button>
          </>
        )}
      </div>

      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="h-10 w-10"
          aria-label={t("Layout.Header.OpenMenuButton")}
        >
          <Icon name="menu" className="w-6 h-6 text-foreground" />
        </Button>
      </div>
    </div>
  );
};
