'use client';

import { LandingLanguageSwitcher } from './LandingLanguageSwitcher';
import { PrimaryButton } from '@/components/ui';
import { useTranslation } from '@/contexts/LanguageContext';

export function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src="/icons/ochellogofull.png"
              alt="Ochel"
              className="h-7 w-auto"
            />
          </a>

          {/* Language Switcher + Login/Signup Buttons */}
          <div className="flex items-center gap-3">
            <LandingLanguageSwitcher />
            <PrimaryButton href="/login" variant="secondary" size="sm">
              {t('nav.login')}
            </PrimaryButton>
            <PrimaryButton href="/signup" size="sm">
              {t('nav.signup')}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
