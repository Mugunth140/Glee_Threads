'use client';
import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Format price in Indian Rupees
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Graphic', 'Plain', 'Oversized', 'Premium', 'Custom'];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
          if (response.ok) {
          const data = await response.json();
          const arr = Array.isArray(data) ? data : [];
          const visible = arr.filter((p: any) => typeof p.is_visible !== 'undefined' ? !!p.is_visible : !!p.is_active);
          setFeaturedProducts(visible.slice(0, 8));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Modern Split Layout */}
      <section className="relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[70vh] py-12">
            {/* Left - Text Content */}
            <div className="order-2 lg:order-1">
              <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
                Custom & Ready-Made T-Shirts
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
                Design Your
                <br />
                <span className="text-gray-400">Perfect Tee</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
                Create custom t-shirts with your unique designs or shop our collection of ready-made styles. Premium quality, endless possibilities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/customize"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all"
                >
                  Customize Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full text-sm font-semibold border border-gray-200 hover:border-black/60 transition-all"
                >
                  Shop Collection
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-12 mt-12 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-3xl font-bold text-black">500+</p>
                  <p className="text-sm text-gray-500">Designs</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-black">1000+</p>
                  <p className="text-sm text-gray-500">Custom Orders</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-black">15k+</p>
                  <p className="text-sm text-gray-500">Happy Customers</p>
                </div>
              </div>
            </div>

            {/* Right - Featured Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-3/4 max-w-md mx-auto lg:max-w-none">
                <div className="absolute inset-0 bg-linear-to-b from-gray-100 to-gray-200 rounded-3xl" />
                {featuredProducts[0] && (
                  <Image
                    src={featuredProducts[0].image_url}
                    alt="Featured Product"
                    fill
                    className="object-cover rounded-3xl"
                    priority
                  />
                )}
                {/* Floating Card */}
                {featuredProducts[0] && (
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Featured</p>
                        <p className="font-semibold text-black">{featuredProducts[0].name}</p>
                      </div>
                      <p className="text-xl font-bold text-black">{formatPrice(Number(featuredProducts[0].price))}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative Elements */}
              {/* <div className="absolute -top-4 -right-4 w-24 h-24 bg-black rounded-full opacity-5" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black rounded-full opacity-5" /> */}
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-8 border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Trending T-Shirts</h2>
              <p className="text-gray-500">Top picks from our collection</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-black hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-3/4 bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group"
                >
                  <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Quick Actions */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-full bg-white/90 backdrop-blur-sm text-black py-3 rounded-xl text-sm font-semibold hover:bg-white transition-colors">
                        Quick View
                      </button>
                    </div>
                    {/* Wishlist Button */}
                    <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    {/* Category Tag */}
                    {product.category_name && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
                        {product.category_name}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-semibold text-black">
                      {formatPrice(Number(product.price))}
                    </p>
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex gap-1 pt-1">
                        {product.sizes.slice(0, 4).map((size) => (
                          <span
                            key={size.size_id}
                            className={`text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600`}
                          >
                            {size.size_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
              <div className="p-3 bg-black rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8 4-8-4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">Free Shipping</h3>
                <p className="text-sm text-gray-500">On orders over Rs.1000</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
              <div className="p-3 bg-black rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">Easy Returns</h3>
                <p className="text-sm text-gray-500">30 day return policy</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl">
              <div className="p-3 bg-black rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">Secure Payment</h3>
                <p className="text-sm text-gray-500">100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-black mb-4">Stay in the Loop</h2>
            <p className="text-gray-500 mb-8">Subscribe to get special offers, free giveaways, and exclusive deals.</p>
            <form className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-black/50 text-black"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
