import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [products] = await pool.query<RowDataPacket[]>(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.category_id,
        c.name as category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get inventory (join sizes table to return size name)
    const [inventory] = await pool.query<RowDataPacket[]>(
      `SELECT s.name as size, pi.quantity
       FROM product_inventory pi
       JOIN sizes s ON pi.size_id = s.id
       WHERE pi.product_id = ?`,
      [id]
    );

    // Get colors if table exists
    let colors: string[] = [];
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT color_hex FROM product_colors WHERE product_id = ?',
        [id]
      );
      colors = Array.isArray(rows) ? rows.map((r: any) => r.color_hex) : [];
    } catch (e) {
      // table might not exist yet
      colors = [];
    }

    return NextResponse.json({ 
      product: products[0],
      inventory,
      colors
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
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
    const { name, description, price, image_url, category_id, sizes, colors } = body;

    if (!name || !price || !category_id) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    // Update product
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category_id = ? WHERE id = ?',
      [name, description || '', price, image_url || '', category_id, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update inventory
    if (sizes && Array.isArray(sizes)) {
      // Delete existing inventory
      await pool.query('DELETE FROM product_inventory WHERE product_id = ?', [id]);
      
      // Insert new inventory (sizes may be strings) — map to size_id
      for (const size of sizes) {
        const sizeName = typeof size === 'string' ? size : (size.size || String(size));
        // find or create size id
        const [sizeRows] = await pool.query<any[]>('SELECT id FROM sizes WHERE name = ?', [sizeName]);
        let sizeId: number | null = null;
        if (Array.isArray(sizeRows) && sizeRows.length > 0) {
          sizeId = sizeRows[0].id;
        } else {
          const [res] = await pool.query<ResultSetHeader>('INSERT INTO sizes (name) VALUES (?)', [sizeName]);
          sizeId = res.insertId;
        }
        if (sizeId) {
          await pool.query(
            'INSERT INTO product_inventory (product_id, size_id, quantity) VALUES (?, ?, ?)',
            [id, sizeId, 0]
          );
        }
      }
    }

    // Update colors: recreate product_colors entries
    if (Array.isArray(colors)) {
      try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS product_colors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            color_hex VARCHAR(12) NOT NULL,
            CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
        );
        await pool.query('DELETE FROM product_colors WHERE product_id = ?', [id]);
        for (const color of colors) {
          const hex = String(color).trim();
          if (!hex) continue;
          await pool.query('INSERT INTO product_colors (product_id, color_hex) VALUES (?, ?)', [id, hex]);
        }
      } catch (e) {
        console.error('Failed to save product colors', e);
      }
    }

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete from featured products first
    await pool.query('DELETE FROM featured_products WHERE product_id = ?', [id]);
    
    // Delete inventory
    await pool.query('DELETE FROM product_inventory WHERE product_id = ?', [id]);
    
    // Delete cart items
    await pool.query('DELETE FROM cart_items WHERE product_id = ?', [id]);
    
    // Delete product
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
