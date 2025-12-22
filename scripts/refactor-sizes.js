#!/usr/bin/env node
// Refactor script: normalize and ensure `products.sizes` JSON column is populated for all products
// Usage: node scripts/refactor-sizes.js [--dry-run] [--apply]

const mysql = require('mysql2/promise');

const DRY_RUN = process.argv.includes('--dry-run') && !process.argv.includes('--apply');
const APPLY = process.argv.includes('--apply');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8220',
  database: process.env.DB_NAME || 'dress_shop',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
});

const DEFAULT_SIZES = ['XS','S','M','L','XL'];

async function ensureSizesColumn() {
  try {
    await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSON");
    console.info('Ensured products.sizes column exists');
  } catch (err) {
    console.warn('Could not ensure sizes column exists (older MySQL). Continuing anyway. Error:', err.message || err);
  }
}

function normalizeSizesArray(arr) {
  if (!Array.isArray(arr)) return [];
  const out = Array.from(new Set(arr
    .map(s => (s || '').toString().trim())
    .filter(Boolean)
    .map(s => s.toUpperCase())
  ));
  return out;
}

async function getSizesFromProductSizes(productId) {
  try {
    const [rows] = await db.query('SELECT size FROM product_sizes WHERE product_id = ?', [productId]);
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map(r => String(r.size));
  } catch (err) {
    return [];
  }
}

async function getSizesFromInventory(productId) {
  try {
    const [rows] = await db.query(
      `SELECT s.name as size_name FROM product_inventory pi JOIN sizes s ON pi.size_id = s.id WHERE pi.product_id = ?`,
      [productId]
    );
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map(r => String(r.size_name));
  } catch (err) {
    return [];
  }
}

async function fetchAllProducts() {
  const [rows] = await db.query('SELECT id, sizes, category_id, name FROM products');
  return rows;
}

async function refactor() {
  console.info(`Running refactor-sizes ${DRY_RUN ? '(dry-run)' : ''} ${APPLY ? '(apply)' : ''}`);
  await ensureSizesColumn();
  const products = await fetchAllProducts();
  console.info('Found', products.length, 'products');

  let updated = 0, normalized = 0, skipped = 0, filledWithDefault = 0, backfilled = 0;

  for (const p of products) {
    const id = p.id;
    let original = p.sizes;
    let sizesArr = [];

    // Attempt to parse existing sizes
    if (original) {
      try {
        const parsed = typeof original === 'string' ? JSON.parse(original) : original;
        if (Array.isArray(parsed)) sizesArr = parsed.map(x => String(x));
      } catch (err) {
        // invalid JSON — we'll attempt to recover by treating as comma-separated
        try {
          const asString = String(original);
          sizesArr = asString.split(/[,;|\/]/).map(s => s.trim()).filter(Boolean);
          console.warn(`Product ${id} had invalid JSON in sizes; attempted CSV parse and got [${sizesArr.join(', ')}]`);
        } catch (e) {
          sizesArr = [];
        }
      }
    }

    // Normalize found sizes
    let normalizedArr = normalizeSizesArray(sizesArr);

    // If still empty, try product_sizes table
    if (normalizedArr.length === 0) {
      const fromPS = await getSizesFromProductSizes(id);
      if (fromPS.length > 0) {
        normalizedArr = normalizeSizesArray(fromPS);
        backfilled++;
      }
    }

    // If still empty, try inventory fallback
    if (normalizedArr.length === 0) {
      const fromInv = await getSizesFromInventory(id);
      if (fromInv.length > 0) {
        normalizedArr = normalizeSizesArray(fromInv);
        backfilled++;
      }
    }

    // If still empty, use default sizes for dev data
    if (normalizedArr.length === 0) {
      normalizedArr = DEFAULT_SIZES.slice();
      filledWithDefault++;
    }

    // Compare with original (stringified normalized)
    const originalStr = original ? (typeof original === 'string' ? original : JSON.stringify(original)) : '';
    const newStr = JSON.stringify(normalizedArr);

    if (originalStr !== newStr) {
      if (DRY_RUN) {
        console.info(`DRY: Would update product ${id} sizes => ${newStr}`);
      } else if (APPLY) {
        try {
          await db.query('UPDATE products SET sizes = ? WHERE id = ?', [newStr, id]);
          console.info(`Updated product ${id} sizes => ${newStr}`);
          updated++;
        } catch (err) {
          console.error(`Failed to update product ${id}:`, err.message || err);
        }
      } else {
        console.info(`Would update product ${id} sizes => ${newStr} (run with --apply to write)`);
      }
    } else {
      normalized++;
    }
  }

  console.info('Refactor complete. Summary:');
  console.info(`  updated: ${updated}`);
  console.info(`  normalized (no write needed): ${normalized}`);
  console.info(`  backfilled (from tables): ${backfilled}`);
  console.info(`  filled with default sizes: ${filledWithDefault}`);
}

refactor().then(() => process.exit(0)).catch(err => { console.error('Failed:', err); process.exit(1); });
