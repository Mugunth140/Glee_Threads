import ProductsClient from '@/components/products/ProductsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products | Glee Threads',
  description: 'Browse our extensive collection of premium t-shirts. Filter by style, price, and size to find your perfect fit.',
  openGraph: {
    title: 'Shop All Products | Glee Threads',
    description: 'Browse our extensive collection of premium t-shirts. Filter by style, price, and size to find your perfect fit.',
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
