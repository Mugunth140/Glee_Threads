'use client';

import { Category, Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

// Format price in Indian Rupees
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const PRICE_RANGES = [
  { key: 'under-999', label: 'Under ₹999', min: 0, max: 998 },
  { key: '999-1499', label: '₹999 - ₹1,499', min: 999, max: 1499 },
  { key: '1500-2499', label: '₹1,500 - ₹2,499', min: 1500, max: 2499 },
  { key: '2500+', label: '₹2,500+', min: 2500, max: Infinity },
];

export default function ProductsClient() {
  // const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination for load more (server-side)
  const PAGE_SIZE = 12;
  const [page, setPage] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  const styles = ['Graphic', 'Plain', 'Oversized', 'Premium', 'Custom'];

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = useCallback(async (requestedPage = 1, append = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedStyle) params.set('style', selectedStyle);
      if (sortBy) params.set('sort', sortBy);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(requestedPage));
      params.set('pageSize', String(PAGE_SIZE));
      const url = `/api/products?${params.toString()}`;
      console.debug('Fetching products from', url, { selectedCategory, selectedStyle, sortBy, searchQuery, requestedPage });
      const response = await fetch(url);
      const data = await response.json();

      // Expected response: { products: [], total, page, pageSize }
      let items: Product[] = [];
      if (data && Array.isArray(data.products)) items = data.products as Product[];
      else if (Array.isArray(data)) items = data as Product[];

      if (!Array.isArray(items)) {
        console.warn('Unexpected products response:', data);
        items = [];
      }

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
          const names = Array.isArray(sizes)
            ? sizes
              .map((s: unknown) => (typeof s === 'string' ? String(s) : ((s as { size_name?: string })?.size_name ?? String(s))))
              .map(n => n.toUpperCase())
            : [];
          if (!names.includes(selectedSizeFilter.toUpperCase())) return false;
        }

        return true;
      });

      if (append) {
        setProducts(prev => [...prev, ...filtered]);
      } else {
        setProducts(filtered);
      }

      // Update pagination metadata if present
      if (data && typeof data.total === 'number') {
        setTotalProducts(data.total);
      } else {
        setTotalProducts(prev => append ? prev : filtered.length);
      }

      setPage(requestedPage);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStyle, sortBy, searchQuery, selectedPriceRange, selectedSizeFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update the browser URL with current filters and page
  const updateUrlWithParams = useCallback((requestedPage: number) => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (selectedCategory) params.set('category', selectedCategory);
      else params.delete('category');
      if (searchQuery) params.set('search', searchQuery);
      else params.delete('search');
      params.set('page', String(requestedPage));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState(null, '', newUrl);
    } catch {
      // ignore
    }
  }, [selectedCategory, searchQuery]);

  // Navigate to a page (page-based pagination)
  const goToPage = (requestedPage: number) => {
    if (requestedPage < 1) return;
    const totalPages = Math.max(1, Math.ceil((totalProducts || 0) / PAGE_SIZE));
    if (requestedPage > totalPages) return;
    setProducts([]);
    setPage(requestedPage);
    fetchProducts(requestedPage, false);
    updateUrlWithParams(requestedPage);
  };

  useEffect(() => {
    // Read category and page from browser URL on mount and when navigation occurs
    const readParamsFromUrl = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');
        const search = params.get('search');
        const pageParam = Number(params.get('page') || '1') || 1;
        setSelectedCategory(category || '');
        setSearchQuery(search || '');
        setPage(pageParam);
        // Fetch the requested page when navigating via back/forward
        fetchProducts(pageParam, false);
      } catch {
        setSelectedCategory('');
        setSearchQuery('');
        setPage(1);
        fetchProducts(1, false);
      }
    };
    readParamsFromUrl();
    window.addEventListener('popstate', readParamsFromUrl);
    return () => window.removeEventListener('popstate', readParamsFromUrl);
  }, [fetchProducts]);

  useEffect(() => {
    // Reset to first page when filters/search change
    setProducts([]);
    setPage(1);
    fetchProducts(1, false);
    updateUrlWithParams(1);
  }, [selectedCategory, selectedStyle, sortBy, selectedPriceRange, selectedSizeFilter, searchQuery, fetchProducts, updateUrlWithParams]);

  // Ensure PRICE_RANGES is included as dependency for fetchProducts
  // and keep fetchProducts stable. (eslint wants explicit dependency)
  // No runtime change expected since PRICE_RANGES is a constant above.

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-4">
            {totalProducts} Products
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
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === ''
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
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === category.slug
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
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-black/80 hover:border-gray-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-3 border border-gray-200 rounded-full text-sm font-medium bg-white text-black/80 hover:border-gray-500 transition-colors focus:outline-none focus:border-gray-600"
            >
              <option value="default">Sort By</option>
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
                      className={`px-4 py-2 rounded-full text-sm transition-all ${selectedStyle === style
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
                  setSearchQuery('');
                  // Clear URL params
                  window.history.pushState({}, '', '/products');
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
                    sizes="(max-width: 768px) 50vw, 25vw"
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

        {/* Pagination (page-based) */}
        {(() => {
          const totalPages = Math.max(1, Math.ceil((totalProducts || 0) / PAGE_SIZE));
          if (totalPages <= 1) return null;

          // Determine visible window of pages (max 7)
          const maxVisible = 7;
          let start = Math.max(1, page - Math.floor(maxVisible / 2));
          const end = Math.min(totalPages, start + maxVisible - 1);
          if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
          }

          const pages = [];
          for (let p = start; p <= end; p++) pages.push(p);

          return (
            <div className="flex items-center justify-center mt-12 gap-3">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className={`px-4 py-2 rounded-full border ${page <= 1 ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-black hover:bg-gray-100'} transition-colors`}
              >
                Prev
              </button>

              <div className="flex items-center gap-2">
                {start > 1 && (
                  <>
                    <button onClick={() => goToPage(1)} className="px-3 py-2 rounded-full border border-gray-300 text-black hover:bg-gray-100">1</button>
                    {start > 2 && <span className="px-2 text-gray-400">…</span>}
                  </>
                )}

                {pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-3 py-2 rounded-full border ${p === page ? 'bg-primary text-white border-primary' : 'border-gray-300 text-black hover:bg-gray-100'} transition-colors`}
                  >
                    {p}
                  </button>
                ))}

                {end < totalPages && (
                  <>
                    {end < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
                    <button onClick={() => goToPage(totalPages)} className="px-3 py-2 rounded-full border border-gray-300 text-black hover:bg-gray-100">{totalPages}</button>
                  </>
                )}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className={`px-4 py-2 rounded-full border ${page >= totalPages ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-black hover:bg-gray-100'} transition-colors`}
              >
                Next
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
