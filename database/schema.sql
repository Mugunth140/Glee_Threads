-- Create Database
CREATE DATABASE IF NOT EXISTS gleethreads;
USE dress_shop;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (t-shirts)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sizes JSON DEFAULT NULL,
  category_id INT,
  image_url VARCHAR(500),
  material VARCHAR(100),
  care_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Sizes table
CREATE TABLE IF NOT EXISTS sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(10) NOT NULL UNIQUE,
  display_order INT DEFAULT 0
);

-- Product inventory (sizes and availability)
CREATE TABLE IF NOT EXISTS product_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size_id INT NOT NULL,
  quantity INT DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_size (product_id, size_id)
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Shopping cart
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  size_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE CASCADE
);

-- Insert default sizes
INSERT INTO sizes (name, display_order) VALUES
  ('XS', 1),
  ('S', 2),
  ('M', 3),
  ('L', 4),
  ('XL', 5),
  ('XXL', 6)
ON DUPLICATE KEY UPDATE display_order = VALUES(display_order);

-- Insert categories
INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Graphic Tees', 'graphic-tees', 'Bold graphic designs and artistic prints', 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&h=500&fit=crop'),
  ('Plain Tees', 'plain-tees', 'Classic solid color essentials', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'),
  ('Oversized Tees', 'oversized-tees', 'Relaxed fit for ultimate comfort', 'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=500&h=500&fit=crop'),
  ('Premium Tees', 'premium-tees', 'Luxury fabrics and premium quality', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=500&fit=crop')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, material, care_instructions) VALUES
  ('Classic Black Graphic Tee', 'Bold graphic print on premium cotton t-shirt', 1299, 1, 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500&h=500&fit=crop', '100% Cotton', 'Machine wash cold'),
  ('White Essential Tee', 'Timeless white t-shirt for everyday wear', 899, 2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop', '100% Cotton', 'Machine wash cold, tumble dry low'),
  ('Oversized Street Tee', 'Relaxed fit oversized tee with drop shoulders', 1499, 3, 'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=500&h=500&fit=crop', 'Cotton blend', 'Machine wash cold'),
  ('Navy Blue Plain Tee', 'Classic navy blue t-shirt with perfect fit', 799, 2, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=500&fit=crop', '100% Cotton', 'Machine washable'),
  ('Premium Black Tee', 'Luxury heavyweight cotton with superior quality', 1999, 4, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop', 'Premium Cotton', 'Machine wash gentle'),
  ('Grey Melange Tee', 'Soft grey melange t-shirt with modern fit', 999, 2, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=500&fit=crop', 'Cotton Polyester blend', 'Machine wash cold'),
  ('Vintage Print Graphic Tee', 'Retro-style vintage print on soft cotton', 1399, 1, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&h=500&fit=crop', '100% Cotton', 'Machine wash cold, inside out'),
  ('Black Oversized Tee', 'Premium oversized fit in classic black', 1599, 3, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop', 'Heavy Cotton', 'Machine wash cold')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert inventory for products (availability by size)
INSERT INTO product_inventory (product_id, size_id, quantity, sku) VALUES
  -- Classic Black Graphic Tee
  (1, 1, 5, 'CBGT-XS-001'), (1, 2, 8, 'CBGT-S-001'), (1, 3, 12, 'CBGT-M-001'), (1, 4, 10, 'CBGT-L-001'), (1, 5, 6, 'CBGT-XL-001'),
  -- White Essential Tee
  (2, 2, 15, 'WET-S-002'), (2, 3, 20, 'WET-M-002'), (2, 4, 18, 'WET-L-002'), (2, 5, 10, 'WET-XL-002'),
  -- Oversized Street Tee
  (3, 1, 4, 'OST-XS-003'), (3, 2, 7, 'OST-S-003'), (3, 3, 9, 'OST-M-003'), (3, 4, 8, 'OST-L-003'), (3, 5, 5, 'OST-XL-003'),
  -- Navy Blue Plain Tee
  (4, 1, 10, 'NBPT-XS-004'), (4, 2, 15, 'NBPT-S-004'), (4, 3, 20, 'NBPT-M-004'), (4, 4, 15, 'NBPT-L-004'), (4, 5, 8, 'NBPT-XL-004'),
  -- Premium Black Tee
  (5, 2, 6, 'PBT-S-005'), (5, 3, 10, 'PBT-M-005'), (5, 4, 8, 'PBT-L-005'), (5, 5, 4, 'PBT-XL-005'),
  -- Grey Melange Tee
  (6, 1, 12, 'GMT-XS-006'), (6, 2, 18, 'GMT-S-006'), (6, 3, 25, 'GMT-M-006'), (6, 4, 20, 'GMT-L-006'), (6, 5, 10, 'GMT-XL-006'),
  -- Vintage Print Graphic Tee
  (7, 2, 8, 'VPGT-S-007'), (7, 3, 12, 'VPGT-M-007'), (7, 4, 10, 'VPGT-L-007'), (7, 5, 6, 'VPGT-XL-007'),
  -- Black Oversized Tee
  (8, 1, 8, 'BOT-XS-008'), (8, 2, 14, 'BOT-S-008'), (8, 3, 18, 'BOT-M-008'), (8, 4, 15, 'BOT-L-008'), (8, 5, 9, 'BOT-XL-008')
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- Create admin user (password: admin123 - hashed with bcrypt)
-- Note: In production, hash the password properly using bcrypt
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@dressshop.com', '$2b$10$rZY4qKQxqq1ZV5xK5nC5Ru5yKxvqzDZJ5nC5Ru5yKxvqzDZJ5nC5R', 'Admin User', 'admin')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- Subscribes table
CREATE TABLE IF NOT EXISTS subscribes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
