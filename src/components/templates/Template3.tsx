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

interface Template3Props {
  restaurant: Restaurant;
  demoItem?: DemoItem | null;
}

/**
 * Template 3: Boutique
 * Stylish template with elegant typography and spacing
 * Features: Custom fonts, spacious layout, premium feel, category highlights
 */
export default function Template3({ restaurant, demoItem }: Template3Props) {
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
      <Navigation
        restaurant={restaurant}
      />

      {/* Main Layout - Boutique Elegant Theme */}
      <div className={cn("min-h-screen", bodyFontClass)} style={{ backgroundColor: 'var(--pixel-bg, #FAF8F3)', color: 'var(--pixel-text, #2C2416)', ...variableStyles }}>
        {/* Elegant Header */}
        <div
          className="relative h-[276px] flex items-center justify-center p-6 text-center bg-cover bg-center"
          style={{
            backgroundImage: restaurant.hero_image_url ? `url('${restaurant.hero_image_url}')` : undefined,
            backgroundColor: restaurant.hero_image_url ? undefined : 'var(--pixel-text, #2C2416)',
            color: restaurant.hero_image_url ? 'white' : 'var(--pixel-bg, #FAF8F3)'
          }}
        >
          {restaurant.hero_image_url && <div className="absolute inset-0 bg-black/40"></div>}
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h1 className={cn("text-[56px] mb-6 tracking-wide", headerFontClass)}>
              {restaurant.name}
            </h1>
            <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: 'var(--pixel-primary, #D4AF37)' }}></div>
            <p className="text-xl font-light tracking-widest uppercase">
              {t('menuPage.title')}
            </p>
          </div>
        </div>

        {/* Content Container - Spacious */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Category Pills - Elegant Style */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(index)}
                  className={cn(
                    "text-sm font-medium rounded-full py-3 px-6 transition-all duration-300",
                    "border-2 uppercase tracking-wider",
                    activeTab === index
                      ? "text-white shadow-lg"
                      : "bg-transparent hover:text-white"
                  )}
                  style={{
                    backgroundColor: activeTab === index ? 'var(--pixel-primary, #D4AF37)' : 'transparent',
                    borderColor: activeTab === index ? 'var(--pixel-primary, #D4AF37)' : 'var(--pixel-text, #2C2416)',
                    color: activeTab === index ? 'white' : 'var(--pixel-text, #2C2416)',
                    // hover effect for non-active items needs to be handled via CSS or just simpler style
                  }}
                >
                  {getTranslatedField(category, 'title')}
                </button>
              ))}
            </div>
          </div>

          {/* Category Title - Elegant */}
          {
            currentCategory && (
              <div className="mb-12 text-center">
                <h2 className={cn("text-[22px] mb-4 tracking-wide", headerFontClass)} style={{ color: 'var(--pixel-text, #2C2416)' }}>
                  {getTranslatedField(currentCategory, 'title')}
                </h2>
                <div className="w-16 h-1 mx-auto mb-4" style={{ backgroundColor: 'var(--pixel-primary, #D4AF37)' }}></div>
                {getTranslatedField(currentCategory, 'text') && (
                  <p className="text-lg text-gray-600 italic max-w-2xl mx-auto">
                    {getTranslatedField(currentCategory, 'text')}
                  </p>
                )}
              </div>
            )
          }

          {/* Loading State */}
          {
            loading && (
              <div className="py-6">
                <MenuSkeleton />
              </div>
            )
          }

          {/* Error State */}
          {
            error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-600 text-lg">{error}</div>
              </div>
            )
          }

          {/* Menu Content - Spacious Layout */}
          {
            !loading && !error && (
              <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                {sections.length === 0 ? (
                  <EmptyState message={t('menu.noItems')} className="text-gray-500 italic" />
                ) : (
                  sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-16">
                      {/* Section Title - Elegant */}
                      {section.title && (
                        <div className="mb-8 text-center">
                          <h3 className={cn("text-[18px] capitalize mb-3", headerFontClass)} style={{ color: 'var(--pixel-text, #2C2416)' }}>
                            {section.title}
                          </h3>
                          <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: 'var(--pixel-primary, #D4AF37)' }}></div>
                          {section.subtitle && (
                            <p className="text-md text-gray-600 italic mt-3">
                              {section.subtitle}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Menu Items - Clean List */}
                      <div className="space-y-8">
                        {section.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className={cn("text-2xl tracking-wide", headerFontClass)} style={{ color: 'var(--pixel-text, #2C2416)' }}>
                                {item.title}
                              </h4>
                              <span className="text-xl font-semibold ml-6 whitespace-nowrap" style={{ color: 'var(--pixel-primary, #D4AF37)' }}>
                                {item.price}
                              </span>
                            </div>
                            {item.subtitle && (
                              <p className="text-gray-600 leading-relaxed">{item.subtitle}</p>
                            )}
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-64 object-cover rounded-lg mt-4"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          }
        </div >
      </div >
    </>
  );
}
