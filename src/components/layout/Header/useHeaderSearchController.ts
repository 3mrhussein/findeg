"use client";

import { FormEvent, useState } from "react";

interface UseHeaderSearchControllerParams {
  onSearch: (query: string) => void;
}

interface UseHeaderSearchControllerResult {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearchSubmit: (event: FormEvent) => void;
}

export function useHeaderSearchController({
  onSearch,
}: UseHeaderSearchControllerParams): UseHeaderSearchControllerResult {
  const [searchQuery, setSearchQuery] = useState("");

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      return;
    }

    onSearch(searchQuery.trim());
    setSearchQuery("");
  };

  return {
    searchQuery,
    setSearchQuery,
    onSearchSubmit,
  };
}
