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
            return NextResponse.json({ errorCode: 'MISSING_SLUG' }, { status: 400 });
        }

        // 1. Fetch restaurant to get stripe_customer_id
        const { data: restaurant, error: dbError } = await supabase
            .from('restaurants')
            .select('stripe_customer_id')
            .eq('slug', slug)
            .single();

        if (dbError || !restaurant) {
            console.error('Error fetching restaurant for portal:', dbError);
            return NextResponse.json({ errorCode: 'NO_RESTAURANT' }, { status: 404 });
        }

        if (!restaurant.stripe_customer_id) {
            return NextResponse.json({ errorCode: 'NO_CUSTOMER' }, { status: 400 });
        }

        // 2. Verify customer exists in Stripe (handle test/live mode mismatch)
        try {
            await stripe.customers.retrieve(restaurant.stripe_customer_id);
        } catch (customerError: any) {
            console.error('Stripe customer not found:', customerError.message);

            // If customer doesn't exist (e.g., test mode ID in live mode), clear it from database
            if (customerError.code === 'resource_missing') {
                await supabase
                    .from('restaurants')
                    .update({
                        stripe_customer_id: null,
                        stripe_subscription_id: null,
                        subscription_status: 'incomplete',
                    })
                    .eq('slug', slug);

                return NextResponse.json({
                    errorCode: 'TEST_MODE_DATA'
                }, { status: 400 });
            }
            throw customerError;
        }

        // 3. Determine base URL
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) {
            if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
            } else {
                baseUrl = 'http://localhost:3000';
            }
        }
        baseUrl = baseUrl.replace(/\/$/, '');

        // 4. Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: restaurant.stripe_customer_id,
            return_url: `${baseUrl}/${slug}/admin?tab=membership`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Error creating portal session:', err);
        return NextResponse.json({ errorCode: 'GENERIC_ERROR', message: err.message }, { status: 500 });
    }
}
