import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getLocaleMessages } from './content';

export default getRequestConfig(async ({ locale }) => {
  // Validate locale or fallback to default
  const currentLocale = (routing.locales.includes(locale as any) 
    ? locale 
    : routing.defaultLocale) as 'en' | 'ar';

  return {
    locale: currentLocale,
    messages: getLocaleMessages(currentLocale)
  };
});
