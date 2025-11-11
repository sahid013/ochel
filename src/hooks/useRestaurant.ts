import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';

interface UseRestaurantResult {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get the current logged-in user's restaurant
 * Used in admin panel to ensure restaurant-specific operations
 */
export function useRestaurant(): UseRestaurantResult {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get restaurant owned by this user
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (restaurantError) throw restaurantError;
      if (!restaurantData) {
        throw new Error('No restaurant found for this user');
      }

      setRestaurant(restaurantData as Restaurant);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, []);

  return {
    restaurant,
    loading,
    error,
    refetch: fetchRestaurant,
  };
}
