import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the requestLocale promise provided by next-intl
  const locale = await requestLocale;
  
  // Validate the locale and fallback to default if necessary
  const finalLocale = hasLocale(routing.locales, locale) 
    ? locale 
    : routing.defaultLocale;

  // Load dashboard-specific messages
  const messages = (await import(`../../messages/${finalLocale}.json`)).default;

  return {
    locale: finalLocale,
    messages,
  };
});

