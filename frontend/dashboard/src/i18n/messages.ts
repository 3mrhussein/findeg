import type { Locale } from '@findeg/domain';
import type { RequestConfig } from 'next-intl/server';

type MessageLoader = () => Promise<NonNullable<RequestConfig['messages']>>;

/** Each supported Domain locale must supply a translation file. */
export const messageLoaders: Record<Locale, MessageLoader> = {
  en: () => import('../../messages/en.json').then((module) => module.default),
  ar: () => import('../../messages/ar.json').then((module) => module.default),
} satisfies Record<Locale, MessageLoader>;
