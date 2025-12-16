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
        p.material, p.care_instructions, p.is_active,
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

    // Get sizes and availability
    const [sizes] = await pool.execute(
      `SELECT 
        s.id as size_id, s.name as size_name, 
        pi.quantity, pi.sku
      FROM product_inventory pi
      JOIN sizes s ON pi.size_id = s.id
      WHERE pi.product_id = ?
      ORDER BY s.display_order`,
      [productId]
    );

    // Get additional images
    const [images] = await pool.execute(
      `SELECT id, image_url, display_order, is_primary
      FROM product_images
      WHERE product_id = ?
      ORDER BY display_order`,
      [productId]
    );

    // Get available colors (if any)
    let colors: any[] = [];
    try {
      const [colorRows] = await pool.execute(
        `SELECT color_hex FROM product_colors WHERE product_id = ?`,
        [productId]
      );
      colors = Array.isArray(colorRows) ? (colorRows as any[]).map(r => r.color_hex) : [];
    } catch (err) {
      // If table doesn't exist or other error, ignore and continue without colors
      console.warn('Could not fetch product colors:', err);
      colors = [];
    }

    return NextResponse.json({
      ...product,
      sizes,
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
