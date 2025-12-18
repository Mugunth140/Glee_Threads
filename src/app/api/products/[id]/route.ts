
import { SIZES } from '@/lib/constants';
import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Get product details
    const [products] = await pool.execute(
      `SELECT 
        p.id, p.name, p.description, p.price, p.image_url, 
        p.material, p.care_instructions, p.is_active, p.is_out_of_stock,
        c.id as category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = true`,
      [productId]
    );

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];

    // Get sizes (hardcoded, available if not out of stock)
    const sizesWithNames = product.is_out_of_stock ? [] : SIZES.map(s => ({
      size_id: s.id,
      size_name: s.name,
      quantity: 0,
      sku: '',
    }));

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
