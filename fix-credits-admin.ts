import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function fixCreditsWithAdmin() {
    console.log('=== Fixing Credits with Admin Permissions ===\n');

    // Get test-restaurant
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
        .from('restaurants')
        .select('id, slug, credits_left, subscription_plan')
        .eq('slug', 'test-restaurant')
        .single();

    if (restaurantError) {
        console.error('Error fetching restaurant:', restaurantError);
        return;
    }

    console.log(`Restaurant: ${restaurant.slug}`);
    console.log(`Current credits: ${restaurant.credits_left}`);

    // Count 3D requests
    const { data: menuItems, error: itemsError } = await supabaseAdmin
        .from('menu_items')
        .select('id, title, additional_image_url')
        .eq('restaurant_id', restaurant.id)
        .not('additional_image_url', 'is', null);

    if (itemsError) {
        console.error('Error fetching menu items:', itemsError);
        return;
    }

    const validRequests = menuItems?.filter(item => {
        try {
            const images = JSON.parse(item.additional_image_url || '[]');
            return Array.isArray(images) && images.length > 0;
        } catch {
            return false;
        }
    }) || [];

    console.log(`3D Requests found: ${validRequests.length}`);

    // Calculate expected credits (pro plan = 15 credits)
    const initialCredits = 15;
    const expectedCredits = Math.max(0, initialCredits - validRequests.length);

    console.log(`Expected credits: ${expectedCredits} (${initialCredits} - ${validRequests.length})`);

    if (restaurant.credits_left !== expectedCredits) {
        console.log(`\nUpdating credits from ${restaurant.credits_left} to ${expectedCredits}...`);

        const { data: updateData, error: updateError } = await supabaseAdmin
            .from('restaurants')
            .update({ credits_left: expectedCredits })
            .eq('id', restaurant.id)
            .select();

        if (updateError) {
            console.error('❌ Error updating credits:', updateError);
        } else {
            console.log('✅ Credits updated successfully!');
            console.log('Updated data:', updateData);
        }

        // Verify the update
        const { data: verifyData } = await supabaseAdmin
            .from('restaurants')
            .select('credits_left')
            .eq('id', restaurant.id)
            .single();

        console.log(`\nVerification - Credits are now: ${verifyData?.credits_left}`);
    } else {
        console.log('✅ Credits are already correct!');
    }
}

fixCreditsWithAdmin();
