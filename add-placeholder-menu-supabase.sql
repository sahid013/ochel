-- ============================================
-- Add Placeholder Menu Items to Test Menu Display
-- FOR SUPABASE SQL EDITOR
-- ============================================
-- STEP 1: First, find your restaurant_id by running this query:
-- SELECT id, name, slug FROM restaurants;
--
-- STEP 2: Replace 'a5306ade-c1b7-4540-8787-31f16e364f06' below with your actual restaurant ID
-- Example: If your restaurant_id is 'abc123-def456', replace every instance of 'a5306ade-c1b7-4540-8787-31f16e364f06' with 'abc123-def456'
-- ============================================

-- ============================================
-- Create Categories
-- ============================================

-- Pasta Category
INSERT INTO categories (title, title_en, title_es, title_it, text, "order", status, restaurant_id)
VALUES
  ('Pasta', 'Pasta', 'Pasta', 'Pasta',
   'Fresh homemade pasta with authentic Italian sauces',
   1, 'active', 'a5306ade-c1b7-4540-8787-31f16e364f06')
ON CONFLICT DO NOTHING
RETURNING id, title;

-- Pizza Category
INSERT INTO categories (title, title_en, title_es, title_it, text, "order", status, restaurant_id)
VALUES
  ('Pizza', 'Pizza', 'Pizza', 'Pizza',
   'Neapolitan style pizza baked in our wood-fired oven',
   2, 'active', 'a5306ade-c1b7-4540-8787-31f16e364f06')
ON CONFLICT DO NOTHING
RETURNING id, title;

-- Appetizers Category
INSERT INTO categories (title, title_en, title_es, title_it, text, "order", status, restaurant_id)
VALUES
  ('Appetizers', 'Appetizers', 'Aperitivos', 'Antipasti',
   'Start your meal with our delicious starters',
   3, 'active', 'a5306ade-c1b7-4540-8787-31f16e364f06')
ON CONFLICT DO NOTHING
RETURNING id, title;

-- Desserts Category
INSERT INTO categories (title, title_en, title_es, title_it, text, "order", status, restaurant_id)
VALUES
  ('Desserts', 'Desserts', 'Postres', 'Dolci',
   'Traditional Italian desserts made fresh daily',
   4, 'active', 'a5306ade-c1b7-4540-8787-31f16e364f06')
ON CONFLICT DO NOTHING
RETURNING id, title;

-- ============================================
-- Create Subcategories (General for each category)
-- ============================================

-- General subcategory for Pasta
INSERT INTO subcategories (category_id, title, title_en, "order", status, restaurant_id)
SELECT id, 'General', 'General', 1, 'active', 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM categories
WHERE title = 'Pasta' AND restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- General subcategory for Pizza
INSERT INTO subcategories (category_id, title, title_en, "order", status, restaurant_id)
SELECT id, 'General', 'General', 1, 'active', 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM categories
WHERE title = 'Pizza' AND restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- General subcategory for Appetizers
INSERT INTO subcategories (category_id, title, title_en, "order", status, restaurant_id)
SELECT id, 'General', 'General', 1, 'active', 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM categories
WHERE title = 'Appetizers' AND restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- General subcategory for Desserts
INSERT INTO subcategories (category_id, title, title_en, "order", status, restaurant_id)
SELECT id, 'General', 'General', 1, 'active', 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM categories
WHERE title = 'Desserts' AND restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- ============================================
-- Add PASTA Menu Items
-- ============================================

-- Spaghetti Carbonara
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Spaghetti Carbonara', 'Spaghetti Carbonara',
  'Creamy pasta with pancetta, egg, and parmesan cheese',
  'Creamy pasta with pancetta, egg, and parmesan cheese',
  14.50, 1, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Penne Arrabbiata
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Penne Arrabbiata', 'Penne Arrabbiata',
  'Spicy tomato sauce with garlic and red chili peppers',
  'Spicy tomato sauce with garlic and red chili peppers',
  12.00, 2, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Linguine alle Vongole (SPECIAL)
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Linguine alle Vongole', 'Linguine with Clams',
  'Fresh clams with white wine, garlic, and parsley',
  'Fresh clams with white wine, garlic, and parsley',
  16.50, 3, 'active', true, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Fettuccine Alfredo
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Fettuccine Alfredo', 'Fettuccine Alfredo',
  'Rich and creamy parmesan sauce with butter',
  'Rich and creamy parmesan sauce with butter',
  13.50, 4, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Lasagna Bolognese
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Lasagna Bolognese', 'Lasagna Bolognese',
  'Layers of pasta with meat sauce, béchamel, and cheese',
  'Layers of pasta with meat sauce, béchamel, and cheese',
  15.00, 5, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- ============================================
-- Add PIZZA Menu Items
-- ============================================

-- Pizza Margherita
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Pizza Margherita', 'Pizza Margherita',
  'Classic tomato sauce, mozzarella, fresh basil',
  'Classic tomato sauce, mozzarella, fresh basil',
  11.00, 1, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Pizza Quattro Formaggi
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Pizza Quattro Formaggi', 'Four Cheese Pizza',
  'Mozzarella, gorgonzola, parmesan, and fontina cheese',
  'Mozzarella, gorgonzola, parmesan, and fontina cheese',
  14.00, 2, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Pizza Diavola
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Pizza Diavola', 'Spicy Salami Pizza',
  'Tomato sauce, mozzarella, spicy salami, chili oil',
  'Tomato sauce, mozzarella, spicy salami, chili oil',
  13.50, 3, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Pizza Prosciutto e Funghi
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Pizza Prosciutto e Funghi', 'Ham and Mushroom Pizza',
  'Tomato sauce, mozzarella, ham, fresh mushrooms',
  'Tomato sauce, mozzarella, ham, fresh mushrooms',
  13.00, 4, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Pizza Truffle Special (SPECIAL)
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Pizza Truffle Special', 'Truffle Pizza',
  'White sauce, mozzarella, mushrooms, truffle oil',
  'White sauce, mozzarella, mushrooms, truffle oil',
  18.00, 5, 'active', true, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- ============================================
-- Add APPETIZER Menu Items
-- ============================================

-- Bruschetta al Pomodoro
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Bruschetta al Pomodoro', 'Tomato Bruschetta',
  'Grilled bread with fresh tomatoes, garlic, basil, and olive oil',
  'Grilled bread with fresh tomatoes, garlic, basil, and olive oil',
  8.50, 1, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Appetizers' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Caprese Salad
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Caprese Salad', 'Caprese Salad',
  'Fresh mozzarella, tomatoes, basil, balsamic glaze',
  'Fresh mozzarella, tomatoes, basil, balsamic glaze',
  9.50, 2, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Appetizers' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Arancini
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Arancini', 'Fried Rice Balls',
  'Sicilian rice balls filled with ragu and mozzarella',
  'Sicilian rice balls filled with ragu and mozzarella',
  10.00, 3, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Appetizers' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Calamari Fritti
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Calamari Fritti', 'Fried Calamari',
  'Crispy fried squid rings with lemon and aioli',
  'Crispy fried squid rings with lemon and aioli',
  11.50, 4, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Appetizers' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- ============================================
-- Add DESSERT Menu Items
-- ============================================

-- Tiramisu
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Tiramisu', 'Tiramisu',
  'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
  'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
  7.50, 1, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Desserts' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Panna Cotta
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Panna Cotta', 'Panna Cotta',
  'Creamy vanilla dessert with berry coulis',
  'Creamy vanilla dessert with berry coulis',
  6.50, 2, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Desserts' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Cannoli Siciliani
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Cannoli Siciliani', 'Sicilian Cannoli',
  'Crispy pastry shells filled with sweet ricotta cream',
  'Crispy pastry shells filled with sweet ricotta cream',
  7.00, 3, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Desserts' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- Gelato Assortito
INSERT INTO menu_items (subcategory_id, title, title_en, description, description_en, price, "order", status, is_special, restaurant_id)
SELECT s.id, 'Gelato Assortito', 'Assorted Italian Gelato',
  'Three scoops of our homemade gelato - choose your flavors',
  'Three scoops of our homemade gelato - choose your flavors',
  8.00, 4, 'active', false, 'a5306ade-c1b7-4540-8787-31f16e364f06'
FROM subcategories s JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Desserts' AND s.title = 'General' AND c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06';

-- ============================================
-- Verification Queries
-- ============================================

-- Check how many items were added per category
SELECT
  c.title as category,
  COUNT(mi.id) as item_count
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
LEFT JOIN menu_items mi ON mi.subcategory_id = s.id
WHERE c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06'
GROUP BY c.title, c."order"
ORDER BY c."order";

-- View all menu items with prices
SELECT
  c.title as category,
  mi.title as menu_item,
  mi.price || ' €' as price,
  CASE WHEN mi.is_special THEN '⭐ SPECIAL' ELSE '' END as special
FROM categories c
JOIN subcategories s ON s.category_id = c.id
JOIN menu_items mi ON mi.subcategory_id = s.id
WHERE c.restaurant_id = 'a5306ade-c1b7-4540-8787-31f16e364f06'
ORDER BY c."order", mi."order";
