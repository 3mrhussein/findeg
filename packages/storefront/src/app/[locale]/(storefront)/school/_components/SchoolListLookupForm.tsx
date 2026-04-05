"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@findeg/ui";
import { Button } from "@findeg/ui";
import { useSchoolListLookup } from "@/hooks/useSchoolListLookup";

interface SchoolListLookupFormProps {
  initialCode?: string;
}

/**
 * School list lookup form that syncs to URL query state.
 */
export function SchoolListLookupForm({ initialCode = "" }: SchoolListLookupFormProps) {
  const t = useTranslations();
  const { code, setCode, submit } = useSchoolListLookup({ initialCode });

  /**
   *
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="school-list-code">
          {t("Pages.SchoolLists.FormTitle")}
        </label>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            id="school-list-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t("Pages.SchoolLists.Placeholder")}
            autoComplete="off"
          />
          <Button type="submit">{t("Pages.SchoolLists.Submit")}</Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t("Pages.SchoolLists.CodeHint")}</p>
    </form>
  );
}
