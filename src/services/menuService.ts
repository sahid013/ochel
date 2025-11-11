import { supabase } from '@/lib/supabase';
import { deleteImage, isSupabaseUrl } from '@/lib/storage';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Category {
  id: number;
  title: string;
  title_en?: string | null;
  title_it?: string | null;
  title_es?: string | null;
  text?: string | null;
  text_en?: string | null;
  text_it?: string | null;
  text_es?: string | null;
  order: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface Subcategory {
  id: number;
  category_id: number;
  title: string;
  title_en?: string | null;
  title_it?: string | null;
  title_es?: string | null;
  text?: string | null;
  text_en?: string | null;
  text_it?: string | null;
  text_es?: string | null;
  order: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface MenuItem {
  id: number;
  title: string;
  title_en?: string | null;
  title_it?: string | null;
  title_es?: string | null;
  text?: string | null;
  text_en?: string | null;
  text_it?: string | null;
  text_es?: string | null;
  description: string;
  description_en?: string | null;
  description_it?: string | null;
  description_es?: string | null;
  image_path?: string | null;
  model_3d_url?: string | null;
  redirect_3d_url?: string | null;
  additional_image_url?: string | null;
  is_special: boolean;
  price: number;
  subcategory_id: number;
  order: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface Addon {
  id: number;
  title: string;
  title_en?: string | null;
  title_it?: string | null;
  title_es?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_it?: string | null;
  description_es?: string | null;
  image_path?: string | null;
  price: number;
  category_id?: number | null;
  subcategory_id?: number | null;
  order: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}

// ============================================================================
// TRANSLATION HELPER
// ============================================================================

/**
 * Get translated field value based on locale
 * Falls back to French if translation not available
 */
export function getTranslatedField<T extends Record<string, any>>(
  item: T,
  field: string,
  locale: 'fr' | 'en' | 'it' | 'es'
): string {
  // For French, return the original field
  if (locale === 'fr') {
    return (item[field] as string) || '';
  }

  // For other languages, try translated field first, fallback to French
  const translatedField = `${field}_${locale}`;
  return (item[translatedField] as string) || (item[field] as string) || '';
}

// ============================================================================
// CATEGORIES
// ============================================================================

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error} = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'order'>): Promise<Category> {
    // Get the max order value to assign next order
    const { data: maxOrderData } = await supabase
      .from('categories')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.order || 0) + 1;

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, order: nextOrder })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorder(id: number, direction: 'up' | 'down'): Promise<void> {
    // Get current category
    const current = await this.getById(id);
    if (!current) throw new Error('Category not found');

    // Get all categories ordered
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, order')
      .order('order', { ascending: true });

    if (!allCategories || allCategories.length < 2) return;

    // Find current index
    const currentIndex = allCategories.findIndex(c => c.id === id);
    if (currentIndex === -1) return;

    // Determine swap target
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= allCategories.length) return;

    const target = allCategories[targetIndex];

    // Swap order values
    await supabase
      .from('categories')
      .update({ order: target.order })
      .eq('id', current.id);

    await supabase
      .from('categories')
      .update({ order: current.order })
      .eq('id', target.id);
  },

  async updateBulkOrder(updates: { id: number; order: number }[]): Promise<void> {
    // Update multiple categories' order values in batch
    for (const update of updates) {
      await supabase
        .from('categories')
        .update({ order: update.order })
        .eq('id', update.id);
    }
  },
};

// ============================================================================
// SUBCATEGORIES
// ============================================================================

export const subcategoryService = {
  async getAll(): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByCategory(categoryId: number): Promise<Subcategory[]> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Subcategory | null> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(subcategory: Omit<Subcategory, 'id' | 'created_at' | 'updated_at' | 'order'>): Promise<Subcategory> {
    // Get the max order value within this category to assign next order
    const { data: maxOrderData } = await supabase
      .from('subcategories')
      .select('order')
      .eq('category_id', subcategory.category_id)
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.order || 0) + 1;

    const { data, error } = await supabase
      .from('subcategories')
      .insert({ ...subcategory, order: nextOrder })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, subcategory: Partial<Subcategory>): Promise<Subcategory> {
    const { data, error } = await supabase
      .from('subcategories')
      .update(subcategory)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorder(id: number, direction: 'up' | 'down'): Promise<void> {
    // Get current subcategory
    const current = await this.getById(id);
    if (!current) throw new Error('Subcategory not found');

    // Get all subcategories in same category, ordered
    const { data: allSubcategories } = await supabase
      .from('subcategories')
      .select('id, order')
      .eq('category_id', current.category_id)
      .order('order', { ascending: true });

    if (!allSubcategories || allSubcategories.length < 2) return;

    // Find current index
    const currentIndex = allSubcategories.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    // Determine swap target
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= allSubcategories.length) return;

    const target = allSubcategories[targetIndex];

    // Swap order values
    await supabase
      .from('subcategories')
      .update({ order: target.order })
      .eq('id', current.id);

    await supabase
      .from('subcategories')
      .update({ order: current.order })
      .eq('id', target.id);
  },

  async updateBulkOrder(updates: { id: number; order: number }[]): Promise<void> {
    // Update multiple subcategories' order values in batch
    for (const update of updates) {
      await supabase
        .from('subcategories')
        .update({ order: update.order })
        .eq('id', update.id);
    }
  },
};

// ============================================================================
// MENU ITEMS
// ============================================================================

export const menuItemService = {
  async getAll(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getBySubcategory(subcategoryId: number): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('subcategory_id', subcategoryId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at' | 'order'>): Promise<MenuItem> {
    // Get the max order value within this subcategory to assign next order
    const { data: maxOrderData } = await supabase
      .from('menu_items')
      .select('order')
      .eq('subcategory_id', menuItem.subcategory_id)
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.order || 0) + 1;

    const { data, error } = await supabase
      .from('menu_items')
      .insert({ ...menuItem, order: nextOrder })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, menuItem: Partial<MenuItem>): Promise<MenuItem> {
    // If updating image_path, delete the old image from storage
    if (menuItem.image_path !== undefined) {
      const oldItem = await this.getById(id);
      if (oldItem?.image_path && isSupabaseUrl(oldItem.image_path) && oldItem.image_path !== menuItem.image_path) {
        // Delete old image asynchronously (don't wait)
        deleteImage(oldItem.image_path).catch(err =>
          console.warn('Failed to delete old menu item image:', err)
        );
      }
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(menuItem)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    // Get the menu item first to access its image path
    const menuItem = await this.getById(id);

    // Delete from database
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete associated image from storage (only if it's a Supabase URL)
    if (menuItem?.image_path && isSupabaseUrl(menuItem.image_path)) {
      deleteImage(menuItem.image_path).catch(err =>
        console.warn('Failed to delete menu item image:', err)
      );
    }
  },

  async getSpecialItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_special', true)
      .eq('status', 'active')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async reorder(id: number, direction: 'up' | 'down'): Promise<void> {
    // Get current menu item
    const current = await this.getById(id);
    if (!current) throw new Error('Menu item not found');

    // Get all menu items in same subcategory, ordered
    const { data: allItems } = await supabase
      .from('menu_items')
      .select('id, order')
      .eq('subcategory_id', current.subcategory_id)
      .order('order', { ascending: true });

    if (!allItems || allItems.length < 2) return;

    // Find current index
    const currentIndex = allItems.findIndex(i => i.id === id);
    if (currentIndex === -1) return;

    // Determine swap target
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= allItems.length) return;

    const target = allItems[targetIndex];

    // Swap order values
    await supabase
      .from('menu_items')
      .update({ order: target.order })
      .eq('id', current.id);

    await supabase
      .from('menu_items')
      .update({ order: current.order })
      .eq('id', target.id);
  },

  async updateBulkOrder(updates: { id: number; order: number }[]): Promise<void> {
    // Update multiple menu items' order values in batch
    for (const update of updates) {
      await supabase
        .from('menu_items')
        .update({ order: update.order })
        .eq('id', update.id);
    }
  },
};

// ============================================================================
// MENU DATA - Composite query for menu display
// ============================================================================

export interface MenuData {
  category: Category;
  subcategories: Subcategory[];
  menuItems: MenuItem[];
  addons: Addon[];
}

export const menuService = {
  async getMenuByCategory(categoryId: number): Promise<MenuData> {
    // Fetch all data in parallel
    const [category, subcategories, allMenuItems, addons] = await Promise.all([
      categoryService.getById(categoryId),
      subcategoryService.getByCategory(categoryId),
      menuItemService.getAll(),
      addonService.getByCategory(categoryId),
    ]);

    if (!category) {
      throw new Error('Category not found');
    }

    // Filter menu items to only those in this category's subcategories
    const subcategoryIds = subcategories.map(s => s.id);
    const menuItems = allMenuItems.filter(item =>
      subcategoryIds.includes(item.subcategory_id) && item.status === 'active'
    );

    return {
      category,
      subcategories: subcategories.filter(s => s.status === 'active'),
      menuItems,
      addons: addons.filter(a => a.status === 'active'),
    };
  },

  async getActiveCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAllMenuData(): Promise<Map<number, MenuData>> {
    // Fetch all data in one go
    const [categories, subcategories, menuItems, addons] = await Promise.all([
      this.getActiveCategories(),
      subcategoryService.getAll(),
      menuItemService.getAll(),
      addonService.getAll(),
    ]);

    // Build a map of category ID to menu data
    const menuDataMap = new Map<number, MenuData>();

    for (const category of categories) {
      const categorySubcats = subcategories.filter(
        s => s.category_id === category.id && s.status === 'active'
      );

      const subcatIds = categorySubcats.map(s => s.id);

      const categoryMenuItems = menuItems.filter(
        item => subcatIds.includes(item.subcategory_id) && item.status === 'active'
      );

      const categoryAddons = addons.filter(
        addon =>
          (addon.category_id === category.id || subcatIds.includes(addon.subcategory_id ?? 0)) &&
          addon.status === 'active'
      );

      menuDataMap.set(category.id, {
        category,
        subcategories: categorySubcats,
        menuItems: categoryMenuItems,
        addons: categoryAddons,
      });
    }

    return menuDataMap;
  },
};

// ============================================================================
// ADDONS
// ============================================================================

export const addonService = {
  async getAll(): Promise<Addon[]> {
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .order('order', { ascending: true});

    if (error) throw error;
    return data || [];
  },

  async getByCategory(categoryId: number): Promise<Addon[]> {
    // Get all subcategories for this category first
    const { data: subcategories, error: subcatError } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', categoryId);

    if (subcatError) throw subcatError;

    const subcategoryIds = subcategories?.map(s => s.id) || [];

    // Get addons that match this category OR any of its subcategories
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .or(`category_id.eq.${categoryId},subcategory_id.in.(${subcategoryIds.join(',')})`)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getBySubcategory(subcategoryId: number): Promise<Addon[]> {
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .eq('subcategory_id', subcategoryId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Addon | null> {
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(addon: Omit<Addon, 'id' | 'created_at' | 'updated_at' | 'order'>): Promise<Addon> {
    // Get the max order value within this subcategory to assign next order
    // Handle null subcategory_id by using category_id or defaulting to global ordering
    let nextOrder = 1;
    if (addon.subcategory_id) {
      const { data: maxOrderData } = await supabase
        .from('addons')
        .select('order')
        .eq('subcategory_id', addon.subcategory_id)
        .order('order', { ascending: false })
        .limit(1)
        .single();

      nextOrder = (maxOrderData?.order || 0) + 1;
    }

    const { data, error } = await supabase
      .from('addons')
      .insert({ ...addon, order: nextOrder })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, addon: Partial<Addon>): Promise<Addon> {
    // If updating image_path, delete the old image from storage
    if (addon.image_path !== undefined) {
      const oldAddon = await this.getById(id);
      if (oldAddon?.image_path && isSupabaseUrl(oldAddon.image_path) && oldAddon.image_path !== addon.image_path) {
        // Delete old image asynchronously (don't wait)
        deleteImage(oldAddon.image_path).catch(err =>
          console.warn('Failed to delete old addon image:', err)
        );
      }
    }

    const { data, error } = await supabase
      .from('addons')
      .update(addon)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    // Get the addon first to access its image path
    const addon = await this.getById(id);

    // Delete from database
    const { error } = await supabase
      .from('addons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete associated image from storage (only if it's a Supabase URL)
    if (addon?.image_path && isSupabaseUrl(addon.image_path)) {
      deleteImage(addon.image_path).catch(err =>
        console.warn('Failed to delete addon image:', err)
      );
    }
  },

  async reorder(id: number, direction: 'up' | 'down'): Promise<void> {
    // Get current addon
    const current = await this.getById(id);
    if (!current) throw new Error('Addon not found');
    if (!current.subcategory_id) throw new Error('Addon must have a subcategory to reorder');

    // Get all addons in same subcategory, ordered
    const { data: allAddons } = await supabase
      .from('addons')
      .select('id, order')
      .eq('subcategory_id', current.subcategory_id)
      .order('order', { ascending: true });

    if (!allAddons || allAddons.length < 2) return;

    // Find current index
    const currentIndex = allAddons.findIndex(a => a.id === id);
    if (currentIndex === -1) return;

    // Determine swap target
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= allAddons.length) return;

    const target = allAddons[targetIndex];

    // Swap order values
    await supabase
      .from('addons')
      .update({ order: target.order })
      .eq('id', current.id);

    await supabase
      .from('addons')
      .update({ order: current.order })
      .eq('id', target.id);
  },

  async updateBulkOrder(updates: { id: number; order: number }[]): Promise<void> {
    // Update multiple addons' order values in batch
    for (const update of updates) {
      await supabase
        .from('addons')
        .update({ order: update.order })
        .eq('id', update.id);
    }
  },
};
