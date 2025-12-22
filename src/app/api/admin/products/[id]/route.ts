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
        p.material,
        p.care_instructions,
        p.category_id,
        c.name as category_name,
        p.created_at,
        p.sizes,
        p.is_out_of_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Sizes are stored on the product row as JSON (array of size names)
    let sizesArr: string[] = [];
    try {
      const raw = (products[0] as RowDataPacket & { sizes?: unknown }).sizes;
      if (raw) {
        if (typeof raw === 'string') sizesArr = JSON.parse(String(raw));
        else if (Array.isArray(raw)) sizesArr = raw as string[];
      }
    } catch {
      sizesArr = [];
    }

    // Get colors if table exists
    let colors: string[] = [];
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT color_hex FROM product_colors WHERE product_id = ?',
        [id]
      );
      if (Array.isArray(rows)) {
        const typed = rows as Array<RowDataPacket & { color_hex: string }>;
        colors = typed.map(r => String(r.color_hex));
      } else {
        colors = [];
      }
    } catch {
      // table might not exist yet
      colors = [];
    }

    return NextResponse.json({ 
      product: products[0],
      sizes: sizesArr,
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
    const { name, description, price, image_url, category_id, is_out_of_stock, colors, sizes, material, care_instructions } = body;

    if (!name || !price || !category_id) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });
    }

    // Update product
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, is_out_of_stock = ?, material = ?, care_instructions = ? WHERE id = ?',
      [name, description || '', price, image_url || '', category_id, is_out_of_stock ? 1 : 0, material || null, care_instructions || null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
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

    // Persist sizes on product row
    if (Array.isArray(sizes)) {
      try {
        const clean: string[] = sizes.map((s: unknown) => String(s).trim()).filter((s: string) => s.length > 0);
        await pool.query('UPDATE products SET sizes = ? WHERE id = ?', [JSON.stringify(clean), id]);
      } catch (e) {
        console.error('Failed to persist product sizes on product row', e);
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
    
    // Cart items are stored client-side (anonymous cart). No DB cleanup needed here.
    
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
