"use client";

import { PageStateError } from "@/components/common/state/PageStateError";
import { useTranslations } from "next-intl";

interface CategoryErrorProps {
  reset: () => void;
}

/**
 *
 */
export default function CategoryError({ reset }: CategoryErrorProps) {
  const t = useTranslations();

  return (
    <PageStateError
      title={t("Common.ErrorOccurred")}
      description={t("Pages.Shop.NoProducts")}
      retryLabel={t("Common.TryAgain")}
      onRetry={reset}
    />
  );
}
