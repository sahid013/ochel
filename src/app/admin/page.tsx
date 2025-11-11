'use client';

import { useEffect } from 'react';
import { useRestaurant } from '@/hooks/useRestaurant';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminRedirectPage() {
  const { restaurant, loading } = useRestaurant();

  useEffect(() => {
    // Redirect to the new restaurant-specific admin URL
    if (restaurant?.slug) {
      window.location.href = `/${restaurant.slug}/admin`;
    } else if (!loading && !restaurant) {
      // If no restaurant found, redirect to login
      window.location.href = '/login';
    }
  }, [restaurant, loading]);

  return (
    <div className="min-h-screen bg-gray-50 md:bg-white font-forum flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}