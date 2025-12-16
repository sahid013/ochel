import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // Use default API version from package
});

export async function POST(req: Request) {
    try {
        const { priceId, restaurantId, email, slug } = await req.json();

        if (!priceId || !restaurantId || !email) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // DIAGNOSTIC: Check which Stripe account is being used
        try {
            const account = await stripe.accounts.retrieve();
            console.log(`[Stripe Diagnostic] Using Account ID: ${account.id}`);
            console.log(`[Stripe Diagnostic] Account Type: ${account.type}`);
            console.log(`[Stripe Diagnostic] Charges Enabled: ${account.charges_enabled}`);
            console.log(`[Stripe Diagnostic] Looking for Product ID: ${priceId}`);
        } catch (authError) {
            console.error('[Stripe Diagnostic] Failed to retrieve account details. Check API Key.', authError);
        }

        let targetPriceId = priceId;

        // If a Product ID is provided (starts with 'prod_'), find the associated Price
        if (priceId.startsWith('prod_')) {
            const prices = await stripe.prices.list({
                product: priceId,
                active: true,
                limit: 1,
            });

            if (prices.data.length === 0) {
                return NextResponse.json({ error: `No active price found for product: ${priceId}` }, { status: 400 });
            }
            targetPriceId = prices.data[0].id;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: targetPriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${slug}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${slug}/subscribe`,
            customer_email: email,
            metadata: {
                restaurantId,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error('Error creating checkout session:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
