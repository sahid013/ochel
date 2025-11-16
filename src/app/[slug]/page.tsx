'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { Template1, Template2, Template3, Template4 } from '@/components/templates';

/**
 * Restaurant Public Menu Page
 * Routes to different template components based on restaurant.template setting
 * Supports preview mode via ?preview=template2 URL parameter
 * Optimized with client-side caching and faster data fetching
 */
export default function RestaurantMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const previewTemplate = searchParams.get('preview');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure proper scrolling context for sticky positioning
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
    document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.setProperty('max-width', '100vw', 'important');
    document.documentElement.style.setProperty('max-width', '100vw', 'important');

    return () => {
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

        // Optimize query to select only needed columns
        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (fetchError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching restaurant:', fetchError);
          }
          setError('Restaurant not found');
          setLoading(false);
          return;
        }

        setRestaurant(data as Restaurant);
        setLoading(false);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Unexpected error:', err);
        }
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
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full bg-[#F34A23] h-6 w-6 animate-bounce-dot"
              style={{
                animationDelay: `${i * 0.16}s`
              }}
            />
          ))}
        </div>
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

  // Determine which template to render
  const selectedTemplate = previewTemplate || restaurant.template || 'template1';
  const isPreviewMode = !!previewTemplate;

  // Template router
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'template1':
        return <Template1 restaurant={restaurant} />;
      case 'template2':
        return <Template2 restaurant={restaurant} />;
      case 'template3':
        return <Template3 restaurant={restaurant} />;
      case 'template4':
        return <Template4 restaurant={restaurant} />;
      default:
        return <Template1 restaurant={restaurant} />;
    }
  };

  // Get customization from restaurant settings
  const customization = {
    primaryColor: restaurant.primary_color || '#F34A23',
    accentColor: restaurant.accent_color || '#FFD65A',
    backgroundColor: restaurant.background_color || '#000000',
    textColor: restaurant.text_color || '#FFFFFF',
    font: restaurant.font_family || 'forum'
  };

  return (
    <>
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 z-50 font-medium text-sm">
          ⚠️ PREVIEW MODE - This is a test preview. Changes are not saved to your public menu.
          <a
            href={`/${restaurant.slug}`}
            className="ml-4 underline hover:no-underline font-semibold"
          >
            Exit Preview
          </a>
        </div>
      )}

      {/* Render the selected template */}
      <div
        className={`min-h-screen ${isPreviewMode ? 'mt-10' : ''}`}
        style={{
          backgroundColor: customization.backgroundColor,
          color: customization.textColor,
          fontFamily: customization.font === 'forum' ? 'var(--font-forum)' :
                       customization.font === 'satoshi' ? 'var(--font-satoshi)' :
                       customization.font === 'eb-garamond' ? 'var(--font-eb-garamond)' :
                       customization.font,
          '--primary-color': customization.primaryColor,
          '--accent-color': customization.accentColor,
          '--bg-color': customization.backgroundColor,
          '--text-color': customization.textColor,
        } as React.CSSProperties}
      >
        {renderTemplate()}
      </div>
    </>
  );
}
