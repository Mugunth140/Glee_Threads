import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// Ensure orders table has required columns (runs once per cold start)
let ordersTableChecked = false;
async function ensureOrdersColumns() {
  if (ordersTableChecked) return;
  try {
    // Add missing columns if they don't exist
    const alterQueries = [
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_name VARCHAR(255)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(32)",
      "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)",
    ];
    for (const q of alterQueries) {
      try {
        await pool.query(q);
      } catch (e: unknown) {
        // Ignore if column already exists or syntax not supported
        const code = typeof e === 'object' && e !== null && 'code' in e ? (e as { code?: string }).code : '';
        if (code !== 'ER_DUP_FIELDNAME') {
          console.warn('Alter orders table warning:', (e as Error).message);
        }
      }
    }
    ordersTableChecked = true;
  } catch (err) {
    console.warn('Could not ensure orders columns:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure table has required columns
    await ensureOrdersColumns();
    
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

    // Try to insert order items - with custom_options first, fallback to without
    const itemsArray = items as OrderItemPayload[];
    if (itemsArray.length > 0) {
      try {
        // Try with custom_options column
        const itemInsertsWithOptions = itemsArray.map((it) => [
          insertId, 
          (it.product_id && it.product_id > 0) ? it.product_id : null,
          it.quantity, 
          it.size || null, 
          it.price,
          it.custom_color || null,
          it.custom_image_url || null,
          it.custom_text || null,
          it.custom_options ? JSON.stringify(it.custom_options) : null
        ]);
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, size, price, custom_color, custom_image_url, custom_text, custom_options) VALUES ?',
          [itemInsertsWithOptions]
        );
      } catch (itemError: unknown) {
        // If custom_options column doesn't exist, try without it
        if (typeof itemError === 'object' && itemError !== null && 'code' in itemError && (itemError as { code?: string }).code === 'ER_BAD_FIELD_ERROR') {
          console.warn('custom_options column not found, inserting without it');
          const itemInsertsBasic = itemsArray.map((it) => [
            insertId, 
            (it.product_id && it.product_id > 0) ? it.product_id : null,
            it.quantity, 
            it.size || null, 
            it.price,
            it.custom_color || null,
            it.custom_image_url || null,
            it.custom_text || null
          ]);
          await pool.query(
            'INSERT INTO order_items (order_id, product_id, quantity, size, price, custom_color, custom_image_url, custom_text) VALUES ?',
            [itemInsertsBasic]
          );
        } else {
          throw itemError;
        }
      }
    }

    return NextResponse.json({ success: true, order_id: insertId });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
