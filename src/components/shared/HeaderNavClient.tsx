"use client";

import { Link } from "@/i18n/routing";
import { Menu, User } from "lucide-react";
import type { HeaderCategoryNode } from "@/features/catalog/application/queries/header-nav";
import { Button } from "@/components/ui/button";
import ToggleTheme from "@/components/shared/ToggleTheme";
import ToggleLanguage from "@/components/shared/ToggleLanguage";
import { CartTrigger } from "@/app/[locale]/(shop)/_components/CartTrigger";
import { CartDrawer } from "@/app/[locale]/(shop)/_components/CartDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslations } from "next-intl";
import { logoutAction } from "@/features/identity/application/actions/auth";
import { HeaderSearchForm } from "@/app/[locale]/(shop)/_components/HeaderSearchForm";

interface HeaderNavClientProps {
  categories: HeaderCategoryNode[];
  isAuthenticated: boolean;
}

/**
 * Client-side header navigation with dynamic categories and utility actions.
 */
export function HeaderNavClient({ categories, isAuthenticated }: HeaderNavClientProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-2">
      <nav className="hidden items-center gap-4 lg:flex">
        <Link href="/shop" className="text-sm font-medium">
          {t("Nav.Shop")}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="px-2">
              {t("Nav.Categories")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[420px] p-3">
            <div className="grid grid-cols-2 gap-3">
              {categories.slice(0, 6).map((category) => (
                <div key={category.id} className="space-y-2">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {category.name}
                  </Link>
                  {category.children.length > 0 ? (
                    <div className="space-y-1">
                      {category.children.slice(0, 5).map((child) => (
                        <Link
                          key={child.id}
                          href={`/categories/${child.slug}`}
                          className="block text-xs text-muted-foreground hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/categories">{t("Nav.Categories")}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/search" className="text-sm font-medium">
          {t("Nav.Search")}
        </Link>
        <Link href="/school-lists" className="text-sm font-medium">
          {t("Nav.SchoolLists")}
        </Link>
        <Link href="/about" className="text-sm font-medium">
          {t("Nav.About")}
        </Link>
      </nav>

      <HeaderSearchForm />

      <div className="hidden items-center gap-2 md:flex">
        <ToggleLanguage />
        <ToggleTheme />
        <CartTrigger />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t("Nav.MyAccount")}>
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("Nav.MyAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAuthenticated ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/my-account">{t("Nav.MyAccount")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/checkout">{t("Pages.Checkout.Title")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action={logoutAction} className="w-full">
                    <button type="submit" className="w-full text-start">
                      {t("Pages.MyAccount.Logout")}
                    </button>
                  </form>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/login">{t("Pages.Auth.SigninLink")}</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={t("Layout.Header.OpenMenuButton")}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[320px]">
          <SheetHeader>
            <SheetTitle>{t("Nav.Shop")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            <div className="flex items-center gap-2">
              <ToggleLanguage />
              <ToggleTheme />
              <CartTrigger />
            </div>
            <HeaderSearchForm compact />
            <div className="space-y-2">
              <Link href="/shop" className="block text-sm font-medium">
                {t("Nav.Shop")}
              </Link>
              <Link href="/search" className="block text-sm font-medium">
                {t("Nav.Search")}
              </Link>
              <Link href="/school-lists" className="block text-sm font-medium">
                {t("Nav.SchoolLists")}
              </Link>
              <Link href="/about" className="block text-sm font-medium">
                {t("Nav.About")}
              </Link>
            </div>
            <Accordion type="single" collapsible>
              <AccordionItem value="categories">
                <AccordionTrigger>{t("Nav.Categories")}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="space-y-1">
                        <Link
                          href={`/categories/${category.slug}`}
                          className="block text-sm font-medium"
                        >
                          {category.name}
                        </Link>
                        {category.children.slice(0, 4).map((child) => (
                          <Link
                            key={child.id}
                            href={`/categories/${child.slug}`}
                            className="block ps-3 text-xs text-muted-foreground"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div>
              {isAuthenticated ? (
                <form action={logoutAction}>
                  <Button type="submit" variant="outline" className="w-full">
                    {t("Pages.MyAccount.Logout")}
                  </Button>
                </form>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login">{t("Pages.Auth.SigninLink")}</Link>
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <CartDrawer />
    </div>
  );
}
