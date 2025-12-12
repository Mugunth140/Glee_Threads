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
  const body = await request.json();
  const { direction } = body;

  if (!direction || !['up', 'down'].includes(direction)) {
    return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
  }

  try {
    // Get current position
    const [current] = await pool.query<RowDataPacket[]>(
      'SELECT id, position FROM featured_products WHERE product_id = ?',
      [productId]
    );

    if (current.length === 0) {
      return NextResponse.json({ error: 'Product not found in featured' }, { status: 404 });
    }

    const currentPos = current[0].position;
    
    // Find the item to swap with
    let swapQuery: string;
    if (direction === 'up') {
      swapQuery = 'SELECT id, position FROM featured_products WHERE position < ? ORDER BY position DESC LIMIT 1';
    } else {
      swapQuery = 'SELECT id, position FROM featured_products WHERE position > ? ORDER BY position ASC LIMIT 1';
    }

    const [swap] = await pool.query<RowDataPacket[]>(swapQuery, [currentPos]);

    if (swap.length === 0) {
      // Already at the edge
      return NextResponse.json({ message: 'Already at the edge' });
    }

    const swapId = swap[0].id;
    const swapPos = swap[0].position;

    // Swap positions
    await pool.query('UPDATE featured_products SET position = ? WHERE id = ?', [swapPos, current[0].id]);
    await pool.query('UPDATE featured_products SET position = ? WHERE id = ?', [currentPos, swapId]);

    return NextResponse.json({ message: 'Position updated successfully' });
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
  }
}
