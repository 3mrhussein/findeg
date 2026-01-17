import { translations } from './i18n';
import { Language } from '@/types';

export function getTranslation(language: Language = 'en') {
  const t = (key: keyof typeof translations['en'], options?: { [key: string]: string | number }): string => {
    let translation = translations[language]?.[key] || translations['en'][key];
    if (options) {
      Object.keys(options).forEach(optKey => {
        translation = translation.replace(`{${optKey}}`, String(options[optKey]));
      });
    }
    return translation;
  };

  return { t, language };
}
