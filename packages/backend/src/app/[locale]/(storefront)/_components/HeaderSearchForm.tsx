"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconTooltip } from "@/components/ui/IconTooltip";
import { Search } from "lucide-react";
import { useHeaderSearch } from "@/features/catalog/presentation/hooks/useHeaderSearch";

interface HeaderSearchFormProps {
  compact?: boolean;
}

/**
 * Header search form for quick catalog lookup.
 */
export function HeaderSearchForm({ compact = false }: HeaderSearchFormProps) {
  const t = useTranslations();
  const { query, setQuery, submit } = useHeaderSearch();

  /**
   *
   */
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  if (compact) {
    return (
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Nav.SearchPlaceholder")}
          className="h-9"
        />
        <IconTooltip label={t("Layout.Header.SearchButton")} asChild>
          <Button type="submit" size="icon" aria-label={t("Layout.Header.SearchButton")}>
            <Search className="h-4 w-4" />
          </Button>
        </IconTooltip>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="hidden w-full max-w-sm items-center gap-2 xl:flex">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("Nav.SearchPlaceholder")}
      />
      <Button type="submit">{t("Layout.Header.SearchButton")}</Button>
    </form>
  );
}
