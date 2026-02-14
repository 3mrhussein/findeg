"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/common/Icon";
import { useTranslations } from "next-intl";

interface HeaderSearchProps {
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 *
 */
export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  onSearch,
  className = "",
  placeholder,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations();

  /**
   *
   */
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery("");
    }
  };

  return (
    <form onSubmit={onSearchSubmit} className={`relative ${className}`}>
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder || t("Nav.SearchPlaceholder")}
        className="w-32 lg:w-48 bg-muted border-transparent h-9 rounded-full ltr:pl-4 rtl:pr-4 ltr:pr-10 rtl:pl-10 text-sm transition-all duration-300 focus:w-48 lg:focus:w-64"
      />
      <Button
        size="icon"
        variant="ghost"
        type="submit"
        className="absolute top-1/2 -translate-y-1/2 ltr:right-0 rtl:left-0 h-9 w-9 text-muted-foreground hover:text-primary"
        aria-label="Search"
      >
        <Icon name="search" className="w-5 h-5" />
      </Button>
    </form>
  );
};
