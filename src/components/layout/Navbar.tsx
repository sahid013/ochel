'use client';

import { LandingLanguageSwitcher } from './LandingLanguageSwitcher';
import { PrimaryButton } from '@/components/ui';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="text-3xl font-bold text-primary font-loubag tracking-tight uppercase">
            Ochel
          </a>

          {/* Language Switcher + Login/Signup Buttons */}
          <div className="flex items-center gap-3">
            <LandingLanguageSwitcher />
            <PrimaryButton href="/login" variant="secondary" size="sm">
              Login
            </PrimaryButton>
            <PrimaryButton href="/signup" size="sm">
              Sign Up
            </PrimaryButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
