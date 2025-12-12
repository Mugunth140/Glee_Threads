import { products } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === parseInt(params.id));

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Product Image */}
        <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
          
          {product.rating && (
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-500 mr-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < Math.floor(product.rating!) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-gray-600">({product.rating} / 5)</span>
            </div>
          )}

          <div className="text-4xl font-bold text-blue-600 mb-6">
            ${product.price.toFixed(2)}
          </div>

          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-6">
            <span className={`text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
            <div className="flex items-center border border-gray-300 rounded-lg w-32">
              <button className="px-4 py-2 hover:bg-gray-100">-</button>
              <span className="px-4 py-2 border-x border-gray-300">1</span>
              <button className="px-4 py-2 hover:bg-gray-100">+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
            <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
              Add to Wishlist
            </button>
          </div>

          {/* Product Info */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Product Information</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Category:</strong> {product.category}</li>
              <li><strong>Product ID:</strong> {product.id}</li>
              <li><strong>Availability:</strong> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <Link 
                key={relatedProduct.id} 
                href={`/products/${relatedProduct.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{relatedProduct.name}</h3>
                  <span className="text-blue-600 font-bold">${relatedProduct.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
