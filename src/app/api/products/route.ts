
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const style = searchParams.get('style');
    const sort = searchParams.get('sort');

    let query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.image_url, 
        p.material, p.care_instructions, p.sizes, p.is_active, p.is_out_of_stock,
        c.id as category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

    const params: string[] = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (style) {
      query += ' AND c.name LIKE ?';
      params.push(`${style}%`);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Pagination
    const page = Number(searchParams.get('page') || '1') || 1;
    const pageSize = Number(searchParams.get('pageSize') || '1000') || 1000; // default to large if not provided

    // Sort
    let orderBy = 'p.created_at DESC';
    if (sort === 'price-low') {
      orderBy = 'p.price ASC';
    } else if (sort === 'price-high') {
      orderBy = 'p.price DESC';
    } else if (sort === 'newest') {
      orderBy = 'p.created_at DESC';
    } else if (sort === 'popular') {
      // Assuming no popularity field, use created_at
      orderBy = 'p.created_at DESC';
    }

    // Build count query (same filters)
    const countQuery = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true` +
      (category ? ' AND c.slug = ?' : '') +
      (style ? ' AND c.name LIKE ?' : '') +
      (search ? ' AND (p.name LIKE ? OR p.description LIKE ?)' : '');

    const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, params);
    const totalRow = (Array.isArray(countRows) && countRows[0]) ? (countRows[0] as RowDataPacket & { total?: number }) : undefined;
    const total = totalRow && typeof totalRow.total === 'number' ? Number(totalRow.total) : 0;

    // Some installations may not have `p.sizes` column yet. Try the full query first
    // and fall back to a safer query if it fails.
    let productsRows: RowDataPacket[] = [];

    // Append order and pagination to query
    query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const dataParams = [...params, pageSize, (page - 1) * pageSize];

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(query, dataParams);
      productsRows = Array.isArray(rows) ? (rows as RowDataPacket[]) : [];
    } catch (e) {
      console.warn('Products list query failed, retrying without sizes column:', (e as Error).message);
      // remove p.sizes from select (rebuild query to be safe)
      const fallbackQuery = query.replace('p.material, p.care_instructions, p.sizes, p.is_active, p.is_out_of_stock,', 'p.material, p.care_instructions, p.is_active, p.is_out_of_stock,');
      const [rows] = await pool.execute<RowDataPacket[]>(fallbackQuery, dataParams);
      productsRows = Array.isArray(rows) ? (rows as RowDataPacket[]) : [];
    }

    // Fetch inventory sizes for all returned products so we can fallback to inventory
    const productIds = (productsRows as Array<{ id: number }>).map(p => p.id);
    let inventoryMap: Record<number, { size_name: string; size_id?: number; quantity?: number; sku?: string }[]> = {};
    if (productIds.length > 0) {
      try {
        const placeholders = productIds.map(() => '?').join(',');
        const [invRows] = await pool.execute<RowDataPacket[]>(
          `SELECT pi.product_id, s.id as size_id, s.name as size_name, pi.quantity, pi.sku
           FROM product_inventory pi
           JOIN sizes s ON pi.size_id = s.id
           WHERE pi.product_id IN (${placeholders})`,
          productIds
        );
        for (const r of invRows as RowDataPacket[]) {
          const row = r as RowDataPacket & { product_id: number; size_id: number; size_name: string; quantity: number; sku: string };
          const pid = Number(row.product_id);
          inventoryMap[pid] = inventoryMap[pid] || [];
          inventoryMap[pid].push({ size_name: String(row.size_name), size_id: Number(row.size_id), quantity: Number(row.quantity), sku: row.sku });
        }
      } catch (err) {
        // If inventory or sizes table missing, ignore and continue
        console.warn('Could not fetch product inventory for sizes fallback:', err);
        inventoryMap = {};
      }
    }

    // Add sizes (available if not out of stock). Prefer sizes stored on product row, fallback to inventory table.
    const productsWithSizes = (productsRows as Array<{
      id: number;
      name: string;
      description: string;
      price: number;
      image_url: string;
      category_id: number;
      category_name: string;
      is_out_of_stock: boolean;
      sizes?: unknown;
    }>).map(product => {
      let sizes: { size_name: string; size_id?: number; quantity?: number; sku?: string }[] = [];
      if (!product.is_out_of_stock) {
        try {
          const raw = (product as unknown as { sizes?: unknown }).sizes;
          const arr = raw ? (typeof raw === 'string' ? JSON.parse(String(raw)) : raw) : [];
          sizes = Array.isArray(arr) ? (arr as string[]).map((name: string) => ({ size_name: String(name), quantity: 0, sku: '' })) : [];
          // If no sizes in product row, fallback to inventory-derived sizes
          if (sizes.length === 0 && inventoryMap[product.id]) {
            sizes = inventoryMap[product.id];
          }
        } catch (e) {
          // Parsing failed; log a concise warning so we can detect intermittent parsing errors.
          console.warn(`Failed to parse sizes for product ${product.id}:`, (e as Error).message || e);
          sizes = [];
        }

        // If after parsing and inventory fallback we still have no sizes, log a trace so admin can investigate
        if (sizes.length === 0) {
          console.debug(`Product ${product.id} has no sizes in product row or inventory`);
        }
      }
      return {
        ...product,
        sizes,
      };
    });

    // Return pagination info along with products
    return NextResponse.json({ products: productsWithSizes, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty data instead of error object to prevent frontend crashes
    return NextResponse.json({ products: [], total: 0, page: 1, pageSize: 1000 });
  }
}
