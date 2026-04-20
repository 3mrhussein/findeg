"use client";

import { useState } from "react";
import { Link } from "@i18n/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, ToggleTheme } from "@findeg/ui";
import ToggleLanguage from "./ToggleLanguage";
import { Menu, User, LayoutDashboard } from "lucide-react";
import { useUser } from "@hooks/useUser";
import { CartTrigger } from "@app/[locale]/(storefront)/_components/CartTrigger";
import { useTranslations } from "next-intl";

/**
 *
 */
export function HeaderNavClient() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, currentUser, isLoading } = useUser();
  const t = useTranslations("Nav");

  return (
    <>
      <CartTrigger />

      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Menu className="h-5 w-5 text-slate-900 dark:text-white" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-left font-black tracking-tight text-xl">
                Ready<span className="text-primary">.</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6">
              {isLoggedIn && currentUser && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold truncate">{currentUser.name}</span>
                    <span className="text-xs text-slate-500 truncate">{currentUser.email}</span>
                  </div>
                </div>
              )}
              <nav className="flex flex-col gap-4">
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 hover:text-primary transition-colors"
                >
                  Shop
                </Link>
                <Link
                  href="/categories"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 hover:text-primary transition-colors"
                >
                  Collections
                </Link>
                <Link
                  href="/school-lists"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 hover:text-primary transition-colors"
                >
                  For Schools
                </Link>
                <Link
                  href={isLoggedIn ? "/dashboard" : "/login"}
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 hover:text-primary transition-colors"
                >
                  {isLoggedIn ? t("Dashboard") : t("Login")}
                </Link>
              </nav>

              <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Language
                  </span>
                  <ToggleLanguage />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Theme
                  </span>
                  <ToggleTheme />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
