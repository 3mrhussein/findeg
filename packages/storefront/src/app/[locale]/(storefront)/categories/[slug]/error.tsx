"use client";

import { PageStateError } from "@/components/shared/state/PageStateError";
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
      description={t("Pages.Shop.NoProductsDescription")}
      retryLabel={t("Common.TryAgain")}
      onRetry={reset}
    />
  );
}
