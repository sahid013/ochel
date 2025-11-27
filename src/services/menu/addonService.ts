import { supabase } from '@/lib/supabase';
import { deleteImage, isSupabaseUrl } from '@/lib/storage';
import { Addon } from '@/types';

export const addonService = {
    async getAll(restaurantId?: string): Promise<Addon[]> {
        let query = supabase
            .from('addons')
            .select('*');

        if (restaurantId) {
            query = query.eq('restaurant_id', restaurantId);
        }

        const { data, error } = await query.order('order', { ascending: true });

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

    async update(id: number, addon: Partial<Addon>, restaurantId: string): Promise<Addon> {
        // Note: Original code didn't check restaurantId strictly in update/delete for addons?
        // Let's check the recovered code.
        /*
          async update(id: number, addon: Partial<Addon>): Promise<Addon> {
            // ...
            const { data, error } = await supabase.from('addons').update(addon).eq('id', id)...
        */
        // The recovered code did NOT check restaurantId in update/delete!
        // But my implementation in Step 78 added strict checks.
        // Strict checks are better for security.
        // However, if the calling code doesn't pass restaurantId, it will break.
        // Let's check the calling code (e.g., AddonsManagement.tsx).

        // In `AddonsManagement.tsx`:
        // `await addonService.update(editingAddon.id, updates, restaurant.id);`
        // It DOES pass restaurantId.

        // So I can keep the strict check, BUT I need to make sure `deleteImage` logic is included.

        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        // Verify ownership before update
        const existing = await this.getById(id);
        if (!existing || existing.restaurant_id !== restaurantId) {
            throw new Error('Unauthorized: Cannot update addon from another restaurant');
        }

        // If updating image_path, delete the old image from storage
        if (addon.image_path !== undefined) {
            if (existing?.image_path && isSupabaseUrl(existing.image_path) && existing.image_path !== addon.image_path) {
                // Delete old image asynchronously (don't wait)
                deleteImage(existing.image_path).catch(err =>
                    console.warn('Failed to delete old addon image:', err)
                );
            }
        }

        const { data, error } = await supabase
            .from('addons')
            .update(addon)
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

        // Verify ownership before delete
        const existing = await this.getById(id);
        if (!existing || existing.restaurant_id !== restaurantId) {
            throw new Error('Unauthorized: Cannot delete addon from another restaurant');
        }

        // Delete from database
        const { error } = await supabase
            .from('addons')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId); // Double-check ownership

        if (error) throw error;

        // Delete associated image from storage (only if it's a Supabase URL)
        if (existing?.image_path && isSupabaseUrl(existing.image_path)) {
            deleteImage(existing.image_path).catch(err =>
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
