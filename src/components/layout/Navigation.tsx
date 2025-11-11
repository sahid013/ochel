'use client';

import { useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

export interface NavigationProps {
  className?: string;
}

export default function Navigation({
  className = '',
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Fixed Navigation Bar */}
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 w-[356px] md:w-auto ${className}`}>
        <div className="border border-[#4a3f35] shadow-lg" style={{ display: 'flex', padding: '0.375rem', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderRadius: '3.75rem', background: '#1F1F1F', backdropFilter: 'blur(5px)' }}>
            {/* Left side: Hamburger */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button */}
              <div className="rounded-full flex items-center justify-center" style={{ width: '56px', height: '56px', backgroundColor: '#101010' }}>
                <button
                  onClick={toggleMenu}
                  className="relative flex flex-col justify-center items-center focus:outline-none group"
                  style={{ width: '48px', height: '48px' }}
                  aria-label="Toggle navigation menu"
                >
                  {/* Hamburger Lines with Animation */}
                  <span
                    className={`block w-6 h-0.5 transition-all duration-300 ease-in-out ${
                      isOpen
                        ? 'rotate-45 translate-y-0.5'
                        : 'group-hover:-translate-y-1 -translate-y-1.5'
                    }`}
                    style={{ backgroundColor: '#EFE6D2' }}
                  />
                  <span
                    className={`block w-6 h-0.5 transition-all duration-300 ease-in-out ${
                      isOpen
                        ? 'opacity-0'
                        : 'group-hover:opacity-0 opacity-100'
                    }`}
                    style={{ backgroundColor: '#EFE6D2' }}
                  />
                  <span
                    className={`block w-6 h-0.5 transition-all duration-300 ease-in-out ${
                      isOpen
                        ? '-rotate-45 -translate-y-0.5'
                        : 'group-hover:translate-y-1 translate-y-1.5'
                    }`}
                    style={{ backgroundColor: '#EFE6D2' }}
                  />
                </button>
              </div>
            </div>

            {/* Right side: Language Switcher */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
            </div>
        </div>
      </nav>
    </>
  );
}
