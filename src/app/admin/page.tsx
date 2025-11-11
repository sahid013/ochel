'use client';

import { PageLayout } from '@/components/layout';
import { AdminHeader, MenuManagementTab } from '@/components/admin';
import { useRestaurant } from '@/hooks/useRestaurant';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

export default function AdminPage() {
  const { restaurant, loading, error } = useRestaurant();

  if (loading) {
    return (
      <PageLayout showHeader={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50 md:bg-white font-forum flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error || !restaurant) {
    return (
      <PageLayout showHeader={false} showFooter={false}>
        <div className="min-h-screen bg-gray-50 md:bg-white font-forum flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <h3 className="font-semibold mb-2">Erreur de chargement</h3>
            <p>{error || 'Restaurant non trouvé. Veuillez vous reconnecter.'}</p>
          </Alert>
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