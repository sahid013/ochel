'use client';

import { cn } from '@/lib';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';
import { useMenuData } from '@/hooks/useMenuData';
import { Restaurant } from '@/types';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { MenuSkeleton } from '@/components/ui/MenuSkeleton';

interface Template1Props {
  restaurant: Restaurant;
}

/**
 * Template 1: Classic Dark
 * Elegant dark theme with split layout - perfect for fine dining
 * Features: Dark background, split-screen design, image gallery support, 3D model integration
 */
export default function Template1({ restaurant }: Template1Props) {
  const { t, locale } = useTranslation();
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

      {/* Main Layout - Two Equal Sections */}
      <div className="bg-[#000000] text-white font-forum">
        <div className="flex flex-col lg:flex-row relative">
          {/* Image Section - Left on desktop, Top on mobile/tablet */}
          <div className='w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen flex-shrink-0'>
            <div
              className={cn(
                "relative flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat h-[250px] md:h-[300px] lg:h-screen w-full"
              )}
              style={{ backgroundImage: 'url("/images/menu-bg 2.webp")' }}>
              {/* Dark overlay */}
              <div className="absolute" style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                top: 0,
                left: 0
              }}></div>

              {/* NOTRE MENU text in the middle */}
              <div className="text-center px-4 pt-16 lg:pt-0 relative z-10">
                <h1 className="text-[2.5rem] md:text-[3rem] font-normal tracking-normal text-white" suppressHydrationWarning>
                  {t('menuPage.title')}
                </h1>
              </div>
            </div>
          </div>

          {/* Content Section - Right on desktop, Bottom on mobile/tablet */}
          <div className="w-full lg:w-1/2 bg-[#000000] pt-[100px] min-h-screen">
            <div className="w-full p-4 md:p-6 lg:p-8 pb-8">
              {/* Tab Bar Container */}
              <div className="bg-[#101010] border border-white/30 rounded-[8px] p-[6px] mb-6">
                <div className="overflow-x-auto scrollbar-hide md:overflow-x-visible">
                  <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-1 md:gap-1">
                    {categories.map((category, index) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveTab(index);
                          // Scroll selected tab to center on mobile
                          const button = document.getElementById(`tab-${index}`);
                          if (button && window.innerWidth < 768) {
                            button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          }
                        }}
                        id={`tab-${index}`}
                        className={cn(
                          "text-[14px] text-center rounded-[6px] cursor-pointer transition-all duration-200 py-2 px-4",
                          "min-h-[40px] flex items-center justify-center whitespace-nowrap flex-shrink-0",
                          activeTab === index
                            ? "text-[#FFD65A] bg-[#FFD65A]/10"
                            : "text-white bg-white/10 hover:text-[#FFD65A]"
                        )}
                      >
                        {getTranslatedField(category, 'title')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Title and Description */}
              {currentCategory && (
                <div className="mb-6">
                  <h2 className="text-[28px] md:text-[32px] font-forum text-[#FFF2CC] font-medium capitalize">
                    {getTranslatedField(currentCategory, 'title')}
                  </h2>
                  {getTranslatedField(currentCategory, 'text') && (
                    <p className="text-[14px] md:text-[16px] font-forum text-[#FFD65A]/80 mt-2">
                      {getTranslatedField(currentCategory, 'text')}
                    </p>
                  )}
                </div>
              )}

              {/* Loading State - Skeleton */}
              {loading && (
                <div className="py-6">
                  <MenuSkeleton />
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-red-400">{error}</div>
                </div>
              )}

              {/* Menu Content Section */}
              {!loading && !error && (
                <div className={`w-full transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                  {sections.length === 0 && categories.length > 0 ? (
                    <div className="text-center py-12">
                      <p className="text-white/60">{t('menu.noItems')}</p>
                    </div>
                  ) : sections.length > 0 ? (
                    sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="mb-8">
                        {/* Section Title - Only show if title is not empty */}
                        {section.title && (
                          <div className="mb-4">
                            <h3 className="text-[24px] font-forum text-[#FFF2CC] font-medium capitalize">
                              {section.title}
                            </h3>
                            {section.subtitle && (
                              <p className="text-[14px] font-forum text-[#FFD65A] mt-1">
                                ({section.subtitle})
                              </p>
                            )}
                          </div>
                        )}

                        {/* Menu Items */}
                        <div className="space-y-4">
                          {section.items.map((item) => (
                            <MenuItemCard
                              key={item.id}
                              image={item.image}
                              title={item.title}
                              subtitle={item.subtitle}
                              price={item.price}
                              has3D={item.has3D}
                              model3DGlbUrl={item.model3DGlbUrl}
                              model3DUsdzUrl={item.model3DUsdzUrl}
                              variant={section.isSpecial ? 'special' : 'regular'}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-white/60">{t('menu.noCategories')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
