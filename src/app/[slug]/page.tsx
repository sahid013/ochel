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
 */
export default function RestaurantMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const previewTemplate = searchParams.get('preview'); // Get ?preview= parameter
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

  // Determine which template to render
  // Use preview parameter if exists, otherwise use saved template
  const selectedTemplate = previewTemplate || restaurant.template || 'template1';
  const isPreviewMode = !!previewTemplate;

  // Template router - render the selected template component
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
      <div className={isPreviewMode ? 'mt-10' : ''}>
        {renderTemplate()}
      </div>
    </>
  );
}
