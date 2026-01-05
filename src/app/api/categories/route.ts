import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [categories] = await pool.execute(
      'SELECT id, name, slug, description, image_url FROM categories ORDER BY name'
    );

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of error object to prevent frontend .map() errors
    return NextResponse.json([]);
  }
}
