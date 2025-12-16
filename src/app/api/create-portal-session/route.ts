import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // Use default API version from package
});

export async function POST(req: Request) {
    try {
        const { slug } = await req.json();

        if (!slug) {
            return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
        }

        // 1. Fetch restaurant to get stripe_customer_id
        const { data: restaurant, error: dbError } = await supabase
            .from('restaurants')
            .select('stripe_customer_id')
            .eq('slug', slug)
            .single();

        if (dbError || !restaurant) {
            console.error('Error fetching restaurant for portal:', dbError);
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        if (!restaurant.stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer found for this restaurant' }, { status: 400 });
        }

        // 2. Determine base URL
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) {
            if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
            } else {
                baseUrl = 'http://localhost:3000';
            }
        }
        baseUrl = baseUrl.replace(/\/$/, '');

        // 3. Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: restaurant.stripe_customer_id,
            return_url: `${baseUrl}/${slug}/admin?tab=membership`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Error creating portal session:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
