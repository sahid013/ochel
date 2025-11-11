'use client';

import { PageLayout } from '@/components/layout';
import { AdminHeader, MenuManagementTab } from '@/components/admin';
import { useRestaurant } from '@/hooks/useRestaurant';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

export default function AdminPage() {
  const { restaurant, loading, error } = useRestaurant();

  console.log('AdminPage - Restaurant:', restaurant);
  console.log('AdminPage - Loading:', loading);
  console.log('AdminPage - Error:', error);

  if (loading) {
    return (
      <PageLayout showHeader={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50 md:bg-white font-forum flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading restaurant data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !restaurant) {
    return (
      <PageLayout showHeader={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50 md:bg-white font-forum flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <h3 className="font-semibold mb-2">Error Loading Restaurant</h3>
              <p className="text-sm">{error || 'Restaurant not found. Please log in again.'}</p>
            </Alert>
            <div className="text-center">
              <a
                href="/login"
                className="inline-block bg-[#F34A23] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#d63d1a] transition-colors"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showHeader={false} showFooter={false}>
      <div className="min-h-screen bg-gray-50 md:bg-white font-forum">
        <AdminHeader />

        {/* Desktop Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MenuManagementTab restaurantId={restaurant.id} />
        </div>
      </div>
    </PageLayout>
  );
}