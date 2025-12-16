'use client';

import { useEffect, useState, useRef } from 'react';
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
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Set a timeout to prevent infinite loading
        timeoutRef.current = setTimeout(() => {
            console.log('[AdminLayout] Loading timeout - redirecting to home');
            router.push('/');
        }, 5000); // 5 second timeout

        const checkAccess = async () => {
            try {
                if (!slug) {
                    console.log('[AdminLayout] No slug found');
                    router.push('/');
                    return;
                }

                // 1. Get current user first
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    // Not authenticated, redirect to landing page
                    console.log('[AdminLayout] User not authenticated, redirecting to home');
                    router.push('/');
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
                    router.push('/');
                    return;
                }

                if (!restaurant) {
                    // Restaurant not found or user has no access (Row Level Security)
                    console.log('[AdminLayout] Restaurant not found or access denied');
                    router.push('/');
                    return;
                }

                // Clear timeout if we got here successfully
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // 2. Check subscription status
                /*
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
                */

                setLoading(false);
            } catch (err) {
                console.error('[AdminLayout] Unexpected error:', err);
                router.push('/');
            }
        };

        checkAccess();

        // Cleanup timeout on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
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
