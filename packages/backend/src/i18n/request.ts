import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const base = `../features/core/infrastructure/cms/messages`;
  const [storefront, dashboard] = await Promise.all([
    import(`${base}/storefront.${locale}.json`).then((m) => m.default),
    import(`${base}/dashboard.${locale}.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      ...storefront,
      ...dashboard,
      // Deep-merge `Pages` since both files contribute sub-keys under it
      Pages: {
        ...storefront.Pages,
        ...dashboard.Pages,
      },
    },
  };
});
