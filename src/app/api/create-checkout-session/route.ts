import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // Use default API version from package
});

export async function POST(req: Request) {
    try {
        const { priceId, restaurantId, email, slug, interval = 'month', addons = [] } = await req.json();

        if (!priceId || !restaurantId || !email) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // DIAGNOSTIC: Check which Stripe account is being used
        try {
            const account = await stripe.accounts.retrieve();
            console.log(`[Stripe Diagnostic] Using Account ID: ${account.id}`);
            console.log(`[Stripe Diagnostic] Looking for Product ID: ${priceId} with interval: ${interval}`);
        } catch (authError) {
            console.error('[Stripe Diagnostic] Failed to check account.', authError);
        }

        let targetPriceId = priceId;

        // If a Product ID is provided (starts with 'prod_'), find the associated Price by interval
        if (priceId.startsWith('prod_')) {
            const prices = await stripe.prices.list({
                product: priceId,
                active: true,
                limit: 20, // Fetch enough prices to hopefully find both monthly and yearly
                expand: ['data.recurring']
            });

            // Find price with matching interval
            const matchedPrice = prices.data.find(p => p.recurring?.interval === interval);

            if (!matchedPrice) {
                console.error(`[Stripe Error] No ${interval} price found for product ${priceId}`);
                // Fallback to searching just for any price if specific interval missing? 
                // No, better to error so user knows setup is wrong.
                return NextResponse.json({
                    error: `No ${interval} price found for this product. Please check your Stripe configurations.`
                }, { status: 400 });
            }
            targetPriceId = matchedPrice.id;
        }

        // Determine the base URL
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!baseUrl) {
            if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
            } else {
                baseUrl = 'http://localhost:3000';
            }
        }

        // Ensure no trailing slash
        baseUrl = baseUrl.replace(/\/$/, '');

        // 1. Check for existing Stripe Customer ID

        // We need to fetch the restaurant to check for stripe_customer_id
        // Using the service role key would be better for reliability but let's try direct query if RLS allows or if we switch this file to use admin client
        // Actually, create-checkout-session usually runs on server, we should use a proper client. 
        // For now, let's assume we can fetch it via the same supabase client used elsewhere or raw stripe search if needed.
        // Better: Use Supabase to get it.
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('stripe_customer_id')
            .eq('id', restaurantId)
            .single();

        const existingCustomerId = restaurant?.stripe_customer_id;

        // Build line items array starting with the main subscription
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                price: targetPriceId,
                quantity: 1,
            },
        ];

        // Add any cross-sell addons (e.g., Menu multilingue)
        // addons should be an array of objects: [{ productId: 'prod_xxx', interval: 'month' }]
        if (addons && Array.isArray(addons) && addons.length > 0) {
            for (const addon of addons) {
                const addonProductId = addon.productId;
                const addonInterval = addon.interval || interval; // Use same interval as main plan by default

                // Find the price for this addon
                if (addonProductId.startsWith('prod_')) {
                    const addonPrices = await stripe.prices.list({
                        product: addonProductId,
                        active: true,
                        limit: 20,
                        expand: ['data.recurring']
                    });

                    const matchedAddonPrice = addonPrices.data.find(p => p.recurring?.interval === addonInterval);

                    if (matchedAddonPrice) {
                        lineItems.push({
                            price: matchedAddonPrice.id,
                            quantity: 1,
                        });
                    }
                }
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: existingCustomerId || undefined, // Use existing if available
            customer_email: existingCustomerId ? undefined : email, // Only set email if creating new customer
            line_items: lineItems,
            mode: 'subscription',
            allow_promotion_codes: true, // Enable promo codes for discounts
            success_url: `${baseUrl}/${slug}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/${slug}/subscribe`,
            metadata: {
                restaurantId,
                planId: priceId, // Store the Product ID (or Price ID) passed from client
                addons: addons && addons.length > 0 ? JSON.stringify(addons) : undefined, // Store addons in metadata
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error('Error creating checkout session:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
