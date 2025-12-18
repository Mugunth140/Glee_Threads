
import { SIZES } from '@/lib/constants';
import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const style = searchParams.get('style');
    const sort = searchParams.get('sort');

    let query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.image_url, 
        p.material, p.care_instructions, p.is_active, p.is_out_of_stock,
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

    if (style) {
      query += ' AND c.name LIKE ?';
      params.push(`${style}%`);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Sort
    let orderBy = 'p.created_at DESC';
    if (sort === 'price-low') {
      orderBy = 'p.price ASC';
    } else if (sort === 'price-high') {
      orderBy = 'p.price DESC';
    } else if (sort === 'newest') {
      orderBy = 'p.created_at DESC';
    } else if (sort === 'popular') {
      // Assuming no popularity field, use created_at
      orderBy = 'p.created_at DESC';
    }
    query += ` ORDER BY ${orderBy}`;

    const [products] = await pool.execute(query, params);

    // Add sizes (hardcoded, available if not out of stock)
    const productsWithSizes = (products as Array<{
      id: number;
      name: string;
      description: string;
      price: number;
      image_url: string;
      category_id: number;
      category_name: string;
      is_out_of_stock: boolean;
    }>).map(product => {
      const sizes = product.is_out_of_stock ? [] : SIZES.map(s => ({
        size_id: s.id,
        size_name: s.name,
        quantity: 0, // No quantity tracking
        sku: '',
      }));
      return {
        ...product,
        sizes,
      };
    });

    return NextResponse.json(productsWithSizes);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
