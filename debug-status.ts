
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStatus() {
    const restaurantId = '54cdd4f2-d2ef-4792-a039-7f6bf8d91c01';
    console.log(`Checking status for restaurant ${restaurantId}...`);

    // Check Restaurant Credits
    const { data: restaurant, error: rError } = await supabase
        .from('restaurants')
        .select('id, name, credits_left, subscription_plan')
        .eq('id', restaurantId)
        .single();

    if (rError) {
        console.error('Error fetching restaurant:', rError);
    } else {
        console.log('Restaurant Data:', restaurant);
    }

    // Check Menu Items for 3D Requests
    const { data: items, error: iError } = await supabase
        .from('menu_items')
        .select('id, title, additional_image_url, model_3d_url')
        .eq('restaurant_id', restaurantId);

    if (iError) {
        console.error('Error fetching menu items:', iError);
    } else {
        console.log(`Found ${items?.length} menu items.`);
        items?.forEach(item => {
            const hasImages = item.additional_image_url && item.additional_image_url !== 'null';
            const imageCount = hasImages ? JSON.parse(item.additional_image_url!).length : 0;
            console.log(`- Item "${item.title}": Images=${imageCount} (${item.additional_image_url ? 'Present' : 'Null'}), Model=${item.model_3d_url ? 'Yes' : 'No'}`);
        });

        const requestCount = items?.filter(item => item.additional_image_url && !item.model_3d_url).length;
        console.log(`Total 3D Requests (Pending): ${requestCount}`);
    }
}

debugStatus();
