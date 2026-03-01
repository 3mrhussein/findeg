"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CartTrigger } from "@/app/[locale]/(shop)/_components/CartTrigger";
import ToggleLanguage from "./ToggleLanguage";
import ToggleTheme from "./ToggleTheme";
import { Menu } from "lucide-react";

/**
 *
 */
export function HeaderNavClient() {
  const [open, setOpen] = useState(false);

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
              <nav className="flex flex-col gap-4">
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-slate-900 dark:text-white"
                >
                  Shop
                </Link>
                <Link
                  href="/categories"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-slate-900 dark:text-white"
                >
                  Collections
                </Link>
                <Link
                  href="/school-lists"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-slate-900 dark:text-white"
                >
                  For Schools
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-slate-900 dark:text-white"
                >
                  Account
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
