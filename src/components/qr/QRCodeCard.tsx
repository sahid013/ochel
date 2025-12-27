'use client';

import { useState, useRef } from 'react';
import { QRCodeGenerator, QRCodeGeneratorProps } from './QRCodeGenerator';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/contexts/LanguageContext';

interface QRCodeCardProps extends QRCodeGeneratorProps {
  /**
   * Title for the QR code card
   */
  title?: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * File name for download
   * @default 'qrcode.png'
   */
  downloadFileName?: string;

  /**
   * Show download button
   * @default true
   */
  showDownload?: boolean;

  /**
   * Show copy button
   * @default true
   */
  showCopy?: boolean;

  /**
   * Custom actions
   */
  actions?: React.ReactNode;
}

/**
 * QR Code Card Component with Actions
 *
 * Provides a complete QR code card with:
 * - QR code generation
 * - Download functionality
 * - Copy to clipboard
 * - Custom actions
 *
 * @example
 * ```tsx
 * <QRCodeCard
 *   value="https://restaurant.com/menu"
 *   title="Menu QR Code"
 *   description="Scan to view our menu"
 *   logoUrl="/logo.png"
 *   downloadFileName="restaurant-menu-qr.png"
 * />
 * ```
 */
export function QRCodeCard({
  title = 'QR Code',
  description,
  downloadFileName = 'qrcode.png',
  showDownload = true,
  showCopy = true,
  actions,
  ...qrProps
}: QRCodeCardProps) {
  const { t } = useTranslation();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleQRGenerated = (dataUrl: string) => {
    setQrDataUrl(dataUrl);
    qrProps.onGenerated?.(dataUrl);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
      // Fallback: try copying the data URL as text
      try {
        await navigator.clipboard.writeText(qrDataUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}

      {/* QR Code */}
      <div className="flex justify-center mb-4">
        <QRCodeGenerator
          {...qrProps}
          onGenerated={handleQRGenerated}
          className="rounded-lg shadow-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {showDownload && (
          <Button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            variant="secondary"
            className="flex-1 min-w-[120px]"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t('admin.qrCode.download')}
          </Button>
        )}

        {showCopy && (
          <Button
            onClick={handleCopy}
            disabled={!qrDataUrl}
            variant="secondary"
            className="flex-1 min-w-[120px]"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t('admin.qrCode.copied')}
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {t('admin.qrCode.copy')}
              </>
            )}
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
}
