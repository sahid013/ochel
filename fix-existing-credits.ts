import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixExistingCredits() {
    // Get all restaurants with active subscriptions
    const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, slug, credits_left, subscription_plan')
        .not('subscription_plan', 'is', null);

    if (restaurantsError) {
        console.error('Error fetching restaurants:', restaurantsError);
        return;
    }

    console.log(`Found ${restaurants?.length || 0} restaurants with subscriptions\n`);

    for (const restaurant of restaurants || []) {
        console.log(`\n--- Checking restaurant: ${restaurant.slug} (${restaurant.id}) ---`);
        console.log(`Current credits: ${restaurant.credits_left}`);
        console.log(`Subscription plan: ${restaurant.subscription_plan}`);

        // Count menu items with 4 images (3D requests)
        const { data: menuItems, error: itemsError } = await supabase
            .from('menu_items')
            .select('id, title, additional_image_url, model_3d_url')
            .eq('restaurant_id', restaurant.id)
            .not('additional_image_url', 'is', null);

        if (itemsError) {
            console.error('Error fetching menu items:', itemsError);
            continue;
        }

        const threeDRequests = menuItems?.filter(item => {
            try {
                const images = JSON.parse(item.additional_image_url || '[]');
                return Array.isArray(images) && images.length > 0;
            } catch {
                return false;
            }
        }) || [];

        console.log(`Found ${threeDRequests.length} 3D requests (menu items with images)`);

        if (threeDRequests.length > 0) {
            threeDRequests.forEach((item, index) => {
                console.log(`  ${index + 1}. "${item.title}" - ${item.model_3d_url ? 'Completed' : 'Pending'}`);
            });

            // Calculate what credits should be based on plan and 3D requests
            let expectedCredits = restaurant.credits_left;

            // Get the initial credits based on plan
            let initialCredits = 0;
            const plan = restaurant.subscription_plan?.toLowerCase() || '';
            if (plan.includes('standard') || plan.includes('basic')) {
                initialCredits = 5;
            } else if (plan.includes('essentielle') || plan.includes('pro')) {
                initialCredits = 15;
            } else if (plan.includes('avancée') || plan.includes('advanced') || plan.includes('enterprise')) {
                initialCredits = 25;
            }

            console.log(`Initial credits for ${restaurant.subscription_plan}: ${initialCredits}`);

            // Calculate expected credits: initial - number of 3D requests
            expectedCredits = Math.max(0, initialCredits - threeDRequests.length);
            console.log(`Expected credits (${initialCredits} - ${threeDRequests.length} requests): ${expectedCredits}`);

            if (restaurant.credits_left !== expectedCredits) {
                console.log(`⚠️  Credit mismatch! Current: ${restaurant.credits_left}, Expected: ${expectedCredits}`);
                console.log(`Updating credits to ${expectedCredits}...`);

                const { error: updateError } = await supabase
                    .from('restaurants')
                    .update({ credits_left: expectedCredits })
                    .eq('id', restaurant.id);

                if (updateError) {
                    console.error('Error updating credits:', updateError);
                } else {
                    console.log('✅ Credits updated successfully!');
                }
            } else {
                console.log('✅ Credits are correct!');
            }
        } else {
            console.log('No 3D requests found, credits unchanged.');
        }
    }

    console.log('\n✅ Credit fix complete!');
}

fixExistingCredits();
