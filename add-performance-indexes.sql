-- Performance optimization indexes for faster queries

-- Index on restaurants table
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);

-- Index on categories table
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_order ON categories(restaurant_id, "order");

-- Index on subcategories table
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_order ON subcategories("order");
CREATE INDEX IF NOT EXISTS idx_subcategories_category_order ON subcategories(category_id, "order");

-- Index on menu_items table
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory_id ON menu_items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items("order");
CREATE INDEX IF NOT EXISTS idx_menu_items_is_special ON menu_items(is_special);
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory_order ON menu_items(subcategory_id, "order");

-- Index on addons table
CREATE INDEX IF NOT EXISTS idx_addons_category_id ON addons(category_id);
CREATE INDEX IF NOT EXISTS idx_addons_order ON addons("order");
CREATE INDEX IF NOT EXISTS idx_addons_category_order ON addons(category_id, "order");

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_active ON categories(restaurant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_subcat_special ON menu_items(subcategory_id, is_special);

-- Analyze tables to update statistics for query planner
ANALYZE restaurants;
ANALYZE categories;
ANALYZE subcategories;
ANALYZE menu_items;
ANALYZE addons;
