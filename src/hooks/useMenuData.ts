'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import {
  menuService,
  getTranslatedField,
  type Category,
  type MenuItem,
  type Addon,
  type Subcategory
} from '@/services/menuService';

export interface MenuSection {
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

interface MenuData {
  category: Category;
  subcategories: Subcategory[];
  menuItems: MenuItem[];
  addons: Addon[];
}

/**
 * Custom hook for fetching and managing menu data from Supabase
 * Shared across all templates to ensure consistent data access
 */
export function useMenuData(restaurantId?: string) {
  const { t, locale } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuDataCache, setMenuDataCache] = useState<Map<number, MenuData>>(new Map());
  const [isFading, setIsFading] = useState(false);

  // Load all menu data on mount
  useEffect(() => {
    const loadAllMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try browser cache first for faster loading
        const cacheKey = `menu_data_${restaurantId || 'default'}`;
        const cachedMenu = sessionStorage.getItem(cacheKey);

        if (cachedMenu) {
          try {
            const parsed = JSON.parse(cachedMenu);
            // Cache for 5 minutes
            if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              // Reconstruct Map from cached array
              const cachedMap = new Map(parsed.data);
              setMenuDataCache(cachedMap);

              const cats = Array.from(cachedMap.values()).map(data => data.category);
              setCategories(cats);

              if (cats.length > 0) {
                setCurrentCategory(cats[0]);
              }

              setLoading(false);
              return;
            }
          } catch {
            // Invalid cache, continue to fetch
            sessionStorage.removeItem(cacheKey);
          }
        }

        // Fetch fresh data from Supabase
        const allMenuData = await menuService.getAllMenuData(restaurantId);

        // Cache the result
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: Array.from(allMenuData.entries()),
          timestamp: Date.now()
        }));

        setMenuDataCache(allMenuData);

        const cats = Array.from(allMenuData.values()).map(data => data.category);
        setCategories(cats);

        if (cats.length > 0) {
          setCurrentCategory(cats[0]);
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load menu data:', err);
        }
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    loadAllMenuData();

    // Subscribe to realtime changes from Supabase (only in development for performance)
    if (process.env.NODE_ENV === 'development') {
      const { supabase } = require('@/lib/supabase');

      const menuChannel = supabase
        .channel('menu-data-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
          console.log('Categories changed, refreshing...');
          setMenuDataCache(new Map());
          loadAllMenuData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subcategories' }, () => {
          console.log('Subcategories changed, refreshing...');
          setMenuDataCache(new Map());
          loadAllMenuData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
          console.log('Menu items changed, refreshing...');
          setMenuDataCache(new Map());
          loadAllMenuData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'addons' }, () => {
          console.log('Addons changed, refreshing...');
          setMenuDataCache(new Map());
          loadAllMenuData();
        })
        .subscribe();

      // Cleanup on unmount
      return () => {
        supabase.removeChannel(menuChannel);
      };
    }
  }, [restaurantId]);

  // Build sections when active tab changes
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

      const newSections: MenuSection[] = [];

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
            title: '',
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
  }, [activeTab, categories, locale, t, menuDataCache]);

  return {
    categories,
    activeTab,
    setActiveTab,
    currentCategory,
    sections,
    loading,
    error,
    isFading,
    // Utility function for getting translated fields
    getTranslatedField: (item: any, field: string) => getTranslatedField(item, field, locale),
  };
}
