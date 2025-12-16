import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-64 w-full">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          {product.category_name && (
            <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded mb-2">
              {product.category_name}
            </span>
          )}
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-pink-600">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size.size_id}
                  className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600`}
                >
                  {size.size_name}
                </span>
              ))}
            </div>
          )}
          <button className="w-full mt-4 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition">
            View Details
          </button>
        </div>
      </Link>
    </div>
  );
}
