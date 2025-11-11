'use client';

import { useEffect } from 'react';
import { cn } from '@/lib';
import MenuDisplay from '@/components/menu/MenuDisplay';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useTranslation();
  useEffect(() => {
    // Ensure proper scrolling context for sticky positioning
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
    document.documentElement.style.setProperty('overflow-y', 'auto', 'important');

    // Ensure body width is constrained
    document.body.style.setProperty('max-width', '100vw', 'important');
    document.documentElement.style.setProperty('max-width', '100vw', 'important');

    return () => {
      // Restore on unmount
      document.body.style.removeProperty('overflow-x');
      document.body.style.removeProperty('overflow-y');
      document.documentElement.style.removeProperty('overflow-x');
      document.documentElement.style.removeProperty('overflow-y');
      document.body.style.removeProperty('max-width');
      document.documentElement.style.removeProperty('max-width');
    };
  }, []);

  return (
    <>
      {/* Navigation */}
      <Navigation
        logo={{
          src: "/icons/MagnifikoLogo.png",
          alt: "Magnifiko Restaurant",
          width: 50,
          height: 17
        }}
      />

      {/* Main Layout - Two Equal Sections */}
      <div className="bg-[#000000] text-white font-forum">
        <div className="flex flex-col lg:flex-row relative">
          {/* Image Section - Left on desktop, Top on mobile/tablet */}
          <div className='w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen flex-shrink-0'>
            <div
              className={cn(
                "relative flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat h-[250px] md:h-[300px] lg:h-screen w-full"
              )}
              style={{ backgroundImage: 'url("/images/menu-bg.webp")' }}>
              {/* Dark overlay */}
              <div className="absolute" style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                top: 0,
                left: 0
              }}></div>

              {/* NOTRE MENU text in the middle */}
              <div className="text-center px-4 pt-16 lg:pt-0 relative z-10">
                <h1 className="text-[2.5rem] md:text-[3rem] font-normal tracking-normal text-white" suppressHydrationWarning>
                  {t('menuPage.title')}
                </h1>
              </div>
            </div>
          </div>

          {/* Content Section - Right on desktop, Bottom on mobile/tablet */}
          <div className="w-full lg:w-1/2 bg-[#000000] pt-[100px] min-h-screen">
            <MenuDisplay />
          </div>
        </div>
      </div>
    </>
  );
}
