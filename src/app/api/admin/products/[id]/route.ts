import { del } from '@vercel/blob';
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
        'SELECT color FROM product_colors WHERE product_id = ?',
        [id]
      );
      if (Array.isArray(rows)) {
        const typed = rows as Array<RowDataPacket & { color: string }>;
        colors = typed.map(r => String(r.color));
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
        await pool.query('DELETE FROM product_colors WHERE product_id = ?', [id]);
        for (const color of colors) {
          const colorValue = String(color).trim();
          if (!colorValue) continue;
          await pool.query('INSERT INTO product_colors (product_id, color) VALUES (?, ?)', [id, colorValue]);
        }
      } catch (e) {
        console.error('Failed to save product colors', e);
      }
    }

    // Persist sizes on product row
    if (Array.isArray(sizes)) {
      try {
        const clean: string[] = sizes.map((s: unknown) => String(s).trim()).filter((s: string) => s.length > 0);
        // Ensure column exists before updating (best-effort)
        try {
          await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSON`);
        } catch (alterErr) {
          console.warn('Could not ensure sizes column exists (may be older MySQL):', alterErr);
        }
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
    // First, get the product's image URL so we can delete it from blob storage
    let imageUrl: string | null = null;
    try {
      const [products] = await pool.query<RowDataPacket[]>(
        'SELECT image_url FROM products WHERE id = ?',
        [id]
      );
      if (products.length > 0 && products[0].image_url) {
        imageUrl = products[0].image_url as string;
      }
    } catch (e) {
      console.warn('Could not fetch product image URL:', (e as Error).message);
    }

    // Delete from featured products first (ignore if table doesn't exist)
    try {
      await pool.query('DELETE FROM featured_products WHERE product_id = ?', [id]);
    } catch (e) {
      console.warn('Could not delete from featured_products:', (e as Error).message);
    }

    // Delete from hero products (ignore if table doesn't exist)
    try {
      await pool.query('DELETE FROM hero_products WHERE product_id = ?', [id]);
    } catch (e) {
      console.warn('Could not delete from hero_products:', (e as Error).message);
    }

    // Delete product colors (ignore if table doesn't exist)
    try {
      await pool.query('DELETE FROM product_colors WHERE product_id = ?', [id]);
    } catch (e) {
      console.warn('Could not delete from product_colors:', (e as Error).message);
    }

    // Delete product
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete image from Vercel Blob storage if it exists
    if (imageUrl && imageUrl.includes('blob.vercel-storage.com')) {
      try {
        await del(imageUrl);
        console.log('Deleted image from blob storage:', imageUrl);
      } catch (e) {
        console.warn('Could not delete image from blob storage:', (e as Error).message);
        // Don't fail the request if blob deletion fails
      }
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
