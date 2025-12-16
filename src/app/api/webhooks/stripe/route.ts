import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // Use default API version from package
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Create a Supabase client with the service role key to bypass RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const restaurantId = session.metadata?.restaurantId;

                if (!restaurantId) {
                    console.error('No restaurantId in session metadata');
                    break;
                }

                // Update restaurant with subscription details
                const { error } = await supabaseAdmin
                    .from('restaurants')
                    .update({
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                        subscription_status: 'active', // Assume active upon successful checkout
                        // You might want to map price ID to plan name here if needed
                        subscription_plan: 'pro', // Placeholder logic, ideally derive from line items
                    })
                    .eq('id', restaurantId);

                if (error) {
                    console.error('Error updating restaurant subscription:', error);
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                // Handle recurring payments if needed
                break;
            }

            // Add other event handlers (e.g., customer.subscription.updated/deleted) as needed
        }
    } catch (err: any) {
        console.error('Webhook processing error:', err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
