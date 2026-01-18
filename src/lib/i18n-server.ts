import { translations } from './i18n';
import { Language } from '@/types';

export function getTranslation(language: Language = 'en') {
  const t = (key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let current: any = translations;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = key;
        break;
      }
    }

    // After traversing, 'current' should be { en: '...', ar: '...' }
    let translation = '';
    if (current && typeof current === 'object' && (current.en || current.ar)) {
      translation = current[language] || current['en'] || key;
    } else {
      translation = typeof current === 'string' ? current : key;
    }

    if (options) {
      Object.keys(options).forEach(optKey => {
        translation = translation.replace(`{${optKey}}`, String(options[optKey]));
      });
    }
    
    return translation;
  };

  return { t, language };
}
