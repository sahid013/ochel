import { supabase } from '@/lib/supabase';
import { Subcategory } from '@/types';

export const subcategoryService = {
    async getAll(restaurantId: string): Promise<Subcategory[]> {
        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .eq('restaurant_id', restaurantId)
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

    async update(id: number, subcategory: Partial<Subcategory>, restaurantId: string): Promise<Subcategory> {
        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        // Verify ownership before update
        const existing = await this.getById(id);
        if (!existing || existing.restaurant_id !== restaurantId) {
            throw new Error('Unauthorized: Cannot update subcategory from another restaurant');
        }

        const { data, error } = await supabase
            .from('subcategories')
            .update(subcategory)
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
            throw new Error('Unauthorized: Cannot delete subcategory from another restaurant');
        }

        const { error } = await supabase
            .from('subcategories')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId); // Double-check ownership

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
