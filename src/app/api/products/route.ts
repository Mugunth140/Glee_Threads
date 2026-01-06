
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const style = searchParams.get('style');
    const sort = searchParams.get('sort');

    // Pagination
    const page = Number(searchParams.get('page') || '1') || 1;
    const pageSize = Number(searchParams.get('pageSize') || '1000') || 1000;

    // Sort
    let orderBy = 'p.created_at DESC';
    if (sort === 'price-low') {
      orderBy = 'p.price ASC';
    } else if (sort === 'price-high') {
      orderBy = 'p.price DESC';
    } else if (sort === 'newest') {
      orderBy = 'p.created_at DESC';
    } else if (sort === 'popular') {
      orderBy = 'p.created_at DESC';
    }

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];

    if (category) {
      whereClause += ' AND c.slug = ?';
      params.push(category);
    }

    if (style) {
      whereClause += ' AND c.name LIKE ?';
      params.push(`${style}%`);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    let total = 0;
    try {
      const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`;
      const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
      total = (countRows[0] as { total: number })?.total || 0;
    } catch (e) {
      console.warn('Count query failed:', (e as Error).message);
    }

    const offset = (page - 1) * pageSize;
    let productsRows: RowDataPacket[] = [];

    // Try with all columns first, fallback to minimal columns
    try {
      const query = `
        SELECT 
          p.id, p.name, p.description, p.price, p.image_url,
          p.sizes, p.is_out_of_stock,
          c.id as category_id, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;
      const [rows] = await pool.query<RowDataPacket[]>(query, [...params, pageSize, offset]);
      productsRows = Array.isArray(rows) ? rows : [];
    } catch (e) {
      console.warn('Full products query failed, trying minimal:', (e as Error).message);

      // Fallback: minimal columns that should always exist
      try {
        const fallbackQuery = `
          SELECT 
            p.id, p.name, p.description, p.price, p.image_url,
            c.id as category_id, c.name as category_name, c.slug as category_slug
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          ${whereClause}
          ORDER BY ${orderBy}
          LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(fallbackQuery, [...params, pageSize, offset]);
        productsRows = Array.isArray(rows) ? rows : [];
      } catch (e2) {
        console.error('Fallback query also failed:', (e2 as Error).message);
        productsRows = [];
      }
    }

    // Process products with sizes
    const products = productsRows.map(product => {
      let sizes: { size_name: string }[] = [];

      // Parse sizes from product row if available
      try {
        const raw = (product as { sizes?: unknown }).sizes;
        if (raw) {
          const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (Array.isArray(arr)) {
            sizes = arr.map((name: string) => ({ size_name: String(name) }));
          }
        }
      } catch {
        sizes = [];
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category_id: product.category_id,
        category_name: product.category_name,
        category_slug: product.category_slug,
        is_out_of_stock: !!product.is_out_of_stock,
        sizes,
      };
    });

    return NextResponse.json({ products, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ products: [], total: 0, page: 1, pageSize: 1000 });
  }
}
