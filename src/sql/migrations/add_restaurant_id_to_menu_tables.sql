-- Migration: Add restaurant_id to menu tables for multi-tenant support
-- This allows each restaurant to have their own isolated menu data

-- Step 1: Add restaurant_id column to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Step 2: Add restaurant_id column to subcategories table
ALTER TABLE public.subcategories
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Step 3: Add restaurant_id column to menu_items table
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Step 4: Add restaurant_id column to addons table
ALTER TABLE public.addons
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_restaurant_id ON public.subcategories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_addons_restaurant_id ON public.addons(restaurant_id);

-- Enable Row Level Security on all menu tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Restaurant owners can manage their categories" ON public.categories;

DROP POLICY IF EXISTS "Anyone can view active subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Restaurant owners can manage their subcategories" ON public.subcategories;

DROP POLICY IF EXISTS "Anyone can view active menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Restaurant owners can manage their menu items" ON public.menu_items;

DROP POLICY IF EXISTS "Anyone can view active addons" ON public.addons;
DROP POLICY IF EXISTS "Restaurant owners can manage their addons" ON public.addons;

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories with restaurant_id"
  ON public.categories
  FOR SELECT
  USING (restaurant_id IS NOT NULL);

CREATE POLICY "Restaurant owners can manage their categories"
  ON public.categories
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for subcategories
CREATE POLICY "Anyone can view subcategories with restaurant_id"
  ON public.subcategories
  FOR SELECT
  USING (restaurant_id IS NOT NULL);

CREATE POLICY "Restaurant owners can manage their subcategories"
  ON public.subcategories
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view menu items with restaurant_id"
  ON public.menu_items
  FOR SELECT
  USING (restaurant_id IS NOT NULL);

CREATE POLICY "Restaurant owners can manage their menu items"
  ON public.menu_items
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for addons
CREATE POLICY "Anyone can view addons with restaurant_id"
  ON public.addons
  FOR SELECT
  USING (restaurant_id IS NOT NULL);

CREATE POLICY "Restaurant owners can manage their addons"
  ON public.addons
  FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON COLUMN public.categories.restaurant_id IS 'Links category to a specific restaurant for multi-tenant support';
COMMENT ON COLUMN public.subcategories.restaurant_id IS 'Links subcategory to a specific restaurant for multi-tenant support';
COMMENT ON COLUMN public.menu_items.restaurant_id IS 'Links menu item to a specific restaurant for multi-tenant support';
COMMENT ON COLUMN public.addons.restaurant_id IS 'Links addon to a specific restaurant for multi-tenant support';
