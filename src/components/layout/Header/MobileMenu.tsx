"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/Icon";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/common/Logo";
import { useRouter } from "@/i18n/routing";
import type { NavigationItem, Theme } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

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

interface MobileNavLinkProps {
  item: NavigationItem;
  onClick: () => void;
  t: (key: any) => string;
}

/**
 *
 */
const MobileNavLink: React.FC<MobileNavLinkProps> = ({ item, onClick, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  /**
   *
   */
  const handleClick = (e: React.MouseEvent, href: string) => {
    if (item.id === "nav_ai_generator") {
      e.preventDefault();
      router.push("/");
      setTimeout(() => {
        document.querySelector("#ai-generator")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    onClick();
  };

  const hasSubItems = item.isMegaMenu && item.megaMenuColumns && item.megaMenuColumns.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between w-full">
        <Link
          href={item.href}
          onClick={(e) => !hasSubItems && handleClick(e, item.href)}
          className="text-lg font-medium py-2 block text-foreground hover:text-primary transition-colors flex-grow"
        >
          {item.labelKey}
        </Link>
        {hasSubItems && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-auto"
          >
            <Icon
              name="chevronDown"
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </Button>
        )}
      </div>

      {hasSubItems && isExpanded && (
        <div className="pl-4 mt-2 space-y-4 border-l-2 border-border/50 ml-2">
          {item.megaMenuColumns?.map((col) => (
            <div key={col.titleKey} className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider">
                {t(col.titleKey)}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={link.href}
                      onClick={onClick}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 py-1"
                    >
                      {t(link.labelKey)}
                      {link.isNew && (
                        <Badge variant="default" className="text-[10px] h-4 px-1">
                          NEW
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavigationItem[];
  onSearch: (query: string) => void;
  language: string;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

/**
 *
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items,
  onSearch,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  isLoggedIn,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations();
  const router = useRouter();

  /**
   *
   */
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery("");
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-card z-50 transform ${
        isOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
      } transition-transform duration-300 ease-in-out md:hidden flex flex-col`}
    >
      <div className="container mx-auto px-4 flex flex-col h-full overflow-y-auto">
        <div className="flex justify-between items-center py-4 border-b flex-shrink-0">
          <Logo />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu">
            <Icon name="x" className="w-6 h-6 text-foreground" />
          </Button>
        </div>

        <div className="p-4 flex-shrink-0">
          <form onSubmit={onSearchSubmit} className="w-full relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Nav.SearchPlaceholder")}
              className="rounded-full ltr:pr-12 rtl:pl-12 h-11"
            />
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              className="absolute top-1/2 -translate-y-1/2 ltr:right-1 rtl:left-1 text-muted-foreground"
              aria-label="Search"
            >
              <Icon name="search" className="w-6 h-6" />
            </Button>
          </form>
        </div>

        <nav className="flex flex-col items-start space-y-2 p-4 flex-grow">
          {items.map((item) => (
            <MobileNavLink key={item.labelKey} item={item} onClick={onClose} t={t} />
          ))}
        </nav>

        <div className="mt-auto p-4 border-t flex-shrink-0 bg-card">
          <div className="flex justify-around items-center mb-4">
            <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} />
            <LanguageSwitcher language={language} onToggleLanguage={onToggleLanguage} />
          </div>
          {!isLoggedIn ? (
            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  onClose();
                  router.push("/registration");
                }}
              >
                {t("Pages.Auth.RegistrationTitle")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  onClose();
                  router.push("/registration");
                }}
              >
                {t("Pages.Auth.LoginTitle")}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                onClose();
                onLogout();
              }}
            >
              {t("Pages.MyAccount.Logout")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
