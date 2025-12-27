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
    const { searchParams } = new URL(request.url);
    // Check if orders table exists
    const [tables] = await pool.query<RowDataPacket[]>(
      "SHOW TABLES LIKE 'orders'"
    );

    if (tables.length === 0) {
      // Create orders table if it doesn't exist. Store customer name/email directly to avoid
      // depending on a `users` table that may not exist in this simplified app.
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          user_name VARCHAR(255),
          user_email VARCHAR(255),
          phone VARCHAR(32),
          total_amount DECIMAL(10,2) NOT NULL,
          coupon_code VARCHAR(50) NULL,
          coupon_discount_percent INT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          shipping_address TEXT,
          payment_method VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          size VARCHAR(32),
          price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);
    }

    // Ensure coupon columns exist on older databases
    try {
      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) NULL`);
      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount_percent INT NULL`);
    } catch {
      // ignore - columns may already exist or DB may not support IF NOT EXISTS, non-fatal
    }

    // Pagination
    const page = Number(searchParams.get('page') || '1') || 1;
    const pageSize = Number(searchParams.get('pageSize') || '20') || 20;

    // Count total orders
    const [countRows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM orders`);
    const totalRow = (Array.isArray(countRows) && countRows[0]) ? (countRows[0] as RowDataPacket & { total?: number }) : undefined;
    const total = totalRow && typeof totalRow.total === 'number' ? Number(totalRow.total) : 0;

    const offset = (page - 1) * pageSize;

    const [orders] = await pool.query<RowDataPacket[]>(`
      SELECT 
        o.id,
        o.user_id,
        o.user_name,
        o.user_email,
        o.total_amount,
        o.coupon_code,
        o.coupon_discount_percent,
        o.status,
        o.created_at
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    // Get items for the returned orders only
    const orderIds = (orders as Array<RowDataPacket & { id: number }>).map(o => o.id);
    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',');
      const [itemsRows] = await pool.query<RowDataPacket[]>(`
        SELECT 
          oi.id,
          oi.order_id,
          COALESCE(p.name, 'Custom Design') as product_name,
          oi.quantity,
          oi.size,
          oi.price,
          oi.custom_color,
          oi.custom_image_url,
          oi.custom_text
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id IN (${placeholders})
      `, orderIds);

      type ItemRow = RowDataPacket & { order_id: number };
      const itemsByOrder: Record<number, ItemRow[]> = {};
      for (const it of itemsRows as ItemRow[]) {
        const oid = Number(it.order_id);
        itemsByOrder[oid] = itemsByOrder[oid] || [];
        itemsByOrder[oid].push(it);
      }

      type OrderRow = RowDataPacket & { id: number; items?: ItemRow[] };
      for (const order of orders as OrderRow[]) {
        order.items = itemsByOrder[order.id] || [];
      }
    } else {
      type OrderRow = RowDataPacket & { id: number; items?: unknown[] };
      for (const order of orders as OrderRow[]) order.items = [];
    }

    return NextResponse.json({ orders, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
