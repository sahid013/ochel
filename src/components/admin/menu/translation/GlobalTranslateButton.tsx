'use client';

import { useState } from 'react';
import { translateText } from '@/lib/translate';

interface GlobalTranslateButtonProps {
  sourceFields: {
    [key: string]: string; // e.g., { title: "Salade César", description: "..." }
  };
  onTranslationsComplete: (translations: {
    en: { [key: string]: string };
    it: { [key: string]: string };
    es: { [key: string]: string };
  }) => void;
  disabled?: boolean;
}

export function GlobalTranslateButton({
  sourceFields,
  onTranslationsComplete,
  disabled = false,
}: GlobalTranslateButtonProps) {
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleGlobalTranslate = async () => {
    // Check if there are any source fields to translate
    const fieldsToTranslate = Object.entries(sourceFields).filter(
      ([_, value]) => value && value.trim()
    );

    if (fieldsToTranslate.length === 0) {
      alert('Veuillez d\'abord remplir au moins un champ français');
      return;
    }

    setTranslating(true);
    const totalOperations = fieldsToTranslate.length * 3; // 3 languages
    let currentOperation = 0;

    try {
      const translations = {
        en: {} as { [key: string]: string },
        it: {} as { [key: string]: string },
        es: {} as { [key: string]: string },
      };

      // Translate to all languages
      for (const [fieldName, sourceValue] of fieldsToTranslate) {
        if (!sourceValue.trim()) continue;

        // English
        setProgress({ current: ++currentOperation, total: totalOperations });
        translations.en[fieldName] = await translateText(sourceValue, 'en');

        // Italian
        setProgress({ current: ++currentOperation, total: totalOperations });
        translations.it[fieldName] = await translateText(sourceValue, 'it');

        // Spanish
        setProgress({ current: ++currentOperation, total: totalOperations });
        translations.es[fieldName] = await translateText(sourceValue, 'es');
      }

      onTranslationsComplete(translations);
    } catch (error) {
      console.error('Global translation error:', error);
      alert('Échec de la traduction automatique. Veuillez réessayer ou traduire manuellement.');
    } finally {
      setTranslating(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <button
      type="button"
      onClick={handleGlobalTranslate}
      disabled={translating || disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${translating || disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg'
        }
      `}
    >
      {translating ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">
            Traduction... ({progress.current}/{progress.total})
          </span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span className="text-sm font-semibold">Traduire Tout</span>
          <span className="hidden sm:inline text-xs opacity-90">(EN, IT, ES)</span>
        </>
      )}
    </button>
  );
}
