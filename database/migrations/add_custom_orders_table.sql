-- Migration: Add custom_orders table
-- Run this SQL to add the custom orders table for tracking custom t-shirt orders

CREATE TABLE IF NOT EXISTS custom_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NULL,
    front_image_url VARCHAR(1000),
    back_image_url VARCHAR(1000),
    instructions TEXT,
    color VARCHAR(50),
    size VARCHAR(32),
    status ENUM (
        'pending',
        'in_progress',
        'completed',
        'cancelled'
    ) DEFAULT 'pending',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(32),
    shipping_address TEXT,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50) NULL,
    coupon_discount_percent INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX idx_custom_orders_status ON custom_orders (status);

CREATE INDEX idx_custom_orders_created ON custom_orders (created_at);