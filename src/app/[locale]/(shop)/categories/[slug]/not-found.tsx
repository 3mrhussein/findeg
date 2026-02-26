import ErrorPage from "@/components/shared/ErrorPage";
import { getTranslations } from "next-intl/server";

/**
 *
 */
export default async function CategoryNotFoundPage() {
  const t = await getTranslations();

  return (
    <ErrorPage
      title={t("Pages.Categories.EmptyTitle")}
      subtitle={t("Pages.Categories.EmptyDescription")}
      ctaLabel={t("Pages.ProductDetail.BackToShop")}
      ctaHref="/"
    />
  );
}
