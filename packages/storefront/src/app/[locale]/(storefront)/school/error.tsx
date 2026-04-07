"use client";

import { PageStateError } from "@components/shared/state/PageStateError";
import { useTranslations } from "next-intl";

interface SchoolErrorProps {
  reset: () => void;
}

/**
 *
 */
export default function SchoolError({ reset }: SchoolErrorProps) {
  const t = useTranslations();

  return (
    <PageStateError
      title={t("Common.ErrorOccurred")}
      description={t("Pages.SchoolLists.Subtitle")}
      retryLabel={t("Common.TryAgain")}
      onRetry={reset}
    />
  );
}
