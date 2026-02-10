'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Language } from '@/src/domain/entities/Language';
import { translate } from '@/src/presentation/i18n';

interface I18nContextValue {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale?: Language;
}) {
  const [locale, setLocale] = useState<Language>(initialLocale);

  const t = useCallback(
    (key: string) => translate(key, locale),
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
