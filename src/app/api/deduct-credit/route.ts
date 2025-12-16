import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    try {
        const { restaurantId } = await request.json();

        if (!restaurantId) {
            return NextResponse.json(
                { error: 'Restaurant ID is required' },
                { status: 400 }
            );
        }

        // Create Supabase admin client with service role key to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Get current restaurant credits
        const { data: restaurant, error: restaurantError } = await supabaseAdmin
            .from('restaurants')
            .select('credits_left, subscription_plan, subscription_status')
            .eq('id', restaurantId)
            .single();

        if (restaurantError) {
            console.error('Error fetching restaurant:', restaurantError);
            return NextResponse.json(
                { error: 'Failed to fetch restaurant data' },
                { status: 500 }
            );
        }

        if (!restaurant) {
            return NextResponse.json(
                { error: 'Restaurant not found' },
                { status: 404 }
            );
        }

        const currentCredits = restaurant.credits_left ?? 0;

        // Check if restaurant has an active subscription
        if (restaurant.subscription_status !== 'active' && restaurant.subscription_status !== 'trialing') {
            return NextResponse.json(
                { error: 'No active subscription. Please subscribe to a plan to use 3D menu requests.' },
                { status: 403 }
            );
        }

        // Check if credits are available
        if (currentCredits < 1) {
            return NextResponse.json(
                { error: 'Insufficient credits. Please upgrade your subscription plan.' },
                { status: 403 }
            );
        }

        // Deduct 1 credit
        const newCredits = currentCredits - 1;
        const { error: updateError } = await supabaseAdmin
            .from('restaurants')
            .update({ credits_left: newCredits })
            .eq('id', restaurantId);

        if (updateError) {
            console.error('Error updating credits:', updateError);
            return NextResponse.json(
                { error: 'Failed to deduct credit' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            creditsLeft: newCredits,
            message: 'Credit deducted successfully'
        });

    } catch (error) {
        console.error('Credit deduction error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error
                    ? error.message
                    : 'Failed to deduct credit'
            },
            { status: 500 }
        );
    }
}
