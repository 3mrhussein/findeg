import { getLocaleMessages } from '../i18n/content';

type Messages = ReturnType<typeof getLocaleMessages>;

declare global {
  // Use type safe message keys in useTranslations()
  interface IntlMessages extends Messages {}
}
