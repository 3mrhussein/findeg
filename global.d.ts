import { routing } from "@/i18n/routing";
import storefront from "@/features/core/infrastructure/cms/messages/storefront.en.json";
import dashboard from "@/features/core/infrastructure/cms/messages/dashboard.en.json";

type StorefrontMessages = typeof storefront;
type DashboardMessages = typeof dashboard;

// Omit 'Pages' from both and combine them, then manually combine 'Pages'
type MergedMessages = Omit<StorefrontMessages, "Pages"> &
  Omit<DashboardMessages, "Pages"> & {
    Pages: StorefrontMessages["Pages"] & DashboardMessages["Pages"];
  };

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: MergedMessages;
  }
}
