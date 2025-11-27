import { supabase } from '@/lib/supabase';
import { deleteImage, isSupabaseUrl } from '@/lib/storage';
import { MenuItem } from '@/types';

export const menuItemService = {
    async getAll(restaurantId: string): Promise<MenuItem[]> {
        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', restaurantId)
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

    async update(id: number, menuItem: Partial<MenuItem>, restaurantId: string): Promise<MenuItem> {
        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        // Verify ownership before update
        const existing = await this.getById(id);
        if (!existing || existing.restaurant_id !== restaurantId) {
            throw new Error('Unauthorized: Cannot update menu item from another restaurant');
        }

        // If updating image_path, delete the old image from storage
        if (menuItem.image_path !== undefined) {
            if (existing?.image_path && isSupabaseUrl(existing.image_path) && existing.image_path !== menuItem.image_path) {
                // Delete old image asynchronously (don't wait)
                deleteImage(existing.image_path).catch(err =>
                    console.warn('Failed to delete old menu item image:', err)
                );
            }
        }

        const { data, error } = await supabase
            .from('menu_items')
            .update(menuItem)
            .eq('id', id)
            .eq('restaurant_id', restaurantId) // Double-check ownership
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: number, restaurantId: string): Promise<void> {
        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        // Get the menu item first to access its image path and verify ownership
        const menuItem = await this.getById(id);
        if (!menuItem || menuItem.restaurant_id !== restaurantId) {
            throw new Error('Unauthorized: Cannot delete menu item from another restaurant');
        }

        // Delete from database
        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId); // Double-check ownership

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
