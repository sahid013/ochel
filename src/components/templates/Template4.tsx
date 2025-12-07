'use client';

import { useEffect } from 'react';
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

  // Apply light scrollbar for this template
  useEffect(() => {
    document.body.classList.add('scrollbar-light');
    return () => {
      document.body.classList.remove('scrollbar-light');
    };
  }, []);

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
          "min-h-screen pt-16 bg-gradient-to-br from-orange-50 to-yellow-50",
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
            "relative h-[276px] flex items-center justify-center bg-cover bg-center",
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
                              <h4 className={cn("text-xl font-bold flex-1", headerFontClass)} style={{ color: 'var(--pixel-text, #111827)' }}>
                                {item.title}
                              </h4>
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
    </>
  );
}
