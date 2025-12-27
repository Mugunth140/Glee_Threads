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

interface MonthlyStatRow extends RowDataPacket {
  month: string;
  orders: number;
  revenue: number;
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

    // Get total orders and revenue
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;
    let paidOrdersCount = 0;
    let monthlyStats: { month: string; orders: number; revenue: number }[] = [];
    
    try {
      // Total Orders (All valid orders)
      const [orderCount] = await pool.execute<CountRow[]>(
        'SELECT COUNT(*) as count FROM orders WHERE status != "cancelled"'
      );
      totalOrders = orderCount[0]?.count || 0;

      // Pending Orders (status based)
      const [pendingCount] = await pool.execute<CountRow[]>(
        'SELECT COUNT(*) as count FROM orders WHERE status IN ("pending", "processing")'
      );
      pendingOrders = pendingCount[0]?.count || 0;

      // Paid Orders Count (requested for "Total Customers" metric) - status based
      const [paidCount] = await pool.execute<CountRow[]>(
        'SELECT COUNT(*) as count FROM orders WHERE status IN ("paid", "shipped", "delivered")'
      );
      paidOrdersCount = paidCount[0]?.count || 0;

      // Total Revenue (only paid/completed orders)
      const [revenueSum] = await pool.execute<SumRow[]>(
        'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status IN ("paid", "shipped", "delivered")'
      );
      totalRevenue = Number(revenueSum[0]?.total || 0);

      // Monthly Stats (Last 6 months)
      const [statsRows] = await pool.execute<MonthlyStatRow[]>(`
        SELECT 
            DATE_FORMAT(created_at, '%b') as month,
            COUNT(*) as orders,
            SUM(total_amount) as revenue
        FROM orders
        WHERE status IN ("paid", "shipped", "delivered")
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), month
        ORDER BY created_at ASC
      `);
      
      monthlyStats = statsRows.map(r => ({
        month: r.month,
        orders: Number(r.orders),
        revenue: Number(r.revenue)
      }));


    } catch (error) {
      console.error('Error fetching order stats:', error);
      totalOrders = 0;
      totalRevenue = 0;
      pendingOrders = 0;
      paidOrdersCount = 0;
      monthlyStats = [];
    }

    // Get total subscribers count
    let totalSubscribers = 0;
    try {
      const [subscribeCount] = await pool.execute<CountRow[]>(
        'SELECT COUNT(*) as count FROM subscribes'
      );
      totalSubscribers = subscribeCount[0]?.count || 0;
    } catch {
      totalSubscribers = 0;
    }

    return NextResponse.json({
      totalProducts: productCount[0]?.count || 0,
      totalCategories: categoryCount[0]?.count || 0,
      totalUsers: paidOrdersCount,
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalSubscribers,
      recentProducts,
      topCategories,
      recentOrders: [],
      monthlyStats,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
