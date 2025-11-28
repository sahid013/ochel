'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { AdminHeader, MenuManagementTab, TemplateSelector, CustomizeTab, FirstTimeMenuEditor, PublishMenuButton } from '@/components/admin';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';

type AdminTab = 'menu' | 'template' | 'customize';

export default function RestaurantAdminPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('menu');

  // Check if user has completed onboarding
  const { isFirstTime, loading: checkingFirstTime, checkAgain } = useFirstTimeUser(restaurant);

  useEffect(() => {
    async function checkAccess() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          // Redirect to landing page if not logged in
          window.location.href = '/';
          return;
        }

        // Fetch restaurant by slug
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (restaurantError || !restaurantData) {
          setError('Restaurant not found');
          setLoading(false);
          return;
        }

        // Check if user owns this restaurant
        if (restaurantData.owner_id !== user.id) {
          setError('You do not have permission to access this restaurant\'s admin panel');
          setLoading(false);
          return;
        }

        // User is authorized
        setRestaurant(restaurantData as Restaurant);
        setIsAuthorized(true);
        setLoading(false);
      } catch (err) {
        console.error('Error checking access:', err);
        setError('Failed to verify access');
        setLoading(false);
      }
    }

    if (slug) {
      checkAccess();
    }
  }, [slug]);

  if (loading || checkingFirstTime) {
    return (
      <PageLayout showHeader={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50 md:bg-white font-forum flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !restaurant || !isAuthorized) {
    return (
      <PageLayout showHeader={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50 md:bg-white font-forum flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <h3 className="font-semibold mb-2">Access Denied</h3>
              <p className="text-sm">{error || 'You do not have permission to access this page.'}</p>
            </Alert>
            <div className="text-center flex gap-3 justify-center">
              <a
                href="/login"
                className="inline-block bg-[#F34A23] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#d63d1a] transition-colors"
              >
                Go to Login
              </a>
              <a
                href="/"
                className="inline-block bg-gray-200 text-gray-800 py-2 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show first-time menu editor if user has no menu items
  if (isFirstTime) {
    return (
      <PageLayout showHeader={false} showFooter={false}>
        <div className="min-h-screen font-forum" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
          <AdminHeader />

          {/* Publish Menu Button below navbar */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary font-loubag uppercase">
                  Welcome to Ochel!
                </h1>
                <p className="text-sm text-secondary font-inter mt-1">
                  Create your first menu item and publish when ready
                </p>
              </div>
              <PublishMenuButton
                restaurantId={restaurant.id}
                restaurantSlug={slug}
                onPublishComplete={checkAgain}
              />
            </div>
          </div>

          {/* First Time Menu Editor */}
          <div className="py-8">
            <FirstTimeMenuEditor restaurant={restaurant} />
          </div>
        </div>
      </PageLayout>
    );
  }

  // Normal admin interface for existing users
  return (
    <PageLayout showHeader={false} showFooter={false}>
      <div className="min-h-screen bg-gray-50 md:bg-white font-forum">
        <AdminHeader />

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('menu')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'menu'
                    ? 'border-[#F34A23] text-[#F34A23]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Management
              </button>
              <button
                onClick={() => setActiveTab('template')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'template'
                    ? 'border-[#F34A23] text-[#F34A23]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Template Settings
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'customize'
                    ? 'border-[#F34A23] text-[#F34A23]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Customize
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'menu' && (
            <MenuManagementTab restaurantId={restaurant.id} />
          )}

          {activeTab === 'template' && (
            <TemplateSelector
              restaurant={restaurant}
              onTemplateChange={(template) => {
                // Update local state when template changes
                setRestaurant({ ...restaurant, template: template as any });
              }}
            />
          )}

          {activeTab === 'customize' && (
            <CustomizeTab restaurant={restaurant} />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
