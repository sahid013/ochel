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
      console.log('Setting user from session:', supabaseUser.id);

      // Check if user owns a restaurant with timeout
      console.log('Querying restaurants table for owner_id:', supabaseUser.id);

      const restaurantPromise = supabase
        .from('restaurants')
        .select('id, name')
        .eq('owner_id', supabaseUser.id)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          console.warn('Restaurant query timed out after 5 seconds (retrying via auth state change)');
          reject(new Error('Restaurant query timed out'));
        }, 5000)
      );

      const { data: restaurant, error } = await Promise.race([
        restaurantPromise,
        timeoutPromise
      ]) as any;

      console.log('Restaurant check result:', { restaurant, error: error || null });

      if (error) {
        // If it's a timeout, just return silently - auth state change will retry
        if (error.message === 'Restaurant query timed out') {
          console.log('Query timed out, will retry on auth state change');
          return;
        }

        // For other errors (not PGRST116 which is "no rows"), set user to null
        if (error.code !== 'PGRST116') {
          console.error('Database error checking restaurant:', error);
          setUser(null);
          return;
        }
      }

      // Set user (restaurant owners are considered admins)
      if (restaurant) {
        console.log('Setting restaurant owner user:', restaurant.name);
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          role: 'restaurant_owner'
        });
      } else {
        console.log('User has no restaurant, setting basic user');
        // User is authenticated but not a restaurant owner - still set user
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
          role: 'user'
        });
      }
    } catch (error) {
      // Silently handle timeout errors - auth state change will retry
      if (error instanceof Error && error.message === 'Restaurant query timed out') {
        console.log('Query timed out in catch block, ignoring (will retry)');
        return;
      }
      console.error('Unexpected error in setUserFromSession:', error);
      setUser(null);
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
