import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { ResultSetHeader } from 'mysql2';
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
    const { is_out_of_stock } = body;

    // Ensure column exists to avoid hard failures on older DBs
    try {
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_out_of_stock TINYINT(1) DEFAULT 0`);
    } catch (e) {
      // If ALTER fails for any DB reason, log and proceed — update may still work if column exists
      console.warn('Could not ensure is_out_of_stock column exists', e);
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET is_out_of_stock = ? WHERE id = ?',
      [is_out_of_stock ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Stock status updated', is_out_of_stock: !!is_out_of_stock });
  } catch (error) {
    console.error('Error updating stock status:', error);
    return NextResponse.json({ error: 'Failed to update stock status' }, { status: 500 });
  }
}
