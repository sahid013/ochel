'use client';

import { GlobalTranslateButton } from './GlobalTranslateButton';

interface LanguageTabsProps {
  activeTab: 'fr' | 'en' | 'it' | 'es';
  onTabChange: (tab: 'fr' | 'en' | 'it' | 'es') => void;
  hasUnsavedChanges?: boolean;
  sourceFields?: { [key: string]: string };
  onGlobalTranslate?: (translations: {
    en: { [key: string]: string };
    it: { [key: string]: string };
    es: { [key: string]: string };
  }) => void;
}

export function LanguageTabs({
  activeTab,
  onTabChange,
  hasUnsavedChanges = false,
  sourceFields,
  onGlobalTranslate,
}: LanguageTabsProps) {
  const tabs = [
    { code: 'fr' as const, label: 'Français', flag: '🇫🇷', color: '#0055A4' },
    { code: 'en' as const, label: 'English', flag: '🇬🇧', color: '#C8102E' },
    { code: 'it' as const, label: 'Italiano', flag: '🇮🇹', color: '#009246' },
    { code: 'es' as const, label: 'Español', flag: '🇪🇸', color: '#C60B1E' },
  ];

  return (
    <div className="mb-6">
      {/* Global Translate Button - Only show on French tab */}
      {activeTab === 'fr' && sourceFields && onGlobalTranslate && (
        <div className="mb-4 flex justify-end">
          <GlobalTranslateButton
            sourceFields={sourceFields}
            onTranslationsComplete={onGlobalTranslate}
          />
        </div>
      )}

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 border-b border-gray-200 pb-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.code}
              type="button"
              onClick={() => onTabChange(tab.code)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-t-lg font-medium transition-all whitespace-nowrap
                ${activeTab === tab.code
                  ? 'bg-white text-gray-900 border-b-2 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              style={{
                borderBottomColor: activeTab === tab.code ? tab.color : 'transparent',
              }}
            >
              <span className="text-lg">{tab.flag}</span>
              <span className="text-sm font-semibold">{tab.code.toUpperCase()}</span>
              {tab.code === 'fr' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  Src
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab !== 'fr' && (
        <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            Traduction {tabs.find(t => t.code === activeTab)?.label} -
            Laissez vide pour afficher la version française par défaut
          </span>
        </div>
      )}
    </div>
  );
}
