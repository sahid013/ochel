'use client';

import { useState, useEffect } from 'react';
import { cn, getFontClassName } from '@/lib';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';
import { useMenuData, DemoItem } from '@/hooks/useMenuData';
import { Restaurant } from '@/types';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { MenuSkeleton } from '@/components/ui/MenuSkeleton';
import { EmptyState } from '@/components/ui';
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

  const fontClass = getFontClassName(restaurant.font_family);
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
      <div className={cn("bg-[#fff5f0] text-[#3D1F00]", fontClass)}>
        <div className="flex flex-col relative">
          {/* Hero Section - Top (Full Width) */}
          <div className='w-full flex-shrink-0 bg-white'>
            <div
              className="relative flex flex-col justify-center items-center h-[276px] w-full px-4 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/Template1HeroWhite.png')" }}
            >
              {/* Center Content */}
              <div className="text-center relative z-10 max-w-4xl mx-auto backdrop-blur-sm bg-white/40 p-8 rounded-2xl shadow-sm border border-white/50">
                {/* Main Heading */}
                <AnimateIn animation="fade" duration={800} delay={100}>
                  <div className="mb-4">
                    <h1 className="text-[56px] font-bold tracking-tight text-[#3D1F00] uppercase leading-none font-loubag">
                      {restaurant.name}
                    </h1>
                  </div>
                </AnimateIn>

                {/* Subtitle */}
                <AnimateIn animation="blur" duration={1000} delay={300}>
                  <p className="text-xl text-[#3D1F00] max-w-[450px] mx-auto leading-relaxed font-bold">
                    {t('menuPage.title')}
                  </p>
                </AnimateIn>
              </div>
            </div>
          </div>

          {/* Content Section - Bottom (Full Width) */}
          <div className="w-full bg-[#fff5f0] pt-4 min-h-screen">
            <div className="w-full px-4 md:px-6 lg:px-8 py-4 pb-8">
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
                    <h2 className="text-[22px] font-bold text-[#3D1F00] font-bold uppercase">
                      {getTranslatedField(currentCategory, 'title')}
                    </h2>
                    {getTranslatedField(currentCategory, 'text') && (
                      <p className="text-[14px] md:text-[16px] font-bold text-[#3D1F00]/70 mt-2">
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
                <div className="flex items-center justify-center py-4">
                  <div className="text-[#C8102E]">{error}</div>
                </div>
              )}

              {/* Menu Content Section */}
              {!loading && !error && (
                <div className={`w-full transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                  {sections.length === 0 && categories.length > 0 ? (
                    <EmptyState message={t('menu.noItems')} className="text-[#3D1F00]/60" />
                  ) : sections.length > 0 ? (
                    sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="mb-12">
                        {/* Section Title - Only show if title is not empty */}
                        {section.title && (
                          <AnimateIn animation="slide" duration={500} delay={100}>
                            <div className="mb-6">
                              <h3 className="text-[18px] font-bold text-[#3D1F00] font-bold uppercase">
                                {section.title}
                              </h3>
                              {section.subtitle && (
                                <p className="text-[14px] font-bold text-[#3D1F00]/70 mt-1">
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
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-[20px] md:text-[22px] font-bold font-bold text-[#3D1F00] uppercase leading-tight">
                                      {item.title}
                                    </h4>
                                    {item.has3D && (
                                      <button
                                        onClick={(e) => handle3DClick(e, item)}
                                        className="w-6 h-6 flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                        title="View in 3D"
                                      >
                                        <img
                                          src="/icons/3d.svg"
                                          alt="3D View"
                                          className="w-full h-full"
                                        />
                                      </button>
                                    )}
                                  </div>
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
                    <EmptyState message={t('menu.noCategories')} className="text-[#3D1F00]/60" />
                  )}
                </div>
              )}
            </div>
          </div>
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
                className="px-6 py-3 bg-[#F34A23] hover:bg-[#d63d1b] text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
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
