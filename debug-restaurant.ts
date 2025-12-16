
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Using Anon key for reading public fields if RLS allows, or Service Role if available
// Ideally needs service role for admin tasks, but let's try reading with what we have or user might need to be logged in. 
// Since this is a script running locally, I'll assume we might need the service role key if RLS blocks us.
// Let's check keys in .env.local via 'read_file' if this fails, but for now I'll assume I can read safely or use what's available.

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRestaurant() {
    console.log('Fetching restaurants...');
    // Fetch the most recent updated restaurant
    const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching restaurants:', error);
        return;
    }

    if (!restaurants || restaurants.length === 0) {
        console.log('No restaurants found.');
        return;
    }

    const restaurant = restaurants[0];
    console.log('Restaurant Found:', {
        name: restaurant.name,
        slug: restaurant.slug,
        plan: restaurant.subscription_plan,
        status: restaurant.subscription_status,
        credits: restaurant.credits_left,
        id: restaurant.id
    });

    console.log('\nFetching Menu Items for this restaurant...');
    const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('id, title, additional_image_url, model_3d_url')
        .eq('restaurant_id', restaurant.id);

    if (itemsError) {
        console.error('Error fetching items:', itemsError);
    } else {
        console.log(`Found ${items?.length} items.`);
        items?.forEach(item => {
            console.log(`- ${item.title}: Additional Images: ${item.additional_image_url ? 'YES' : 'NO'}, Model URL: ${item.model_3d_url ? 'YES' : 'NO'}`);
        });
    }
}

debugRestaurant();
