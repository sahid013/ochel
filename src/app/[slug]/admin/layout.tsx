'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            if (!slug) return;

            // 1. Get current user first
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not authenticated, RLS will fail or return nothing.
                // Redirect to login or landing.
                return;
            }

            // 2. Get current restaurant
            // Use maybeSingle to avoid 406/PGRST116 error if not found
            const { data: restaurant, error } = await supabase
                .from('restaurants')
                .select('subscription_status, owner_id')
                .eq('slug', slug)
                .maybeSingle();

            if (error) {
                console.error('Error fetching restaurant in AdminLayout:', error.message);
                setLoading(false);
                return;
            }

            if (!restaurant) {
                // Restaurant not found or user has no access (Row Level Security)
                // We can redirect to 404 or home
                console.log('[AdminLayout] Restaurant not found or access denied');
                router.push('/');
                return;
            }

            // 2. Check subscription status
            const allowedStatuses = ['active', 'trialing'];

            if (!restaurant.subscription_status || !allowedStatuses.includes(restaurant.subscription_status)) {
                // Check if it's the owner (optional, but good for debugging/demo bypass if needed)
                const { data: { user } } = await supabase.auth.getUser();
                if (user && restaurant.owner_id === user.id) {
                    console.log(`[AdminLayout] Subscription invalid (${restaurant.subscription_status}). Redirecting to subscribe.`);
                    router.push(`/${slug}/subscribe`);
                    return;
                }
            }

            setLoading(false);
        };

        checkAccess();
    }, [slug, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
