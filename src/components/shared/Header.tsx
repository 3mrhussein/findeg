import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Link } from "@/i18n/routing";
import { HeaderNavClient } from "./HeaderNavClient";
import ToggleLanguage from "./ToggleLanguage";
import ToggleTheme from "./ToggleTheme";
import { SearchOverlay } from "./SearchOverlay";

interface HeaderProps {
  locale: Locale;
}

/**
 *
 */
export async function Header({ locale }: HeaderProps) {
  const t = await getTranslations({ locale });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Listo<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/shop"
            className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            {t("Nav.Shop") || "Shop"}
          </Link>
          <Link
            href="/categories"
            className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            {t("Nav.Categories") || "Categories"}
          </Link>
          <Link
            href="/collections"
            className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            {t("Nav.Collections") || "Collections"}
          </Link>
          <Link
            href="/school-lists"
            className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            {t("Nav.SchoolLists") || "For Schools"}
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <ToggleLanguage />
            <ToggleTheme />
          </div>

          <SearchOverlay />

          <Link
            href="/admin"
            className="hidden sm:flex size-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="sr-only">Account</span>
          </Link>

          <HeaderNavClient />
        </div>
      </div>
    </header>
  );
}
