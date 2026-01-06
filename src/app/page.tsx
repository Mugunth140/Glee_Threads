import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FeaturesSection from '@/components/home/FeaturesSection';
import HeroSection from '@/components/home/HeroSection';
import Newsletter from '@/components/home/Newsletter';
import pool from '@/lib/db';
import { HeroProduct, Product } from '@/types/product';
import { RowDataPacket } from 'mysql2';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Glee Threads - Home',
  description: 'Discover premium custom and ready-made t-shirts at Glee Threads.',
};

async function getHomePageData() {
  try {
    const [featuredRows] = await pool.query<RowDataPacket[]>(`
      SELECT
        fp.product_id as id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.category_id,
        p.is_active,
        c.name as category_name,
        fp.position
      FROM featured_products fp
      JOIN products p ON fp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY fp.position ASC
      LIMIT 8
    `);

    const featuredProducts = (featuredRows as any[]).map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: r.price,
      image_url: r.image_url,
      category_id: r.category_id,
      category_name: r.category_name,
      is_active: r.is_active,
      position: r.position,
      sizes: []
    })) as Product[];

    const [heroRows] = await pool.query<RowDataPacket[]>(`
      SELECT
        hp.id,
        hp.product_id,
        hp.position,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.category_id,
        p.is_active,
        c.name as category_name
      FROM hero_products hp
      JOIN products p ON hp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY hp.position ASC
    `);

    const heroProducts = (heroRows as any[]).map(row => ({
      id: row.id,
      product_id: row.product_id,
      position: row.position,
      product: {
        id: row.product_id,
        name: row.name,
        description: row.description,
        price: row.price,
        image_url: row.image_url,
        category_id: row.category_id,
        category_name: row.category_name,
        is_active: row.is_active,
        sizes: []
      }
    })) as HeroProduct[];

    return { featuredProducts, heroProducts };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return { featuredProducts: [], heroProducts: [] };
  }
}

export default async function Home() {
  const { featuredProducts, heroProducts } = await getHomePageData();

  return (
    <div className="min-h-screen bg-white">
      <HeroSection heroProducts={heroProducts} featuredProducts={featuredProducts} />
      <CategorySection />
      <FeaturedProducts products={featuredProducts} />
      <FeaturesSection />
      <Newsletter />
    </div>
  );
}
