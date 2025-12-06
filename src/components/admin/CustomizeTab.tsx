'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface CustomizeTabProps {
  restaurant: Restaurant;
}

export default function CustomizeTab({ restaurant }: CustomizeTabProps) {
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [customization, setCustomization] = useState({
    primaryColor: restaurant.primary_color || '#F34A23',
    accentColor: restaurant.accent_color || '#FFD65A',
    backgroundColor: restaurant.background_color || '#000000',
    textColor: restaurant.text_color || '#FFFFFF',
    font: restaurant.font_family || 'forum'
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { error } = await supabase
        .from('restaurants')
        .update({
          primary_color: customization.primaryColor,
          accent_color: customization.accentColor,
          background_color: customization.backgroundColor,
          text_color: customization.textColor,
          font_family: customization.font,
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      setSuccessMessage('Customization saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving customization:', error);
      setErrorMessage('Failed to save customization. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCustomization({
      primaryColor: '#F34A23',
      accentColor: '#FFD65A',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      font: 'forum'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Customization</h2>
          <p className="text-gray-600">
            Customize the colors and fonts for your menu templates. Changes will apply to all templates.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Font Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={customization.font}
              onChange={(e) => setCustomization({ ...customization, font: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F34A23]"
            >
              <option value="plus-jakarta-sans">Plus Jakarta Sans (Default)</option>
              <option value="forum">Forum</option>
              <option value="loubag">Loubag</option>
              <option value="satoshi">Satoshi</option>
              <option value="eb-garamond">EB Garamond</option>
              <option value="oswald">Oswald</option>
              <option value="inter">Inter</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select the font family for your menu templates
            </p>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={customization.primaryColor}
                onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customization.primaryColor}
                onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F34A23]"
                placeholder="#F34A23"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Main brand color used for buttons and highlights
            </p>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={customization.accentColor}
                onChange={(e) => setCustomization({ ...customization, accentColor: e.target.value })}
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customization.accentColor}
                onChange={(e) => setCustomization({ ...customization, accentColor: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F34A23]"
                placeholder="#FFD65A"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Secondary color for accents and emphasis
            </p>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={customization.backgroundColor}
                onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customization.backgroundColor}
                onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F34A23]"
                placeholder="#000000"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Main background color for the menu
            </p>
          </div>

          {/* Text Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={customization.textColor}
                onChange={(e) => setCustomization({ ...customization, textColor: e.target.value })}
                className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customization.textColor}
                onChange={(e) => setCustomization({ ...customization, textColor: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F34A23]"
                placeholder="#FFFFFF"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Main text color for menu content
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#F34A23] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#d63d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Apply Customization'
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Reset to Default
          </button>
        </div>


      </div>
    </div>
  );
}
