"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

interface LogoUIProps {
  ariaLabel: string;
  subtitle: string;
}

/**
 * Lightweight, theme-friendly brand mark for storefront shell.
 */
export function LogoUI({ ariaLabel, subtitle }: LogoUIProps) {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label={ariaLabel}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6 18.5V6.5C6 5.67 6.67 5 7.5 5H18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 8.5H17.5V16.5C17.5 17.33 16.83 18 16 18H8C7.17 18 6.5 17.33 6.5 16.5V11.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10 12H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight text-foreground">FindEg</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </Link>
  );
}

/**
 *
 */
export function Logo() {
  const t = useTranslations();
  return <LogoUI ariaLabel={t("Common.LogoAriaLabel")} subtitle={t("Common.LogoSubtitle")} />;
}
