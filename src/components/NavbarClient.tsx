'use client';

// import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function NavbarClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [showCategories, setShowCategories] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    const t = setTimeout(() => setMobileMenuOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

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
          <div className="flex justify-between items-center h-16 relative">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2 text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Left - About, FAQs, Contact, Size Guide (Desktop) */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/about" className="text-sm text-gray-700 hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/faqs" className="text-sm text-gray-700 hover:text-primary transition-colors">
                FAQs
              </Link>
              <Link href="/contact" className="text-sm text-gray-700 hover:text-primary transition-colors">
                Contact
              </Link>
              {/* <Link href="/size-guide" className="text-sm text-gray-700 hover:text-primary transition-colors">
                Size Guide
              </Link> */}
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
              <span className="text-2xl md:text-3xl font-extrabold text-black" style={{ fontFamily: 'var(--font-figtree)' }}>lee Threads</span>
            </Link>

            {/* Right - Cart & Checkout */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Cart Icon with Badge */}
              <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                <svg className="w-6 h-6 text-black group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 md:-top-1 md:-right-1 w-5 h-5 bg-primary text-white text-[10px] md:text-xs font-medium rounded-full flex items-center justify-center border-2 border-white md:border-0">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="hidden sm:inline-block px-5 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-0.5" onClick={() => setMobileMenuOpen(false)}>
              <Image 
                src="/glee_logo.png" 
                alt="Glee Logo" 
                width={20} 
                height={20}
                className="object-contain"
              />
              <span className="text-xl font-extrabold text-black" style={{ fontFamily: 'var(--font-figtree)' }}>lee Threads</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Nav Links */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Navigation</p>
              <div className="grid grid-cols-1 gap-1">
                <Link href="/products" className="px-4 py-3 text-black font-semibold rounded-xl hover:bg-gray-50 transition-colors">All Products</Link>
                <Link href="/about" className="px-4 py-3 text-black font-semibold rounded-xl hover:bg-gray-50 transition-colors">About Us</Link>
                <Link href="/faqs" className="px-4 py-3 text-black font-semibold rounded-xl hover:bg-gray-50 transition-colors">FAQs</Link>
                <Link href="/contact" className="px-4 py-3 text-black font-semibold rounded-xl hover:bg-gray-50 transition-colors">Contact</Link>
                <Link href="/size-guide" className="px-4 py-3 text-black font-semibold rounded-xl hover:bg-gray-50 transition-colors">Size Guide</Link>
                <Link href="/checkout" className="px-4 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-between">
                  Checkout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Categories</p>
              <div className="grid grid-cols-1 gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="px-4 py-3 text-black font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Styles</p>
              <div className="grid grid-cols-2 gap-2">
                {['Graphic', 'Plain', 'Oversized', 'Custom'].map((filter) => (
                  <Link
                    key={filter}
                    href={filter === 'Custom' ? '/customize' : `/products?filter=${filter.toLowerCase()}`}
                    className="px-4 py-2 text-center text-sm font-medium text-gray-700 border border-black/10 rounded-xl hover:bg-black hover:text-white hover:border-black transition-all"
                  >
                    {filter}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Bar (Desktop) */}
      <div className="border-b border-gray-100 hidden lg:block">
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
              <div className="relative">
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
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-12 py-2 text-base md:text-sm text-black border border-black/15 rounded-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Right - Filter Pills */}
            <div className="flex items-center gap-2">
              {['Graphic', 'Plain', 'Oversized'].map((filter) => (
                <Link
                  key={filter}
                  href={`/products?filter=${filter.toLowerCase()}`}
                  className="px-5 py-2 text-sm font-medium text-gray-700 border border-black/20 rounded-full hover:border-primary hover:text-primary transition-all"
                >
                  {filter}
                </Link>
              ))}
              <Link
                href="/customize"
                className="px-5 py-2 text-sm font-medium text-gray-700 border border-black/20 rounded-full hover:border-primary hover:text-primary transition-all"
              >
                Custom
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Sticky below top bar if mobile drawer is closed) */}
      {!mobileMenuOpen && (
        <div className="border-b border-gray-100 lg:hidden">
          <div className="container mx-auto px-4 py-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-10 py-2 text-base text-black bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-primary transition-all"
              />
              <button 
                onClick={handleSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}