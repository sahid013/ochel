'use client';

import { cn } from '@/lib';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';
import { useMenuData, DemoItem } from '@/hooks/useMenuData';
import { Restaurant } from '@/types';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { MenuSkeleton } from '@/components/ui/MenuSkeleton';
import AnimateIn from '@/components/ui/AnimateIn';

interface Template1Props {
  restaurant: Restaurant;
  demoItem?: DemoItem | null;
}

/**
 * Template 1: Classic Dark
 * Elegant dark theme with split layout - perfect for fine dining
 * Features: Dark background, split-screen design, image gallery support, 3D model integration
 */
export default function Template1({ restaurant, demoItem }: Template1Props) {
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
  } = useMenuData(restaurant.id, demoItem);

  return (
    <>
      {/* Navigation */}
      <Navigation
        showLanguageSwitcher={false}
        logo={{
          src: "/icons/MagnifikoLogo.png",
          alt: restaurant.name,
          width: 50,
          height: 17
        }}
      />

      {/* Main Layout - Single Column */}
      <div className="bg-[#fff5f0] text-[#3D1F00] font-oswald">
        <div className="flex flex-col relative">
          {/* Hero Section - Top (Full Width) */}
          <div className='w-full flex-shrink-0 bg-white'>
            <div className="relative flex flex-col justify-center items-center h-[400px] w-full px-4">

              {/* Center Content */}
              <div className="text-center relative z-10 max-w-4xl mx-auto">
                {/* Main Heading */}
                <AnimateIn animation="fade" duration={800} delay={100}>
                  <div className="mb-6">
                    <h1 className="text-[2.5rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[5rem] font-bold tracking-tight text-[#3D1F00] uppercase leading-none">
                      {restaurant.name}
                    </h1>
                  </div>
                </AnimateIn>

                {/* Subtitle */}
                <AnimateIn animation="blur" duration={1000} delay={300}>
                  <p className="text-[14px] md:text-[16px] lg:text-[18px] text-[#3D1F00] max-w-[450px] mx-auto leading-relaxed font-normal">
                    Explore a menu full of handcrafted dishes, rich flavors, and fresh ingredients. From light bites to hearty meals, there for everyone.
                  </p>
                </AnimateIn>
              </div>
            </div>
          </div>

          {/* Content Section - Bottom (Full Width) */}
          <div className="w-full bg-[#fff5f0] pt-8 min-h-screen">
            <div className="w-full p-4 md:p-6 lg:p-8 pb-8">
              {/* Tab Bar Container */}
              <AnimateIn animation="slide" duration={600} delay={200}>
                <div className="mb-8">
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-3 md:gap-4">
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
                            "text-[13px] md:text-[14px] font-bold text-center rounded-lg cursor-pointer transition-all duration-200 py-3 px-6 uppercase tracking-wide",
                            "min-h-[44px] flex items-center justify-center whitespace-nowrap flex-shrink-0",
                            activeTab === index
                              ? "text-white bg-[#C8102E] border-2 border-[#C8102E]"
                              : "text-[#C8102E] bg-white border-2 border-[#C8102E] hover:bg-[#C8102E] hover:text-white"
                          )}
                        >
                          {getTranslatedField(category, 'title')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimateIn>

              {/* Category Title and Description */}
              {currentCategory && (
                <AnimateIn animation="fade" duration={500} delay={100}>
                  <div className="mb-8">
                    <h2 className="text-[28px] md:text-[32px] font-oswald text-[#3D1F00] font-bold uppercase">
                      {getTranslatedField(currentCategory, 'title')}
                    </h2>
                    {getTranslatedField(currentCategory, 'text') && (
                      <p className="text-[14px] md:text-[16px] font-oswald text-[#3D1F00]/70 mt-2">
                        {getTranslatedField(currentCategory, 'text')}
                      </p>
                    )}
                  </div>
                </AnimateIn>
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
                  <div className="text-[#C8102E]">{error}</div>
                </div>
              )}

              {/* Menu Content Section */}
              {!loading && !error && (
                <div className={`w-full transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                  {sections.length === 0 && categories.length > 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[#3D1F00]/60">{t('menu.noItems')}</p>
                    </div>
                  ) : sections.length > 0 ? (
                    sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="mb-12">
                        {/* Section Title - Only show if title is not empty */}
                        {section.title && (
                          <AnimateIn animation="slide" duration={500} delay={100}>
                            <div className="mb-6">
                              <h3 className="text-[24px] font-oswald text-[#3D1F00] font-bold uppercase">
                                {section.title}
                              </h3>
                              {section.subtitle && (
                                <p className="text-[14px] font-oswald text-[#3D1F00]/70 mt-1">
                                  {section.subtitle}
                                </p>
                              )}
                            </div>
                          </AnimateIn>
                        )}

                        {/* Menu Items Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {section.items.map((item, itemIndex) => (
                            <AnimateIn
                              key={item.id}
                              animation="blur"
                              duration={600}
                              delay={100 + (itemIndex * 100)}
                            >
                              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                                {/* Image */}
                                <div className="relative w-full aspect-[4/3] bg-gray-200">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                  {/* Price Badge */}
                                  {item.price && (
                                    <div className="absolute bottom-4 left-4 bg-white rounded-lg px-4 py-2 shadow-md">
                                      <p className="text-[#C8102E] font-bold text-[16px]">{item.price}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                  <h4 className="text-[20px] md:text-[22px] font-oswald font-bold text-[#3D1F00] uppercase mb-2 leading-tight">
                                    {item.title}
                                  </h4>
                                  {item.subtitle && (
                                    <p className="text-[14px] text-[#3D1F00]/70 line-clamp-2">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </AnimateIn>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-[#3D1F00]/60">{t('menu.noCategories')}</p>
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
