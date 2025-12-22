#!/usr/bin/env node
// Seed script: inserts dummy products for development/testing
// Usage: node scripts/seed-products.js [--count=20] [--dry-run]

const mysql = require('mysql2/promise');

const argv = require('minimist')(process.argv.slice(2));
const COUNT = Number(argv.count || argv.c || 20);
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

async function ensureSizesColumn() {
  try {
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSON");
    console.info('Ensured products.sizes column exists');
  } catch (err) {
    console.warn('Could not ensure sizes column exists (older MySQL). Continuing anyway. Error:', err.message || err);
  }
}

async function ensureCategory() {
  // Prefer an existing category named 'Dev' or create one
  try {
    const [rows] = await db.query("SELECT id FROM categories WHERE slug = 'dev' LIMIT 1");
    if (Array.isArray(rows) && rows.length > 0) return rows[0].id;
    const [existing] = await db.query("SELECT id FROM categories LIMIT 1");
    if (Array.isArray(existing) && existing.length > 0) return existing[0].id;
    if (DRY_RUN) {
      console.info('DRY: Would create dev category');
      return null;
    }
    const [result] = await db.query('INSERT INTO categories (name, slug) VALUES (?, ?)', ['Dev', 'dev']);
    return result.insertId;
  } catch (err) {
    console.error('Failed to ensure category exists:', err.message || err);
    return null;
  }
}

function randomPrice() {
  const p = [499, 699, 899, 999, 1299, 1499];
  return p[Math.floor(Math.random() * p.length)];
}

async function seed() {
  console.info(`Seeding ${COUNT} products ${DRY_RUN ? '(dry-run)' : ''}`);
  await ensureSizesColumn();
  const categoryId = await ensureCategory();

  const sizes = ['XS','S','M','L','XL'];
  // Use Unsplash random images for more realistic product imagery
  const imageBase = 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const material = '100% Cotton';
  const care = 'Machine wash cold, tumble dry low.';

  let inserted = 0;

  for (let i = 1; i <= COUNT; i++) {
    const name = `Dev T-Shirt #${i}`;
    const description = `Development dummy product ${i} - comfortable and stylish.`;
    const price = randomPrice();

    // Randomize a few flags for more realistic data
    const is_out_of_stock = Math.random() < 0.12; // ~12% out of stock
    const is_featured = Math.random() < 0.08; // ~8% featured
    const is_hero = Math.random() < 0.05; // ~5% hero
    const is_active = true;
    const is_visible = true;

    // pick a slightly different Unsplash image per item for variety
    const imageUrl = `${imageBase}&sig=${i}`;
    const sizesJson = JSON.stringify(sizes);

    const productPayload = {
      name,
      description,
      price,
      image_url: imageUrl,
      category_id: categoryId,
      sizes: sizesJson,
      is_out_of_stock: is_out_of_stock ? 1 : 0,
      material,
      care_instructions: care,
      is_active: is_active ? 1 : 0,
      is_visible: is_visible ? 1 : 0,
      is_featured: is_featured ? 1 : 0,
      is_hero: is_hero ? 1 : 0,
    };

    if (DRY_RUN) {
      console.info(`DRY: Would insert product:`, productPayload);
      inserted++;
      continue;
    }

    try {
      const [result] = await db.query(
        `INSERT INTO products (name, description, price, image_url, category_id, sizes, is_out_of_stock, material, care_instructions, is_active, is_visible, is_featured, is_hero) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productPayload.name,
          productPayload.description,
          productPayload.price,
          productPayload.image_url,
          productPayload.category_id,
          productPayload.sizes,
          productPayload.is_out_of_stock,
          productPayload.material,
          productPayload.care_instructions,
          productPayload.is_active,
          productPayload.is_visible,
          productPayload.is_featured,
          productPayload.is_hero,
        ]
      );
      inserted++;
      console.info(`Inserted product id=${result.insertId} name=${name}`);
    } catch (err) {
      console.error('Failed to insert product', name, err.message || err);
    }
  }

  console.info(`Seeding complete. Inserted: ${inserted}`);
  if (!DRY_RUN) process.exit(0);
}

seed().catch(err => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
