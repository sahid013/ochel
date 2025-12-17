-- Add index on restaurants.owner_id to improve auth query performance
-- This will speed up the query in AuthContext that checks if a user owns a restaurant

-- Create index if it doesn't already exist
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);

-- Analyze the table to update query planner statistics
ANALYZE restaurants;
