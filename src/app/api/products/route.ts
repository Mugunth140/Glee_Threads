import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.image_url, 
        p.material, p.care_instructions, p.is_active,
        c.id as category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

    const params: string[] = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    const [products] = await pool.execute(query, params);

    // Get sizes and availability for each product
    const productsWithSizes = await Promise.all(
      (products as Array<{
        id: number;
        name: string;
        description: string;
        price: number;
        image_url: string;
        category_id: number;
        category_name: string;
      }>).map(async (product) => {
        const [sizes] = await pool.execute(
          `SELECT 
            s.id as size_id, s.name as size_name, 
            pi.quantity, pi.sku
          FROM product_inventory pi
          JOIN sizes s ON pi.size_id = s.id
          WHERE pi.product_id = ?
          ORDER BY s.display_order`,
          [product.id]
        );

        return {
          ...product,
          sizes: sizes,
        };
      })
    );

    return NextResponse.json(productsWithSizes);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
