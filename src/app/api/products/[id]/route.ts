
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Get product details. `sizes` column may not exist on older DBs, so try including it first
    let products: RowDataPacket[] = [];
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          p.id, p.name, p.description, p.price, p.image_url, 
          p.material, p.care_instructions, p.sizes, p.is_active, p.is_out_of_stock,
          c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.is_active = true`,
        [productId]
      );
      products = Array.isArray(rows) ? (rows as RowDataPacket[]) : [];
    } catch (e) {
      // Fallback: query without `sizes` column in case the column doesn't exist
      console.warn('Product detail query with sizes failed, retrying without sizes column:', (e as Error).message);
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          p.id, p.name, p.description, p.price, p.image_url, 
          p.material, p.care_instructions, p.is_active, p.is_out_of_stock,
          c.id as category_id, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ? AND p.is_active = true`,
        [productId]
      );
      products = Array.isArray(rows) ? (rows as RowDataPacket[]) : [];
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];

    // Parse sizes from product row (JSON array of size names). If product is globally out of stock, return empty.
    let sizesWithNames: { size_name: string; size_id?: number; quantity?: number; sku?: string }[] = [];
    if (!product.is_out_of_stock) {
      try {
        const raw = (product as RowDataPacket & { sizes?: unknown }).sizes;
        const arr = raw ? (typeof raw === 'string' ? JSON.parse(String(raw)) : raw) : [];
        if (Array.isArray(arr)) {
          sizesWithNames = arr.map((name: string) => ({ size_name: String(name), quantity: 0, sku: '' }));
        }
      } catch (err) {
        console.warn('Could not parse product sizes from product row:', err);
        sizesWithNames = [];
      }
    }

    // If no sizes defined on product row, try to fetch available sizes from product_sizes table
    if (sizesWithNames.length === 0 && !product.is_out_of_stock) {
      try {
        const [sizeRows] = await pool.execute<RowDataPacket[]>(
          `SELECT id, size, stock
           FROM product_sizes
           WHERE product_id = ?`,
          [productId]
        );
        sizesWithNames = Array.isArray(sizeRows)
          ? (sizeRows as RowDataPacket[]).map(r => {
              const row = r as RowDataPacket & { id: number; size: string; stock: number };
              return { size_name: String(row.size), size_id: Number(row.id), quantity: Number(row.stock), sku: '' };
            })
          : [];

        // If we found sizes in the product_sizes table, persist them back to products.sizes
        if (sizesWithNames.length > 0) {
          try {
            const names = sizesWithNames.map(s => s.size_name);
            // Ensure sizes column exists (best-effort)
            try {
              await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSON`);
            } catch (alterErr) {
              console.warn('Could not ensure sizes column exists when backfilling:', alterErr);
            }
            await pool.query('UPDATE products SET sizes = ? WHERE id = ?', [JSON.stringify(names), productId]);
            console.info(`Backfilled sizes for product ${productId}: [${names.join(', ')}]`);
          } catch (writeErr) {
            console.warn('Failed to backfill sizes onto product row:', writeErr);
          }
        }
      } catch (err: unknown) {
        // If the table is missing, avoid printing the full stack — just warn and continue
        if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'ER_NO_SUCH_TABLE') {
          console.warn('product_sizes table missing; skipping size lookup');
        } else {
          console.warn('Could not fetch product sizes from product_sizes table:', (err as { message?: string })?.message || err);
        }
        // leave sizesWithNames as-is (empty)
      }
    }

    // Get images from products table
    const images = product.image_url ? [{
      image_url: product.image_url,
      is_primary: true,
      display_order: 0
    }] : [];

    // Get available colors (if any)
    let colors: string[] = [];
    try {
      const [colorRows] = await pool.execute(
        `SELECT color_hex FROM product_colors WHERE product_id = ?`,
        [productId]
      );
      colors = Array.isArray(colorRows) ? (colorRows as { color_hex: string }[]).map(r => r.color_hex) : [];
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'ER_NO_SUCH_TABLE') {
        console.warn('product_colors table missing; skipping color lookup');
      } else {
        console.warn('Could not fetch product colors:', (err as { message?: string })?.message || err);
      }
      colors = [];
    }

    return NextResponse.json({
      ...product,
      sizes: sizesWithNames,
      images,
      colors,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
