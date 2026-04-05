"use client";

import * as React from "react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MapPin, User, Heart, ShoppingCart, Menu, Flame, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/useUser";

import ToggleLanguage from "@/components/shared/ToggleLanguage";
import { ToggleTheme } from "@findeg/ui";
import { IconTooltip } from "@findeg/ui";
// Assuming CartTrigger exists in _components, we'll wrap it or use directly.
// For now we'll put a placeholder cart icon until CartSheet context is clear.
import { CartTrigger } from "@/app/[locale]/(storefront)/_components/CartTrigger";
import { NotificationBell } from "@/components/shared/NotificationBell";

import { SearchBar } from "./SearchBar";
import { MobileNavSheet } from "./MobileNavSheet";
import { MegaMenuOverlay } from "./MegaMenuOverlay";
import { useCategories } from "@/hooks/useCategories";
import { useLocale } from "next-intl";

/**
 * Storefront Navbar with Mega Menu
 *
 * 3-Layer Structure:
 * 1. Utility Bar
 * 2. Main Bar
 * 3. Category Bar (with Mega Menu Desktop)
 */
export function Navbar() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const { categories, isLoading } = useCategories(locale, "tree");
  const { isLoggedIn, currentUser } = useUser();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Top level categories for shortcuts
  const rootCategories = categories.filter((c) => c.depth === 0 || !c.parentId).slice(0, 7);

  // Close MegaMenu with delay on mouse exit
  /**
   *
   */
  const handleMouseEnterMenu = (slug?: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    if (slug) {
      setActiveCategorySlug(slug);
    }
    setIsMegaMenuOpen(true);
  };
  /**
   *
   */
  const handleMouseLeaveMenu = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      setActiveCategorySlug(null);
    }, 150);
  };

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col bg-white dark:bg-background">
      {/* ================= LAYER 1: UTILITY BAR ================= */}
      <div className="hidden h-9 w-full items-center justify-between border-b border-slate-100 bg-slate-50 px-4 text-xs dark:border-slate-800 dark:bg-slate-900/50 sm:flex lg:px-8">
        <div className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
          <MapPin className="size-3.5" />
          <span>Deliver to: Cairo</span>
        </div>
        <div className="flex items-center gap-4">
          <ToggleLanguage />
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
          <ToggleTheme />
        </div>
      </div>

      {/* ================= LAYER 2: MAIN BAR ================= */}
      <div className="flex h-16 w-full items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800 lg:px-8 bg-surface">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger (replaces Layer 3 on mobile) */}
          <MobileNavSheet />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white hidden sm:block">
              FindEg<span className="text-primary">.</span>
            </span>
          </Link>
        </div>
        {/* Center: Search Bar */}
        <div className="hidden flex-1 items-center justify-center px-8 md:flex max-w-2xl">
          <SearchBar />
        </div>
        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <div className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
              <IconTooltip icon={User} label={isLoggedIn ? "My Account" : "Sign In"} size={20} />
            </div>
          </Link>

          {isLoggedIn && <NotificationBell />}

          <Link href={isLoggedIn ? "/dashboard/wishlist" : "/login?returnUrl=/dashboard/wishlist"}>
            <div className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
              <IconTooltip icon={Heart} label="Saved Items" size={20} />
            </div>
          </Link>

          {/* Cart Trigger wrapped with Tooltip */}
          <div className="relative">
            <CartTrigger />
          </div>
        </div>
      </div>

      {/* ================= LAYER 3: CATEGORY BAR (Desktop Only) ================= */}
      <div className="hidden h-11 w-full items-center px-4 md:flex lg:px-8 bg-primary text-white relative">
        <div
          className="flex h-full items-center gap-2 px-4 cursor-pointer font-bold hover:bg-white/10 transition-colors"
          onMouseEnter={() => handleMouseEnterMenu()}
          onMouseLeave={handleMouseLeaveMenu}
        >
          <Menu className="size-5" />
          <span>All Categories</span>
        </div>

        {/* Dynamic Category Shortcuts */}
        <div className="flex-1 flex items-center gap-1 overflow-hidden px-4">
          {isLoading ? (
            <div className="flex items-center gap-4 opacity-50 animate-pulse">
              <div className="h-4 w-16 bg-white/20 rounded-full"></div>
              <div className="h-4 w-20 bg-white/20 rounded-full"></div>
              <div className="h-4 w-14 bg-white/20 rounded-full"></div>
            </div>
          ) : (
            rootCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="px-3 py-1 text-sm font-medium hover:bg-white/10 rounded-full cursor-pointer transition-colors whitespace-nowrap"
                onMouseEnter={() => handleMouseEnterMenu(cat.slug)}
                onMouseLeave={handleMouseLeaveMenu}
              >
                {cat.name}
              </Link>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 text-sm font-bold">
          <Link
            href="/shop?discount=on-sale&sort=popular"
            className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
          >
            <Flame className="size-4 text-amber-400" />
            <span>Deals</span>
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm ml-1">
              HOT
            </span>
          </Link>
          <Link
            href="/shop?sort=newest"
            className="flex items-center gap-1.5 hover:text-blue-200 transition-colors"
          >
            <Sparkles className="size-4" />
            <span>New Arrivals</span>
          </Link>
        </div>

        {/* ================= MEGA MENU OVERLAY ================= */}
        {isMegaMenuOpen && (
          <div
            className="absolute top-11 left-0 w-full"
            onMouseEnter={() => handleMouseEnterMenu()}
            onMouseLeave={handleMouseLeaveMenu}
          >
            <MegaMenuOverlay
              activeCategorySlug={activeCategorySlug}
              setActiveCategorySlug={setActiveCategorySlug}
            />
          </div>
        )}
      </div>
    </header>
  );
}
