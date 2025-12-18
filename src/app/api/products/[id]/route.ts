
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

    // If no sizes defined on product row, try to fetch available sizes from product_inventory
    if (sizesWithNames.length === 0 && !product.is_out_of_stock) {
      try {
        const [invRows] = await pool.execute<RowDataPacket[]>(
          `SELECT s.id as size_id, s.name as size_name, pi.quantity, pi.sku
           FROM product_inventory pi
           JOIN sizes s ON pi.size_id = s.id
           WHERE pi.product_id = ?`,
          [productId]
        );
        sizesWithNames = Array.isArray(invRows)
          ? (invRows as RowDataPacket[]).map(r => {
              const row = r as RowDataPacket & { size_id: number; size_name: string; quantity: number; sku: string };
              return { size_name: String(row.size_name), size_id: Number(row.size_id), quantity: Number(row.quantity), sku: row.sku };
            })
          : [];
      } catch (err) {
        console.warn('Could not fetch product inventory sizes:', err);
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
    } catch (err) {
      // If table doesn't exist or other error, ignore and continue without colors
      console.warn('Could not fetch product colors:', err);
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
