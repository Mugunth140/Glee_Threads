#!/usr/bin/env node
// Seed script: inserts dummy orders for development/testing
// Usage: node scripts/seed-orders.js [--count=20] [--dry-run]

const mysql = require('mysql2/promise');
const argv = require('minimist')(process.argv.slice(2));
const COUNT = Number(argv.count || argv.c || 10);
const DRY_RUN = !!argv['dry-run'] || !!argv.dry;

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8220',
  database: process.env.DB_NAME || 'dress_shop',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
});

async function ensureOrdersTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      user_name VARCHAR(255),
      user_email VARCHAR(255),
      phone VARCHAR(32),
      total_amount DECIMAL(10,2) NOT NULL,
      coupon_code VARCHAR(50) NULL,
      coupon_discount_percent INT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      shipping_address TEXT,
      payment_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      size VARCHAR(32),
      price DECIMAL(10,2) NOT NULL,
      custom_color VARCHAR(20) NULL,
      custom_image_url VARCHAR(1000) NULL,
      custom_text TEXT NULL,
      CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_prod FOREIGN KEY (product_id) REFERENCES products(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomName() {
  const fn = ['Asha','Ravi','Neha','Arjun','Priya','Karan','Maya','Vikram','Isha','Sana','Rohan','Meera'];
  const ln = ['Shah','Iyer','Kumar','Reddy','Patel','Singh','Nair','Menon','Das','Verma'];
  return `${pick(fn)} ${pick(ln)}`;
}

function randomEmail(name, idx) {
  const local = name.toLowerCase().replace(/\s+/g, '.') + (idx ? `.${idx}` : '');
  return `${local}@example.com`;
}

const STATUSES = ['pending','paid','cancelled'];
const PAY_METHODS = ['card','cod','upi'];

async function fetchProducts() {
  const [rows] = await db.query("SELECT id, price, sizes FROM products WHERE is_active = 1 AND is_visible = 1 LIMIT 1000");
  return rows;
}

async function seed() {
  console.info(`Seeding ${COUNT} orders ${DRY_RUN ? '(dry-run)' : ''}`);
  await ensureOrdersTables();

  const products = await fetchProducts();
  if (!Array.isArray(products) || products.length === 0) {
    console.error('No available products found to create orders. Seed products first.');
    process.exit(1);
  }

  let inserted = 0;

  for (let i = 1; i <= COUNT; i++) {
    const customerName = randomName();
    const email = randomEmail(customerName, i);
    const phone = `9${randomInt(100000000, 999999999)}`.slice(0,10);
    const status = Math.random() < 0.7 ? 'paid' : (Math.random() < 0.5 ? 'pending' : 'cancelled');
    const payment_method = status === 'paid' ? pick(PAY_METHODS) : pick(PAY_METHODS);

    // create 1-3 items
    const itemCount = randomInt(1, 3);
    const chosen = [];
    let orderTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = pick(products);
      const qty = randomInt(1, 3);
      const price = Number(prod.price) || randomInt(499, 1499);
      const sizes = prod.sizes ? (typeof prod.sizes === 'string' ? JSON.parse(prod.sizes) : prod.sizes) : [];
      const size = Array.isArray(sizes) && sizes.length > 0 ? pick(sizes) : null;
      chosen.push({ product_id: prod.id, quantity: qty, price, size: size && (typeof size === 'string' ? size : size.size_name) });
      orderTotal += price * qty;
    }

    // optionally apply a coupon (10% chance)
    const hasCoupon = Math.random() < 0.1;
    const coupon = hasCoupon ? 'DEV10' : null;
    const coupon_percent = hasCoupon ? 10 : null;
    const totalAfter = hasCoupon ? Math.round(orderTotal * (1 - coupon_percent / 100) * 100) / 100 : orderTotal;

    const shipping = '123 Dev Lane, Test City, TN';

    if (DRY_RUN) {
      console.info('DRY: Would insert order:', {
        customerName, email, phone, status, payment_method, items: chosen, subtotal: orderTotal, coupon, coupon_percent, total: totalAfter
      });
      inserted++;
      continue;
    }

    // Persist to DB
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [res] = await conn.query('INSERT INTO orders (user_name, user_email, phone, total_amount, coupon_code, coupon_discount_percent, status, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [customerName, email, phone, totalAfter, coupon, coupon_percent, status, shipping, payment_method]);
      const orderId = res.insertId;

      const itemsPayload = chosen.map(it => [orderId, it.product_id, it.quantity, it.size || null, it.price]);
      await conn.query('INSERT INTO order_items (order_id, product_id, quantity, size, price) VALUES ?', [itemsPayload]);

      await conn.commit();
      inserted++;
      console.info(`Inserted order id=${orderId} customer=${customerName} total=₹${totalAfter}`);
    } catch (err) {
      await conn.rollback();
      console.error('Failed to insert order', err.message || err);
    } finally {
      conn.release();
    }
  }

  console.info(`Seeding complete. Inserted: ${inserted}`);
  if (!DRY_RUN) process.exit(0);
}

seed().catch(err => {
  console.error('Seed orders script failed:', err);
  process.exit(1);
});
