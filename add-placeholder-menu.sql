-- ============================================
-- Add Placeholder Menu Items to Test Menu Display
-- ============================================
-- IMPORTANT: Replace 'YOUR_RESTAURANT_ID' with your actual restaurant ID
-- You can find your restaurant_id by running: SELECT id, name, slug FROM restaurants;

-- Set your restaurant ID here
\set restaurant_id 'YOUR_RESTAURANT_ID'

-- ============================================
-- STEP 1: Create Categories
-- ============================================

-- Pasta Category
INSERT INTO categories (title, title_en, title_fr, title_es, title_it, text, order, status, restaurant_id)
VALUES
  ('Pasta', 'Pasta', 'Pâtes', 'Pasta', 'Pasta',
   'Fresh homemade pasta with authentic Italian sauces',
   1, 'active', :'restaurant_id')
ON CONFLICT DO NOTHING;

-- Pizza Category
INSERT INTO categories (title, title_en, title_fr, title_es, title_it, text, order, status, restaurant_id)
VALUES
  ('Pizza', 'Pizza', 'Pizza', 'Pizza', 'Pizza',
   'Neapolitan style pizza baked in our wood-fired oven',
   2, 'active', :'restaurant_id')
ON CONFLICT DO NOTHING;

-- Appetizers Category
INSERT INTO categories (title, title_en, title_fr, title_es, title_it, text, order, status, restaurant_id)
VALUES
  ('Appetizers', 'Appetizers', 'Entrées', 'Aperitivos', 'Antipasti',
   'Start your meal with our delicious starters',
   3, 'active', :'restaurant_id')
ON CONFLICT DO NOTHING;

-- Desserts Category
INSERT INTO categories (title, title_en, title_fr, title_es, title_it, text, order, status, restaurant_id)
VALUES
  ('Desserts', 'Desserts', 'Desserts', 'Postres', 'Dolci',
   'Traditional Italian desserts made fresh daily',
   4, 'active', :'restaurant_id')
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 2: Create Subcategories
-- ============================================

-- General subcategory for Pasta
INSERT INTO subcategories (category_id, title, title_en, order, status, restaurant_id)
SELECT id, 'General', 'General', 1, 'active', :'restaurant_id'
FROM categories
WHERE title = 'Pasta' AND restaurant_id = :'restaurant_id'
ON CONFLICT DO NOTHING;

-- General subcategory for Pizza
INSERT INTO subcategories (category_id, title, title_en, order, status, restaurant_id)
SELECT id, 'General', 'General', 1, 'active', :'restaurant_id'
FROM categories
WHERE title = 'Pizza' AND restaurant_id = :'restaurant_id'
ON CONFLICT DO NOTHING;

-- General subcategory for Appetizers
INSERT INTO subcategories (category_id, title, title_en, order, status, restaurant_id)
SELECT id, 'General', 'General', 1, 'active', :'restaurant_id'
FROM categories
WHERE title = 'Appetizers' AND restaurant_id = :'restaurant_id'
ON CONFLICT DO NOTHING;

-- General subcategory for Desserts
INSERT INTO subcategories (category_id, title, title_en, order, status, restaurant_id)
SELECT id, 'General', 'General', 1, 'active', :'restaurant_id'
FROM categories
WHERE title = 'Desserts' AND restaurant_id = :'restaurant_id'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 3: Add Pasta Menu Items
-- ============================================

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Spaghetti Carbonara',
  'Spaghetti Carbonara',
  'Spaghetti Carbonara',
  'Creamy pasta with pancetta, egg, and parmesan cheese',
  'Creamy pasta with pancetta, egg, and parmesan cheese',
  'Pâtes crémeuses avec pancetta, œuf et parmesan',
  14.50,
  1,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Penne Arrabbiata',
  'Penne Arrabbiata',
  'Penne Arrabbiata',
  'Spicy tomato sauce with garlic and red chili peppers',
  'Spicy tomato sauce with garlic and red chili peppers',
  'Sauce tomate épicée à l''ail et piments rouges',
  12.00,
  2,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Linguine alle Vongole',
  'Linguine with Clams',
  'Linguine aux Palourdes',
  'Fresh clams with white wine, garlic, and parsley',
  'Fresh clams with white wine, garlic, and parsley',
  'Palourdes fraîches au vin blanc, ail et persil',
  16.50,
  3,
  'active',
  true,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Fettuccine Alfredo',
  'Fettuccine Alfredo',
  'Fettuccine Alfredo',
  'Rich and creamy parmesan sauce with butter',
  'Rich and creamy parmesan sauce with butter',
  'Sauce crémeuse riche au parmesan et beurre',
  13.50,
  4,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Lasagna Bolognese',
  'Lasagna Bolognese',
  'Lasagne Bolognaise',
  'Layers of pasta with meat sauce, béchamel, and cheese',
  'Layers of pasta with meat sauce, béchamel, and cheese',
  'Couches de pâtes à la sauce viande, béchamel et fromage',
  15.00,
  5,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pasta' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

-- ============================================
-- STEP 4: Add Pizza Menu Items
-- ============================================

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Pizza Margherita',
  'Pizza Margherita',
  'Pizza Margherita',
  'Classic tomato sauce, mozzarella, fresh basil',
  'Classic tomato sauce, mozzarella, fresh basil',
  'Sauce tomate classique, mozzarella, basilic frais',
  11.00,
  1,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Pizza Quattro Formaggi',
  'Four Cheese Pizza',
  'Pizza Quatre Fromages',
  'Mozzarella, gorgonzola, parmesan, and fontina cheese',
  'Mozzarella, gorgonzola, parmesan, and fontina cheese',
  'Mozzarella, gorgonzola, parmesan et fontina',
  14.00,
  2,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Pizza Diavola',
  'Spicy Salami Pizza',
  'Pizza Diavola',
  'Tomato sauce, mozzarella, spicy salami, chili oil',
  'Tomato sauce, mozzarella, spicy salami, chili oil',
  'Sauce tomate, mozzarella, salami épicé, huile pimentée',
  13.50,
  3,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Pizza Prosciutto e Funghi',
  'Ham and Mushroom Pizza',
  'Pizza Jambon Champignons',
  'Tomato sauce, mozzarella, ham, fresh mushrooms',
  'Tomato sauce, mozzarella, ham, fresh mushrooms',
  'Sauce tomate, mozzarella, jambon, champignons frais',
  13.00,
  4,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Pizza Truffle Special',
  'Truffle Pizza',
  'Pizza aux Truffes',
  'White sauce, mozzarella, mushrooms, truffle oil',
  'White sauce, mozzarella, mushrooms, truffle oil',
  'Sauce blanche, mozzarella, champignons, huile de truffe',
  18.00,
  5,
  'active',
  true,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Pizza' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

-- ============================================
-- STEP 5: Add Appetizer Menu Items
-- ============================================

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Bruschetta al Pomodoro',
  'Tomato Bruschetta',
  'Bruschetta à la Tomate',
  'Grilled bread with fresh tomatoes, garlic, basil, and olive oil',
  'Grilled bread with fresh tomatoes, garlic, basil, and olive oil',
  'Pain grillé aux tomates fraîches, ail, basilic et huile d''olive',
  8.50,
  1,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Appetizers' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Caprese Salad',
  'Caprese Salad',
  'Salade Caprese',
  'Fresh mozzarella, tomatoes, basil, balsamic glaze',
  'Fresh mozzarella, tomatoes, basil, balsamic glaze',
  'Mozzarella fraîche, tomates, basilic, glaçage balsamique',
  9.50,
  2,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Appetizers' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Arancini',
  'Fried Rice Balls',
  'Arancini',
  'Sicilian rice balls filled with ragu and mozzarella',
  'Sicilian rice balls filled with ragu and mozzarella',
  'Boules de riz siciliennes farcies au ragu et mozzarella',
  10.00,
  3,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Appetizers' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Calamari Fritti',
  'Fried Calamari',
  'Calamars Frits',
  'Crispy fried squid rings with lemon and aioli',
  'Crispy fried squid rings with lemon and aioli',
  'Anneaux de calamars croustillants avec citron et aïoli',
  11.50,
  4,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Appetizers' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

-- ============================================
-- STEP 6: Add Dessert Menu Items
-- ============================================

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Tiramisu',
  'Tiramisu',
  'Tiramisu',
  'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
  'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
  'Dessert italien classique aux biscuits imbibés de café et mascarpone',
  7.50,
  1,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Desserts' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Panna Cotta',
  'Panna Cotta',
  'Panna Cotta',
  'Creamy vanilla dessert with berry coulis',
  'Creamy vanilla dessert with berry coulis',
  'Dessert crémeux à la vanille avec coulis de fruits rouges',
  6.50,
  2,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Desserts' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Cannoli Siciliani',
  'Sicilian Cannoli',
  'Cannoli Siciliens',
  'Crispy pastry shells filled with sweet ricotta cream',
  'Crispy pastry shells filled with sweet ricotta cream',
  'Coques de pâtisserie croustillantes fourrées à la crème ricotta',
  7.00,
  3,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Desserts' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

INSERT INTO menu_items (subcategory_id, title, title_en, title_fr, description, description_en, description_fr, price, order, status, is_special, restaurant_id)
SELECT
  s.id,
  'Gelato Assortito',
  'Assorted Italian Gelato',
  'Gelato Assorti',
  'Three scoops of our homemade gelato - choose your flavors',
  'Three scoops of our homemade gelato - choose your flavors',
  'Trois boules de notre gelato maison - choisissez vos parfums',
  8.00,
  4,
  'active',
  false,
  :'restaurant_id'
FROM subcategories s
JOIN categories c ON s.category_id = c.id
WHERE c.title = 'Desserts' AND s.title = 'General' AND c.restaurant_id = :'restaurant_id';

-- ============================================
-- Summary Query - Check what was added
-- ============================================
SELECT
  c.title as category,
  COUNT(mi.id) as item_count
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
LEFT JOIN menu_items mi ON mi.subcategory_id = s.id
WHERE c.restaurant_id = :'restaurant_id'
GROUP BY c.title, c.order
ORDER BY c.order;

-- Show all menu items by category
SELECT
  c.title as category,
  mi.title as menu_item,
  mi.price,
  CASE WHEN mi.is_special THEN 'SPECIAL' ELSE '' END as special
FROM categories c
JOIN subcategories s ON s.category_id = c.id
JOIN menu_items mi ON mi.subcategory_id = s.id
WHERE c.restaurant_id = :'restaurant_id'
ORDER BY c.order, mi.order;
