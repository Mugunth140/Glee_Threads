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
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        hp.id,
        hp.product_id,
        hp.position,
        hp.created_at,
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

    return NextResponse.json({ heroProducts });
  } catch (error) {
    console.error('Error fetching hero products:', error);
    return NextResponse.json({ error: 'Failed to fetch hero products' }, { status: 500 });
  }
}
