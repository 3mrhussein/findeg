import ErrorPage from "@/components/common/ErrorPage";
import { getTranslations } from "next-intl/server";

/**
 *
 */
export default async function ProductNotFoundPage() {
  const t = await getTranslations();

  return (
    <ErrorPage
      title={t("Pages.ProductDetail.NotFound")}
      subtitle={t("Pages.ProductDetail.NotFoundDescription")}
      ctaLabel={t("Pages.ProductDetail.BackToShop")}
      ctaHref="/"
    />
  );
}
