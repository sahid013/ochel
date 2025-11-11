'use client';

import { useTranslation } from '@/contexts/LanguageContext';

export function AdminHeader() {
  const { t } = useTranslation();

  return (
    <header className="bg-[#F34A23] !border-b !border-[#F6F1F0] font-forum">
      {/* Desktop Header */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold text-white">{t('admin.header.title')}</h1>
              <p className="text-sm text-white/80">{t('admin.header.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Header */}
      <div className="block md:hidden px-4 safe-area-pt">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{t('admin.header.title')}</h1>
              <p className="text-xs text-white/70 -mt-1">{t('admin.header.subtitle').split(' ')[0]}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}