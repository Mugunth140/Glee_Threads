'use client';

// import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NavbarClient() {
  const [showCategories, setShowCategories] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  // Initialize cart count from anonymous localStorage cart and listen for changes
  useEffect(() => {
    function updateCount() {
      try {
        const raw = localStorage.getItem('glee_cart_v1');
        if (!raw) return setCartCount(0);
        const items = JSON.parse(raw) as Array<{ quantity?: number }>;
        const count = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }

    updateCount();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'glee_cart_v1') updateCount();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);


  const newProducts = ['New Arrivals', 'Best Sellers', 'Limited Edition'];

  return (
    <nav className="bg-white sticky top-0 z-50">
      {/* Top Bar */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - About, FAQs */}
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-gray-700 hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/faqs" className="text-sm text-gray-700 hover:text-primary transition-colors">
                FAQs
              </Link>
            </div>

            {/* Center - Logo */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-0.5 group">
              <Image 
                src="/glee_logo.png" 
                alt="Glee Logo" 
                width={24} 
                height={24}
                className="object-contain"
              />
              <span className="text-3xl font-extrabold text-black group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-figtree)' }}>lee Threads</span>
            </Link>

            {/* Right - Cart & Sign In */}
            <div className="flex items-center gap-4">
              {/* Cart Icon with Badge */}
              <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                <svg className="w-6 h-6 text-black group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Sign In Link Only (no user menu)  later changed to checkout button*/}
              <Link
                href="/checkout"
                className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Left - Dropdowns */}
            <div className="flex items-center gap-4">
              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-primary transition-colors"
                  onClick={() => {
                    setShowCategories(!showCategories);
                    setShowNewProduct(false);
                  }}
                >
                  Categories
                  <svg className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180 text-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showCategories && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        onClick={() => setShowCategories(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* New Product Dropdown */}
              <div className="relative hidden md:block">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-primary transition-colors"
                  onClick={() => {
                    setShowNewProduct(!showNewProduct);
                    setShowCategories(false);
                  }}
                >
                  New Product
                  <svg className={`w-4 h-4 transition-transform ${showNewProduct ? 'rotate-180 text-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showNewProduct && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                    {newProducts.map((item) => (
                      <Link
                        key={item}
                        href={`/products?sort=${item.toLowerCase().replace(' ', '-')}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                        onClick={() => setShowNewProduct(false)}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm text-black border border-black/15 rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right - Filter Pills */}
            <div className="hidden lg:flex items-center gap-2">
              {['Graphic', 'Plain', 'Oversized', 'Custom'].map((filter) => (
                <Link
                  key={filter}
                  href={`/products?filter=${filter.toLowerCase()}`}
                  className="px-5 py-2 text-sm font-medium text-gray-700 border border-black/20 rounded-full hover:border-primary hover:text-primary transition-all"
                >
                  {filter}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}