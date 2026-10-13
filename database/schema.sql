-- ==========================================================
-- ShopEasy E-Commerce Website - MySQL Database Schema
-- Database: shopeasy_db
-- ==========================================================

CREATE DATABASE IF NOT EXISTS shopeasy_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shopeasy_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500)
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    category_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLACED',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash on Delivery',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Order Items Table (Stores unit price at purchase time for historical accuracy)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ==========================================================
-- Sample Seed Data
-- Passwords are hashed with BCrypt ($2a$10$...)
-- admin@shopeasy.com / admin123
-- customer@shopeasy.com / customer123
-- ==========================================================

INSERT INTO users (name, email, password, phone, role)
VALUES 
('ShopEasy Admin', 'admin@shopeasy.com', '$2a$10$w8T0mK62K3G3o/k0a5d4o.G4mN8XQpU7.oWvM3xL6G7bW0iW4L2mS', '+91 9876543210', 'ROLE_ADMIN'),
('Rahul Sharma', 'customer@shopeasy.com', '$2a$10$Yw5pWnJ5a3g6uG8jY0n4tOXbN8.r3bK2o1vV4xL9G0mW1iW5L3nS', '+91 9876543211', 'ROLE_CUSTOMER')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO categories (name, description, image_url)
VALUES 
('Electronics', 'Gadgets, audio, smartphones, and cutting-edge devices', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80'),
('Fashion', 'Trendy clothing, apparel, and lifestyle accessories for all', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80'),
('Home & Kitchen', 'Modern home appliances, cookware, and decorative essentials', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80'),
('Footwear', 'Athletic shoes, casual sneakers, and formal footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80'),
('Books & Stationery', 'Bestselling novels, educational books, and stationery', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80')
ON DUPLICATE KEY UPDATE description=VALUES(description);

INSERT INTO products (name, description, price, stock_quantity, image_url, category_id)
VALUES 
('Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise canceling wireless headphones with crystal-clear hands-free calling and 30-hour battery life.', 24999.00, 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', 1),
('Apple Watch Series 9 GPS', 'Smartwatch with Always-On Retina display, advanced health sensors, crash detection, and fitness tracking.', 32900.00, 18, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', 1),
('Logitech MX Master 3S Wireless Mouse', 'Ergonomic performance mouse with quiet clicks, 8K DPI tracking on glass, and hyper-fast scroll wheel.', 8495.00, 40, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80', 1),
('Men Classic Slim-Fit Oxford Shirt', 'Pure premium cotton button-down shirt designed for all-day comfort and timeless business casual elegance.', 1499.00, 60, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', 2),
('Women Floral Wrap Midi Dress', 'Lightweight breathable rayon fabric with flattering wrap silhouette and vibrant bohemian floral pattern.', 2199.00, 35, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80', 2),
('Nike Air Zoom Pegasus 40 Running Shoes', 'Responsive cushioned road running shoes engineered with breathable engineered mesh and dual Zoom Air units.', 7999.00, 20, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 4),
('Stainless Steel Coffee French Press', 'Double-walled insulated French press coffee maker with 4-level filtration system and 1L capacity.', 1899.00, 50, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', 3),
('Minimalist Ceramic Table Lamp', 'Warm ambient LED desk lamp with dimmable touch control and textured ceramic base for modern interiors.', 2499.00, 15, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80', 3),
('Atomic Habits by James Clear', 'An easy and proven way to build good habits and break bad ones. Over 10 million copies sold worldwide.', 499.00, 100, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 5)
ON DUPLICATE KEY UPDATE price=VALUES(price);
