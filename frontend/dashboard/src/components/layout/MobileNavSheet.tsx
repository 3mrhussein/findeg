"use client";

import { useState } from "react";
import { Link } from "@i18n/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@hooks/useUser";
import { useCategories, type Category } from "@hooks/useCategories";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui";
import { Menu, User, Settings, Heart, Image as ImageIcon, Search } from "lucide-react";

import ToggleLanguage from "@components/shared/ToggleLanguage";
import { ToggleTheme } from "@ui";

/**
 * Mobile Navigation Sheet
 * Displayed on screens < 768px in place of the Layer 3 Category Bar.
 */
export function MobileNavSheet() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, currentUser } = useUser();
  const t = useTranslations("Nav");
  const { categories, isLoading } = useCategories();

  const topLevelCategories = categories.filter((c: Category) => !c.parentId || c.depth === 0) || [];

  return (
    <div className="md:hidden flex items-center mr-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Menu className="size-6 text-slate-900 dark:text-white" />
          <span className="sr-only">Open menu</span>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[85vw] sm:w-[350px] p-0 flex flex-col h-full bg-white dark:bg-background overflow-hidden border-r-0"
        >
          <SheetHeader className="p-4 border-b border-slate-100 dark:border-slate-800 text-left bg-slate-50 dark:bg-slate-950/50">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

            {/* User Greeting */}
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-6" />
              </div>
              <div className="flex flex-col">
                {isLoggedIn ? (
                  <>
                    <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      Hello, {currentUser?.name || "User"}
                    </span>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      View Account
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      Welcome to FindEg
                    </span>
                    <div className="flex items-center gap-2 text-xs font-medium mt-0.5">
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="text-primary hover:underline"
                      >
                        Sign In
                      </Link>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <Link
                        href="/register"
                        onClick={() => setOpen(false)}
                        className="text-primary hover:underline"
                      >
                        Register
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto w-full">
            {/* Mobile Search Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <Link href="/search" onClick={() => setOpen(false)}>
                <div className="flex items-center gap-3 w-full h-10 px-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
                  <Search className="size-4" />
                  <span className="text-sm">Search FindEg...</span>
                </div>
              </Link>
            </div>

            {/* Category Accordion */}
            <div className="p-2">
              <h3 className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Departments
              </h3>
              {isLoading ? (
                <div className="p-4 text-center text-sm text-slate-400">Loading categories...</div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {topLevelCategories.map((cat: Category) => {
                    const subCats = categories.filter((c: Category) => c.parentId === cat.id);
                    return (
                      <AccordionItem value={`cat-${cat.id}`} key={cat.id} className="border-b-0">
                        <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-slate-900">
                          <div className="flex items-center gap-3 text-left">
                            <div className="flex size-8 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {cat.icon ? (
                                <span className="material-symbols-outlined text-[18px]">
                                  {cat.icon}
                                </span>
                              ) : (
                                <ImageIcon className="size-4" />
                              )}
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {cat.name}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2 pt-1 pl-12 pr-4">
                          <div className="flex flex-col space-y-1">
                            {subCats.length > 0 ? (
                              subCats.map((sub: Category) => (
                                <Link
                                  key={sub.id}
                                  href={`/shop/${sub.slug}`}
                                  onClick={() => setOpen(false)}
                                  className="block py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              ))
                            ) : (
                              <Link
                                href={`/shop/${cat.slug}`}
                                onClick={() => setOpen(false)}
                                className="block py-2 text-sm text-primary font-medium hover:underline transition-colors"
                              >
                                View all in {cat.name}
                              </Link>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>

            <div className="h-4"></div>
          </div>

          {/* Bottom Utility Strip */}
          <div className="mt-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Link
                href={isLoggedIn ? "/dashboard/wishlist" : "/login"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Heart className="size-4" />
                <span className="text-sm font-medium">{t("SavedItems") || "Saved"}</span>
              </Link>
              <Link
                href={isLoggedIn ? "/dashboard/orders" : "/login"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                <span className="text-sm font-medium">{t("Orders") || "Orders"}</span>
              </Link>
              <Link
                href={isLoggedIn ? "/dashboard/settings" : "/login"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Settings className="size-4" />
                <span className="text-sm font-medium">{t("Settings") || "Settings"}</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ToggleLanguage />
                <span className="text-xs font-semibold text-slate-500 uppercase">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Theme</span>
                <ToggleTheme />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
