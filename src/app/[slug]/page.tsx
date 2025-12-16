import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FullPageMenuSkeleton } from '@/components/ui/MenuSkeleton';
import { createClient } from '@supabase/supabase-js';
import { Restaurant } from '@/types';

// Dynamic imports for templates
const Template1 = dynamic(() => import('@/components/templates/Template1'), {
  loading: () => <FullPageMenuSkeleton />,
});
const Template2 = dynamic(() => import('@/components/templates/Template2'), {
  loading: () => <FullPageMenuSkeleton />,
});
const Template3 = dynamic(() => import('@/components/templates/Template3'), {
  loading: () => <FullPageMenuSkeleton />,
});
const Template4 = dynamic(() => import('@/components/templates/Template4'), {
  loading: () => <FullPageMenuSkeleton />,
});

// Initialize Supabase client for Server Component
// persistSession: false is critical for server-side usage
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Restaurant Public Menu Page (Server Component)
 * Fetches data on the server for instant initial paint (SSR)
 * eliminating client-side data fetching waterfalls.
 */
export default async function RestaurantMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const previewTemplate = resolvedSearchParams.preview as string | undefined;

  // Fetch restaurant data
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !restaurant) {
    if (error) console.error('Error fetching restaurant:', error);
    notFound();
  }

  // Cast to Restaurant type
  const typedRestaurant = restaurant as Restaurant;

  // Check onboarding status
  if (!typedRestaurant.has_completed_onboarding && !previewTemplate) {
    notFound();
  }

  // Determine which template to render
  const selectedTemplate = previewTemplate || typedRestaurant.template || 'template1';

  // Preview logic
  const isSubscriptionActive = typedRestaurant.subscription_status === 'active' || typedRestaurant.subscription_status === 'trialing';
  const isPreviewMode = !!previewTemplate || !isSubscriptionActive;

  // Customization styles
  const customization = {
    primaryColor: typedRestaurant.primary_color || '#F34A23',
    accentColor: typedRestaurant.accent_color || '#FFD65A',
    backgroundColor: typedRestaurant.background_color || '#000000',
    textColor: typedRestaurant.text_color || '#FFFFFF',
    font: typedRestaurant.font_family || 'forum'
  };

  // Helper to render correct template
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'template1': return <Template1 restaurant={typedRestaurant} />;
      case 'template2': return <Template2 restaurant={typedRestaurant} />;
      case 'template3': return <Template3 restaurant={typedRestaurant} />;
      case 'template4': return <Template4 restaurant={typedRestaurant} />;
      default: return <Template1 restaurant={typedRestaurant} />;
    }
  };

  return (
    <>
      {/* Scroll lock styles - previously in useEffect, now inline valid style tag or wrapper styles ?? */}
      {/* Actually simply setting style on the wrapper div is safer than injecting global styles from server component */}

      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 z-50 font-medium text-sm flex justify-center items-center gap-2">
          <span>⚠️ {isSubscriptionActive ? 'PREVIEW MODE' : 'SITE NOT LIVE'} - {isSubscriptionActive ? 'Changes are not saved to your public menu.' : 'Subscribe to publish your menu.'}</span>
          {!isSubscriptionActive && (
            <a
              href={`/${typedRestaurant.slug}/subscribe`}
              className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
              target="_blank"
            >
              Go Live Now
            </a>
          )}
          {isSubscriptionActive && (
            <a
              href={`/${typedRestaurant.slug}`}
              className="ml-4 underline hover:no-underline font-semibold"
            >
              Exit Preview
            </a>
          )}
        </div>
      )}

      {/* Main Content Wrapper */}
      <div
        className={`min-h-screen ${isPreviewMode ? 'mt-10' : ''}`}
        style={{
          color: customization.textColor,
          fontFamily: customization.font === 'forum' ? 'var(--font-forum)' :
            customization.font === 'satoshi' ? 'var(--font-satoshi)' :
              customization.font === 'eb-garamond' ? 'var(--font-eb-garamond)' :
                customization.font,
          // CSS Variables
          // @ts-ignore - Custom properties
          '--primary-color': customization.primaryColor,
          // @ts-ignore
          '--accent-color': customization.accentColor,
          // @ts-ignore
          '--bg-color': customization.backgroundColor,
          // @ts-ignore
          '--text-color': customization.textColor,
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        } as React.CSSProperties}
      >
        <Suspense fallback={<FullPageMenuSkeleton />}>
          {renderTemplate()}
        </Suspense>
      </div>
    </>
  );
}
