'use client';

import { Navbar } from '@/components/layout/Navbar';
import { PrimaryButton } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* 404 Title */}
          <h1 className="text-[120px] leading-none font-bold text-primary font-loubag">
            404!
          </h1>

          {/* Subtitle */}
          <div className="space-y-4">
            <p className="text-lg text-secondary font-plus-jakarta-sans">
              {t('notFound.subtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <PrimaryButton
              href="/"
              size="default"
              className="px-12"
            >
              {t('notFound.button')}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
