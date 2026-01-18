'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { Language } from '@/types';
import { translations } from '@/lib/i18n';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], options?: { [key: string]: string | number }) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useMemo(() => (key: keyof typeof translations['en'], options?: { [key: string]: string | number }): string => {
    let translation = translations[language]?.[key] || translations['en'][key];
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
