import { supabase } from '@/lib/supabase';
import { Category, MenuData } from '@/types';
import { categoryService } from './categoryService';
import { subcategoryService } from './subcategoryService';
import { menuItemService } from './menuItemService';
import { addonService } from './addonService';

export const menuService = {
    async getMenuByCategory(categoryId: number): Promise<MenuData> {
        // Fetch category first to get restaurantId


        const category = await categoryService.getById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }

        // We need restaurantId.
        const restaurantId = category.restaurant_id;
        if (!restaurantId) throw new Error('Category has no restaurant ID');

        const [subcategories, allMenuItems, addons] = await Promise.all([
            subcategoryService.getByCategory(categoryId),
            menuItemService.getAll(restaurantId),
            addonService.getByCategory(categoryId),
        ]);

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

    async getActiveCategories(restaurantId?: string): Promise<Category[]> {
        let query = supabase
            .from('categories')
            .select('*')
            .eq('status', 'active');

        if (restaurantId) {
            query = query.eq('restaurant_id', restaurantId);
        }

        query = query.order('order', { ascending: true });

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    async getAllMenuData(restaurantId?: string): Promise<Map<number, MenuData>> {
        // Fetch all data in one go
        // Note: subcategoryService.getAll requires restaurantId.
        // menuItemService.getAll requires restaurantId.
        // addonService.getAll requires restaurantId.

        // The original code had:
        /*
        async getAllMenuData(restaurantId?: string): Promise<Map<number, MenuData>> {
          // ...
          const [categories, subcategories, menuItems, addons] = await Promise.all([
            this.getActiveCategories(restaurantId),
            subcategoryService.getAll(restaurantId), // Error if restaurantId is undefined
            menuItemService.getAll(restaurantId),    // Error if restaurantId is undefined
            addonService.getAll(restaurantId),       // Error if restaurantId is undefined
          ]);
        */

        // So `getAllMenuData` also fails if `restaurantId` is missing.
        // I should probably enforce `restaurantId` in `getAllMenuData` or handle it.
        // Given the signature `restaurantId?: string`, it implies it's optional.
        // But the sub-services require it.
        // I will assume `restaurantId` is required for `getAllMenuData` effectively, or I should fix the sub-services to allow optional?
        // No, sub-services enforce it for security/scoping.

        if (!restaurantId) {
            // If no restaurant ID, we can't fetch all data for "all restaurants" easily/safely in this context usually.
            // Or maybe we return empty?
            return new Map();
        }

        const [categories, subcategories, menuItems, addons] = await Promise.all([
            this.getActiveCategories(restaurantId),
            subcategoryService.getAll(restaurantId),
            menuItemService.getAll(restaurantId),
            addonService.getAll(restaurantId),
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
