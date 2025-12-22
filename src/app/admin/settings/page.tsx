'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_name: string;
}

interface FeaturedProduct {
  id: number;
  product_id: number;
  position: number;
  product: Product;
}

interface HeroProduct {
  id: number;
  product_id: number;
  position: number;
  product: Product;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'featured' | 'hero' | 'store'>('featured');
  const router = useRouter();
  
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [heroProducts, setHeroProducts] = useState<HeroProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'featured' | 'hero'>('featured');
  const [searchTerm, setSearchTerm] = useState('');

  const [storeSettings, setStoreSettings] = useState<{ shipping_fee: number; free_shipping_threshold: number; gst_percentage: number; gst_enabled: boolean }>({
    shipping_fee: 99,
    free_shipping_threshold: 999,
    gst_percentage: 18,
    gst_enabled: true,
  });

  // Save partial store settings (upsert)
  const saveStoreSettings = async (partial: Partial<typeof storeSettings>) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const body = { ...storeSettings, ...partial };
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        // refresh settings from server to ensure correct parsing of saved values
        await fetchData();
        const { showToast } = await import('@/lib/toast');
        showToast('Store settings saved', { type: 'success' });
      } else {
        const { showToast } = await import('@/lib/toast');
        showToast('Failed to save store settings', { type: 'error' });
      }
    } catch (err) {
      console.error('Failed to save store settings', err);
      const { showToast } = await import('@/lib/toast');
      showToast('Failed to save store settings', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      

      // Fetch featured products
      const featuredRes = await fetch('/api/admin/featured-products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (featuredRes.ok) {
        const data = await featuredRes.json();
        setFeaturedProducts(data.featuredProducts || []);
      }

      // Fetch hero products
      const heroRes = await fetch('/api/admin/hero-products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (heroRes.ok) {
        const data = await heroRes.json();
        setHeroProducts(data.heroProducts || []);
      }

      // Fetch store settings (shipping & gst)
      const settingsRes = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) {
          const parseBool = (v: any) => {
            if (v === true || v === 'true' || v === 1 || v === '1') return true;
            return false;
          };
          setStoreSettings({
            shipping_fee: Number(data.settings.shipping_fee || 99),
            free_shipping_threshold: Number(data.settings.free_shipping_threshold || 999),
            gst_percentage: Number(data.settings.gst_percentage || 18),
            gst_enabled: parseBool(data.settings.gst_enabled),
          });
        }
      }

      // Fetch all products for adding
      const productsRes = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (productsRes.ok) {
        const data = await productsRes.json();
        setAllProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };



  const addToFeatured = async (productId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: true })
      });

      if (res.ok) {
        fetchData();
        setShowAddModal(false);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error adding to featured:', error);
    }
  };

  const removeFromFeatured = async (productId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: false })
      });

      if (res.ok) {
        setFeaturedProducts(featuredProducts.filter(fp => fp.product_id !== productId));
      }
    } catch (error) {
      console.error('Error removing from featured:', error);
    }
  };

  const movePosition = async (productId: number, direction: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/featured-products/${productId}/position`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ direction })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error moving position:', error);
    }
  };

  const addToHero = async (productId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}/hero`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_hero: true })
      });

      if (res.ok) {
        fetchData();
        setShowAddModal(false);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error adding to hero:', error);
    }
  };

  const removeFromHero = async (productId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}/hero`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_hero: false })
      });

      if (res.ok) {
        setHeroProducts(heroProducts.filter(hp => hp.product_id !== productId));
      }
    } catch (error) {
      console.error('Error removing from hero:', error);
    }
  };

  const moveHeroPosition = async (productId: number, direction: 'up' | 'down') => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/hero-products/${productId}/position`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ direction })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error moving hero position:', error);
    }
  };

  // Filter products based on active tab and search
  const getAvailableProducts = () => {
    const currentList = addModalType === 'featured' ? featuredProducts : heroProducts;
    return allProducts.filter(
      p => !currentList.some(item => item.product_id === p.id)
    ).filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const availableProducts = getAvailableProducts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-bold text-black/80">Site Settings</h1> */}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('featured')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'featured'
              ? 'text-black border-b-2 border-white'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Featured Products
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'hero'
              ? 'text-black border-b-2 border-white'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Hero Products
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'store'
              ? 'text-black border-b-2 border-white'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Store Settings
        </button>

      </div>

      {/* Hero Products Tab */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Select products to display in the main Hero carousel on the homepage.
              </p>
            </div>
            <button
              onClick={() => {
                setAddModalType('hero');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>

          {/* Hero Products List */}
          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
            {heroProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No hero products yet</p>
                <p className="text-sm mt-1">Add products to populate the carousel</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-700">
                {heroProducts.map((hp, index) => (
                  <div key={hp.id} className="flex items-center gap-4 p-4 hover:bg-white transition-colors">
                    {/* Position */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => moveHeroPosition(hp.product_id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-500 w-6 text-center">{index + 1}</span>
                      <button
                        onClick={() => moveHeroPosition(hp.product_id, 'down')}
                        disabled={index === heroProducts.length - 1}
                        className="p-1 text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {hp.product?.image_url ? (
                        <Image
                          src={hp.product.image_url}
                          alt={hp.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black truncate">{hp.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        ₹{hp.product?.price?.toLocaleString('en-IN')} • {hp.product?.category_name}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromHero(hp.product_id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      title="Remove from hero"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Products Tab */}
      {activeTab === 'featured' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              {/* <h2 className="text-lg font-semibold text-black/70">Featured Products</h2> */}
              <p className="text-sm text-gray-500">
                These products will appear in the Featured section below the hero.
              </p>
            </div>
            <button
              onClick={() => {
                setAddModalType('featured');
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>

          {/* Featured Products List */}
          <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
            {featuredProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p>No featured products yet</p>
                <p className="text-sm mt-1">Add products to display them on the homepage</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-700">
                {featuredProducts.map((fp, index) => (
                  <div key={fp.id} className="flex items-center gap-4 p-4 hover:bg-white transition-colors">
                    {/* Position */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => movePosition(fp.product_id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-500 w-6 text-center">{index + 1}</span>
                      <button
                        onClick={() => movePosition(fp.product_id, 'down')}
                        disabled={index === featuredProducts.length - 1}
                        className="p-1 text-gray-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {fp.product?.image_url ? (
                        <Image
                          src={fp.product.image_url}
                          alt={fp.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black truncate">{fp.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        ₹{fp.product?.price?.toLocaleString('en-IN')} • {fp.product?.category_name}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromFeatured(fp.product_id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      title="Remove from featured"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-100 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">
                Add to {addModalType === 'featured' ? 'Featured' : 'Hero'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {availableProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No products found' : `All products are already in ${addModalType}`}
                </div>
              ) : (
                availableProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addModalType === 'featured' ? addToFeatured(product.id) : addToHero(product.id)}
                    className="w-full flex items-center gap-4 p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        ₹{product.price.toLocaleString('en-IN')} • {product.category_name}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Store settings tab */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-black/80">Store Settings</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-medium text-black mb-3">Shipping</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Shipping Fee (₹)</label>
                    <input type="number" value={storeSettings.shipping_fee} onChange={(e) => setStoreSettings({ ...storeSettings, shipping_fee: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black/60" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Free Shipping Threshold (₹)</label>
                    <input type="number" value={storeSettings.free_shipping_threshold} onChange={(e) => setStoreSettings({ ...storeSettings, free_shipping_threshold: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black/60" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-medium text-black mb-3">Taxes</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">GST Percentage (%)</label>
                    <input type="number" value={storeSettings.gst_percentage} onChange={(e) => setStoreSettings({ ...storeSettings, gst_percentage: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black/60" />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        // Optimistically update
                        const newVal = !storeSettings.gst_enabled;
                        setStoreSettings({ ...storeSettings, gst_enabled: newVal });
                        await saveStoreSettings({ gst_enabled: newVal });
                      }}
                      aria-pressed={storeSettings.gst_enabled}
                      aria-label={storeSettings.gst_enabled ? 'Disable GST' : 'Enable GST'}
                      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors ${storeSettings.gst_enabled ? 'bg-black' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${storeSettings.gst_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-sm text-gray-700">{storeSettings.gst_enabled ? 'GST enabled' : 'GST disabled'}</span>
                  </div>

                  <p className="text-xs text-gray-500">Toggle GST on/off — when disabled GST will not be added to order totals.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={async () => {
                  await saveStoreSettings(storeSettings);
                }}
                disabled={saving}
                className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
