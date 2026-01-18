'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { Language } from '@/types';
import { translations } from '@/lib/i18n';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useMemo(() => (key: string, options?: { [key: string]: string | number }): string => {
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
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
