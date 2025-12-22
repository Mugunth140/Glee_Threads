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
  { params }: { params: Promise<{ productId: string }> }
) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await params;

  try {
    const body = await request.json();
    const { direction } = body;

    const [currentItem] = await pool.query<RowDataPacket[]>(
      'SELECT position FROM hero_products WHERE product_id = ?',
      [productId]
    );

    if (!currentItem.length) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const currentPos = currentItem[0].position;
    let targetPos: number;

    if (direction === 'up') {
      const [prevItem] = await pool.query<RowDataPacket[]>(
        'SELECT product_id, position FROM hero_products WHERE position < ? ORDER BY position DESC LIMIT 1',
        [currentPos]
      );
      if (!prevItem.length) return NextResponse.json({ message: 'Already at top' });
      targetPos = prevItem[0].position;
      
      // Swap
      await pool.query('UPDATE hero_products SET position = ? WHERE product_id = ?', [currentPos, prevItem[0].product_id]);
      await pool.query('UPDATE hero_products SET position = ? WHERE product_id = ?', [targetPos, productId]);

    } else {
      const [nextItem] = await pool.query<RowDataPacket[]>(
        'SELECT product_id, position FROM hero_products WHERE position > ? ORDER BY position ASC LIMIT 1',
        [currentPos]
      );
      if (!nextItem.length) return NextResponse.json({ message: 'Already at bottom' });
      targetPos = nextItem[0].position;

      // Swap
      await pool.query('UPDATE hero_products SET position = ? WHERE product_id = ?', [currentPos, nextItem[0].product_id]);
      await pool.query('UPDATE hero_products SET position = ? WHERE product_id = ?', [targetPos, productId]);
    }

    return NextResponse.json({ message: 'Position updated' });
  } catch (error) {
    console.error('Error moving hero product:', error);
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
  }
}
