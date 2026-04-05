"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "../ui/button";
import { IconTooltip } from "../ui/IconTooltip";

/**
 * A theme toggle component that switches between light and dark modes.
 */
export const ToggleTheme = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const label = nextTheme === "dark" ? "Switch to dark theme" : "Switch to light theme";

  return (
    <IconTooltip label={label} asChild>
      <Button variant="outline" size="icon" onClick={() => setTheme(nextTheme)} aria-label={label}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </IconTooltip>
  );
};
