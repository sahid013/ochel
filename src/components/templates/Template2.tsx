'use client';

import { cn } from '@/lib';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';
import { useMenuData } from '@/hooks/useMenuData';
import { Restaurant } from '@/types';
import MenuItemCard from '@/components/menu/MenuItemCard';

interface Template2Props {
  restaurant: Restaurant;
}

/**
 * Template 2: Modern Light
 * Clean, bright design with minimalist aesthetics
 * Features: Light background, card-based layout, mobile-optimized, fast loading
 */
export default function Template2({ restaurant }: Template2Props) {
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

      {/* Main Layout - Light Theme */}
      <div className="bg-white text-gray-900 font-sans min-h-screen">
        {/* Hero Header */}
        <div className="relative h-[300px] bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
                {restaurant.name}
              </h1>
              <p className="text-xl text-gray-600">{t('menuPage.title')}</p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-12">
          {/* Category Tabs - Light Style */}
          <div className="bg-white shadow-md rounded-2xl p-2 mb-8 sticky top-4 z-10">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-2">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(index)}
                    className={cn(
                      "text-sm font-medium rounded-xl py-3 px-4 transition-all duration-200",
                      "min-h-[48px] flex items-center justify-center whitespace-nowrap flex-shrink-0",
                      activeTab === index
                        ? "bg-[#F34A23] text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {getTranslatedField(category, 'title')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Title */}
          {currentCategory && (
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {getTranslatedField(currentCategory, 'title')}
              </h2>
              {getTranslatedField(currentCategory, 'text') && (
                <p className="text-lg text-gray-600">
                  {getTranslatedField(currentCategory, 'text')}
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-full bg-[#F34A23] h-4 w-4 animate-bounce-dot"
                    style={{
                      animationDelay: `${i * 0.16}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500 text-lg">{error}</div>
            </div>
          )}

          {/* Menu Content */}
          {!loading && !error && (
            <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
              {sections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">{t('menu.noItems')}</p>
                </div>
              ) : (
                sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-12">
                    {/* Section Title */}
                    {section.title && (
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-gray-800 capitalize">
                          {section.title}
                        </h3>
                        {section.subtitle && (
                          <p className="text-md text-gray-600 mt-1">
                            {section.subtitle}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Menu Items - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xl font-semibold text-gray-900">{item.title}</h4>
                            <span className="text-lg font-bold text-[#F34A23] ml-4">{item.price}</span>
                          </div>
                          {item.subtitle && (
                            <p className="text-sm text-gray-600">{item.subtitle}</p>
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
