import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        hp.id,
        hp.product_id,
        hp.position,
        p.name,
        p.price,
        p.image_url,
        c.name as category_name
      FROM hero_products hp
      JOIN products p ON hp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY hp.position ASC
    `);

    // Format for frontend
    const heroProducts = rows.map(row => ({
      id: row.id,
      product_id: row.product_id,
      position: row.position,
      product: {
        id: row.product_id,
        name: row.name,
        price: row.price,
        image_url: row.image_url,
        category_name: row.category_name
      }
    }));

    return NextResponse.json(heroProducts);
  } catch (error) {
    console.error('Error fetching hero products:', error);
    // Return empty array instead of error object to prevent frontend .map() errors
    return NextResponse.json([]);
  }
}
