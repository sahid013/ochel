-- Enable RLS on menu tables if not already enabled
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public menu items are viewable by everyone" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Restaurant owners can manage categories" ON categories;
DROP POLICY IF EXISTS "Public subcategories are viewable by everyone" ON subcategories;
DROP POLICY IF EXISTS "Restaurant owners can manage subcategories" ON subcategories;

-- Menu Items Policies
-- 1. Everyone can view menu items (for public menu pages)
CREATE POLICY "Public menu items are viewable by everyone" 
ON menu_items FOR SELECT 
USING ( true );

-- 2. Restaurant owners can manage (insert/update/delete) their own menu items
CREATE POLICY "Restaurant owners can manage menu items" 
ON menu_items FOR ALL 
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
);

-- Categories Policies
CREATE POLICY "Public categories are viewable by everyone" 
ON categories FOR SELECT 
USING ( true );

CREATE POLICY "Restaurant owners can manage categories" 
ON categories FOR ALL 
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
);

-- Subcategories Policies
CREATE POLICY "Public subcategories are viewable by everyone" 
ON subcategories FOR SELECT 
USING ( true );

CREATE POLICY "Restaurant owners can manage subcategories" 
ON subcategories FOR ALL 
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = auth.uid()
  )
);
