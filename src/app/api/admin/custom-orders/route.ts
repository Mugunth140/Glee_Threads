import pool from '@/lib/db';
import { del } from '@vercel/blob';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all custom orders for admin
export async function GET(request: NextRequest) {
    try {
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

// PATCH - Update custom order status
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
        }

        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const [result] = await pool.query(
            'UPDATE custom_orders SET status = ? WHERE id = ?',
            [status, id]
        );

        const affectedRows = (result as ResultSetHeader).affectedRows;
        if (affectedRows === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating custom order:', error);
        return NextResponse.json({ error: 'Failed to update custom order' }, { status: 500 });
    }
}

// DELETE - Delete a custom order and its images
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        // First, get the order to retrieve image URLs
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT front_image_url, back_image_url FROM custom_orders WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = rows[0];

        // Delete images from blob storage
        const deletePromises: Promise<void>[] = [];

        if (order.front_image_url && order.front_image_url.includes('blob.vercel-storage.com')) {
            deletePromises.push(
                del(order.front_image_url).catch(err => {
                    console.warn('Failed to delete front image:', err);
                })
            );
        }

        if (order.back_image_url && order.back_image_url.includes('blob.vercel-storage.com')) {
            deletePromises.push(
                del(order.back_image_url).catch(err => {
                    console.warn('Failed to delete back image:', err);
                })
            );
        }

        // Wait for image deletions (don't fail if they fail)
        await Promise.allSettled(deletePromises);

        // Delete the order from database
        const [result] = await pool.query(
            'DELETE FROM custom_orders WHERE id = ?',
            [id]
        );

        const affectedRows = (result as ResultSetHeader).affectedRows;
        if (affectedRows === 0) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting custom order:', error);
        return NextResponse.json({ error: 'Failed to delete custom order' }, { status: 500 });
    }
}
