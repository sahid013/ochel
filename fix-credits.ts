
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Using Anon key

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCredits() {
    const restaurantId = '54cdd4f2-d2ef-4792-a039-7f6bf8d91c01';
    console.log(`Updating credits for restaurant ${restaurantId}...`);

    const { data, error } = await supabase
        .from('restaurants')
        .update({ credits_left: 15 })
        .eq('id', restaurantId)
        .select();

    if (error) {
        console.error('Error updating credits:', error);
    } else {
        console.log('Successfully updated credits to 15.');
    }

    // Insert a dummy pending request so the user sees something in the tab
    console.log('Creating dummy pending request...');
    const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .insert({
            restaurant_id: restaurantId,
            title: 'Sample 3D Request',
            description: 'This is a sample item to demonstrate the 3D Request tab.',
            price: 15.00,
            category_id: null, // nullable usually? check schema if needed, assuming yes or will fail. Actually let's fetch a category first or leave null if allowed.
            // Better to check schema or just try. If fail, I'll skip.
            // Let's use standard image array
            additional_image_url: JSON.stringify([
                'https://via.placeholder.com/400x400?text=Angle+1',
                'https://via.placeholder.com/400x400?text=Angle+2',
                'https://via.placeholder.com/400x400?text=Angle+3',
                'https://via.placeholder.com/400x400?text=Angle+4'
            ])
        })
        .select();

    if (itemError) {
        // If category_id is required, we might fail. Let's try to fetch a category.
        console.log('Failed to create simple item, trying with valid category...');
        const { data: categories } = await supabase.from('categories').select('id').eq('restaurant_id', restaurantId).limit(1);
        if (categories && categories.length > 0) {
            const { error: retryError } = await supabase
                .from('menu_items')
                .insert({
                    restaurant_id: restaurantId,
                    title: 'Sample 3D Request',
                    description: 'This is a sample item to demonstrate the 3D Request tab.',
                    price: 15.00,
                    category_id: categories[0].id,
                    additional_image_url: JSON.stringify([
                        'https://via.placeholder.com/400x400?text=Angle+1',
                        'https://via.placeholder.com/400x400?text=Angle+2',
                        'https://via.placeholder.com/400x400?text=Angle+3',
                        'https://via.placeholder.com/400x400?text=Angle+4'
                    ])
                });
            if (retryError) console.error('Error creating dummy item:', retryError);
            else console.log('Dummy request created successfully.');
        } else {
            console.error('No categories found, cannot create item:', itemError);
        }
    } else {
        console.log('Dummy request created successfully.');
    }

}

fixCredits();
