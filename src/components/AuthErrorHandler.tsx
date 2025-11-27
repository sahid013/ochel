'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthError } from '@supabase/supabase-js';

/**
 * Global auth error handler component
 * Handles invalid refresh tokens and session errors
 */
export function AuthErrorHandler() {
  const isHandlingError = useRef(false);
  const isLoggingIn = useRef(false);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Don't interfere with login process
      if (event === 'SIGNED_IN') {
        isLoggingIn.current = true;
        isHandlingError.current = false;
        isLoggingOut.current = false;
        setTimeout(() => {
          isLoggingIn.current = false;
        }, 3000); // Give 3 seconds for login to complete
        return;
      }

      // Handle sign out event - but don't interfere with intentional logouts
      if (event === 'SIGNED_OUT') {
        // If this is an intentional logout (user clicked logout button), don't do anything extra
        if (isLoggingOut.current) {
          isLoggingOut.current = false;
          return;
        }

        // Only clear auth data for unexpected sign outs (not manual logouts)
        if (!isLoggingIn.current && !isHandlingError.current) {
          isHandlingError.current = true;
          // Just clear local storage, don't call signOut again
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.includes('supabase') || key.includes('auth-token') || key.includes('sb-')) {
              localStorage.removeItem(key);
            }
          });
          setTimeout(() => {
            isHandlingError.current = false;
          }, 1000);
        }
      }

      // Handle token refresh failures (only if not currently logging in)
      if (event === 'TOKEN_REFRESHED' && !session && !isLoggingIn.current) {
        console.warn('Token refresh failed - clearing invalid session');
        if (!isHandlingError.current) {
          isHandlingError.current = true;
          clearAuthData();

          // Only redirect if we're on a protected page
          if (window.location.pathname.includes('/admin')) {
            window.location.href = '/login';
          }

          setTimeout(() => {
            isHandlingError.current = false;
          }, 1000);
        }
      }
    });

    // Listen for intentional logout attempts
    const handleBeforeLogout = () => {
      isLoggingOut.current = true;
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 2000);
    };

    // Add event listener for logout button clicks
    window.addEventListener('logout-initiated', handleBeforeLogout);

    // Listen for auth errors globally (but only act if not logging in)
    const handleAuthError = (error: Error) => {
      // Don't handle errors during login
      if (isLoggingIn.current || isHandlingError.current) {
        return;
      }

      if (error instanceof AuthError) {
        // Check for invalid refresh token error
        if (error.message.includes('Invalid Refresh Token') ||
            error.message.includes('Refresh Token Not Found')) {
          console.warn('Invalid refresh token detected - suppressing error');

          // Prevent the error from showing in console
          error.message = '';

          // Only clear session if we're not on login/signup pages
          if (!window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/signup')) {
            isHandlingError.current = true;
            clearAuthData();

            // Only redirect if we're on a protected page
            if (window.location.pathname.includes('/admin')) {
              window.location.href = '/login';
            }

            setTimeout(() => {
              isHandlingError.current = false;
            }, 1000);
          }
        }
      }
    };

    // Add global error listener
    const errorHandler = (event: ErrorEvent) => {
      if (event.error) {
        handleAuthError(event.error);
      }
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      if (event.reason) {
        handleAuthError(event.reason);
      }
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
      window.removeEventListener('logout-initiated', handleBeforeLogout);
    };
  }, []);

  return null; // This component doesn't render anything
}

/**
 * Clear all authentication data from localStorage
 */
function clearAuthData() {
  try {
    // Clear Supabase auth tokens
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth-token') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Sign out from Supabase (silently)
    supabase.auth.signOut({ scope: 'local' }).catch(() => {
      // Silently ignore errors during cleanup
    });
  } catch (error) {
    // Silently ignore errors during cleanup
  }
}
