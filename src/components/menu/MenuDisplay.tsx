'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib';
import MenuItemCard from './MenuItemCard';
import MenuItemSkeleton from './MenuItemSkeleton';
import {
  menuService,
  getTranslatedField,
  type Category,
  type MenuItem,
  type Addon,
  type Subcategory
} from '@/services/menuService';
import { useTranslation } from '@/contexts/LanguageContext';

interface MenuDisplaySection {
  title: string;
  subtitle?: string | null;
  isSpecial?: boolean;
  items: {
    id: number;
    image?: string;
    title: string;
    subtitle?: string;
    price: string;
    has3D?: boolean;
    model3DGlbUrl?: string;
    model3DUsdzUrl?: string;
  }[];
}

interface MenuDisplayProps {
  restaurantId?: string;
}

export default function MenuDisplay({ restaurantId }: MenuDisplayProps) {
  const { t, locale } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [sections, setSections] = useState<MenuDisplaySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuDataCache, setMenuDataCache] = useState<Map<number, {
    category: Category;
    subcategories: Subcategory[];
    menuItems: MenuItem[];
    addons: Addon[];
  }>>(new Map());
  const [isFading, setIsFading] = useState(false);

  // Load all menu data on mount
  useEffect(() => {
    const loadAllMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch fresh data (no caching - using realtime updates instead)
        const allMenuData = await menuService.getAllMenuData(restaurantId);

        setMenuDataCache(allMenuData);

        const cats = Array.from(allMenuData.values()).map(data => data.category);
        setCategories(cats);

        if (cats.length > 0) {
          setCurrentCategory(cats[0]);
        }
      } catch (err) {
        console.error('Failed to load menu data:', err);
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    loadAllMenuData();

    // Subscribe to realtime changes
    const { supabase } = require('@/lib/supabase');

    const menuChannel = supabase
      .channel('menu-display-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        console.log('Categories changed, refreshing...');
        setMenuDataCache(new Map()); // Clear cache
        loadAllMenuData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subcategories' }, () => {
        console.log('Subcategories changed, refreshing...');
        setMenuDataCache(new Map()); // Clear cache
        loadAllMenuData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        console.log('Menu items changed, refreshing...');
        setMenuDataCache(new Map()); // Clear cache
        loadAllMenuData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'addons' }, () => {
        console.log('Addons changed, refreshing...');
        setMenuDataCache(new Map()); // Clear cache
        loadAllMenuData();
      })
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(menuChannel);
    };
  }, [restaurantId]);

  // Build sections when active tab changes (no API call)
  useEffect(() => {
    if (!categories[activeTab]) return;

    const categoryId = categories[activeTab].id;
    const menuData = menuDataCache.get(categoryId);

    if (!menuData) return;

    // Trigger fade out
    setIsFading(true);

    setTimeout(() => {
      setCurrentCategory(menuData.category);

      // Build sections based on the structure:
      // 1. General subcategory items (regular, non-special)
      // 2. Custom subcategories with their items
      // 3. Special items
      // 4. Add-ons

      const newSections: MenuDisplaySection[] = [];

      // Find General subcategory
      const generalSubcat = menuData.subcategories.find(s =>
        s.title.toLowerCase().includes('general')
      );

      // 1. General subcategory items (non-special) - NO HEADING
      if (generalSubcat) {
        const generalItems = menuData.menuItems
          .filter(item => item.subcategory_id === generalSubcat.id && !item.is_special)
          .sort((a, b) => a.order - b.order);

        if (generalItems.length > 0) {
          newSections.push({
            title: '', // No heading for general items
            subtitle: null,
            items: generalItems.map(item => ({
              id: item.id,
              image: item.image_path || undefined,
              title: getTranslatedField(item, 'title', locale),
              subtitle: getTranslatedField(item, 'text', locale) || getTranslatedField(item, 'description', locale),
              price: `${item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
              has3D: !!item.model_3d_url || !!item.redirect_3d_url,
              model3DGlbUrl: item.model_3d_url || undefined,
              model3DUsdzUrl: item.redirect_3d_url || undefined,
            })),
          });
        }
      }

      // 2. Custom subcategories with their items
      const customSubcats = menuData.subcategories
        .filter(s => !s.title.toLowerCase().includes('general'))
        .sort((a, b) => a.order - b.order);

      for (const subcat of customSubcats) {
        const subcatItems = menuData.menuItems
          .filter(item => item.subcategory_id === subcat.id)
          .sort((a, b) => a.order - b.order);

        if (subcatItems.length > 0) {
          newSections.push({
            title: getTranslatedField(subcat, 'title', locale),
            subtitle: getTranslatedField(subcat, 'text', locale) || null,
            items: subcatItems.map(item => ({
              id: item.id,
              image: item.image_path || undefined,
              title: getTranslatedField(item, 'title', locale),
              subtitle: getTranslatedField(item, 'text', locale) || getTranslatedField(item, 'description', locale),
              price: `${item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
              has3D: !!item.model_3d_url || !!item.redirect_3d_url,
              model3DGlbUrl: item.model_3d_url || undefined,
              model3DUsdzUrl: item.redirect_3d_url || undefined,
            })),
          });
        }
      }

      // 3. Special items
      const specialItems = menuData.menuItems
        .filter(item => item.is_special)
        .sort((a, b) => a.order - b.order);

      if (specialItems.length > 0) {
        newSections.push({
          title: t('menu.specials'),
          subtitle: null,
          isSpecial: true,
          items: specialItems.map(item => ({
            id: item.id,
            image: item.image_path || undefined,
            title: getTranslatedField(item, 'title', locale),
            subtitle: getTranslatedField(item, 'text', locale) || getTranslatedField(item, 'description', locale),
            price: `${item.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
            has3D: !!item.model_3d_url || !!item.redirect_3d_url,
            model3DGlbUrl: item.model_3d_url || undefined,
            model3DUsdzUrl: item.redirect_3d_url || undefined,
          })),
        });
      }

      // 4. Add-ons (Supplements)
      if (menuData.addons.length > 0) {
        const sortedAddons = [...menuData.addons].sort((a, b) => a.order - b.order);

        newSections.push({
          title: t('menu.supplements'),
          subtitle: null,
          items: sortedAddons.map(addon => ({
            id: addon.id,
            image: addon.image_path || undefined,
            title: getTranslatedField(addon, 'title', locale),
            subtitle: getTranslatedField(addon, 'description', locale) || undefined,
            price: `${addon.price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
            has3D: false,
          })),
        });
      }

      setSections(newSections);

      // Trigger fade in
      setTimeout(() => setIsFading(false), 50);
    }, 150);
  }, [activeTab, categories, locale, t]);

  if (categories.length === 0 && !loading) {
    return (
      <div className="w-full h-full p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <p className="text-white/60 text-center">
          {t('menu.noCategories')}
        </p>
      </div>
    );
  }

  return (
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
                {getTranslatedField(category, 'title', locale)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Title and Description */}
      {currentCategory && (
        <div className="mb-6">
          <h2 className="text-[28px] md:text-[32px] font-forum text-[#FFF2CC] font-medium capitalize">
            {getTranslatedField(currentCategory, 'title', locale)}
          </h2>
          {getTranslatedField(currentCategory, 'text', locale) && (
            <p className="text-[14px] md:text-[16px] font-forum text-[#FFD65A]/80 mt-2">
              {getTranslatedField(currentCategory, 'text', locale)}
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <MenuItemSkeleton key={index} />
          ))}
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
          ) : null}
        </div>
      )}
    </div>
  );
}
