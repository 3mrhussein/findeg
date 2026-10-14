// Temporary compatibility entry; the Catalog package (@findeg/catalog) publishes the locale helpers.
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LocaleSchema,
  type Locale,
  valid,
  parse,
  TranslationMapSchema,
  type TranslationMap,
  asTranslationMap,
  pick,
} from '@findeg/catalog';
