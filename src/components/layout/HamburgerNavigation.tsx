'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HamburgerNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4">
        <div className="bg-[#1a1612] bg-opacity-95 backdrop-blur-sm rounded-full px-6 py-3 border border-[#4a3f35] shadow-lg">
          <div className="flex items-center gap-6">
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="relative w-8 h-8 flex flex-col justify-center items-center focus:outline-none group"
              aria-label="Toggle navigation menu"
            >
              {/* Hamburger Lines with Animation */}
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                  isOpen 
                    ? 'rotate-45 translate-y-0.5' 
                    : 'group-hover:-translate-y-1 -translate-y-1.5'
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                  isOpen 
                    ? 'opacity-0' 
                    : 'group-hover:opacity-0 opacity-100'
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
                  isOpen 
                    ? '-rotate-45 -translate-y-0.5' 
                    : 'group-hover:translate-y-1 translate-y-1.5'
                }`}
              />
            </button>

            {/* Logo/Brand */}
            <div className="flex items-center">
              <Image
                src="/icons/MagnifikoLogo.png"
                alt="Magnifiko Restaurant"
                width={50}
                height={17}
                className="object-contain"
              />
            </div>

            {/* Main Navigation Items */}
            <div className="hidden md:flex space-x-6 font-eb-garamond text-sm tracking-wider">
              <Link href="#menu" className="text-white hover:text-[#d4af37] transition-colors">
                Menu
              </Link>
              <Link href="#about" className="text-white hover:text-[#d4af37] transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-white hover:text-[#d4af37] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Expandable Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={toggleMenu}
        />
        
        {/* Menu Content */}
        <div
          className={`absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-[600px] px-4 transition-all duration-300 ease-in-out ${
            isOpen 
              ? 'translate-y-0 opacity-100' 
              : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="bg-[#1a1612] bg-opacity-95 backdrop-blur-sm rounded-2xl p-8 border border-[#4a3f35] shadow-xl">
            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Navigation */}
              <div className="space-y-4">
                <h3 className="font-eb-garamond text-lg text-[#d4af37] tracking-wider mb-4" suppressHydrationWarning>
                  NAVIGATION
                </h3>
                <Link 
                  href="#menu" 
                  className="block font-eb-garamond text-white hover:text-[#d4af37] transition-colors text-lg tracking-wide"
                  onClick={toggleMenu}
                >
                  Menu
                </Link>
                <Link 
                  href="#about" 
                  className="block font-eb-garamond text-white hover:text-[#d4af37] transition-colors text-lg tracking-wide"
                  onClick={toggleMenu}
                >
                  About
                </Link>
                <Link 
                  href="#hours" 
                  className="block font-eb-garamond text-white hover:text-[#d4af37] transition-colors text-lg tracking-wide"
                  onClick={toggleMenu}
                >
                  Hours
                </Link>
                <Link 
                  href="#contact" 
                  className="block font-eb-garamond text-white hover:text-[#d4af37] transition-colors text-lg tracking-wide"
                  onClick={toggleMenu}
                >
                  Contact
                </Link>
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-4">
                <h3 className="font-eb-garamond text-lg text-[#d4af37] tracking-wider mb-4" suppressHydrationWarning>
                  DISCOVER
                </h3>
                <Link 
                  href="#menu" 
                  className="block font-eb-garamond text-white hover:text-[#d4af37] transition-colors text-lg tracking-wide"
                  onClick={toggleMenu}
                >
                  Our Specialties
                </Link>
                <Link 
                  href="#testimonials" 
                  className="block font-eb-garamond text-white hover:text-[#d4af37] transition-colors text-lg tracking-wide"
                  onClick={toggleMenu}
                >
                  Reviews
                </Link>
                <Link 
                  href="#hero" 
                  className="block font-eb-garamond text-white hover:text-[#d4af37] transition-colors text-lg tracking-wide"
                  onClick={toggleMenu}
                >
                  Back to Top
                </Link>
                <Link 
                  href="#contact" 
                  className="block font-eb-garamond text-white hover:text-[#d4af37] transition-colors text-lg tracking-wide"
                  onClick={toggleMenu}
                >
                  Location
                </Link>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8 pt-6 border-t border-[#4a3f35]">
              <div className="text-center">
                <p className="font-forum text-[#c9b99b] text-sm mb-2">
                  123 Avenue de la République, 94200 Ivry-sur-Seine
                </p>
                <p className="font-forum text-[#c9b99b] text-sm mb-2">
                  Tél: 01 23 45 67 89
                </p>
                <p className="font-forum text-[#d4af37] text-sm">
                  Ouvert tous les jours • 11h00 - 00h00
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-6 mt-6">
              <Link href="#" className="text-[#8a7a68] hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-[#8a7a68] hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm4.896 11.906a.5.5 0 01-.5.5h-1.793a.5.5 0 01-.5-.5V8.094a.5.5 0 01.5-.5h1.793a.5.5 0 01.5.5v3.812z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-[#8a7a68] hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


