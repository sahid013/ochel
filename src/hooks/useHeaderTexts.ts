'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/contexts/LanguageContext';

interface HeaderTexts {
  headerText1: string;
  headerText2: string;
  headerText3: string;
}

/**
 * Custom hook to fetch header texts from database with multi-language support
 * These texts appear at the top of the reservation form
 * Falls back to translation files if database values don't exist
 */
export function useHeaderTexts() {
  const { locale, t } = useTranslation();
  const [headerTexts, setHeaderTexts] = useState<HeaderTexts>({
    headerText1: t('reservation.header.text1'),
    headerText2: t('reservation.header.text2'),
    headerText3: t('reservation.header.text3')
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHeaderTexts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: dbError } = await supabase
          .from('restaurant_settings')
          .select('setting_key, setting_value, setting_value_en, setting_value_it, setting_value_es')
          .in('setting_key', ['header_text_1', 'header_text_2', 'header_text_3']);

        if (dbError) {
          console.error('Error loading header texts:', dbError);
          setError('Failed to load header texts');
          return;
        }

        // Initialize with default values from translations
        const texts: HeaderTexts = {
          headerText1: t('reservation.header.text1'),
          headerText2: t('reservation.header.text2'),
          headerText3: t('reservation.header.text3')
        };

        // Update with database values if they exist
        if (data) {
          data.forEach((setting) => {
            let value;

            // Get value based on current locale
            switch (locale) {
              case 'en':
                value = setting.setting_value_en || setting.setting_value;
                break;
              case 'it':
                value = setting.setting_value_it || setting.setting_value;
                break;
              case 'es':
                value = setting.setting_value_es || setting.setting_value;
                break;
              default: // 'fr' or any other
                value = setting.setting_value;
            }

            // Map to header texts
            switch (setting.setting_key) {
              case 'header_text_1':
                texts.headerText1 = value || texts.headerText1;
                break;
              case 'header_text_2':
                texts.headerText2 = value || texts.headerText2;
                break;
              case 'header_text_3':
                texts.headerText3 = value || texts.headerText3;
                break;
            }
          });
        }

        setHeaderTexts(texts);
      } catch (err) {
        console.error('Error loading header texts:', err);
        setError('Failed to load header texts');
      } finally {
        setLoading(false);
      }
    };

    loadHeaderTexts();
  }, [locale, t]);

  return { headerTexts, loading, error };
}

