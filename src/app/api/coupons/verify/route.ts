import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND expiry_date > NOW()',
      [code.toUpperCase().trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
    }

    const coupon = rows[0];
    return NextResponse.json({
      valid: true,
      discount_percent: Number(coupon.discount_percent),
      code: coupon.code
    });
  } catch (error) {
    console.error('Error verifying coupon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
