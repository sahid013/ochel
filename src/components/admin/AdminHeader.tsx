'use client';

import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/contexts/LanguageContext';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

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
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-white font-medium">{user.username}</p>
                  <p className="text-xs text-white/80">{user.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-2xl"
                >
                  {t('admin.header.logout')}
                </Button>
              </div>
            )}
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
          
          <div className="flex items-center space-x-2">
            {user && (
              <>
                <div className="text-right mr-2">
                  <p className="text-sm text-white font-medium">{user.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}