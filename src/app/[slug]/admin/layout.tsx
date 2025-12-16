import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Ensure we always get fresh data

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // 1. Get current restaurant
    const { data, error } = await supabase
        .from('restaurants')
        .select('subscription_status, owner_id')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching restaurant in AdminLayout:', error);
    }

    const restaurant = data as any;
    console.log(`[AdminLayout] Checking subscription for ${slug}. Status: ${restaurant?.subscription_status}`);

    if (!restaurant) {
        redirect('/'); // Or 404
    }

    // 2. Check subscription status
    // Allow 'active' and 'trialing'.
    // You might want to allow 'past_due' with a warning, but for now strict gate.
    const allowedStatuses = ['active', 'trialing'];

    if (!restaurant.subscription_status || !allowedStatuses.includes(restaurant.subscription_status)) {
        console.log(`[AdminLayout] Subscription invalid (${restaurant.subscription_status}). Redirecting to subscribe.`);
        // Check if it's the owner (optional, but good for debugging/demo bypass if needed)
        // For now, strict redirect to subscribe
        redirect(`/${slug}/subscribe`);
    }

    return (
        <>
            {children}
        </>
    );
}
