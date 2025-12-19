'use client';

// Ensure this page is rendered dynamically to avoid build-time prerender errors
export const dynamic = 'force-dynamic';

import { Category, Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
// useSearchParams causes prerendering issues during build; use window.location in a client-only effect instead
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

export default function ProductsPage() {
  // const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const styles = ['Graphic', 'Plain', 'Oversized', 'Premium', 'Custom'];
  const PRICE_RANGES = [
    { key: 'under-999', label: 'Under ₹999', min: 0, max: 998 },
    { key: '999-1499', label: '₹999 - ₹1,499', min: 999, max: 1499 },
    { key: '1500-2499', label: '₹1,500 - ₹2,499', min: 1500, max: 2499 },
    { key: '2500+', label: '₹2,500+', min: 2500, max: Infinity },
  ];

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedStyle) params.set('style', selectedStyle);
      if (sortBy) params.set('sort', sortBy);
      const url = `/api/products${params.toString() ? '?' + params.toString() : ''}`;
      console.debug('Fetching products from', url, { selectedCategory, selectedStyle, sortBy });
      const response = await fetch(url);
      console.debug('Products API response status:', response.status, response.ok);
      const data = await response.json();
      // Normalize response: API should return an array, but sometimes it may be wrapped
      const possible = data as unknown;
      let items: Product[] = [];
      if (Array.isArray(possible)) items = possible as Product[];
      else if (possible && typeof possible === 'object') {
        const wrapped = possible as { products?: unknown };
        if (Array.isArray(wrapped.products)) items = wrapped.products as Product[];
      }
      if (!Array.isArray(items)) {
        console.warn('Unexpected products response:', data);
        items = [];
      }
      console.debug('Products fetched, count:', items.length);
      // Only include products that are visible. If API provides `is_visible` use it,
      // otherwise fall back to `is_active`.
      const visible = items.filter((p) => {
        if (typeof p.is_visible !== 'undefined') return !!p.is_visible;
        return !!p.is_active;
      });

      // Apply client-side size and price filters (server-side filtering may not be available on all DBs)
      const filtered = visible.filter((p) => {
        // Price filter
        if (selectedPriceRange) {
          const range = PRICE_RANGES.find(r => r.key === selectedPriceRange);
          if (range) {
            const priceNum = Number(p.price || 0);
            if (priceNum < range.min || priceNum > (range.max === Infinity ? Number.MAX_SAFE_INTEGER : range.max)) return false;
          }
        }

        // Size filter
        if (selectedSizeFilter) {
          const sizes = p.sizes || [];
          // sizes may be array of objects or strings; normalize to uppercase names
          const names = Array.isArray(sizes)
            ? sizes
                .map((s: unknown) => (typeof s === 'string' ? String(s) : ((s as { size_name?: string })?.size_name ?? String(s))))
                .map(n => n.toUpperCase())
            : [];
          if (!names.includes(selectedSizeFilter.toUpperCase())) return false;
        }

        return true;
      });

      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Read category from browser URL on mount and when navigation occurs
    const readCategoryFromUrl = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');
        setSelectedCategory(category || '');
      } catch {
        setSelectedCategory('');
      }
    };
    readCategoryFromUrl();
    window.addEventListener('popstate', readCategoryFromUrl);
    return () => window.removeEventListener('popstate', readCategoryFromUrl);
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStyle, sortBy, selectedPriceRange, selectedSizeFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-4">
            {products.length} Products
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Our Collection
          </h1>
          <p className="text-gray-600 max-w-xl">
            Discover our curated selection of premium t-shirts. From custom designs to ready-made classics.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === ''
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.slug
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full text-sm font-medium hover:border-black transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-full text-sm font-medium bg-white hover:border-black transition-colors focus:outline-none focus:border-black"
            >
              <option value="">Sort By</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Style Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Style</p>
                <div className="flex flex-wrap gap-2">
                  {styles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        selectedStyle === style
                          ? 'bg-primary text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-black'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Price Range</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setSelectedPriceRange(selectedPriceRange === r.key ? '' : r.key)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${selectedPriceRange === r.key ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-black'}`} 
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSizeFilter(selectedSizeFilter === size ? '' : size)}
                        className={`w-12 h-10 rounded-full text-sm transition-all ${selectedSizeFilter === size ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-black'}`}
                      >
                        {size}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-500">Showing {products.length} products</p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedStyle('');
                  setSortBy('');
                  setSelectedPriceRange('');
                  setSelectedSizeFilter('');
                }}
                className="text-sm font-medium text-black hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">No products found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your filters or browse all products.</p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedStyle('');
                setSelectedPriceRange('');
                setSelectedSizeFilter('');
              }}
              className="px-6 py-3 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-hover transition-all"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group"
              >
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Quick Add Button */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full py-3 bg-white text-black text-sm font-semibold rounded-full shadow-lg hover:bg-primary hover:text-white transition-colors">
                      Quick Add
              {/* Reset price & size filters when clearing */}
                    </button>
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="font-medium text-black mb-1 group-hover:text-gray-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-1">
                    {product.category_name || 'T-Shirt'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black">
                      {formatPrice(Number(product.price))}
                    </span>
                    {product.sizes && product.sizes.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {product.sizes.length} sizes
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-4 border border-gray-200 rounded-full text-sm font-semibold hover:border-black transition-colors">
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
