-- ============================================================================
-- CREATE MENU TABLES WITH MULTI-TENANT SUPPORT
-- Creates categories, subcategories, menu_items, and addons tables
-- with restaurant_id for multi-tenant isolation
-- ============================================================================

-- ============================================================================
-- TABLE 1: CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  title_it VARCHAR(255),
  title_es VARCHAR(255),
  text TEXT,
  text_en TEXT,
  text_it TEXT,
  text_es TEXT,
  "order" INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_order ON public.categories("order");

-- Function for categories updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories with restaurant_id" ON public.categories;
CREATE POLICY "Anyone can view categories with restaurant_id"
  ON public.categories
  FOR SELECT
  USING (restaurant_id IS NOT NULL);

DROP POLICY IF EXISTS "Restaurant owners can manage their categories" ON public.categories;
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

-- ============================================================================
-- TABLE 2: SUBCATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  title_it VARCHAR(255),
  title_es VARCHAR(255),
  text TEXT,
  text_en TEXT,
  text_it TEXT,
  text_es TEXT,
  "order" INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Indexes for subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_restaurant_id ON public.subcategories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_status ON public.subcategories(status);
CREATE INDEX IF NOT EXISTS idx_subcategories_order ON public.subcategories("order");

-- Function for subcategories updated_at
CREATE OR REPLACE FUNCTION update_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for subcategories
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON public.subcategories;
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_subcategories_updated_at();

-- RLS for subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subcategories with restaurant_id" ON public.subcategories;
CREATE POLICY "Anyone can view subcategories with restaurant_id"
  ON public.subcategories
  FOR SELECT
  USING (restaurant_id IS NOT NULL);

DROP POLICY IF EXISTS "Restaurant owners can manage their subcategories" ON public.subcategories;
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

-- ============================================================================
-- TABLE 3: MENU_ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  title_it VARCHAR(255),
  title_es VARCHAR(255),
  text TEXT,
  text_en TEXT,
  text_it TEXT,
  text_es TEXT,
  description TEXT NOT NULL,
  description_en TEXT,
  description_it TEXT,
  description_es TEXT,
  image_path VARCHAR(500),
  model_3d_url TEXT,
  redirect_3d_url TEXT,
  additional_image_url TEXT,
  is_special BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) NOT NULL,
  subcategory_id INTEGER NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Indexes for menu_items
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory_id ON public.menu_items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_status ON public.menu_items(status);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON public.menu_items("order");

-- Function for menu_items updated_at
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for menu_items
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_items_updated_at();

-- RLS for menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view menu items with restaurant_id" ON public.menu_items;
CREATE POLICY "Anyone can view menu items with restaurant_id"
  ON public.menu_items
  FOR SELECT
  USING (restaurant_id IS NOT NULL);

DROP POLICY IF EXISTS "Restaurant owners can manage their menu items" ON public.menu_items;
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

-- ============================================================================
-- TABLE 4: ADDONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.addons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  title_it VARCHAR(255),
  title_es VARCHAR(255),
  description TEXT,
  description_en TEXT,
  description_it TEXT,
  description_es TEXT,
  image_path VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
  subcategory_id INTEGER REFERENCES public.subcategories(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER,
  -- Ensure at least one of category_id or subcategory_id is set
  CHECK (category_id IS NOT NULL OR subcategory_id IS NOT NULL)
);

-- Indexes for addons
CREATE INDEX IF NOT EXISTS idx_addons_category_id ON public.addons(category_id);
CREATE INDEX IF NOT EXISTS idx_addons_subcategory_id ON public.addons(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_addons_restaurant_id ON public.addons(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_addons_status ON public.addons(status);
CREATE INDEX IF NOT EXISTS idx_addons_order ON public.addons("order");

-- Function for addons updated_at
CREATE OR REPLACE FUNCTION update_addons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for addons
DROP TRIGGER IF EXISTS update_addons_updated_at ON public.addons;
CREATE TRIGGER update_addons_updated_at
  BEFORE UPDATE ON public.addons
  FOR EACH ROW
  EXECUTE FUNCTION update_addons_updated_at();

-- RLS for addons
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view addons with restaurant_id" ON public.addons;
CREATE POLICY "Anyone can view addons with restaurant_id"
  ON public.addons
  FOR SELECT
  USING (restaurant_id IS NOT NULL);

DROP POLICY IF EXISTS "Restaurant owners can manage their addons" ON public.addons;
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

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.categories, public.subcategories, public.menu_items, public.addons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.subcategories, public.menu_items, public.addons TO authenticated;

-- Grant usage on sequences (needed for SERIAL primary keys)
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE subcategories_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE menu_items_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE addons_id_seq TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.categories IS 'Main menu categories with multi-tenant support';
COMMENT ON TABLE public.subcategories IS 'Subcategories within each main category';
COMMENT ON TABLE public.menu_items IS 'Individual menu items with prices and details';
COMMENT ON TABLE public.addons IS 'Additional items that can be added to menu items';

COMMENT ON COLUMN public.categories.restaurant_id IS 'Links category to a specific restaurant for multi-tenant support';
COMMENT ON COLUMN public.subcategories.restaurant_id IS 'Links subcategory to a specific restaurant for multi-tenant support';
COMMENT ON COLUMN public.menu_items.restaurant_id IS 'Links menu item to a specific restaurant for multi-tenant support';
COMMENT ON COLUMN public.addons.restaurant_id IS 'Links addon to a specific restaurant for multi-tenant support';
