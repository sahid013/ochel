import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentState() {
    console.log('=== Checking Current Database State ===\n');

    // Get all restaurants with subscriptions
    const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id, slug, credits_left, subscription_plan, subscription_status')
        .not('subscription_plan', 'is', null);

    if (restaurantsError) {
        console.error('Error fetching restaurants:', restaurantsError);
        return;
    }

    console.log('All restaurants with subscriptions:\n');
    for (const restaurant of restaurants || []) {
        console.log(`Restaurant: ${restaurant.slug}`);
        console.log(`  ID: ${restaurant.id}`);
        console.log(`  Plan: ${restaurant.subscription_plan}`);
        console.log(`  Status: ${restaurant.subscription_status}`);
        console.log(`  Credits: ${restaurant.credits_left}`);

        // Check 3D requests for this restaurant
        const { data: menuItems, error: itemsError } = await supabase
            .from('menu_items')
            .select('id, title, additional_image_url, model_3d_url')
            .eq('restaurant_id', restaurant.id)
            .not('additional_image_url', 'is', null);

        if (!itemsError && menuItems && menuItems.length > 0) {
            const validRequests = menuItems.filter(item => {
                try {
                    const images = JSON.parse(item.additional_image_url || '[]');
                    return Array.isArray(images) && images.length > 0;
                } catch {
                    return false;
                }
            });

            console.log(`  3D Requests: ${validRequests.length}`);
            validRequests.forEach((item, index) => {
                console.log(`    ${index + 1}. "${item.title}" - ${item.model_3d_url ? 'Completed' : 'Pending'}`);
            });
        } else {
            console.log(`  3D Requests: 0`);
        }
        console.log('');
    }

    console.log('\n=== Most Recently Created 3D Request ===\n');
    const { data: recentItems } = await supabase
        .from('menu_items')
        .select('id, title, restaurant_id, additional_image_url, created_at')
        .not('additional_image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

    if (recentItems && recentItems.length > 0) {
        recentItems.forEach((item, index) => {
            console.log(`${index + 1}. "${item.title}"`);
            console.log(`   Restaurant ID: ${item.restaurant_id}`);
            console.log(`   Created: ${item.created_at}`);
            console.log(`   Has images: ${item.additional_image_url ? 'Yes' : 'No'}`);
            console.log('');
        });
    } else {
        console.log('No 3D requests found in the system.');
    }
}

checkCurrentState();
