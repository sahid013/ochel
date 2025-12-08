'use client';

import { useState, useEffect } from 'react';
import { cn, parseFontConfig, getFontClass, getTemplateVariables } from '@/lib';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';
import { useMenuData, DemoItem } from '@/hooks/useMenuData';
import { Restaurant } from '@/types';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { MenuSkeleton } from '@/components/ui/MenuSkeleton';
import { EmptyState } from '@/components/ui';

interface Template4Props {
  restaurant: Restaurant;
  demoItem?: DemoItem | null;
}

/**
 * Template 4: Casual Dining
 * Friendly, approachable design for casual restaurants
 * Features: Colorful accents, grid layout, photo-focused, social media integration
 */
export default function Template4({ restaurant, demoItem }: Template4Props) {
  const { t } = useTranslation();
  const {
    categories,
    activeTab,
    setActiveTab,
    currentCategory,
    sections,
    loading,
    error,
    isFading,
    getTranslatedField,
  } = useMenuData(restaurant.id, demoItem);

  const { header, body } = parseFontConfig(restaurant.font_family);
  const headerFontClass = getFontClass(header);
  const bodyFontClass = getFontClass(body);
  const variableStyles = getTemplateVariables(restaurant);

  // const hasCustomBg = !!restaurant.background_color; // Restricted
  // const hasCustomPrimary = !!restaurant.primary_color; // Keep primary logic if needed for specific overrides, but for BG we want default

  const [selected3DItem, setSelected3DItem] = useState<{ glb: string | undefined, usdz: string | undefined, title: string } | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Apply light scrollbar for this template
  useEffect(() => {
    document.body.classList.add('scrollbar-light');
    return () => {
      document.body.classList.remove('scrollbar-light');
    };
  }, []);

  const handle3DClick = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (item.model3DGlbUrl || item.model3DUsdzUrl) {
      setSelected3DItem({
        glb: item.model3DGlbUrl,
        usdz: item.model3DUsdzUrl,
        title: item.title
      });
    }
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelected3DItem(null);
      setIsClosing(false);
    }, 300);
  };

  const handleARClick = () => {
    if (!selected3DItem) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS && selected3DItem.usdz) {
      window.location.href = selected3DItem.usdz;
    } else if (selected3DItem.glb) {
      const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(selected3DItem.glb)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
      window.location.href = intent;
    }
  };

  return (
    <>
      {/* Navigation */}
      {/* Navigation */}
      <Navigation
        restaurant={restaurant}
      />

      {/* Main Layout - Casual Colorful Theme */}
      <div
        className={cn(
          "min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50",
          bodyFontClass
        )}
        style={{
          // backgroundColor: hasCustomBg ? 'var(--pixel-bg)' : undefined, // Restricted
          color: 'var(--pixel-text, #111827)',
          ...variableStyles
        }}
      >
        {/* Fun Header */}
        <div
          className={cn(
            "relative h-[276px] flex items-center justify-center bg-cover bg-center pt-16 pb-16",
            !restaurant.primary_color && !restaurant.hero_image_url && "bg-gradient-to-r from-[#F34A23] to-[#FF6B4A]"
          )}
          style={{
            backgroundColor: !restaurant.hero_image_url && restaurant.primary_color ? 'var(--pixel-primary)' : undefined,
            backgroundImage: restaurant.hero_image_url ? `url('${restaurant.hero_image_url}')` : undefined,
            color: 'white'
          }}
        >
          {restaurant.hero_image_url && <div className="absolute inset-0 bg-black/40"></div>}
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className={cn("text-[56px] font-bold mb-4", headerFontClass)}>
              {restaurant.name}
            </h1>
            <p className="text-xl font-medium">
              {t('menuPage.title')}
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          {/* Category Tabs - Colorful Buttons */}
          <div className="mb-10">
            <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(index)}
                  className={cn(
                    "text-base font-bold rounded-2xl py-4 px-6 transition-all duration-200",
                    "whitespace-nowrap shadow-md hover:shadow-lg",
                    activeTab === index
                      ? "text-white scale-105"
                      : "bg-white hover:bg-opacity-90"
                  )}
                  style={{
                    backgroundColor: activeTab === index ? 'var(--pixel-primary, #F34A23)' : 'white',
                    color: activeTab === index ? 'white' : 'var(--pixel-text, #111827)'
                  }}
                >
                  {getTranslatedField(category, 'title')}
                </button>
              ))}
            </div>
          </div>

          {/* Category Title - Fun Style */}
          {currentCategory && (
            <div className="mb-10">
              <h2 className={cn("text-[22px] font-bold mb-3", headerFontClass)} style={{ color: 'var(--pixel-text, #111827)' }}>
                {getTranslatedField(currentCategory, 'title')}
              </h2>
              {getTranslatedField(currentCategory, 'text') && (
                <p className="text-lg text-gray-700">
                  {getTranslatedField(currentCategory, 'text')}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-6">
              <MenuSkeleton />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500 text-lg font-semibold">{error}</div>
            </div>
          )}

          {/* Menu Content - Photo Grid */}
          {!loading && !error && (
            <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
              {sections.length === 0 ? (
                <EmptyState message={t('menu.noItems')} className="text-gray-600" />
              ) : (
                sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-12">
                    {/* Section Title - Bold & Colorful */}
                    {section.title && (
                      <div className="mb-6">
                        <h3 className={cn("text-[18px] font-bold capitalize mb-2", headerFontClass)} style={{ color: 'var(--pixel-primary, #F34A23)' }}>
                          {section.title}
                        </h3>
                        {section.subtitle && (
                          <p className="text-md text-gray-700">
                            {section.subtitle}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Menu Items - Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                          {item.image && (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                <h4 className={cn("text-xl font-bold", headerFontClass)} style={{ color: 'var(--pixel-text, #111827)' }}>
                                  {item.title}
                                </h4>
                                {item.has3D && (
                                  <button
                                    onClick={(e) => handle3DClick(e, item)}
                                    className="w-6 h-6 flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer rounded-[4px] p-[3px]"
                                    title="View in 3D"
                                    style={{ backgroundColor: 'var(--pixel-primary, #F34A23)' }}
                                  >
                                    <img
                                      src="/icons/3d.svg"
                                      alt="3D View"
                                      className="w-full h-full invert brightness-0"
                                    />
                                  </button>
                                )}
                              </div>
                              <span className="text-xl font-bold ml-3 whitespace-nowrap" style={{ color: 'var(--pixel-primary, #F34A23)' }}>
                                {item.price}
                              </span>
                            </div>
                            {item.subtitle && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3D Model Modal */}
      {selected3DItem && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={closeModal}
          />
          <div className={`relative bg-white rounded-2xl w-full max-w-3xl aspect-square md:aspect-video max-h-[90vh] p-4 flex flex-col transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="flex justify-end mb-2">
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden bg-gray-50 relative">
              {/* @ts-ignore */}
              <model-viewer
                src={selected3DItem.glb || ''}
                ios-src={selected3DItem.usdz || ''}
                camera-controls
                touch-action="pan-y"
                exposure="1"
                shadow-intensity="1"
                alt={selected3DItem.title}
                interaction-prompt="auto"
                auto-rotate
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleARClick}
                className="px-6 py-3 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
                style={{ backgroundColor: 'var(--pixel-primary, #F34A23)' }}
              >
                <span>View on Table (AR)</span>
                <img src="/icons/3d.svg" alt="" className="w-5 h-5 invert brightness-0" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
