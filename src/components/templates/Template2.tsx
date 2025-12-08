'use client';

import { useState, useEffect } from 'react';
import { cn, parseFontConfig, getFontClass, getTemplateVariables } from '@/lib';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';
import { useMenuData, DemoItem } from '@/hooks/useMenuData';
import { Restaurant } from '@/types';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { getTranslatedField as getFieldTranslation } from '@/services';
import { MenuSkeleton } from '@/components/ui/MenuSkeleton';
import { EmptyState } from '@/components/ui';
import cookingBlackAnimation from '../../../public/assets/cookingBlack.json';

interface Template2Props {
  restaurant: Restaurant;
  demoItem?: DemoItem | null;
}

/**
 * Template 2: Modern Light
 * Clean, bright design with minimalist aesthetics
 * Features: Light background, card-based layout, mobile-optimized, fast loading
 */
export default function Template2({ restaurant, demoItem }: Template2Props) {
  const { t, locale } = useTranslation();
  const {
    categories,
    activeTab,
    setActiveTab,
    loading,
    error,
    getTranslatedField,
  } = useMenuData(restaurant.id, demoItem);

  // State for all categories data
  const [allCategoriesData, setAllCategoriesData] = useState<Map<number, any>>(new Map());
  const [selected3DItem, setSelected3DItem] = useState<{ glb: string | undefined, usdz: string | undefined, title: string } | null>(null);
  const [isClosing, setIsClosing] = useState(false);

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

  // Load all menu data for all categories
  useEffect(() => {
    const loadAllData = async () => {
      if (loading || categories.length === 0) return;

      // Handle demo mode
      if (restaurant.id === 'demo-restaurant' && demoItem) {
        const mockMap = new Map();
        const categoryId = categories[0].id;

        mockMap.set(categoryId, {
          category: categories[0],
          subcategories: [{
            id: 1,
            category_id: categoryId,
            title: demoItem.subcategory || 'General',
            title_en: demoItem.subcategory || 'General',
            title_fr: demoItem.subcategory || 'General',
            text: '',
            text_en: '',
            text_fr: '',
            order: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }],
          menuItems: [{
            id: parseInt(demoItem.id),
            subcategory_id: 1,
            title: demoItem.title,
            title_en: demoItem.title,
            title_fr: demoItem.title,
            description: demoItem.description,
            description_en: demoItem.description,
            description_fr: demoItem.description,
            price: parseFloat(demoItem.price),
            image_path: demoItem.image,
            model_3d_url: demoItem.model3dGlbUrl,
            redirect_3d_url: demoItem.model3dUsdzUrl,
            is_special: false,
            order: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }],
          addons: []
        });

        setAllCategoriesData(mockMap);
        return;
      }

      try {
        const { menuService } = await import('@/services');
        const allData = await menuService.getAllMenuData(restaurant.id);
        setAllCategoriesData(allData);
      } catch (err) {
        console.error('Failed to load all categories data:', err);
      }
    };

    loadAllData();
  }, [categories, loading, restaurant.id]);

  // Function to scroll to a specific category section
  const scrollToCategory = (categoryId: string | number) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 100; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const { header, body } = parseFontConfig(restaurant.font_family);
  const headerFontClass = getFontClass(header);
  const bodyFontClass = getFontClass(body);
  const variableStyles = getTemplateVariables(restaurant);

  return (
    <div style={{ backgroundColor: 'var(--pixel-bg, #000000)', ...variableStyles }}>
      {/* Navigation */}
      {/* Navigation */}
      <Navigation
        restaurant={restaurant}
      />

      {/* Main Layout - Dark Theme */}
      <div className={cn("min-h-screen", bodyFontClass)} style={{ backgroundColor: 'var(--pixel-bg, #000000)', color: 'var(--pixel-text, white)' }}>
        {/* Hero Header */}
        <div
          className="h-[240px] w-full bg-cover bg-center flex items-center justify-center relative pt-16 pb-16"
          style={{ backgroundImage: `url('${restaurant.hero_image_url || '/images/menu-bg 2.webp'}')` }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center relative z-10">
              <h1 className={cn("text-[56px] font-bold mb-4", headerFontClass)} style={{ color: 'var(--pixel-text, white)' }}>
                {restaurant.name}
              </h1>
              <p className="text-xl" style={{ color: 'var(--pixel-text, white)' }}>{t('menuPage.title')}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout - Tabs Left, Content Right */}
        <div className="relative lg:flex">
          {/* Left Sidebar - Vertical Tabs (Sticky on Desktop) - Only show if there are categories */}
          {categories.length > 0 && (
            <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen lg:w-64 border-r border-white/20 z-20 lg:overflow-y-auto flex-shrink-0" style={{ backgroundColor: 'var(--pixel-bg, #000000)' }}>
              <div className="p-4 lg:pt-8">
                {/* Category Tabs - Vertical */}
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveTab(index);
                        scrollToCategory(category.id);
                      }}
                      className={cn(
                        "w-full text-left font-medium rounded-xl py-4 px-4 transition-all duration-200",
                        activeTab === index
                          ? "text-white shadow-lg"
                          : "bg-white/10 hover:bg-white/20"
                      )}
                      style={{
                        backgroundColor: activeTab === index ? 'var(--pixel-primary, #F34A23)' : undefined,
                        color: activeTab === index ? 'white' : 'var(--pixel-text, white)'
                      }}
                    >
                      {getTranslatedField(category, 'title')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right Content Area */}
          <div className={cn(
            "px-4 md:px-6 lg:px-8 py-4 flex-1",
            // categories.length > 0 ? "lg:ml-64" : "" // Removed margin-left as we are using flex
          )}>
            {/* Loading State - Skeleton */}
            {loading && (
              <div className="py-6">
                <MenuSkeleton itemClassName="bg-white/10" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-400 text-lg">{error}</div>
              </div>
            )}

            {/* All Categories and Menu Content */}
            {!loading && !error && (
              <div>
                {categories.length === 0 ? (
                  <div style={{ color: 'var(--pixel-text, white)' }}>
                    <EmptyState message={t('menu.noItems')} animationData={cookingBlackAnimation} />
                  </div>
                ) : (
                  categories.map((category) => {
                    const menuData = allCategoriesData.get(category.id);
                    if (!menuData) return null;

                    // Build sections for this category
                    const categorySections: any[] = [];

                    // Find General subcategory
                    const generalSubcat = menuData.subcategories.find((s: any) =>
                      s.title.toLowerCase().includes('general')
                    );

                    // 1. General subcategory items (non-special) - NO HEADING
                    if (generalSubcat) {
                      const generalItems = menuData.menuItems
                        .filter((item: any) => item.subcategory_id === generalSubcat.id && !item.is_special)
                        .sort((a: any, b: any) => a.order - b.order);

                      if (generalItems.length > 0) {
                        categorySections.push({
                          title: '',
                          subtitle: null,
                          items: generalItems.map((item: any) => ({
                            id: item.id,
                            image: item.image_path || undefined,
                            title: getFieldTranslation(item, 'title', locale),
                            subtitle: getFieldTranslation(item, 'text', locale) || getFieldTranslation(item, 'description', locale),
                            price: `${item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
                            model3DGlbUrl: item.model_3d_url,
                            model3DUsdzUrl: item.redirect_3d_url,
                            has3D: !!(item.model_3d_url || item.redirect_3d_url)
                          })),
                        });
                      }
                    }

                    // 2. Custom subcategories with their items
                    const customSubcats = menuData.subcategories
                      .filter((s: any) => !s.title.toLowerCase().includes('general'))
                      .sort((a: any, b: any) => a.order - b.order);

                    for (const subcat of customSubcats) {
                      const subcatItems = menuData.menuItems
                        .filter((item: any) => item.subcategory_id === subcat.id)
                        .sort((a: any, b: any) => a.order - b.order);

                      if (subcatItems.length > 0) {
                        categorySections.push({
                          title: getFieldTranslation(subcat, 'title', locale),
                          subtitle: getFieldTranslation(subcat, 'text', locale) || null,
                          items: subcatItems.map((item: any) => ({
                            id: item.id,
                            image: item.image_path || undefined,
                            title: getFieldTranslation(item, 'title', locale),
                            subtitle: getFieldTranslation(item, 'text', locale) || getFieldTranslation(item, 'description', locale),
                            price: `${item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
                            model3DGlbUrl: item.model_3d_url,
                            model3DUsdzUrl: item.redirect_3d_url,
                            has3D: !!(item.model_3d_url || item.redirect_3d_url)
                          })),
                        });
                      }
                    }

                    // 3. Special items
                    const specialItems = menuData.menuItems
                      .filter((item: any) => item.is_special)
                      .sort((a: any, b: any) => a.order - b.order);

                    if (specialItems.length > 0) {
                      categorySections.push({
                        title: t('menu.specials'),
                        subtitle: null,
                        items: specialItems.map((item: any) => ({
                          id: item.id,
                          image: item.image_path || undefined,
                          title: getFieldTranslation(item, 'title', locale),
                          subtitle: getFieldTranslation(item, 'text', locale) || getFieldTranslation(item, 'description', locale),
                          price: `${item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
                          model3DGlbUrl: item.model_3d_url,
                          model3DUsdzUrl: item.redirect_3d_url,
                          has3D: !!(item.model_3d_url || item.redirect_3d_url)
                        })),
                      });
                    }

                    // 4. Add-ons
                    if (menuData.addons.length > 0) {
                      const sortedAddons = [...menuData.addons].sort((a: any, b: any) => a.order - b.order);

                      categorySections.push({
                        title: t('menu.supplements'),
                        subtitle: null,
                        items: sortedAddons.map((addon: any) => ({
                          id: addon.id,
                          image: addon.image_path || undefined,
                          title: getFieldTranslation(addon, 'title', locale),
                          subtitle: getFieldTranslation(addon, 'description', locale) || undefined,
                          price: `${addon.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
                          model3DGlbUrl: undefined,
                          model3DUsdzUrl: undefined,
                          has3D: false
                        })),
                      });
                    }

                    return (
                      <div key={category.id} id={`category-${category.id}`} className="mb-16 scroll-mt-24">
                        {/* Category Title */}
                        <div className="mb-8">
                          <h2 className={cn("text-[22px] font-bold mb-2", headerFontClass)} style={{ color: 'var(--pixel-text, #FFF2CC)' }}>
                            {getTranslatedField(category, 'title')}
                          </h2>
                          {getTranslatedField(category, 'text') && (
                            <p className="text-lg opacity-80" style={{ color: 'var(--pixel-accent, #FFD65A)' }}>
                              {getTranslatedField(category, 'text')}
                            </p>
                          )}
                        </div>

                        {/* Category Sections */}
                        {categorySections.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="mb-12">
                            {/* Section Title */}
                            {section.title && (
                              <div className="mb-6">
                                <h3 className={cn("text-[18px] font-bold capitalize", headerFontClass)} style={{ color: 'var(--pixel-text, #FFF2CC)' }}>
                                  {section.title}
                                </h3>
                                {section.subtitle && (
                                  <p className="text-md mt-1" style={{ color: 'var(--pixel-accent, #FFD65A)' }}>
                                    {section.subtitle}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Menu Items - Vertical List */}
                            <div className="space-y-6">
                              {section.items.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="border border-white/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} // Light background for cards works well on dark or light
                                >
                                  <div className="flex flex-col md:flex-row gap-4">
                                    {item.image && (
                                      <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-[80px] h-[80px] object-cover rounded-lg flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                          <h4 className={cn("text-xl font-semibold", headerFontClass)} style={{ color: 'var(--pixel-text, white)' }}>{item.title}</h4>
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
                                        <span className="text-lg font-bold ml-4 whitespace-nowrap" style={{ color: 'var(--pixel-accent, #FFD65A)' }}>{item.price}</span>
                                      </div>
                                      {item.subtitle && (
                                        <p className="text-sm opacity-70" style={{ color: 'var(--pixel-text, white)' }}>{item.subtitle}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            )}
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
    </div>
  );
}
