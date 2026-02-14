"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/Icon";
import { IndicatorCircle } from "@/components/common/IndicatorCircle";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Theme } from "@/lib/types";

interface LanguageSwitcherProps {
  language: string;
  onToggleLanguage: () => void;
}

/**
 *
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, onToggleLanguage }) => {
  return (
    <Button variant="ghost" onClick={onToggleLanguage} size="sm">
      {language === "en" ? "AR" : "EN"}
    </Button>
  );
};

interface ThemeSwitcherProps {
  theme: Theme;
  onToggleTheme: () => void;
}

/**
 *
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onToggleTheme }) => {
  return (
    <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
      <Icon name={theme === "light" ? "moon" : "sun"} className="w-6 h-6" />
    </Button>
  );
};

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
  const router = useRouter();

  return (
    <div className="flex items-center space-x-2">
      <div className="hidden sm:flex items-center space-x-1">
        <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} />
        <LanguageSwitcher language={language} onToggleLanguage={onToggleLanguage} />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCart}
        className="relative"
        aria-label={t("Layout.Header.CartButton")}
      >
        <Icon name="shoppingCart" className="w-6 h-6 text-foreground" />
        {cartCount > 0 && <IndicatorCircle count={cartCount} />}
      </Button>
      <div className="hidden sm:flex items-center gap-2">
        {!isLoggedIn ? (
          <>
            <Button variant="ghost" onClick={() => router.push("/registration")}>
              {t("Pages.Auth.LoginTitle")}
            </Button>
            <Button onClick={() => router.push("/registration")}>
              {t("Pages.Auth.RegistrationTitle")}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onLogout}>
              {t("Pages.MyAccount.Logout")}
            </Button>
          </>
        )}
      </div>

      <div className="md:hidden">
        <Button variant="ghost" size="icon" onClick={onToggleMobileMenu} aria-label="Open menu">
          <Icon name="menu" className="w-6 h-6 text-foreground" />
        </Button>
      </div>
    </div>
  );
};
