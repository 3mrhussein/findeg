"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/routing";

interface UseMobileMenuControllerParams {
  onSearch: (query: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

interface UseMobileMenuControllerResult {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearchSubmit: (event: FormEvent) => void;
  onGoToSchoolLists: () => void;
  onGoToAuth: () => void;
  onLogoutClick: () => void;
}

export function useMobileMenuController({
  onSearch,
  onClose,
  onLogout,
}: UseMobileMenuControllerParams): UseMobileMenuControllerResult {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    onSearch(searchQuery.trim());
    setSearchQuery("");
    onClose();
  };

  const onGoToSchoolLists = () => {
    onClose();
    router.push("/school-lists");
  };

  const onGoToAuth = () => {
    onClose();
    router.push("/registration");
  };

  const onLogoutClick = () => {
    onClose();
    onLogout();
  };

  return {
    searchQuery,
    setSearchQuery,
    onSearchSubmit,
    onGoToSchoolLists,
    onGoToAuth,
    onLogoutClick,
  };
}
