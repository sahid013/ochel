import Link from 'next/link';
import { RESTAURANT_CONFIG } from '@/lib/constants';

export function Header() {
  return (
    <header className="bg-[#EFE7D2] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-[#3F2E24] font-bold text-xl">🍽️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{RESTAURANT_CONFIG.name}</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="#menu" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">
              Menu
            </Link>
            <Link href="#about" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-amber-600 font-medium transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}