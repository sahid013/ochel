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
      console.log('Checking admin role for user:', supabaseUser.id);
      
      // First, check if this is the default admin user
      if (supabaseUser.email === 'admin@restaurant.com') {
        console.log('Default admin user detected, setting admin role');
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          username: 'admin',
          role: 'super_admin'
        });
        return;
      }
      
      // Check if user has admin role
      const { data: adminRole, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .single();

      console.log('Admin role query result:', { data: adminRole, error: error || null });

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user is not an admin
          console.log('User is not an admin, signing out');
          setUser(null);
          await supabase.auth.signOut();
          return;
        } else {
          // Other error occurred - log it properly
          console.error('Database error checking admin role:', error);
          setUser(null);
          return;
        }
      }

      // Only set user if they have an admin role
      if (adminRole?.role) {
        console.log('Setting admin user with role:', adminRole.role);
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'Admin',
          role: adminRole.role
        });
      } else {
        // This shouldn't happen if query succeeds, but just in case
        console.log('Admin role query succeeded but no valid role found');
        setUser(null);
        await supabase.auth.signOut();
      }
    } catch (error) {
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
