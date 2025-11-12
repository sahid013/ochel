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
      <nav className={`fixed top-[48px] right-[24px] z-50 px-4 w-[356px] md:w-auto ${className}`}>
        <div className="border border-[#4a3f35] shadow-lg" style={{ display: 'flex', padding: '0.375rem', justifyContent: 'center', alignItems: 'center', borderRadius: '3.75rem', background: '#1F1F1F', backdropFilter: 'blur(5px)' }}>
            {/* Language Switcher */}
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
        </div>
      </nav>
    </>
  );
}
