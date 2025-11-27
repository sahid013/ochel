'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/contexts/LanguageContext';

interface MenuItemCardProps {
  image?: string;
  title: string;
  subtitle?: string;
  price: string;
  has3D?: boolean;
  model3DGlbUrl?: string;
  model3DUsdzUrl?: string;
  variant?: 'regular' | 'special';
}

type ModalType = '3d' | 'image' | null;

export default function MenuItemCard({
  image,
  title,
  subtitle,
  price,
  has3D = false,
  model3DGlbUrl,
  model3DUsdzUrl,
  variant = 'regular'
}: MenuItemCardProps) {
  const { t } = useTranslation();
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleCardClick = () => {
    // Only open image modal if image exists
    if (image) {
      setIsOpening(true);
      setModalType('image');
      setTimeout(() => setIsOpening(false), 50);
    }
  };

  const handle3DClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (model3DGlbUrl || model3DUsdzUrl) {
      console.log('3D URLs:', { model3DGlbUrl, model3DUsdzUrl });
      setIsOpening(true);
      setModalType('3d');
      setTimeout(() => setIsOpening(false), 50);
    }
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setModalType(null);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const handleARClick = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS && model3DUsdzUrl) {
      // iOS opens USDZ automatically in AR Quick Look
      window.location.href = model3DUsdzUrl;
    } else if (model3DGlbUrl) {
      // Android opens GLB in Scene Viewer
      const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(model3DGlbUrl)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
      window.location.href = intent;
    }
  };

  const isSpecial = variant === 'special';

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg transition-opacity hover:opacity-90 ${image ? 'cursor-pointer' : 'cursor-default'
          } ${isSpecial
            ? 'bg-[#EFE6D2] text-black'
            : 'bg-[#101010] border border-white/10 text-white'
          }`}
      >
        {/* Image - Only render if image exists */}
        {image && (
          <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 ${isSpecial ? 'border-[3px] border-[#FFD65A]' : 'border-2 border-white/30'
            }`}>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className={`text-base sm:text-lg font-medium font-forum capitalize ${isSpecial ? 'text-black' : 'text-white'
              }`}>{title}</h3>

            {/* Icons */}
            {has3D && (
              <button
                onClick={handle3DClick}
                className={`w-5 h-5 sm:w-6 sm:h-6 opacity-70 hover:opacity-100 transition-opacity cursor-pointer ml-1 sm:ml-2 ${isSpecial ? 'invert' : ''
                  }`}
              >
                <Image
                  src="/icons/3d.svg"
                  alt="3D View"
                  width={24}
                  height={24}
                  className="w-full h-full cursor-pointer"
                />
              </button>
            )}
          </div>

          {subtitle && subtitle.trim() && (
            <p className={`text-sm mb-2 font-forum ${isSpecial ? 'text-black/70' : 'text-gray-400'
              }`}>{subtitle}</p>
          )}
        </div>

        {/* Price - Always normal variant style */}
        <div className="text-white text-base sm:text-lg font-medium font-forum border border-white/20 bg-[#1F1F1F] rounded px-2 py-1 sm:px-3">
          {price}
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : isOpening ? 'opacity-0' : 'opacity-100'}`}>
          {/* Background Overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={closeModal}
          />

          {/* Modal Content - Square shaped, responsive */}
          <div className={`relative bg-[#101010] rounded-2xl border border-white/20 w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] h-[85vh] sm:aspect-square sm:max-h-[90vh] sm:h-auto p-3 sm:p-4 md:p-6 flex flex-col transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : isOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {/* Close Button - In empty space, not overlapping */}
            <div className="flex justify-end mb-2 sm:mb-3">
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-white rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center flex-shrink-0"
                aria-label="Close"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modalType === '3d' && (model3DGlbUrl || model3DUsdzUrl) ? (
              <>
                {/* 3D Model Viewer with rounded corners */}
                <div className="flex-1 rounded-xl overflow-hidden mb-4">
                  {/* @ts-ignore */}
                  <model-viewer
                    src={model3DGlbUrl || ''}
                    ios-src={model3DUsdzUrl || ''}
                    camera-controls
                    touch-action="pan-y"
                    exposure="1"
                    shadow-intensity="1"
                    alt={title}
                    interaction-prompt="auto"
                    interaction-prompt-threshold="0"
                    interaction-prompt-style="basic"
                    auto-rotate
                    auto-rotate-delay="1000"
                    style={{ width: '100%', height: '100%', background: '#fff' }}
                  />
                </div>

                {/* AR Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleARClick}
                    className="px-6 py-3 bg-[#FFD65A] hover:bg-[#FFD65A]/90 text-black font-medium rounded-lg transition-colors cursor-pointer font-forum"
                  >
                    {t('menu.viewOnTable')}
                  </button>
                </div>
              </>
            ) : (
              /* Image Display with rounded corners */
              image && (
                <div className="w-full h-full rounded-xl overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
