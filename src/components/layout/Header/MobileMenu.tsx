"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/common/Logo";
import { Icon } from "@/components/common/Icon";
import { HeaderLocaleThemeControls } from "./HeaderLocaleThemeControls";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { NavigationItem, Theme } from "@/lib/types";
import { useMobileMenuController } from "./useMobileMenuController";

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

function MobileMenuLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block w-full rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
    >
      {label}
    </Link>
  );
}

export function MobileMenu({
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
}: MobileMenuProps) {
  const t = useTranslations();
  const translate = (key: string) => t(key as never);
  const {
    searchQuery,
    setSearchQuery,
    onSearchSubmit,
    onGoToSchoolLists,
    onGoToAuth,
    onLogoutClick,
  } = useMobileMenuController({ onSearch, onClose, onLogout });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="sr-only">{t("Layout.Header.OpenMenuButton")}</SheetTitle>
          <div className="flex items-center justify-between">
            <Logo />
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
              <Icon name="x" className="w-6 h-6 text-foreground" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex h-full flex-col overflow-y-auto pb-8">
          <div className="border-b p-4">
            <form onSubmit={onSearchSubmit} className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("Nav.SearchPlaceholder")}
                className="h-11 rounded-full ltr:pr-12 rtl:pl-12"
              />
              <Button
                size="icon"
                variant="ghost"
                type="submit"
                className="absolute top-1/2 h-10 w-10 -translate-y-1/2 ltr:right-1 rtl:left-1"
                aria-label={t("Layout.Header.SearchButton")}
              >
                <Icon name="search" className="w-5 h-5" />
              </Button>
            </form>
            <Button variant="outline" className="mt-3 w-full" onClick={onGoToSchoolLists}>
              {t("Nav.SchoolLists")}
            </Button>
          </div>

          <nav className="flex flex-col gap-1 p-4">
            {items.map((item) => (
              <MobileMenuLink
                key={item.labelKey}
                href={item.href}
                onNavigate={onClose}
                label={translate(item.labelKey)}
              />
            ))}
          </nav>

          <div className="mt-auto border-t p-4">
            <HeaderLocaleThemeControls
              language={language}
              onToggleLanguage={onToggleLanguage}
              theme={theme}
              onToggleTheme={onToggleTheme}
              className="mb-4 flex justify-around"
            />
            {!isLoggedIn ? (
              <div className="space-y-2">
                <Button size="lg" className="w-full" onClick={onGoToAuth}>
                  {t("Pages.Auth.RegistrationTitle")}
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={onGoToAuth}>
                  {t("Pages.Auth.LoginTitle")}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="lg" className="w-full" onClick={onLogoutClick}>
                {t("Pages.MyAccount.Logout")}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
