import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // Use default API version is fine
});

export async function POST(req: Request) {
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    try {
        const { sessionId, slug } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
        }

        // 1. Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 2. Verify payment status
        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
        }

        const restaurantId = session.metadata?.restaurantId;

        if (!restaurantId) {
            // Fallback: try to find restaurant by slug if metadata is missing (unlikely but safe)
            const { data: rest } = await supabaseAdmin.from('restaurants').select('id').eq('slug', slug).single();
            if (!rest) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
            // We'd use rest.id here, but let's error for now to be strict
            // return NextResponse.json({ error: 'No restaurant ID in session metadata' }, { status: 400 });
        }

        // 3. Manually update database (same logic as webhook)
        const { error } = await supabaseAdmin
            .from('restaurants')
            .update({
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                subscription_status: 'active',
                subscription_plan: 'pro', // Ideally derive this
            })
            .eq('id', restaurantId || (await supabaseAdmin.from('restaurants').select('id').eq('slug', slug).single()).data?.id);

        if (error) {
            console.error('DB Update Error:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Verification error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
