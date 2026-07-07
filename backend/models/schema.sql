CREATE DATABASE IF NOT EXISTS laot_niaga
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE laot_niaga;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'umkm', 'admin') NOT NULL DEFAULT 'buyer',
  store_name VARCHAR(160),
  phone VARCHAR(40),
  address TEXT,
  story TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
  description TEXT,
  origin VARCHAR(160),
  ingredients TEXT,
  production_method TEXT,
  expiry_info VARCHAR(160),
  image VARCHAR(255),
  status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  shipping_address TEXT,
  note TEXT,
  status ENUM('pending', 'paid', 'processed', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (name, email, password, role, store_name, phone, address, story)
VALUES
('Sari Pesisir', 'umkm@laotniaga.test', 'password123', 'umkm', 'Dapur Laot Leupung', '081234567890', 'Leupung, Aceh Besar', 'UMKM keluarga yang mengolah ikan kayu, abon ikan, dan kerupuk ikan dari hasil tangkapan nelayan setempat.'),
('Pembeli Demo', 'buyer@laotniaga.test', 'password123', 'buyer', NULL, '081111222233', 'Banda Aceh', NULL)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO products (seller_id, name, category, price, stock, unit, description, origin, ingredients, production_method, expiry_info, image)
SELECT id, 'Keumamah Premium', 'Ikan Olahan', 45000, 24, 'pack', 'Ikan kayu khas Aceh dengan rasa gurih dan tekstur padat, cocok untuk masakan rumahan.', 'Leupung, Aceh Besar', 'Ikan tongkol, garam, rempah', 'Dikukus, dikeringkan, lalu dikemas higienis', 'Baik dikonsumsi 6 bulan setelah produksi', '../assets/img/product-keumamah.svg'
FROM users WHERE email = 'umkm@laotniaga.test'
AND NOT EXISTS (SELECT 1 FROM products WHERE products.name = 'Keumamah Premium');

INSERT INTO products (seller_id, name, category, price, stock, unit, description, origin, ingredients, production_method, expiry_info, image)
SELECT id, 'Abon Ikan Laut', 'Siap Santap', 38000, 30, 'jar', 'Abon ikan lembut dengan bumbu Aceh, praktis untuk lauk dan oleh-oleh.', 'Aceh Besar', 'Ikan laut, bawang, cabai, rempah', 'Disuwir, dibumbui, dan disangrai hingga kering', 'Simpan di tempat kering', '../assets/img/product-abon.svg'
FROM users WHERE email = 'umkm@laotniaga.test'
AND NOT EXISTS (SELECT 1 FROM products WHERE products.name = 'Abon Ikan Laut');
