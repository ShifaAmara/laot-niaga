-- ============================================================
--  LAOT NIAGA — Database Schema v2
--  MySQL / MariaDB (XAMPP compatible)
--  Jalankan: source path/to/schema.sql di phpMyAdmin Query
-- ============================================================

CREATE DATABASE IF NOT EXISTS laot_niaga
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE laot_niaga;

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  role          ENUM('buyer','umkm','admin') NOT NULL DEFAULT 'buyer',
  store_name    VARCHAR(160),
  phone         VARCHAR(40),
  address       TEXT,
  story         TEXT,
  avatar        VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  seller_id         INT NOT NULL,
  name              VARCHAR(160)    NOT NULL,
  category          VARCHAR(80)     NOT NULL,
  price             DECIMAL(12,2)   NOT NULL,
  original_price    DECIMAL(12,2)   DEFAULT NULL,
  stock             INT             NOT NULL DEFAULT 0,
  unit              VARCHAR(30)     NOT NULL DEFAULT 'pcs',
  weight            INT             DEFAULT NULL COMMENT 'gram',
  description       TEXT,
  origin            VARCHAR(160),
  ingredients       TEXT,
  production_method TEXT,
  expiry_info       VARCHAR(160),
  image             VARCHAR(255),
  rating            DECIMAL(3,2)    DEFAULT 0.00,
  sold              INT             DEFAULT 0,
  tags              VARCHAR(255),
  status            ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id         INT NOT NULL,
  total            DECIMAL(12,2)  NOT NULL DEFAULT 0,
  shipping_address TEXT,
  courier          VARCHAR(60),
  courier_service  VARCHAR(60),
  resi             VARCHAR(120),
  note             TEXT,
  payment_method   VARCHAR(60),
  status           ENUM('pending','paid','processed','shipped','completed','cancelled')
                   NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT            NOT NULL,
  price       DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  user_id     INT NOT NULL,
  order_id    INT,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- ─── CHATS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chats (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  message     TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_sender   FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── AI LOGS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  prompt      TEXT NOT NULL,
  response    TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── SEED DATA ───────────────────────────────────────────────
-- Password di bawah adalah plain text untuk testing.
-- Di production, gunakan bcrypt hash!
INSERT INTO users (name, email, password, role, store_name, phone, address, story)
VALUES
  ('Sari Pesisir',   'demo@umkm.com',  'demo123', 'umkm',  'Dapur Laot Leupung', '081234567890', 'Leupung, Aceh Besar', 'UMKM keluarga pengolah ikan kayu, abon ikan, dan kerupuk dari nelayan setempat.'),
  ('Pembeli Demo',   'demo@user.com',  'demo123', 'buyer', NULL,                 '081111222233', 'Banda Aceh',          NULL),
  ('Rahmi Bahari',   'rahmi@umkm.com', 'demo123', 'umkm',  'Lhok Snack Bahari',  '082345678901', 'Banda Aceh',          'Spesialis camilan laut khas Aceh.'),
  ('Admin Laot',     'admin@laot.com', 'admin123','admin', NULL,                 NULL,            NULL,                  NULL)
ON DUPLICATE KEY UPDATE email = email;

-- Produk untuk UMKM 1 (Dapur Laot Leupung)
INSERT INTO products (seller_id, name, category, price, original_price, stock, unit, description, origin, ingredients, production_method, expiry_info, image, rating, sold, tags)
SELECT u.id, 'Keumamah Premium Aceh', 'Ikan Olahan', 45000, 55000, 24, 'pack',
  'Ikan kayu khas Aceh dari ikan tongkol segar pilihan. Diproses higienis, dikemas vakum. Bebas pengawet.',
  'Leupung, Aceh Besar', 'Ikan tongkol, garam laut, rempah Aceh',
  'Dikukus dengan tekanan tinggi, dikeringkan alami, dikemas vakum higienis.',
  '6 bulan dalam kemasan tertutup', 'assets/img/keumamah.jpg', 4.8, 214,
  'Tanpa Pengawet,Vakum,Halal,UMKM Aceh'
FROM users u WHERE u.email = 'demo@umkm.com'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Keumamah Premium Aceh');

INSERT INTO products (seller_id, name, category, price, original_price, stock, unit, description, origin, ingredients, production_method, expiry_info, image, rating, sold, tags)
SELECT u.id, 'Abon Ikan Laut Spesial', 'Siap Santap', 38000, NULL, 30, 'jar',
  'Abon ikan lembut dengan bumbu Aceh turun-temurun. Tanpa MSG. Cocok untuk lauk, sandwich, bekal.',
  'Aceh Besar', 'Ikan laut segar, bawang merah, cabai, rempah pilihan',
  'Disuwir halus, dibumbui rempah Aceh, disangrai hingga kering sempurna.',
  '4 bulan, simpan di tempat kering', 'assets/img/abon ikan.jpg', 4.7, 178, 'No MSG,Halal,Pedas Sedang'
FROM users u WHERE u.email = 'demo@umkm.com'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Abon Ikan Laut Spesial');

INSERT INTO products (seller_id, name, category, price, original_price, stock, unit, description, origin, ingredients, production_method, expiry_info, image, rating, sold, tags)
SELECT u.id, 'Bakso Ikan Tuna Jumbo', 'Siap Santap', 55000, 65000, 15, 'pack',
  'Bakso ikan tuna jumbo 80% daging ikan, tanpa campuran daging ayam. Dikemas vakum, frozen.',
  'Aceh Besar', 'Ikan tuna segar, tepung, putih telur, bawang putih, garam',
  'Ikan tuna segar digiling halus, dibentuk bulat besar, direbus matang, dikemas vakum.',
  '3 bulan dalam freezer', 'assets/img/kerupuk ikan.jpg', 4.8, 89, '80% Daging Ikan,Vakum,Halal,High Protein'
FROM users u WHERE u.email = 'demo@umkm.com'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Bakso Ikan Tuna Jumbo');

-- Produk untuk UMKM 2 (Lhok Snack Bahari)
INSERT INTO products (seller_id, name, category, price, original_price, stock, unit, description, origin, ingredients, production_method, expiry_info, image, rating, sold, tags)
SELECT u.id, 'Kerupuk Ikan Pesisir Renyah', 'Camilan Laut', 22000, 28000, 45, 'bungkus',
  'Kerupuk ikan dari ikan segar pilihan. Bebas pewarna. Renyah sempurna, aroma ikan khas Aceh.',
  'Banda Aceh', 'Ikan segar, tepung tapioka, bawang putih, garam',
  'Adonan ikan segar dihaluskan, dibentuk, dijemur 2 hari, siap digoreng.',
  '3 bulan dalam kemasan tertutup rapat', 'assets/img/kerupuk ikan.jpg', 4.6, 302, 'Tanpa Pewarna,Halal,Renyah'
FROM users u WHERE u.email = 'rahmi@umkm.com'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Kerupuk Ikan Pesisir Renyah');

INSERT INTO products (seller_id, name, category, price, original_price, stock, unit, description, origin, ingredients, production_method, expiry_info, image, rating, sold, tags)
SELECT u.id, 'Terasi Udang Premium', 'Bumbu Laut', 18000, NULL, 60, 'bungkus',
  'Terasi udang rebon segar dari Aceh Barat. Difermentasi alami 30 hari. Aroma kuat, umami mendalam.',
  'Aceh Barat', 'Udang rebon segar, garam laut berkualitas',
  'Udang rebon difermentasi alami 30 hari, dipress dan dikeringkan.',
  '12 bulan dalam kemasan kedap udara', 'assets/img/abon ikan.jpg', 4.9, 521, 'Fermentasi Alami,Halal,Premium'
FROM users u WHERE u.email = 'rahmi@umkm.com'
AND NOT EXISTS (SELECT 1 FROM products p WHERE p.name = 'Terasi Udang Premium');
