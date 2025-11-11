-- ============================================================================
-- COMPLETE DATABASE SETUP SCRIPT
-- Restaurant Reservation & Menu Management System
-- ============================================================================
-- This script creates all tables, indexes, triggers, RLS policies, and
-- necessary functions for a complete restaurant management system.
-- Safe to run multiple times (idempotent).
-- ============================================================================

-- ============================================================================
-- SHARED FUNCTIONS
-- ============================================================================

-- Create updated_at trigger function (shared across tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TABLE 1: RESERVATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0 AND guests <= 12),
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for reservations
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, reservation_time);

-- Trigger for reservations
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can create reservations" ON reservations;
CREATE POLICY "Public can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can view their own reservations" ON reservations;
CREATE POLICY "Customers can view their own reservations" ON reservations
  FOR SELECT USING (
    email = current_setting('app.customer_email', true)
  );

-- Permissions for reservations
GRANT INSERT ON reservations TO anon, authenticated;
GRANT SELECT ON reservations TO authenticated;

-- Comments for reservations
COMMENT ON TABLE reservations IS 'Stores customer reservations for the restaurant';
COMMENT ON COLUMN reservations.guests IS 'Number of guests, limited between 1 and 12';
COMMENT ON COLUMN reservations.status IS 'Reservation status: confirmed, cancelled, or completed';

-- ============================================================================
-- TABLE 2: CLOSED_DATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS closed_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  is_closed BOOLEAN DEFAULT false,
  reason TEXT,
  -- Continuous hours (used when use_split_hours = false)
  opening_time TIME DEFAULT '10:00',
  closing_time TIME DEFAULT '20:00',
  -- Split hours support (used when use_split_hours = true)
  morning_opening TIME,
  morning_closing TIME,
  afternoon_opening TIME,
  afternoon_closing TIME,
  use_split_hours BOOLEAN DEFAULT false,
  -- Manual override tracking (for weekly schedule sync)
  is_manual_override BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for closed_dates
CREATE INDEX IF NOT EXISTS idx_closed_dates_date ON closed_dates(date);
CREATE INDEX IF NOT EXISTS idx_closed_dates_is_closed ON closed_dates(is_closed);
CREATE INDEX IF NOT EXISTS idx_closed_dates_date_range ON closed_dates(date, is_closed);
CREATE INDEX IF NOT EXISTS idx_closed_dates_manual_override ON closed_dates(is_manual_override);

-- Function for closed_dates updated_at
CREATE OR REPLACE FUNCTION update_closed_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for closed_dates
DROP TRIGGER IF EXISTS update_closed_dates_updated_at ON closed_dates;
CREATE TRIGGER update_closed_dates_updated_at
  BEFORE UPDATE ON closed_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_closed_dates_updated_at();

-- RLS for closed_dates
ALTER TABLE closed_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to closed_dates" ON closed_dates;
CREATE POLICY "Allow public read access to closed_dates" ON closed_dates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage closed_dates" ON closed_dates;
CREATE POLICY "Allow authenticated users to manage closed_dates" ON closed_dates
  FOR ALL USING (auth.role() = 'authenticated');

-- Permissions for closed_dates
GRANT SELECT ON closed_dates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON closed_dates TO authenticated;

-- Comments for closed_dates
COMMENT ON TABLE closed_dates IS 'Manages restaurant closed dates and custom opening hours that override the weekly schedule';
COMMENT ON COLUMN closed_dates.is_closed IS 'True if restaurant is closed on this date, false if open with custom hours';
COMMENT ON COLUMN closed_dates.reason IS 'Reason for closure or custom hours (e.g., "Christmas Day", "Special Event")';
COMMENT ON COLUMN closed_dates.is_manual_override IS 'True = manually set by admin (protected from weekly sync), False = auto-synced from weekly schedule';

-- ============================================================================
-- TABLE 3: RESTAURANT_SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for restaurant_settings
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_key ON restaurant_settings(setting_key);

-- Trigger for restaurant_settings
DROP TRIGGER IF EXISTS update_restaurant_settings_updated_at ON restaurant_settings;
CREATE TRIGGER update_restaurant_settings_updated_at
  BEFORE UPDATE ON restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for restaurant_settings
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read restaurant settings" ON restaurant_settings;
CREATE POLICY "Public can read restaurant settings" ON restaurant_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert settings" ON restaurant_settings;
CREATE POLICY "Authenticated users can insert settings" ON restaurant_settings
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update settings" ON restaurant_settings;
CREATE POLICY "Authenticated users can update settings" ON restaurant_settings
  FOR UPDATE TO authenticated USING (true);

-- Permissions for restaurant_settings
GRANT SELECT ON restaurant_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON restaurant_settings TO authenticated;

-- Comments for restaurant_settings
COMMENT ON TABLE restaurant_settings IS 'Stores restaurant configuration settings including weekly schedules';
COMMENT ON COLUMN restaurant_settings.setting_key IS 'Unique key for the setting (e.g., weekly_schedule_0 for Sunday)';
COMMENT ON COLUMN restaurant_settings.setting_value IS 'JSON string containing the setting configuration';

-- ============================================================================
-- TABLE 4: CATEGORIES (Menu System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  text TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Function for categories updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON categories;
CREATE POLICY "Allow authenticated users to manage categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Comments for categories
COMMENT ON TABLE categories IS 'Main menu categories (e.g., Appetizers, Main Courses, Desserts)';

-- ============================================================================
-- TABLE 5: SUBCATEGORIES (Menu System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL UNIQUE,
  text TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Index for subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);

-- Function for subcategories updated_at
CREATE OR REPLACE FUNCTION update_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for subcategories
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_subcategories_updated_at();

-- RLS for subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to subcategories" ON subcategories;
CREATE POLICY "Allow public read access to subcategories" ON subcategories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage subcategories" ON subcategories;
CREATE POLICY "Allow authenticated users to manage subcategories" ON subcategories
  FOR ALL USING (auth.role() = 'authenticated');

-- Comments for subcategories
COMMENT ON TABLE subcategories IS 'Subcategories within each main category';

-- ============================================================================
-- TABLE 6: MENU_ITEMS (Menu System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  text TEXT,
  description TEXT NOT NULL,
  image_path VARCHAR(500),
  model_3d_url TEXT,
  redirect_3d_url TEXT,
  additional_image_url TEXT,
  is_special BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) NOT NULL,
  subcategory_id INTEGER NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER
);

-- Index for menu_items
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory_id ON menu_items(subcategory_id);

-- Function for menu_items updated_at
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for menu_items
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_items_updated_at();

-- RLS for menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to menu_items" ON menu_items;
CREATE POLICY "Allow public read access to menu_items" ON menu_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage menu_items" ON menu_items;
CREATE POLICY "Allow authenticated users to manage menu_items" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Comments for menu_items
COMMENT ON TABLE menu_items IS 'Individual menu items with prices and details';
COMMENT ON COLUMN menu_items.image_path IS 'Path to menu item image: public/images/menu/menu-item/filename.jpg';
COMMENT ON COLUMN menu_items.model_3d_url IS 'Direct link to 3D model file (.glb, .obj, etc.)';
COMMENT ON COLUMN menu_items.redirect_3d_url IS 'Link to external 3D viewer page (e.g., Sketchfab)';

-- ============================================================================
-- TABLE 7: ADDONS (Menu System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS addons (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_path VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER,
  updated_by INTEGER,
  -- Ensure at least one of category_id or subcategory_id is set
  CHECK (category_id IS NOT NULL OR subcategory_id IS NOT NULL)
);

-- Indexes for addons
CREATE INDEX IF NOT EXISTS idx_addons_category_id ON addons(category_id);
CREATE INDEX IF NOT EXISTS idx_addons_subcategory_id ON addons(subcategory_id);

-- Function for addons updated_at
CREATE OR REPLACE FUNCTION update_addons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for addons
DROP TRIGGER IF EXISTS update_addons_updated_at ON addons;
CREATE TRIGGER update_addons_updated_at
  BEFORE UPDATE ON addons
  FOR EACH ROW
  EXECUTE FUNCTION update_addons_updated_at();

-- RLS for addons
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to addons" ON addons;
CREATE POLICY "Allow public read access to addons" ON addons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage addons" ON addons;
CREATE POLICY "Allow authenticated users to manage addons" ON addons
  FOR ALL USING (auth.role() = 'authenticated');

-- Comments for addons
COMMENT ON TABLE addons IS 'Additional items that can be added to menu items';
COMMENT ON COLUMN addons.image_path IS 'Path to addon image: public/images/menu/add-ons/filename.jpg';
COMMENT ON COLUMN addons.category_id IS 'Optional: Link addon to entire category';
COMMENT ON COLUMN addons.subcategory_id IS 'Optional: Link addon to specific subcategory';

-- ============================================================================
-- GRANT PERMISSIONS FOR MENU SYSTEM
-- ============================================================================

GRANT SELECT ON categories, subcategories, menu_items, addons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON categories, subcategories, menu_items, addons TO authenticated;

-- Grant usage on sequences (needed for SERIAL primary keys)
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE subcategories_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE menu_items_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE addons_id_seq TO authenticated;

-- ============================================================================
-- REALTIME SUBSCRIPTIONS (Supabase specific)
-- ============================================================================

-- Enable realtime for restaurant_settings (if using Supabase)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE closed_dates;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Realtime publication not available (not running on Supabase)';
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=======================================================';
  RAISE NOTICE '✓ DATABASE SETUP COMPLETE';
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  1. reservations';
  RAISE NOTICE '  2. closed_dates';
  RAISE NOTICE '  3. restaurant_settings';
  RAISE NOTICE '  4. categories';
  RAISE NOTICE '  5. subcategories';
  RAISE NOTICE '  6. menu_items';
  RAISE NOTICE '  7. addons';
  RAISE NOTICE '';
  RAISE NOTICE 'All indexes, triggers, RLS policies created successfully.';
  RAISE NOTICE '=======================================================';
END $$;
