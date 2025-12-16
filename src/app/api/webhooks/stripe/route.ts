import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // Use default API version from package
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
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

                // Determine credits based on plan ID (ProductId)
                // Standard: prod_Tbyu0kjYbAO1GU -> 5 (minus 1 for landing page request = 4)
                // Essential: prod_Tbyv6lbtixiI8D -> 15 (minus 1 = 14)
                // Advanced: prod_TbyvP5fQfg2Dbh -> 25 (minus 1 = 24)
                const planId = session.metadata?.planId;
                let creditsToAdd = 0;
                let subscriptionPlan = 'free';

                if (planId === 'prod_Tbyu0kjYbAO1GU') {
                    creditsToAdd = 5; // Start with full quota
                    subscriptionPlan = 'Standard';
                } else if (planId === 'prod_Tbyv6lbtixiI8D') {
                    creditsToAdd = 15;
                    subscriptionPlan = 'Essentielle';
                } else if (planId === 'prod_TbyvP5fQfg2Dbh') {
                    creditsToAdd = 25;
                    subscriptionPlan = 'Avancée';
                }

                // Check if user has already submitted a 3D request (uploaded 4 images)
                // We check if any menu item has 'additional_image_url' populated
                const { data: existingItems, error: itemsError } = await supabaseAdmin
                    .from('menu_items')
                    .select('id')
                    .eq('restaurant_id', restaurantId)
                    .not('additional_image_url', 'is', null)
                    .limit(1);

                // If user has pending 3D request (items with 4 images), deduct 1 credit
                // Note: We check if any check returned true
                if (existingItems && existingItems.length > 0) {
                    creditsToAdd = Math.max(0, creditsToAdd - 1);
                }

                // Update restaurant with subscription details and credits
                const { error } = await supabaseAdmin
                    .from('restaurants')
                    .update({
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                        subscription_status: 'active',
                        subscription_plan: subscriptionPlan,
                        credits_left: creditsToAdd,
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
