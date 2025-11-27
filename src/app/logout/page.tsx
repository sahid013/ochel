'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function signOut() {
      // Notify the auth error handler that this is an intentional logout
      window.dispatchEvent(new Event('logout-initiated'));

      await supabase.auth.signOut();
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      // Redirect to home
      window.location.href = '/';
    }
    signOut();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Signing out...</p>
    </div>
  );
}
