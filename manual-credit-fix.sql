-- Manual Credit Fix for test-restaurant
-- Run this SQL directly in your Supabase SQL Editor

-- First, let's see the current state
SELECT
    slug,
    credits_left,
    subscription_plan,
    (SELECT COUNT(*)
     FROM menu_items
     WHERE menu_items.restaurant_id = restaurants.id
     AND additional_image_url IS NOT NULL
     AND additional_image_url != 'null'
    ) as three_d_requests
FROM restaurants
WHERE slug = 'test-restaurant';

-- Update the credits to match the correct count
UPDATE restaurants
SET credits_left = 14
WHERE slug = 'test-restaurant';

-- Verify the update
SELECT
    slug,
    credits_left,
    subscription_plan,
    (SELECT COUNT(*)
     FROM menu_items
     WHERE menu_items.restaurant_id = restaurants.id
     AND additional_image_url IS NOT NULL
     AND additional_image_url != 'null'
    ) as three_d_requests
FROM restaurants
WHERE slug = 'test-restaurant';
