'use client';

import { cn } from '@/lib';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';
import { useMenuData } from '@/hooks/useMenuData';
import { Restaurant } from '@/types';
import MenuItemCard from '@/components/menu/MenuItemCard';
import MenuItemSkeleton from '@/components/menu/MenuItemSkeleton';

interface Template3Props {
  restaurant: Restaurant;
}

/**
 * Template 3: Boutique
 * Stylish template with elegant typography and spacing
 * Features: Custom fonts, spacious layout, premium feel, category highlights
 */
export default function Template3({ restaurant }: Template3Props) {
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
  } = useMenuData(restaurant.id);

  return (
    <>
      {/* Navigation */}
      <Navigation
        logo={{
          src: "/icons/MagnifikoLogo.png",
          alt: restaurant.name,
          width: 50,
          height: 17
        }}
      />

      {/* Main Layout - Boutique Elegant Theme */}
      <div className="bg-[#FAF8F3] text-gray-900 font-serif min-h-screen">
        {/* Elegant Header */}
        <div className="relative bg-[#2C2416] text-[#F5E6D3] py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-6xl md:text-7xl font-forum mb-6 tracking-wide">
              {restaurant.name}
            </h1>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-6"></div>
            <p className="text-2xl font-light tracking-widest uppercase">
              {t('menuPage.title')}
            </p>
          </div>
        </div>

        {/* Content Container - Spacious */}
        <div className="max-w-4xl mx-auto px-6 py-16">
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
                      ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-lg"
                      : "bg-transparent text-[#2C2416] border-[#2C2416] hover:bg-[#2C2416] hover:text-white"
                  )}
                >
                  {getTranslatedField(category, 'title')}
                </button>
              ))}
            </div>
          </div>

          {/* Category Title - Elegant */}
          {currentCategory && (
            <div className="mb-12 text-center">
              <h2 className="text-5xl font-forum text-[#2C2416] mb-4 tracking-wide">
                {getTranslatedField(currentCategory, 'title')}
              </h2>
              <div className="w-16 h-1 bg-[#D4AF37] mx-auto mb-4"></div>
              {getTranslatedField(currentCategory, 'text') && (
                <p className="text-lg text-gray-600 italic max-w-2xl mx-auto">
                  {getTranslatedField(currentCategory, 'text')}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg h-40 animate-pulse shadow" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-600 text-lg">{error}</div>
            </div>
          )}

          {/* Menu Content - Spacious Layout */}
          {!loading && !error && (
            <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
              {sections.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg italic">{t('menu.noItems')}</p>
                </div>
              ) : (
                sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-16">
                    {/* Section Title - Elegant */}
                    {section.title && (
                      <div className="mb-8 text-center">
                        <h3 className="text-4xl font-forum text-[#2C2416] capitalize mb-3">
                          {section.title}
                        </h3>
                        <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto"></div>
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
                            <h4 className="text-2xl font-forum text-[#2C2416] tracking-wide">
                              {item.title}
                            </h4>
                            <span className="text-xl font-semibold text-[#D4AF37] ml-6 whitespace-nowrap">
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
          )}
        </div>
      </div>
    </>
  );
}
