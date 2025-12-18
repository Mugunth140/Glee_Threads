'use client';

import Image from 'next/image';
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

interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
  footer_text: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'featured'>('featured');
  
  const [settings, setSettings] = useState<SiteSettings>({
    hero_title: 'Premium T-Shirts',
    hero_subtitle: 'Discover our collection of comfortable, stylish t-shirts',
    hero_button_text: 'Shop Now',
    footer_text: '© 2024 Glee Threads. All rights reserved.'
  });
  
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch settings
      const settingsRes = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }

      // Fetch featured products
      const featuredRes = await fetch('/api/admin/featured-products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (featuredRes.ok) {
        const data = await featuredRes.json();
        setFeaturedProducts(data.featuredProducts || []);
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

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
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

  // Filter products not already featured
  const availableProducts = allProducts.filter(
    p => !featuredProducts.some(fp => fp.product_id === p.id)
  ).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'general'
              ? 'text-black border-b-2 border-white'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          General Settings
        </button> */}
      </div>

      {/* Featured Products Tab */}
      {activeTab === 'featured' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              {/* <h2 className="text-lg font-semibold text-black/70">Featured Products</h2> */}
              <p className="text-sm text-gray-500">
                These products will appear in the homepage carousel and featured section
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
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

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-black/80">Homepage Hero Section</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Hero Title
              </label>
              <input
                type="text"
                value={settings.hero_title}
                onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Premium T-Shirts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Hero Subtitle
              </label>
              <textarea
                value={settings.hero_subtitle}
                onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                placeholder="Discover our collection..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Hero Button Text
              </label>
              <input
                type="text"
                value={settings.hero_button_text}
                onChange={(e) => setSettings({ ...settings, hero_button_text: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Shop Now"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-black/80">Footer</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="© 2024 Glee Threads. All rights reserved."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-100 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Add to Featured</h3>
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
                  {searchTerm ? 'No products found' : 'All products are already featured'}
                </div>
              ) : (
                availableProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToFeatured(product.id)}
                    className="w-full flex items-center gap-4 p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
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
    </div>
  );
}
