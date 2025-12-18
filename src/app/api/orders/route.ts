import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      shipping_address,
      payment_method,
      items,
      total_amount,
    } = body;

    if (!name || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    // Insert order
    const [result] = await pool.query(
      'INSERT INTO orders (user_name, user_email, phone, shipping_address, payment_method, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email || null, phone, shipping_address || null, payment_method || null, total_amount || 0]
    );

    // mysql2 returns ResultSetHeader for insert
    const insertId = (result as ResultSetHeader).insertId as number;

    // Insert items (ensure typed shape)
    type OrderItemPayload = { product_id: number; quantity: number; size?: string | null; price: number };
    const itemInserts = (items as OrderItemPayload[]).map((it) => [insertId, it.product_id, it.quantity, it.size || null, it.price]);
    if (itemInserts.length > 0) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, size, price) VALUES ?',
        [itemInserts]
      );
    }

    return NextResponse.json({ success: true, order_id: insertId });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
