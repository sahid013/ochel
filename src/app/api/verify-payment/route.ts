export async function POST(req: Request) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY in server environment' }, { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY in server environment' }, { status: 500 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const { Stripe } = await import('stripe');

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    try {
        const body = await req.json();
        console.log('[Verify Payment] Request body:', body);
        const { sessionId, slug } = body;

        if (!sessionId) {
            console.error('[Verify Payment] Missing session ID');
            return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
        }

        // 1. Retrieve session from Stripe
        console.log('[Verify Payment] Retrieving session:', sessionId);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log('[Verify Payment] Session retrieved. Payment Status:', session.payment_status);

        // 2. Verify payment status
        if (session.payment_status !== 'paid') {
            console.error('[Verify Payment] Payment not paid:', session.payment_status);
            return NextResponse.json({ error: `Payment not completed. Status: ${session.payment_status}` }, { status: 400 });
        }

        const restaurantId = session.metadata?.restaurantId;
        console.log('[Verify Payment] Restaurant ID from metadata:', restaurantId);

        let targetRestaurantId = restaurantId;

        if (!targetRestaurantId) {
            console.log('[Verify Payment] Metadata missing. Falling back to slug lookup:', slug);
            // Fallback: try to find restaurant by slug if metadata is missing
            const { data: rest } = await supabaseAdmin.from('restaurants').select('id').eq('slug', slug).single();
            if (!rest) {
                console.error('[Verify Payment] Restaurant not found by slug:', slug);
                return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
            }
            targetRestaurantId = rest.id;
            console.log('[Verify Payment] Found restaurant ID by slug:', targetRestaurantId);
        }

        // 3. Manually update database (same logic as webhook)
        console.log('[Verify Payment] Updating database for restaurant:', targetRestaurantId);
        const { error } = await supabaseAdmin
            .from('restaurants')
            .update({
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                subscription_status: 'active',
                subscription_plan: 'pro', // Ideally derive this
            })
            .eq('id', targetRestaurantId);

        if (error) {
            console.error('[Verify Payment] DB Update Error:', error);
            return NextResponse.json({ error: 'Database update failed: ' + error.message }, { status: 500 });
        }

        console.log('[Verify Payment] Success!');
        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Verification error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
