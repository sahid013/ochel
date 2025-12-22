'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          console.log('Session check timed out, setting loading to false');
          setIsLoading(false);
        }, 3000); // 3 second timeout

        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('Initial session result:', { session: !!session, error });

        if (error) {
          console.error('Error getting session:', error);
          clearTimeout(timeoutId);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Found session user, checking admin role...');
          await setUserFromSession(session.user);
        } else {
          console.log('No session found');
        }

        clearTimeout(timeoutId);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session);

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await setUserFromSession(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const setUserFromSession = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('[AuthContext] Setting user from session:', supabaseUser.id);

      // Check cache first for instant load
      const cacheKey = `user_restaurant_${supabaseUser.id}`;
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          console.log('[AuthContext] Using cached restaurant data:', cachedData.name);
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
            role: cachedData.hasRestaurant ? 'restaurant_owner' : 'user'
          });

          // Still fetch in background to update cache
          fetchRestaurantInBackground(supabaseUser, cacheKey);
          return;
        } catch (e) {
          console.log('[AuthContext] Cache parse error, fetching fresh data');
        }
      }

      // Set user immediately to prevent blocking
      // We'll update the role if we find a restaurant
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
        role: 'user'
      });

      // Fetch restaurant with aggressive timeout
      await fetchRestaurantInBackground(supabaseUser, cacheKey);

    } catch (error) {
      // Keep user set even if there's an error
      // User is already set above, so pages can still load
      if (error instanceof Error && error.message === 'Restaurant query timed out') {
        console.log('[AuthContext] Timeout in catch block - user is already set, continuing');
        return;
      }
      console.error('[AuthContext] Unexpected error in setUserFromSession:', error);
      // Keep the user that was already set instead of nullifying
      console.log('[AuthContext] Keeping user despite error to allow page access');
    }
  };

  const fetchRestaurantInBackground = async (supabaseUser: SupabaseUser, cacheKey: string) => {
    try {
      console.log('[AuthContext] Fetching restaurant in background for owner_id:', supabaseUser.id);

      const restaurantPromise = supabase
        .from('restaurants')
        .select('id, name')
        .eq('owner_id', supabaseUser.id)
        .limit(1)
        .maybeSingle();

      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => {
          console.warn('[AuthContext] Restaurant query timed out after 5 seconds');
          reject(new Error('Restaurant query timed out'));
        }, 5000) // Increased to 5 seconds to prevent premature timeouts
      );

      const { data: restaurant, error } = await Promise.race([
        restaurantPromise,
        timeoutPromise
      ]) as any;

      console.log('[AuthContext] Restaurant check result:', { restaurant, error: error || null });

      // Cache the result for future instant loads
      const cacheData = {
        hasRestaurant: !!restaurant,
        name: restaurant?.name || null,
        timestamp: Date.now()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));

      if (error) {
        // If it's a timeout, user is already set with basic role
        if (error.message === 'Restaurant query timed out') {
          console.log('[AuthContext] Timeout - keeping user with basic role, pages can still load');
          // Cache as no restaurant found
          sessionStorage.setItem(cacheKey, JSON.stringify({ hasRestaurant: false, name: null, timestamp: Date.now() }));
          return;
        }

        // For other errors (not PGRST116 which is "no rows"), keep current user
        if (error.code !== 'PGRST116') {
          console.error('[AuthContext] Database error checking restaurant:', error);
          return;
        }
      }

      // Update user role if restaurant found
      if (restaurant) {
        console.log('[AuthContext] Found restaurant, updating user role to restaurant_owner:', restaurant.name);
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          role: 'restaurant_owner'
        });
      } else {
        console.log('[AuthContext] No restaurant found, keeping basic user role');
        // User already set above with 'user' role, no need to set again
      }
    } catch (error) {
      // Keep user set even if there's an error
      if (error instanceof Error && error.message === 'Restaurant query timed out') {
        console.log('[AuthContext] Background fetch timeout - user already set');
        return;
      }
      console.error('[AuthContext] Error in fetchRestaurantInBackground:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        // setUserFromSession will be called automatically by the auth state change listener
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Notify the auth error handler that this is an intentional logout
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('logout-initiated'));
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    // setUser(null) will be called automatically by the auth state change listener
  };



  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
