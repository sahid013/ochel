'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Restaurant } from '@/types';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';

export default function SuperAdminDashboard() {
    const { t } = useTranslation();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setRestaurants(data as Restaurant[]);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            alert('Failed to fetch restaurants');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold font-forum text-gray-900">{t('superAdmin.dashboard.title')}</h2>
                    <p className="text-gray-500 mt-1">{t('superAdmin.dashboard.title') === 'Restaurants' ? 'Manage and view all registered restaurants.' : 'Gérez et visualisez tous les restaurants inscrits.'}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                    <span className="text-gray-500 text-sm">{t('admin.stats.total')}: </span>
                    <span className="font-bold text-lg">{restaurants.length}</span>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {restaurants.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500">No restaurants found.</li>
                    ) : (
                        restaurants.map((restaurant) => (
                            <li key={restaurant.id} className="hover:bg-gray-50 transition-colors">
                                <div className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                                            {restaurant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="ml-4 min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-purple-600 truncate">{restaurant.name}</p>
                                                {restaurant.is_active ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {t('superAdmin.dashboard.active')}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        {t('superAdmin.dashboard.inactive')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 mt-1">
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">{t('superAdmin.dashboard.columns.slug')}:</span> {restaurant.slug}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">Email:</span> {restaurant.email}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">{t('superAdmin.dashboard.columns.contact')}:</span> {restaurant.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex items-center gap-4">
                                        <p className="text-xs text-gray-400">
                                            {t('superAdmin.dashboard.columns.joined')} {formatDate(restaurant.created_at)}
                                        </p>
                                        {/* Placeholder for future actions */}
                                        <button
                                            className="text-xs text-orange-600 hover:text-orange-900 font-medium"
                                            onClick={() => router.push(`/super-admin/3d-models`)}
                                        >
                                            {t('superAdmin.dashboard.view3dModels')}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
