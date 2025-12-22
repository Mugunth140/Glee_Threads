import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AdminPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

function verifyAdmin(request: NextRequest): AdminPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    // Some DBs might not have the `is_out_of_stock` column yet. Try the full query first and
    // fall back to a query without that column if it fails.
    // Pagination
    const page = Number(searchParams.get('page') || '1') || 1;
    const pageSize = Number(searchParams.get('pageSize') || '20') || 20;

    try {
      // Count total
      const [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM products`);
      const total = Array.isArray(countRows) && (countRows[0] as any)?.total ? Number((countRows[0] as any).total) : 0;

      const offset = (page - 1) * pageSize;

      const [products] = await pool.query<RowDataPacket[]>(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.image_url,
          p.category_id,
          c.name as category_name,
          p.created_at,
          CASE WHEN p.is_featured = 1 THEN true ELSE false END as is_featured,
          CASE WHEN p.is_out_of_stock = 1 THEN true ELSE false END as is_out_of_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `, [pageSize, offset]);

      return NextResponse.json({ products, total, page, pageSize });
    } catch (e) {
      console.warn('Products query with is_out_of_stock failed, retrying without that column:', (e as Error).message);
      const offset = (page - 1) * pageSize;
      const [products] = await pool.query<RowDataPacket[]>(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.image_url,
          p.category_id,
          c.name as category_name,
          p.created_at,
          CASE WHEN p.is_featured = 1 THEN true ELSE false END as is_featured
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `, [pageSize, offset]);

      // Ensure each product has the field for client convenience
      const typed = (products as Array<RowDataPacket & { is_out_of_stock?: unknown }>).map(p => ({ ...p, is_out_of_stock: false }));
      return NextResponse.json({ products: typed, total: 0, page, pageSize });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, image_url, category_id, is_out_of_stock, colors, sizes, material, care_instructions } = body;

    if (!name || !price || !category_id) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    // Insert product
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, description, price, image_url, category_id, is_out_of_stock, material, care_instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', price, image_url || '', category_id, is_out_of_stock ? 1 : 0, material || null, care_instructions || null]
    );

    const productId = result.insertId;

    // Store colors if provided. Create product_colors table if missing.
    if (colors && Array.isArray(colors) && colors.length > 0) {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS product_colors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          color_hex VARCHAR(12) NOT NULL,
          CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      );

      for (const color of colors) {
        const hex = String(color).trim();
        if (!hex) continue;
        await pool.query('INSERT INTO product_colors (product_id, color_hex) VALUES (?, ?)', [productId, hex]);
      }
    }

    // Persist sizes (admin-selected) directly on the product row as JSON
    if (sizes && Array.isArray(sizes)) {
      try {
        const clean: string[] = sizes.map((s: unknown) => String(s).trim()).filter((s: string) => s.length > 0);
        // Ensure column exists to avoid silent failures on older DBs
        try {
          await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSON`);
        } catch (alterErr) {
          console.warn('Could not ensure sizes column exists (may be older MySQL):', alterErr);
        }
        await pool.query('UPDATE products SET sizes = ? WHERE id = ?', [JSON.stringify(clean), productId]);
      } catch (e) {
        console.error('Failed to persist product sizes on product row', e);
      }
    }

    return NextResponse.json({ 
      message: 'Product created successfully',
      productId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
