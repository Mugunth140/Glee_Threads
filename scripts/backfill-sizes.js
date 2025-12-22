#!/usr/bin/env node
// Backfill script: copies sizes from product_sizes or product_inventory into products.sizes JSON column
// Usage: node scripts/backfill-sizes.js [--dry-run]

const mysql = require('mysql2/promise');

const DRY_RUN = process.argv.includes('--dry-run');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8220',
  database: process.env.DB_NAME || 'dress_shop',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
});

async function columnExists() {
  const [rows] = await db.query(
    "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'sizes'",
    [process.env.DB_NAME || 'dress_shop']
  );
  return rows && rows[0] && rows[0].cnt > 0;
}

async function ensureSizesColumn() {
  try {
    // MySQL 8+ supports 'ADD COLUMN IF NOT EXISTS'
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSON");
    console.info('Ensured products.sizes column exists');
  } catch (err) {
    console.warn('Could not ensure sizes column exists (older MySQL server). Continuing anyway. Error:', err.message || err);
  }
}

async function fetchProductsWithoutSizes(limit = 500) {
  // Try to select products where sizes is NULL or empty JSON array or empty string
  const query = `SELECT id FROM products WHERE (sizes IS NULL OR sizes = '' OR JSON_LENGTH(sizes) = 0) LIMIT ?`;
  try {
    const [rows] = await db.query(query, [limit]);
    return rows.map(r => r.id);
  } catch (err) {
    // JSON_LENGTH may fail on older servers; fallback to simpler query
    console.warn('JSON_LENGTH failed in query, falling back to sizes IS NULL OR sizes = ""', err.message || err);
    const [rows] = await db.query("SELECT id FROM products WHERE (sizes IS NULL OR sizes = '') LIMIT ?", [limit]);
    return rows.map(r => r.id);
  }
}

async function getSizesFromProductSizes(productId) {
  try {
    const [rows] = await db.query('SELECT size FROM product_sizes WHERE product_id = ?', [productId]);
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map(r => String(r.size));
  } catch (err) {
    console.warn(`product_sizes lookup failed for product ${productId}:`, err.message || err);
    return [];
  }
}

async function getSizesFromInventory(productId) {
  try {
    const [rows] = await db.query(
      `SELECT s.name as size_name FROM product_inventory pi JOIN sizes s ON pi.size_id = s.id WHERE pi.product_id = ? AND (pi.quantity IS NULL OR pi.quantity > 0)`,
      [productId]
    );
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map(r => String(r.size_name));
  } catch (err) {
    console.warn(`product_inventory lookup failed for product ${productId}:`, err.message || err);
    return [];
  }
}

async function backfillProduct(productId) {
  const sizesFromTable = await getSizesFromProductSizes(productId);
  if (sizesFromTable.length > 0) return sizesFromTable;

  const sizesFromInv = await getSizesFromInventory(productId);
  if (sizesFromInv.length > 0) return sizesFromInv;

  return [];
}

async function run() {
  console.info('Starting backfill sizes', DRY_RUN ? '(dry-run)' : '');
  const exists = await columnExists();
  if (!exists) {
    await ensureSizesColumn();
  }

  const ids = await fetchProductsWithoutSizes(1000);
  console.info(`Found ${ids.length} products without sizes (sample limit 1000)`);

  let updated = 0;
  let skipped = 0;

  for (const id of ids) {
    try {
      const sizes = await backfillProduct(id);
      if (sizes.length === 0) {
        skipped++;
        continue;
      }

      console.info(`Backfilling product ${id} with sizes: [${sizes.join(', ')}]`);
      if (!DRY_RUN) {
        await db.query('UPDATE products SET sizes = ? WHERE id = ?', [JSON.stringify(sizes), id]);
      }
      updated++;
    } catch (err) {
      console.error(`Failed to backfill product ${id}:`, err.message || err);
    }
  }

  console.info(`Backfill complete — updated: ${updated}, skipped(no-sizes): ${skipped}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
