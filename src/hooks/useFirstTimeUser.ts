import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';

interface UseFirstTimeUserResult {
  isFirstTime: boolean;
  loading: boolean;
  checkAgain: () => Promise<void>;
}

/**
 * Hook to check if the restaurant has completed onboarding
 * Returns true if has_completed_onboarding is false/null (first-time user)
 */
export function useFirstTimeUser(restaurant: Restaurant | null): UseFirstTimeUserResult {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkFirstTime = async () => {
    if (!restaurant) {
      console.log('useFirstTimeUser: No restaurant provided');
      setIsFirstTime(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const hasCompleted = restaurant.has_completed_onboarding;
      console.log('useFirstTimeUser check:', {
        id: restaurant.id,
        hasCompleted,
        computedIsFirstTime: !hasCompleted
      });

      // Check the has_completed_onboarding flag
      // If it's false or null, user hasn't completed onboarding yet
      setIsFirstTime(!hasCompleted);
    } catch (err) {
      console.error('Error in useFirstTimeUser:', err);
      setIsFirstTime(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFirstTime();
  }, [restaurant?.id, restaurant?.has_completed_onboarding]);

  return {
    isFirstTime,
    loading,
    checkAgain: checkFirstTime,
  };
}
