import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface CountRow extends RowDataPacket {
  count: number;
}

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  price: string;
  image_url: string;
  category_name: string;
}

interface CategoryCountRow extends RowDataPacket {
  name: string;
  product_count: number;
}

interface SumRow extends RowDataPacket {
  total: number;
}

function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    if (!verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total products
    const [productCount] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as count FROM products'
    );

    // Get total categories
    const [categoryCount] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as count FROM categories'
    );

    // Get total users
    const [userCount] = await pool.execute<CountRow[]>(
      'SELECT COUNT(*) as count FROM users WHERE role = "user"'
    );

    // Get recent products with category
    const [recentProducts] = await pool.execute<ProductRow[]>(
      `SELECT p.id, p.name, p.price, p.image_url, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       ORDER BY p.id DESC LIMIT 4`
    );

    // Get top categories by product count
    const [topCategories] = await pool.execute<CategoryCountRow[]>(
      `SELECT c.name, COUNT(p.id) as product_count 
       FROM categories c 
       LEFT JOIN products p ON c.id = p.category_id 
       GROUP BY c.id, c.name 
       ORDER BY product_count DESC 
       LIMIT 5`
    );

    // Get total orders and revenue (if orders table exists)
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;
    
    try {
      const [orderCount] = await pool.execute<CountRow[]>(
        'SELECT COUNT(*) as count FROM orders'
      );
      totalOrders = orderCount[0]?.count || 0;

      const [pendingCount] = await pool.execute<CountRow[]>(
        'SELECT COUNT(*) as count FROM orders WHERE status IN ("pending", "processing")'
      );
      pendingOrders = pendingCount[0]?.count || 0;

      const [revenueSum] = await pool.execute<SumRow[]>(
        'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status NOT IN ("cancelled", "refunded")'
      );
      totalRevenue = revenueSum[0]?.total || 0;
    } catch {
      // Orders table might not exist
      totalOrders = 0;
      totalRevenue = 0;
      pendingOrders = 0;
    }

    // Get low stock products count
    let lowStockProducts = 0;
    try {
      const [lowStockCount] = await pool.execute<CountRow[]>(
        `SELECT COUNT(DISTINCT product_id) as count FROM product_inventory WHERE quantity < 5`
      );
      lowStockProducts = lowStockCount[0]?.count || 0;
    } catch {
      lowStockProducts = 0;
    }

    return NextResponse.json({
      totalProducts: productCount[0]?.count || 0,
      totalCategories: categoryCount[0]?.count || 0,
      totalUsers: userCount[0]?.count || 0,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      recentProducts,
      topCategories,
      recentOrders: [],
      monthlyStats: [],
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
