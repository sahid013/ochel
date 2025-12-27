'use client';

import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';

export interface QRCodeGeneratorProps {
  /**
   * The data to encode in the QR code (e.g., URL)
   */
  value: string;

  /**
   * Width of the QR code in pixels
   * @default 400
   */
  width?: number;

  /**
   * Height of the QR code in pixels
   * @default 300
   */
  height?: number;

  /**
   * URL or base64 of the logo to display in the center
   */
  logoUrl?: string;

  /**
   * Size of the logo as a percentage of the QR code width (0-100)
   * @default 10
   */
  logoSizePercent?: number;

  /**
   * QR code foreground color
   * @default '#000000'
   */
  color?: string;

  /**
   * QR code background color
   * @default '#FFFFFF'
   */
  backgroundColor?: string;

  /**
   * Error correction level
   * @default 'M'
   */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';

  /**
   * Margin around the QR code
   * @default 4
   */
  margin?: number;

  /**
   * Custom class name for the canvas
   */
  className?: string;

  /**
   * Callback when QR code is generated
   */
  onGenerated?: (dataUrl: string) => void;
}

/**
 * Professional QR Code Generator Component
 *
 * Features:
 * - Rectangular QR codes with custom dimensions
 * - Logo overlay in the center
 * - Customizable colors and styling
 * - High-quality canvas rendering
 * - Reusable across the application
 *
 * @example
 * ```tsx
 * <QRCodeGenerator
 *   value="https://example.com/menu"
 *   width={400}
 *   height={300}
 *   logoUrl="/logo.png"
 *   logoSizePercent={10}
 * />
 * ```
 */
export function QRCodeGenerator({
  value,
  width = 400,
  height = 300,
  logoUrl,
  logoSizePercent = 10,
  color = '#000000',
  backgroundColor = '#FFFFFF',
  errorCorrectionLevel = 'M',
  margin = 4,
  className = '',
  onGenerated,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode();
  }, [value, width, height, logoUrl, logoSizePercent, color, backgroundColor, errorCorrectionLevel, margin]);

  const generateQRCode = async () => {
    if (!canvasRef.current || !value) return;

    setIsGenerating(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Unable to get canvas context');
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Calculate QR code size to fit in the canvas
      const qrSize = Math.min(width, height);

      // Generate QR code on a temporary canvas
      const tempCanvas = document.createElement('canvas');
      await QRCode.toCanvas(tempCanvas, value, {
        width: qrSize,
        margin,
        color: {
          dark: color,
          light: backgroundColor,
        },
        errorCorrectionLevel,
      });

      // Clear main canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Calculate position to center QR code
      const qrX = (width - qrSize) / 2;
      const qrY = (height - qrSize) / 2;

      // Draw QR code on main canvas
      ctx.drawImage(tempCanvas, qrX, qrY, qrSize, qrSize);

      // Add logo if provided
      if (logoUrl) {
        await addLogoToCanvas(ctx, qrX, qrY, qrSize);
      }

      // Callback with generated image
      if (onGenerated) {
        onGenerated(canvas.toDataURL('image/png'));
      }

    } catch (err) {
      console.error('Error generating QR code:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const addLogoToCanvas = async (
    ctx: CanvasRenderingContext2D,
    qrX: number,
    qrY: number,
    qrSize: number
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const logo = new Image();
      logo.crossOrigin = 'anonymous';

      logo.onload = () => {
        try {
          // Calculate logo size (percentage of QR code width)
          const logoSize = (qrSize * logoSizePercent) / 100;
          const logoX = qrX + (qrSize - logoSize) / 2;
          const logoY = qrY + (qrSize - logoSize) / 2;

          // Draw white background circle for logo
          const bgSize = logoSize * 1.2; // 20% larger than logo
          const bgX = qrX + (qrSize - bgSize) / 2;
          const bgY = qrY + (qrSize - bgSize) / 2;

          ctx.fillStyle = backgroundColor;
          ctx.beginPath();
          ctx.arc(
            bgX + bgSize / 2,
            bgY + bgSize / 2,
            bgSize / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

          resolve();
        } catch (err) {
          reject(err);
        }
      };

      logo.onerror = () => {
        reject(new Error('Failed to load logo image'));
      };

      logo.src = logoUrl!;
    });
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className={`${className} ${isGenerating ? 'opacity-50' : ''}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#F34A23] rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
