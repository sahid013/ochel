'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LandingLanguageSwitcher } from './LandingLanguageSwitcher';
import { PrimaryButton } from '@/components/ui';
import { useTranslation } from '@/contexts/LanguageContext';

export function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1460px] mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="/icons/ochellogofull.png"
              alt="Ochel"
              className="h-5 w-auto md:h-7"
            />
          </a>

          {/* Language Switcher + Login/Signup Buttons or Profile */}
          <div className="flex items-center gap-1.5">
            <LandingLanguageSwitcher />

            <AuthButtons t={t} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function AuthButtons({ t }: { t: any }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        if (mounted) setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return null; // Or a small spinner if preferred

  if (user) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <PrimaryButton href="/login" variant="secondary" size="sm">
        {t('nav.login')}
      </PrimaryButton>
      <PrimaryButton href="/signup" size="sm">
        {t('nav.signup')}
      </PrimaryButton>
    </div>
  );
}
