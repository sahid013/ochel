'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { cn } from '@/lib';
import MenuDisplay from '@/components/menu/MenuDisplay';
import ComingSoonTemplate from '@/components/menu/ComingSoonTemplate';
import { Navigation } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';

const templateInfo = {
  template2: {
    name: 'Modern Light',
    description: 'Clean, bright design with minimalist aesthetics - perfect for contemporary dining',
  },
  template3: {
    name: 'Boutique',
    description: 'Stylish template with elegant typography and spacing - ideal for upscale establishments',
  },
  template4: {
    name: 'Casual Dining',
    description: 'Friendly, approachable design for casual restaurants and cafes',
  },
};

export default function RestaurantMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const previewTemplate = searchParams.get('preview'); // Get ?preview= parameter
  const { t } = useTranslation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        setLoading(true);
        console.log('Fetching restaurant with slug:', slug);

        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchError) {
          console.error('Error fetching restaurant:', fetchError);
          setError('Restaurant not found');
          setLoading(false);
          return;
        }

        console.log('Restaurant found:', data);
        setRestaurant(data as Restaurant);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Failed to load restaurant');
        setLoading(false);
      }
    }

    if (slug) {
      fetchRestaurant();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Restaurant Not Found</h1>
          <p className="text-gray-400 mb-6">The restaurant you're looking for doesn't exist.</p>
          <a href="/" className="text-[#F34A23] hover:underline">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Check which template to render
  // Use preview parameter if exists, otherwise use saved template
  const selectedTemplate = previewTemplate || restaurant.template || 'template1';
  const isPreviewMode = !!previewTemplate;

  // If template 2, 3, or 4 - show coming soon page
  if (selectedTemplate !== 'template1') {
    const info = templateInfo[selectedTemplate as keyof typeof templateInfo];
    return (
      <>
        {/* Preview Mode Banner */}
        {isPreviewMode && (
          <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 z-50 font-medium text-sm">
            ⚠️ PREVIEW MODE - This is a test preview. Changes are not saved to your public menu.
            <a
              href={`/${restaurant.slug}`}
              className="ml-4 underline hover:no-underline"
            >
              Exit Preview
            </a>
          </div>
        )}
        <div className={isPreviewMode ? 'mt-10' : ''}>
          <ComingSoonTemplate
            restaurantName={restaurant.name}
            templateName={info.name}
            templateDescription={info.description}
          />
        </div>
      </>
    );
  }

  // Template 1 (Classic Dark) - show actual menu
  return (
    <>
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 z-50 font-medium text-sm">
          ⚠️ PREVIEW MODE - This is a test preview. Changes are not saved to your public menu.
          <a
            href={`/${restaurant.slug}`}
            className="ml-4 underline hover:no-underline"
          >
            Exit Preview
          </a>
        </div>
      )}

      {/* Navigation */}
      <Navigation
        logo={{
          src: "/icons/MagnifikoLogo.png",
          alt: restaurant.name,
          width: 50,
          height: 17
        }}
      />

      {/* Main Layout - Two Equal Sections */}
      <div className={`bg-[#000000] text-white font-forum ${isPreviewMode ? 'mt-10' : ''}`}>
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
            <MenuDisplay restaurantId={restaurant.id} />
          </div>
        </div>
      </div>
    </>
  );
}
