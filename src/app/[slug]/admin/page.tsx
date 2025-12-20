'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { AdminHeader, MenuManagementTab, TemplateSelector, CustomizeTab, FirstTimeMenuEditor, PublishMenuButton, SettingsTab, AdminTabs, MembershipTab, ThreeDRequestsTab } from '@/components/admin';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { PrimaryButton } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';

type AdminTab = 'menu' | 'template' | 'customize' | 'settings' | 'membership' | '3d-requests';

// Check if user has completed onboarding
export default function RestaurantAdminPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isOnboardingView = searchParams.get('onboarding') === 'true';
  const tabParam = searchParams.get('tab');

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('menu');
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Check if user has completed onboarding
  const { isFirstTime, loading: checkingFirstTime, checkAgain } = useFirstTimeUser(restaurant);

  console.log('Admin Page Debug:', {
    slug,
    tabParam,
    isOnboardingView,
    isFirstTime,
    checkingFirstTime,
    hasCompletedOnboarding: restaurant?.has_completed_onboarding,
    skipOnboarding: searchParams.get('skip_onboarding'),
    restaurantId: restaurant?.id
  });

  // Sync active tab with URL param
  useEffect(() => {
    if (tabParam && ['menu', 'template', 'customize', 'settings', 'membership', '3d-requests'].includes(tabParam)) {
      setActiveTab(tabParam as AdminTab);
    }
  }, [tabParam]);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      console.log('[AdminPage] Loading timeout after 15 seconds - redirecting to home');
      window.location.href = '/';
    }, 15000); // Increased to 15 second timeout

    async function checkAccess() {
      try {
        console.log('[AdminPage] Starting access check for slug:', slug);
        setLoading(true);
        setError(null);

        // Get current user
        console.log('[AdminPage] Getting current user...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log('[AdminPage] No user found, redirecting to home');
          // Redirect to landing page if not logged in
          window.location.href = '/';
          return;
        }

        console.log('[AdminPage] User found:', user.id);

        // Fetch restaurant by slug with timeout protection
        console.log('[AdminPage] Fetching restaurant by slug:', slug);

        const restaurantPromise = supabase
          .from('restaurants')
          .select('*, has_completed_onboarding')
          .eq('slug', slug)
          .single();

        const timeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Restaurant fetch timeout')), 5000)
        );

        const { data: restaurantData, error: restaurantError } = await Promise.race([
          restaurantPromise,
          timeoutPromise
        ]) as any;

        if (restaurantError) {
          if (restaurantError.message === 'Restaurant fetch timeout') {
            console.error('[AdminPage] Restaurant fetch timed out - database query too slow');
            setError('Database is slow. Please refresh the page or contact support.');
          } else {
            console.error('[AdminPage] Restaurant error:', restaurantError);
            setError('Restaurant not found');
          }
          setLoading(false);
          // Clear timeout before showing error
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          return;
        }

        if (!restaurantData) {
          console.error('[AdminPage] No restaurant data returned');
          setError('Restaurant not found');
          setLoading(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          return;
        }

        console.log('[AdminPage] Restaurant found:', restaurantData.name);

        // Check if user owns this restaurant
        if (restaurantData.owner_id !== user.id) {
          console.error('[AdminPage] User does not own this restaurant');
          setError('You do not have permission to access this restaurant\'s admin panel');
          setLoading(false);
          // Clear timeout before showing error
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          return;
        }

        // User is authorized
        console.log('[AdminPage] User authorized, setting restaurant and loading FirstTimeMenuEditor');
        setRestaurant(restaurantData as Restaurant);
        setIsAuthorized(true);
        setLoading(false);

        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        console.log('[AdminPage] Page setup complete, FirstTimeMenuEditor should mount now');
      } catch (err) {
        console.error('Error checking access:', err);
        setError('Failed to verify access');
        setLoading(false);
        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    }

    if (slug) {
      checkAccess();
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [slug]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    // Optional: Update URL without full refresh to keep state sync
    router.push(`/${slug}/admin?tab=${tab}`, { scroll: false });
  };

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

  // Show first-time menu editor if user has no menu items or explicitly requested via query param
  // But allow skipping if skip_onboarding is true
  const skipOnboarding = searchParams.get('skip_onboarding') === 'true';

  if (((isFirstTime && !skipOnboarding) || isOnboardingView)) {
    return (
      <PageLayout showHeader={false} showFooter={false}>
        <div className="min-h-screen font-plus-jakarta-sans" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
          <AdminHeader />

          {/* Publish Menu Button below navbar */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
              <div className="flex flex-row items-center gap-4 w-full md:w-auto">
                <h1 className="text-[24px] md:text-2xl font-bold text-primary font-loubag uppercase">
                  Welcome to Ochel!
                </h1>
                <PrimaryButton
                  onClick={async () => {
                    // Mark onboarding as completed in the database
                    try {
                      await supabase
                        .from('restaurants')
                        .update({ has_completed_onboarding: true })
                        .eq('id', restaurant.id);

                      // Update local restaurant state immediately
                      setRestaurant({ ...restaurant, has_completed_onboarding: true });

                      // Refresh restaurant data to update the state
                      await checkAgain();

                      // Navigate to admin panel with menu tab explicitly
                      router.push(`/${slug}/admin?tab=menu`);
                    } catch (error) {
                      console.error('Error completing onboarding:', error);
                      // Still navigate even if update fails
                      router.push(`/${slug}/admin?skip_onboarding=true&tab=menu`);
                    }
                  }}
                  size="sm"
                  className=""
                >
                  Gérer mon menu
                </PrimaryButton>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end">
                <PrimaryButton
                  href={`/${slug}?preview=${restaurant.template || 'template1'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  className="py-1.5 flex-1 md:flex-none justify-center"
                >
                  Preview Menu
                </PrimaryButton>
                <div className="flex-1 md:flex-none">
                  <PublishMenuButton
                    restaurantId={restaurant.id}
                    restaurantSlug={slug}
                    currentTemplate={restaurant.template || 'template1'}
                    subscriptionStatus={restaurant.subscription_status}
                    onPublishComplete={checkAgain}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* First Time Menu Editor */}
          <div className="py-8 max-w-[1460px] mx-auto">
            <FirstTimeMenuEditor
              restaurant={restaurant}
              onTemplateChange={(template) => setRestaurant({ ...restaurant, template: template as any })}
            />
          </div>
        </div>
      </PageLayout>
    );
  }

  // Normal admin interface for existing users
  return (
    <PageLayout showHeader={false} showFooter={false}>
      <div className="min-h-screen font-plus-jakarta-sans" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
        <AdminHeader />

        {/* Tabs Navigation */}
        <AdminTabs
          activeTab={activeTab}
          slug={slug}
          onTabChange={handleTabChange}
        />

        {/* Tab Content */}
        <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'menu' && (
            <MenuManagementTab restaurant={restaurant} />
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

          {activeTab === 'settings' && (
            <SettingsTab restaurant={restaurant} slug={slug} />
          )}

          {activeTab === '3d-requests' && (
            <ThreeDRequestsTab restaurant={restaurant} />
          )}

          {activeTab === 'membership' && (
            <MembershipTab restaurant={restaurant} slug={slug} />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
