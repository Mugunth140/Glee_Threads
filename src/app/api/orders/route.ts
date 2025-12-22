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

    // Insert order (support coupon_code and coupon_discount_percent)
    const couponCode = body.coupon_code ? String(body.coupon_code).toUpperCase() : null;
    const couponDiscount = typeof body.coupon_discount_percent !== 'undefined' ? Number(body.coupon_discount_percent) : null;

    const [result] = await pool.query(
      'INSERT INTO orders (user_name, user_email, phone, shipping_address, payment_method, total_amount, coupon_code, coupon_discount_percent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email || null, phone, shipping_address || null, payment_method || null, total_amount || 0, couponCode, couponDiscount]
    );

    // mysql2 returns ResultSetHeader for insert
    const insertId = (result as ResultSetHeader).insertId as number;

    // Insert items (ensure typed shape)
    type OrderItemPayload = { 
      product_id: number; 
      quantity: number; 
      size?: string | null; 
      price: number;
      // Custom fields
      custom_color?: string;
      custom_image_url?: string;
      custom_text?: string;
      custom_options?: Record<string, unknown>;
    };

    const itemInserts = (items as OrderItemPayload[]).map((it) => [
      insertId, 
      (it.product_id && it.product_id > 0) ? it.product_id : null, // Handle custom products (id -1) as NULL
      it.quantity, 
      it.size || null, 
      it.price,
      it.custom_color || null,
      it.custom_image_url || null,
      it.custom_text || null,
      it.custom_options ? JSON.stringify(it.custom_options) : null
    ]);

    if (itemInserts.length > 0) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, size, price, custom_color, custom_image_url, custom_text, custom_options) VALUES ?',
        [itemInserts]
      );
    }

    return NextResponse.json({ success: true, order_id: insertId });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
