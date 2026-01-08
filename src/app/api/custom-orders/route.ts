import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// Ensure custom_orders table exists (runs once per cold start)
let tableChecked = false;
async function ensureCustomOrdersTable() {
    if (tableChecked) return;
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NULL,
        front_image_url VARCHAR(1000),
        back_image_url VARCHAR(1000),
        instructions TEXT,
        color VARCHAR(50),
        size VARCHAR(32),
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(32),
        shipping_address TEXT,
        total_amount DECIMAL(10, 2) DEFAULT 0,
        coupon_code VARCHAR(50) NULL,
        coupon_discount_percent INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        tableChecked = true;
    } catch (err) {
        console.warn('Could not ensure custom_orders table:', err);
    }
}

// POST - Create a new custom order
export async function POST(request: NextRequest) {
    try {
        await ensureCustomOrdersTable();

        const body = await request.json();
        const {
            front_image_url,
            back_image_url,
            instructions,
            color,
            size,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            total_amount,
            coupon_code,
            coupon_discount_percent,
        } = body;

        if (!customer_name || !customer_phone) {
            return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
        }

        if (!front_image_url && !back_image_url) {
            return NextResponse.json({ error: 'At least one design image is required' }, { status: 400 });
        }

        const [result] = await pool.query(
            `INSERT INTO custom_orders 
       (front_image_url, back_image_url, instructions, color, size, customer_name, customer_email, customer_phone, shipping_address, total_amount, coupon_code, coupon_discount_percent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                front_image_url || null,
                back_image_url || null,
                instructions || null,
                color || null,
                size || null,
                customer_name,
                customer_email || null,
                customer_phone,
                shipping_address || null,
                total_amount || 0,
                coupon_code || null,
                coupon_discount_percent || null,
            ]
        );

        const insertId = (result as ResultSetHeader).insertId;

        return NextResponse.json({ success: true, id: insertId });
    } catch (error) {
        console.error('Error creating custom order:', error);
        return NextResponse.json({ error: 'Failed to create custom order' }, { status: 500 });
    }
}

// GET - Fetch custom orders (for admin)
export async function GET(request: NextRequest) {
    try {
        await ensureCustomOrdersTable();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM custom_orders';
        const params: (string | number)[] = [];

        if (status && status !== 'all') {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.query<RowDataPacket[]>(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM custom_orders';
        const countParams: string[] = [];
        if (status && status !== 'all') {
            countQuery += ' WHERE status = ?';
            countParams.push(status);
        }
        const [countResult] = await pool.query<RowDataPacket[]>(countQuery, countParams);
        const total = countResult[0].total;

        return NextResponse.json({
            orders: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching custom orders:', error);
        return NextResponse.json({ error: 'Failed to fetch custom orders' }, { status: 500 });
    }
}
