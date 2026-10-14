import { DEFAULT_LOCALE, LOCALES } from '@findeg/domain';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [...LOCALES],

  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,

  // Don't use a prefix for the default locale
  localePrefix: 'always',
});
