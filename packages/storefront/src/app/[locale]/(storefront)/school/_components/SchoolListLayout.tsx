"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useUser } from "@hooks/useUser";
import { User } from "lucide-react";

interface SchoolListLayoutProps {
  children: React.ReactNode;
  locale: string;
}

/**
 * Simple User Icon Nav for School Layout
 */
function UserIconNav() {
  const { isLoggedIn } = useUser();
  return (
    <Link href={isLoggedIn ? "/dashboard" : "/login"}>
      <div className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
        <User className="size-5" />
      </div>
    </Link>
  );
}

/**
 *
 */
export function SchoolListLayout({ children, locale }: SchoolListLayoutProps) {
  const t = useTranslations("School.ParentExperience.Layout");

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Slim Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">
                F
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 leading-none tracking-tight">FindEg</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  {t("PoweredBy")}
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/schools"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("FindAnotherSchool")}
            </Link>
            <UserIconNav />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Minimal Footer */}
      <footer className="py-8 border-t bg-white">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FindEg. {t("AllRightsReserved")}
          </p>
        </div>
      </footer>
    </div>
  );
}
