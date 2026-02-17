import { routing } from "@/i18n/routing";
import messages from "@/features/core/infrastructure/cms/messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
