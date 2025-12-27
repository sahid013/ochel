'use client';

import { useState, useEffect } from 'react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { Restaurant } from '@/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

interface QRCodeSectionProps {
  restaurant: Restaurant;
}

type QRStyle = 'squares' | 'dots' | 'rounded';

/**
 * QR Code Section for Restaurant Settings
 *
 * Displays a customizable QR code with controls
 * Positioned after the color customization section
 *
 * Features:
 * - Color customization
 * - Logo size adjustment
 * - Download and copy functionality
 *
 * @example
 * ```tsx
 * <QRCodeSection restaurant={restaurant} />
 * ```
 */
export function QRCodeSection({ restaurant }: QRCodeSectionProps) {
  const { t } = useTranslation();

  // Generate the public menu URL
  const menuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${restaurant.slug}`
    : `https://yoursite.com/${restaurant.slug}`;

  // Customization state - Initialize from database values
  const [qrColor, setQrColor] = useState(
    restaurant.qr_code_color || restaurant.primary_color || '#000000'
  );
  const [bgColor, setBgColor] = useState(restaurant.qr_code_bg_color || '#FFFFFF');
  const [logoSize, setLogoSize] = useState(restaurant.qr_code_logo_size || 10);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Save settings to database
  const saveSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('restaurants')
        .update({
          qr_code_color: qrColor,
          qr_code_bg_color: bgColor,
          qr_code_logo_size: logoSize,
        })
        .eq('id', restaurant.id);

      if (error) {
        console.error('Failed to save QR settings:', error);
      }
    } catch (err) {
      console.error('Error saving QR settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save when settings change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveSettings();
    }, 1000); // Save after 1 second of no changes

    return () => clearTimeout(timeoutId);
  }, [qrColor, bgColor, logoSize]);

  // Download handler
  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${restaurant.slug}-menu-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy handler
  const handleCopy = async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    const defaultColor = restaurant.primary_color || '#000000';
    setQrColor(defaultColor);
    setBgColor('#FFFFFF');
    setLogoSize(10);

    // Save the reset values immediately
    try {
      await supabase
        .from('restaurants')
        .update({
          qr_code_color: defaultColor,
          qr_code_bg_color: '#FFFFFF',
          qr_code_logo_size: 10,
        })
        .eq('id', restaurant.id);
    } catch (err) {
      console.error('Error resetting QR settings:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t('admin.qrCode.title')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('admin.qrCode.description')}
          </p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t('admin.qrCode.saving')}</span>
          </div>
        )}
      </div>

      {/* Main Layout: QR Code + Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: QR Code Preview */}
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8 border border-gray-200">
          <QRCodeGenerator
            value={menuUrl}
            width={400}
            height={300}
            logoUrl={restaurant.logo_url || undefined}
            logoSizePercent={logoSize}
            color={qrColor}
            backgroundColor={bgColor}
            errorCorrectionLevel="H"
            className="rounded-lg shadow-sm"
            onGenerated={setQrDataUrl}
          />
          <p className="text-sm text-gray-600 mt-4 text-center">
            {`${t('admin.qrCode.scanText')} ${restaurant.name}`}
          </p>
        </div>

        {/* Right: Customization Panel */}
        <div className="space-y-6">
          {/* Color Customization */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">
              {t('admin.qrCode.customize.colors')}
            </h4>

            {/* QR Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t('admin.qrCode.customize.qrColor')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F34A23] text-gray-900"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t('admin.qrCode.customize.bgColor')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F34A23] text-gray-900"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          {/* Logo Size */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">
              {t('admin.qrCode.customize.logoSize')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {t('admin.qrCode.customize.logoSizeLabel')}
                </label>
                <span className="text-sm text-gray-600">{logoSize}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F34A23]"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5%</span>
                <span>25%</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">
              {t('admin.qrCode.actions.title')}
            </h4>

            {/* Download & Copy */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                variant="secondary"
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('admin.qrCode.download')}
              </Button>

              <Button
                onClick={handleCopy}
                disabled={!qrDataUrl}
                variant="secondary"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('admin.qrCode.copied')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t('admin.qrCode.copy')}
                  </>
                )}
              </Button>
            </div>

            {/* Reset Button */}
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('admin.qrCode.actions.reset')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
