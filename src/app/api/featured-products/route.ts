import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return featured products in configured order
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        fp.product_id as id,
        p.name,
        p.price,
        p.image_url,
        c.name as category_name,
        fp.position
      FROM featured_products fp
      JOIN products p ON fp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY fp.position ASC
    `);

    // Transform into product-like objects (frontend expects image_url, name, price)
    interface FeaturedRow { id: number; name: string; price: number; image_url: string; category_name?: string; position: number }
    const featured = (rows as FeaturedRow[]).map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      image_url: r.image_url,
      category_name: r.category_name,
      position: r.position
    }));

    return NextResponse.json(featured);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
  }
}
