"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/types";

/**
 * Locale switcher that preserves current pathname and query-state.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   *
   */
  function switchLocale(nextLocale: Language) {
    if (nextLocale === locale) return;

    const query = searchParams?.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: nextLocale });
  }

  return (
    <div className="inline-flex items-center rounded-md border">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={locale === "en" ? "bg-muted" : ""}
        onClick={() => switchLocale("en")}
        aria-label="Switch to English"
      >
        EN
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={locale === "ar" ? "bg-muted" : ""}
        onClick={() => switchLocale("ar")}
        aria-label="التبديل إلى العربية"
      >
        AR
      </Button>
    </div>
  );
}
