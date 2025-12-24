import { useState, useEffect } from 'react';
import { FontSelect } from './FontSelect';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { parseFontConfig } from '@/lib';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/demo/ImageUploader';
import { useTranslation } from '@/contexts/LanguageContext';

interface CustomizeTabProps {
  restaurant: Restaurant;
}

export function CustomizeTab({ restaurant }: CustomizeTabProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initial font parsing
  const initialFonts = parseFontConfig(restaurant.font_family);

  const [customization, setCustomization] = useState({
    primaryColor: restaurant.primary_color || '',
    contactEmail: restaurant.email || '',
    // accentColor: restaurant.accent_color || '', // Restricted
    // backgroundColor: restaurant.background_color || '', // Restricted
    // textColor: restaurant.text_color || '', // Restricted
    headerFont: initialFonts.header,
    bodyFont: initialFonts.body
  });

  // Logo state for ImageUploader (expects array)
  const [logoImages, setLogoImages] = useState<(File | string | null)[]>([
    restaurant.logo_url as any || null
  ]);

  // Hero Image state for ImageUploader
  const [heroImages, setHeroImages] = useState<(File | string | null)[]>([
    restaurant.hero_image_url as any || null
  ]);

  // Helper to upload file to Supabase (reused for both logo and hero)
  const uploadFile = async (file: File, bucket: string = 'brand-assets'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.slug}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error(`Error uploading file to ${bucket}:`, error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Combine fonts into JSON structure
      const fontConfig = (!customization.headerFont && !customization.bodyFont)
        ? null
        : JSON.stringify({
          header: customization.headerFont,
          body: customization.bodyFont
        });

      // Handle Logo Upload
      let finalLogoUrl = null;
      const currentLogo = logoImages[0];

      if (currentLogo instanceof File) {
        finalLogoUrl = await uploadFile(currentLogo, 'brand-assets');
      } else if (typeof currentLogo === 'string') {
        finalLogoUrl = currentLogo;
      }

      // Handle Hero Image Upload
      let finalHeroUrl = null;
      const currentHero = heroImages[0];

      if (currentHero instanceof File) {
        // Uploading to 'brand-assets' bucket as requested by user
        finalHeroUrl = await uploadFile(currentHero, 'brand-assets');
      } else if (typeof currentHero === 'string') {
        finalHeroUrl = currentHero;
      }

      const { error } = await supabase
        .from('restaurants')
        .update({
          logo_url: finalLogoUrl as any,
          hero_image_url: finalHeroUrl as any,
          email: customization.contactEmail,
          primary_color: customization.primaryColor || null as any,
          // accent_color: customization.accentColor, // Restricted
          // background_color: customization.backgroundColor, // Restricted
          // text_color: customization.textColor, // Restricted
          font_family: fontConfig,
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      setSuccessMessage(t('admin.customize.success'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving customization:', error);
      setErrorMessage(t('admin.customize.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('restaurants')
        .update({
          primary_color: null as any,
          logo_url: null as any,
          hero_image_url: null as any,
          font_family: null, // font_family likely accepts Json or null
          email: null as any
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      setCustomization({
        primaryColor: '',
        // accentColor: '', // Restricted
        // backgroundColor: '', // Restricted
        // textColor: '', // Restricted
        contactEmail: '',
        headerFont: '',
        bodyFont: ''
      });
      setLogoImages([]);
      setHeroImages([]);

      setSuccessMessage(t('admin.customize.success'));
      setTimeout(() => setSuccessMessage(''), 3000);

      router.refresh();
    } catch (err: any) {
      console.error('Error resetting customization:', err);
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Individual Reset Handlers
  const resetPrimaryColor = () => setCustomization({ ...customization, primaryColor: '' });
  const resetLogo = () => setLogoImages([]);
  const resetHero = () => setHeroImages([]);
  const resetHeaderFont = () => setCustomization({ ...customization, headerFont: '' });
  const resetBodyFont = () => setCustomization({ ...customization, bodyFont: '' });

  const fontOptions = [
    { value: 'plus-jakarta-sans', label: 'Plus Jakarta Sans', fontFamily: 'var(--font-plus-jakarta-sans)' },
    { value: 'forum', label: 'Forum', fontFamily: 'var(--font-forum)' },
    { value: 'loubag', label: 'Loubag', fontFamily: 'var(--font-loubag)' },
    { value: 'satoshi', label: 'Satoshi', fontFamily: 'var(--font-satoshi)' },
    { value: 'eb-garamond', label: 'EB Garamond', fontFamily: 'var(--font-eb-garamond)' },
    { value: 'oswald', label: 'Oswald', fontFamily: 'var(--font-oswald)' },
    { value: 'inter', label: 'Inter', fontFamily: 'var(--font-inter)' },
    { value: 'sans-serif', label: 'Sans Serif', fontFamily: 'var(--font-sans)' },
    { value: 'serif', label: 'Serif', fontFamily: 'var(--font-serif)' },
  ];

  const inputStyle = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400";
  const inputBorderColor = { borderColor: 'rgba(71, 67, 67, 0.1)' };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('admin.customize.title')}</h2>
          <p className="text-gray-600">
            {t('admin.customize.subtitle')}
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
          {/* Logo Upload */}
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.customize.branding.title')}</h3>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Logo Upload */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    {t('admin.customize.branding.logo.label')}
                    <div className="group relative">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        <p className="font-semibold mb-1">{t('admin.customize.branding.logo.tooltipTitle')}</p>
                        <p>{t('admin.customize.branding.logo.tooltipText')}</p>
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  {logoImages.length > 0 && (logoImages[0] !== null) && (
                    <button onClick={resetLogo} className="text-xs text-red-500 hover:text-red-700 underline">
                      {t('admin.customize.branding.logo.reset')}
                    </button>
                  )}
                </div>
                <div className="w-full">
                  <ImageUploader
                    images={logoImages}
                    onImagesChange={setLogoImages}
                    maxImages={1}
                    loadingText={t('admin.customize.buttons.saving')}
                    placeholderText={t('admin.customize.branding.logo.placeholder')}
                    aspectRatio="h-20 w-40" // Rectangular for logos
                    instanceId="logo-uploader"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {t('admin.customize.branding.logo.helpText')}
                  </p>
                </div>
              </div>

              {/* Hero Image Upload */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    {t('admin.customize.branding.hero.label')}
                    <div className="group relative">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                        <p className="font-semibold mb-1">{t('admin.customize.branding.hero.tooltipTitle')}</p>
                        <p>{t('admin.customize.branding.hero.tooltipText')}</p>
                        <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  {heroImages.length > 0 && (heroImages[0] !== null) && (
                    <button onClick={resetHero} className="text-xs text-red-500 hover:text-red-700 underline">
                      {t('admin.customize.branding.logo.reset')}
                    </button>
                  )}
                </div>
                <div className="w-full">
                  <ImageUploader
                    images={heroImages}
                    onImagesChange={setHeroImages}
                    maxImages={1}
                    loadingText={t('admin.customize.buttons.saving')}
                    placeholderText={t('admin.customize.branding.hero.placeholder')}
                    aspectRatio="h-32 w-full" // Wider aspect ratio for hero
                    instanceId="hero-uploader"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {t('admin.customize.branding.hero.helpText')}
                  </p>
                </div>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  {t('admin.customize.branding.email.label')}
                  <div className="group relative">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                      <p className="font-semibold mb-1">{t('admin.customize.branding.email.tooltipTitle')}</p>
                      <p>{t('admin.customize.branding.email.tooltipText')}</p>
                      <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </label>
                <input
                  type="email"
                  value={customization.contactEmail}
                  onChange={(e) => setCustomization({ ...customization, contactEmail: e.target.value })}
                  className={inputStyle}
                  style={inputBorderColor}
                  placeholder="contact@exemple.com"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {t('admin.customize.branding.email.helpText')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Font Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Header Font */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                {t('admin.customize.fonts.header.label')}
                <div className="group relative">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    <p className="font-semibold mb-1">{t('admin.customize.fonts.header.tooltipTitle')}</p>
                    <p>{t('admin.customize.fonts.header.tooltipText')}</p>
                    <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>
              {customization.headerFont && (
                <button onClick={resetHeaderFont} className="text-xs text-red-500 hover:text-red-700 underline">
                  {t('admin.customize.fonts.reset')}
                </button>
              )}
            </div>
            <FontSelect
              value={customization.headerFont}
              onChange={(value) => setCustomization({ ...customization, headerFont: value })}
              options={fontOptions}
              className={inputStyle}
              style={inputBorderColor}
              placeholder={t('admin.customize.fonts.placeholder')}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.customize.fonts.header.helpText')}
            </p>
          </div>

          {/* Body Font */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                {t('admin.customize.fonts.body.label')}
                <div className="group relative">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    <p className="font-semibold mb-1">{t('admin.customize.fonts.header.tooltipTitle')}</p>
                    <p>{t('admin.customize.fonts.body.tooltipText')}</p>
                    <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>
              {customization.bodyFont && (
                <button onClick={resetBodyFont} className="text-xs text-red-500 hover:text-red-700 underline">
                  {t('admin.customize.fonts.reset')}
                </button>
              )}
            </div>
            <FontSelect
              value={customization.bodyFont}
              onChange={(value) => setCustomization({ ...customization, bodyFont: value })}
              options={fontOptions}
              className={inputStyle}
              style={inputBorderColor}
              placeholder={t('admin.customize.fonts.placeholder')}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.customize.fonts.body.helpText')}
            </p>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-6 pt-4 border-t border-gray-100">
          {/* Primary Color */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                {t('admin.customize.colors.primary.label')}
                <div className="group relative">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    <p className="font-semibold mb-1">{t('admin.customize.colors.primary.tooltipTitle')}</p>
                    <p>{t('admin.customize.colors.primary.tooltipText')}</p>
                    <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </label>
              {customization.primaryColor && (
                <button onClick={resetPrimaryColor} className="text-xs text-red-500 hover:text-red-700 underline">
                  {t('admin.customize.fonts.reset')}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <input
                type="color"
                value={customization.primaryColor}
                onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                className="w-20 h-[50px] border border-gray-300 rounded-lg cursor-pointer p-1"
              />
              <input
                type="text"
                value={customization.primaryColor}
                onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                className={inputStyle}
                style={inputBorderColor}
                placeholder="#F34A23"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.customize.colors.primary.helpText')}
            </p>
          </div>

          {/* Other colors restricted */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#F34A23] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#d63d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {t('admin.customize.buttons.saving')}
            </>
          ) : (
            t('admin.customize.buttons.save')
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={saving}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {t('admin.customize.buttons.reset')}
        </button>
      </div>
    </div>
  );
}
