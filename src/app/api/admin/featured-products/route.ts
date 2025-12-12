import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
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
    const [featuredProducts] = await pool.query<RowDataPacket[]>(`
      SELECT 
        fp.id,
        fp.product_id,
        fp.position,
        p.id as product_id,
        p.name as product_name,
        p.price as product_price,
        p.image_url as product_image_url,
        c.name as category_name
      FROM featured_products fp
      JOIN products p ON fp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY fp.position ASC
    `);

    // Transform to nested structure
    const transformed = featuredProducts.map(fp => ({
      id: fp.id,
      product_id: fp.product_id,
      position: fp.position,
      product: {
        id: fp.product_id,
        name: fp.product_name,
        price: fp.product_price,
        image_url: fp.product_image_url,
        category_name: fp.category_name
      }
    }));

    return NextResponse.json({ featuredProducts: transformed });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
  }
}
