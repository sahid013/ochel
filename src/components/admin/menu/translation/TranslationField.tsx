'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { translateText } from '@/lib/translate';

interface TranslationFieldProps {
  label: string;
  sourceText: string;
  value: string;
  onChange: (value: string) => void;
  targetLang: 'en' | 'it' | 'es';
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}

export function TranslationField({
  label,
  sourceText,
  value,
  onChange,
  targetLang,
  multiline = false,
  rows = 3,
  required = false,
  placeholder,
}: TranslationFieldProps) {
  const [translating, setTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!sourceText.trim()) {
      alert('Veuillez d\'abord remplir le champ français');
      return;
    }

    setTranslating(true);
    try {
      const translated = await translateText(sourceText, targetLang);
      onChange(translated);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Échec de la traduction. Veuillez saisir manuellement.');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={handleAutoTranslate}
          disabled={translating || !sourceText.trim()}
          className={`
            flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all
            ${translating || !sourceText.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }
          `}
        >
          {translating ? (
            <>
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Traduction...</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>Auto-traduire</span>
            </>
          )}
        </button>
      </div>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Traduction ${label.toLowerCase()}...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#F34A23] text-gray-900 placeholder:text-gray-400"
          rows={rows}
          required={required}
        />
      ) : (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Traduction ${label.toLowerCase()}...`}
          required={required}
        />
      )}
    </div>
  );
}
