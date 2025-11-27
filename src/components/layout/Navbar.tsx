'use client';

import { LandingLanguageSwitcher } from './LandingLanguageSwitcher';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="text-3xl font-bold text-gray-900 font-loubag tracking-tight uppercase">
            Ochel
          </a>

          {/* Language Switcher + Login/Signup Buttons */}
          <div className="flex items-center gap-3">
            <LandingLanguageSwitcher />
            <a
              href="/login"
              className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors font-inter"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-6 py-2 bg-[#F34A23] text-white font-medium rounded-lg hover:bg-[#d63d1a] transition-colors font-inter"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
