'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TableSkeleton } from '@/components/ui/SkeletonLoader';
import { Restaurant } from '@/types';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/Input';

interface RestaurantWithModels extends Restaurant {
    menu_items: {
        model_3d_url: string | null;
        redirect_3d_url: string | null;
    }[];
}

export default function SuperAdminDashboard() {
    const { t } = useTranslation();
    const [restaurants, setRestaurants] = useState<RestaurantWithModels[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
    const router = useRouter();

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('restaurants')
                .select('*, menu_items(model_3d_url, redirect_3d_url)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setRestaurants(data as unknown as RestaurantWithModels[]);
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

    const get3DStatus = (restaurant: RestaurantWithModels) => {
        if (!restaurant.menu_items || restaurant.menu_items.length === 0) return 'no_items';
        const hasPending = restaurant.menu_items.some(item => !item.model_3d_url || !item.redirect_3d_url);
        return hasPending ? 'pending' : 'completed';
    };

    const filteredRestaurants = restaurants.filter(restaurant => {
        const matchesSearch =
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.phone?.includes(searchQuery);

        if (!matchesSearch) return false;

        const status = get3DStatus(restaurant);

        if (filterStatus === 'pending') return status === 'pending';
        if (filterStatus === 'completed') return status === 'completed';

        return true;
    });

    if (loading) {
        return <TableSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-loubag text-[#3D1F00] uppercase">{t('superAdmin.dashboard.title')}</h2>
                    <p className="text-[#3D1F00]/70 mt-1 font-plus-jakarta-sans">
                        {t('superAdmin.dashboard.title') === 'Restaurants'
                            ? 'Manage and view all registered restaurants.'
                            : 'Gérez et visualisez tous les restaurants inscrits.'}
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-[#F34A23]/20 shadow-sm self-end md:self-auto">
                    <span className="text-[#3D1F00]/60 text-sm font-plus-jakarta-sans uppercase tracking-wide">{t('admin.stats.total')}: </span>
                    <span className="font-bold text-lg text-[#F34A23] font-plus-jakarta-sans">{filteredRestaurants.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#F34A23] text-primary placeholder:text-gray-400 font-plus-jakarta-sans"
                        style={{ borderColor: 'rgba(71, 67, 67, 0.1)' }} // Matches existing style
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors font-plus-jakarta-sans ${filterStatus === 'all'
                                ? 'bg-[#F34A23] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors font-plus-jakarta-sans ${filterStatus === 'pending'
                                ? 'bg-[#F34A23] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Pending 3D
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors font-plus-jakarta-sans ${filterStatus === 'completed'
                                ? 'bg-[#F34A23] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Completed 3D
                    </button>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#F34A23]/5">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#F34A23] uppercase tracking-wider font-plus-jakarta-sans">
                                {t('superAdmin.dashboard.columns.name')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#F34A23] uppercase tracking-wider font-plus-jakarta-sans">
                                {t('superAdmin.dashboard.columns.status')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#F34A23] uppercase tracking-wider font-plus-jakarta-sans">
                                3D Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-[#F34A23] uppercase tracking-wider font-plus-jakarta-sans">
                                {t('superAdmin.dashboard.columns.joined')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRestaurants.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 font-plus-jakarta-sans">
                                    No restaurants found matching your criteria
                                </td>
                            </tr>
                        ) : (
                            filteredRestaurants.map((restaurant) => {
                                const status3D = get3DStatus(restaurant);
                                return (
                                    <tr
                                        key={restaurant.id}
                                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/super-admin/restaurants/${restaurant.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#F34A23]/10 flex items-center justify-center text-[#F34A23] font-bold font-loubag">
                                                    {restaurant.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-[#3D1F00] font-plus-jakarta-sans group-hover:text-[#F34A23] transition-colors">
                                                        {restaurant.name}
                                                    </div>
                                                    <div className="flex flex-row items-center gap-3 mt-1">
                                                        <p className="text-xs text-[#3D1F00]/60 font-plus-jakarta-sans">
                                                            {restaurant.email}
                                                        </p>
                                                        {restaurant.phone && (
                                                            <>
                                                                <span className="text-gray-300">•</span>
                                                                <a
                                                                    href={`tel:${restaurant.phone}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-xs text-[#3D1F00]/60 font-plus-jakarta-sans hover:text-[#F34A23] underline decoration-dotted"
                                                                >
                                                                    {restaurant.phone}
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${restaurant.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {restaurant.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {status3D === 'pending' && (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                                    Pending
                                                </span>
                                            )}
                                            {status3D === 'completed' && (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                    Completed
                                                </span>
                                            )}
                                            {status3D === 'no_items' && (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                                    No Items
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#3D1F00]/60 font-plus-jakarta-sans">
                                            {formatDate(restaurant.created_at)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
