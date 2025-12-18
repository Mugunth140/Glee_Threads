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
    `);

    return NextResponse.json({ products });
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
    const { name, description, price, image_url, category_id, is_out_of_stock, colors } = body;

    if (!name || !price || !category_id) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    // Insert product
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, description, price, image_url, category_id, is_out_of_stock) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', price, image_url || '', category_id, is_out_of_stock ? 1 : 0]
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

    return NextResponse.json({ 
      message: 'Product created successfully',
      productId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
