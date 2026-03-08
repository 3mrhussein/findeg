import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ProductNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({
    locale,
    namespace: "Pages.ProductDetail",
  });

  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="text-2xl font-black text-foreground">{t("NotFound")}</h1>
      <p className="mt-2 text-muted-foreground">{t("NotFoundDescription")}</p>
      <Link
        href="/shop"
        className="mt-6 inline-flex rounded-full border px-4 py-2 text-sm font-semibold hover:bg-muted"
      >
        {t("BackToShop")}
      </Link>
    </div>
  );
}
