"use client";

import type { Theme } from "@/lib/types";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/Icon";

interface HeaderLocaleThemeControlsProps {
  language: string;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  className?: string;
}

export function HeaderLocaleThemeControls({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  className,
}: HeaderLocaleThemeControlsProps) {
  const t = useTranslations();

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleTheme}
        className="h-10 w-10"
        aria-label={t("Layout.Header.ToggleThemeButton")}
      >
        <Icon name={theme === "light" ? "moon" : "sun"} className="w-6 h-6" />
      </Button>
      <Button variant="ghost" onClick={onToggleLanguage} size="sm" className="min-h-10 min-w-10">
        {language === "en" ? "AR" : "EN"}
      </Button>
    </div>
  );
}
