import ProductClientWrapper from '@/components/products/ProductClientWrapper';
import { getProductById } from '@/lib/product-data';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Glee Threads`,
    description: product.description || `Buy ${product.name} at Glee Threads.`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} at Glee Threads.`,
      images: [product.image_url],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Product not found</h1>
          <Link href="/products" className="text-black underline hover:text-gray-600">
            ← Return to Collection
          </Link>
        </div>
      </div>
    );
  }

  return <ProductClientWrapper product={product} />;
}
