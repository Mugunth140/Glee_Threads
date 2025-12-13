'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
}

interface SizeInventory {
  size: string;
  quantity: number;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: ''
  });
  
  const [sizes, setSizes] = useState<SizeInventory[]>(
    SIZES.map(size => ({ size, quantity: 0 }))
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        // API returns categories array directly, not wrapped in object
        setCategories(Array.isArray(data) ? data : (data.categories || []));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id),
          sizes: sizes.filter(s => s.quantity > 0)
        })
      });

      if (res.ok) {
        router.push('/admin/products');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const updateSize = (size: string, quantity: number) => {
    setSizes(sizes.map(s => 
      s.size === size ? { ...s, quantity: Math.max(0, quantity) } : s
    ));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white text-gray-500 hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g., Classic White T-Shirt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="">Select category</option>
                    {categories && categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Inventory</h2>
              <p className="text-sm text-gray-500">Set stock quantity for each size</p>
              
              <div className="grid grid-cols-3 gap-3">
                {sizes.map(({ size, quantity }) => (
                  <div key={size} className="bg-white border border-gray-100 rounded-lg p-3">
                    <label className="block text-sm font-medium text-gray-500 mb-2 text-center">
                      {size}
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => updateSize(size, parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-black text-center focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Product Image</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Image Preview */}
              <div className="aspect-square rounded-lg bg-white border border-gray-100 overflow-hidden">
                {formData.image_url ? (
                  <Image
                    src={formData.image_url}
                    alt="Product preview"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No image</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
          <Link
            href="/admin/products"
            className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
