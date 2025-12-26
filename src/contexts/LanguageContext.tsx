'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import frTranslations from '@/locales/fr.json';
import enTranslations from '@/locales/en.json';
import itTranslations from '@/locales/it.json';
import esTranslations from '@/locales/es.json';

type Locale = 'fr' | 'en' | 'it' | 'es';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import all translations statically so they're available immediately
const translations: Record<Locale, Record<string, any>> = {
  fr: frTranslations,
  en: enTranslations,
  it: itTranslations,
  es: esTranslations,
};

// Force rebuild of translations

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always default to French for both server and initial client render
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [mounted, setMounted] = useState(false);

  // Load saved locale from localStorage after mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && ['fr', 'en', 'it', 'es'].includes(savedLocale)) {
        setLocaleState(savedLocale);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Persist locale to localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };

  // Helper to resolve nested keys
  const resolvePath = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => {
      return (prev && prev[curr] !== undefined) ? prev[curr] : undefined;
    }, obj);
  };

  // Translation function with nested key support
  const t = (key: string): any => {
    // Try current locale
    let value = resolvePath(translations[locale], key);

    // Fallback to French if not found and we're not already using French
    if (value === undefined && locale !== 'fr') {
      value = resolvePath(translations['fr'], key);
    }

    return value !== undefined ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
