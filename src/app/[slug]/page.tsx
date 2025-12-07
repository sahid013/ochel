'use client';

import { useEffect, useState, lazy, Suspense, ComponentType } from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import { MenuSkeleton, FullPageMenuSkeleton } from '@/components/ui/MenuSkeleton';
import { EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';

// Lazy load templates for code splitting - only load the template being used
const Template1 = lazy(() => import('@/components/templates/Template1'));
const Template2 = lazy(() => import('@/components/templates/Template2'));
const Template3 = lazy(() => import('@/components/templates/Template3'));
const Template4 = lazy(() => import('@/components/templates/Template4'));

/**
 * Restaurant Public Menu Page
 * Routes to different template components based on restaurant.template setting
 * Supports preview mode via ?preview=template2 URL parameter
 * Optimized with:
 * - Code splitting: Only loads the template being used
 * - Browser caching: Caches restaurant data
 * - Lazy loading: Templates load on-demand
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
        // Try to get from browser cache first (sessionStorage for current session)
        const cacheKey = `restaurant_${slug}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            // Check if cache is less than 5 minutes old
            if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              setRestaurant(parsed.data as Restaurant);
              setLoading(false);
              return;
            }
          } catch {
            // Invalid cache, continue to fetch
            sessionStorage.removeItem(cacheKey);
          }
        }

        // Fetch from database (don't set loading=true, show optimistically)
        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching restaurant:', fetchError);
          }
          setError('Restaurant not found');
          setLoading(false);
          return;
        }

        // Cache the result
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));

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

  // Show skeleton loader
  if (loading) {
    return <FullPageMenuSkeleton />;
  }

  if (error || !restaurant || (!restaurant.has_completed_onboarding && !searchParams.get('preview'))) {
    notFound();
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
        <Suspense fallback={null}>
          {renderTemplate()}
        </Suspense>
      </div>
    </>
  );
}
