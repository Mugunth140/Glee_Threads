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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { is_featured } = body;

    if (is_featured) {
      // Get current max position
      const [maxPos] = await pool.query<RowDataPacket[]>(
        'SELECT MAX(position) as max_pos FROM featured_products'
      );
      const newPosition = (maxPos[0]?.max_pos || 0) + 1;

      // Add to featured products
      await pool.query(
        'INSERT INTO featured_products (product_id, position) VALUES (?, ?) ON DUPLICATE KEY UPDATE position = ?',
        [id, newPosition, newPosition]
      );
    } else {
      // Remove from featured products
      await pool.query('DELETE FROM featured_products WHERE product_id = ?', [id]);
    }

    return NextResponse.json({ 
      message: is_featured ? 'Product added to featured' : 'Product removed from featured' 
    });
  } catch (error) {
    console.error('Error toggling featured:', error);
    return NextResponse.json({ error: 'Failed to update featured status' }, { status: 500 });
  }
}
