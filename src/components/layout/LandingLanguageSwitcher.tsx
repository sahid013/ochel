'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const;

export function LandingLanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = (langCode: typeof languages[number]['code']) => {
    setLocale(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
        aria-label="Select language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm text-gray-700 font-medium hidden sm:inline">
          {currentLanguage.code.toUpperCase()}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full mt-2 right-0 min-w-[180px] rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-white z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-gray-50 ${
                locale === language.code ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className={`text-sm font-medium ${
                locale === language.code ? 'text-[#F34A23]' : 'text-gray-700'
              }`}>
                {language.label}
              </span>
              {locale === language.code && (
                <svg
                  className="w-4 h-4 ml-auto text-[#F34A23]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
