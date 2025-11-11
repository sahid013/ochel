-- Migration: Add multi-language support to restaurant_settings
-- Date: 2025-10-18
-- Description: Adds language-specific columns for English, Italian, and Spanish translations

-- Add language-specific columns
ALTER TABLE restaurant_settings
  ADD COLUMN IF NOT EXISTS setting_value_en TEXT,
  ADD COLUMN IF NOT EXISTS setting_value_it TEXT,
  ADD COLUMN IF NOT EXISTS setting_value_es TEXT;

-- Update column comments
COMMENT ON COLUMN restaurant_settings.setting_value IS 'Setting value in French (default language)';
COMMENT ON COLUMN restaurant_settings.setting_value_en IS 'Setting value in English';
COMMENT ON COLUMN restaurant_settings.setting_value_it IS 'Setting value in Italian';
COMMENT ON COLUMN restaurant_settings.setting_value_es IS 'Setting value in Spanish';

-- Note: The existing `setting_value` column is used for French (the primary language)
