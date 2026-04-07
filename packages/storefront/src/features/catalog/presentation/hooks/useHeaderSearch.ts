"use client";

import { useState } from "react";
import { useRouter } from "@i18n/navigation";

interface UseHeaderSearchParams {
  initialQuery?: string;
}

export function useHeaderSearch({ initialQuery = "" }: UseHeaderSearchParams = {}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function submit() {
    const normalized = query.trim();
    if (!normalized) {
      router.push("/search");
      return;
    }

    const params = new URLSearchParams();
    params.set("q", normalized);
    router.push(`/search?${params.toString()}`);
  }

  return {
    query,
    setQuery,
    submit,
  };
}
