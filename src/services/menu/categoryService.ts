import { supabase } from '@/lib/supabase';
import { Category } from '@/types';

export const categoryService = {
    async getAll(restaurantId: string): Promise<Category[]> {
        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('restaurant_id', restaurantId)
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
        // Get the max order value to assign next order (filtered by restaurant)
        let maxOrderQuery = supabase
            .from('categories')
            .select('order')
            .order('order', { ascending: false })
            .limit(1);

        if (category.restaurant_id) {
            maxOrderQuery = maxOrderQuery.eq('restaurant_id', category.restaurant_id);
        }

        const { data: maxOrderData } = await maxOrderQuery.maybeSingle();

        const nextOrder = (maxOrderData?.order || 0) + 1;

        const { data, error } = await supabase
            .from('categories')
            .insert({ ...category, order: nextOrder })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: number, category: Partial<Category>, restaurantId: string): Promise<Category> {
        if (!restaurantId) {
            throw new Error('Restaurant ID is required');
        }

        // Verify ownership before update
        const existing = await this.getById(id);
        if (!existing || existing.restaurant_id !== restaurantId) {
            throw new Error('Unauthorized: Cannot update category from another restaurant');
        }

        const { data, error } = await supabase
            .from('categories')
            .update(category)
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
            throw new Error('Unauthorized: Cannot delete category from another restaurant');
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('restaurant_id', restaurantId); // Double-check ownership

        if (error) throw error;
    },

    async reorder(id: number, direction: 'up' | 'down', restaurantId?: string): Promise<void> {
        // Get current category
        const current = await this.getById(id);
        if (!current) throw new Error('Category not found');

        // Get all categories ordered (filtered by restaurant)
        let query = supabase
            .from('categories')
            .select('id, order');

        if (restaurantId) {
            query = query.eq('restaurant_id', restaurantId);
        }

        const { data: allCategories } = await query.order('order', { ascending: true });

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
