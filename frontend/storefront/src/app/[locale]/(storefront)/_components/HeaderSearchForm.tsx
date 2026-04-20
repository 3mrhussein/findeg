"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { IconTooltip } from "@findeg/ui";
import { Search } from "lucide-react";
import { useRouter } from "@i18n/navigation";
import { useState } from "react";

interface HeaderSearchFormProps {
  compact?: boolean;
}

/**
 * Header search form for quick catalog lookup.
 */
export function HeaderSearchForm({ compact = false }: HeaderSearchFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
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
