import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ProductNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({
    locale,
    namespace: "Pages",
  });

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-black text-foreground">{t("ProductDetail.NotFound")}</h1>
      <p className="mt-2 text-muted-foreground">{t("ProductDetail.NotFoundDescription")}</p>
      <Link
        href="/shop"
        className="mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold hover:bg-muted"
      >
        {t("ProductDetail.BackToShop")}
      </Link>
    </div>
  );
}
