import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { getPlanDetails } from '@/lib/stripe-plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // Use default API version from package
});

export async function POST(req: Request) {
    try {
        const { slug } = await req.json();

        if (!slug) {
            return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
        }

        // 1. Fetch restaurant to get stripe_subscription_id
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('stripe_subscription_id')
            .eq('slug', slug)
            .single();

        if (!restaurant || !restaurant.stripe_subscription_id) {
            return NextResponse.json({ status: 'inactive', plan: 'free', interval: null });
        }

        // 2. Fetch Subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(restaurant.stripe_subscription_id) as Stripe.Subscription;

        if (!subscription || subscription.status !== 'active' && subscription.status !== 'trialing') {
            // Handle appropriately
        }

        const price = subscription.items.data[0].price;
        const productId = typeof price.product === 'string' ? price.product : price.product.id;
        const planDetails = getPlanDetails(productId);
        const planName = planDetails.name;

        return NextResponse.json({
            status: subscription.status,
            plan: planName,
            interval: price.recurring?.interval || 'month',
            current_period_end: (subscription as any).current_period_end
        });

    } catch (err: any) {
        console.error('Error fetching subscription details:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
