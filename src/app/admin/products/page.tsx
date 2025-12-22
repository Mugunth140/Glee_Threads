'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  category_name: string;
  is_featured: boolean;
  is_out_of_stock?: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Track product IDs currently updating stock to show spinner and disable the button
  const [stockUpdatingIds, setStockUpdatingIds] = useState<number[]>([]);
  const router = useRouter();

  // initial load will run after fetch functions are defined

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        // Not logged in -> redirect to admin login
        router.push('/admin/login');
        return;
      }

      const res = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        // Unauthorized - token invalid or expired
        router.push('/admin/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to fetch admin products:', err);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

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

    useEffect(() => {
      fetchProducts();
      fetchCategories();
    }, [fetchProducts]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setProducts(products.filter(p => p.id !== productToDelete.id));
        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (productId: number, isFeatured: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}/featured`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_featured: !isFeatured })
      });
      
      if (res.ok) {
        setProducts(products.map(p => 
          p.id === productId ? { ...p, is_featured: !isFeatured } : p
        ));
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const toggleOutOfStock = async (productId: number, isOutOfStock: boolean) => {
    // Optimistic update with per-item spinner
    setStockUpdatingIds(prev => Array.from(new Set([...prev, productId])));
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_out_of_stock: !isOutOfStock } : p));

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_out_of_stock: !isOutOfStock })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // Revert optimistic update
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_out_of_stock: isOutOfStock } : p));
        console.error('Failed to update stock status', err);
        alert(err.error || 'Failed to update stock status');
      }
    } catch (error) {
      // Revert optimistic update on error
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_out_of_stock: isOutOfStock } : p));
      console.error('Error toggling stock status:', error);
      alert('Failed to update stock status');
    } finally {
      setStockUpdatingIds(prev => prev.filter(id => id !== productId));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* <h1 className="text-2xl font-bold text-black/80">Products</h1> */}
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="all">All Categories</option>
          {categories && categories.map(cat => (
            <option key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Price</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">Featured</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
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
                        <div>
                          <p className="font-medium text-black">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {product.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-black font-medium">₹{product.price.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleFeatured(product.id, product.is_featured)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          product.is_featured
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-gray-100 text-gray-500 hover:text-amber-600'
                        }`}
                        title={product.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <svg className="w-5 h-5" fill={product.is_featured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleOutOfStock(product.id, !!product.is_out_of_stock)}
                          aria-pressed={!!product.is_out_of_stock}
                          aria-label={product.is_out_of_stock ? `Mark ${product.name} as in stock` : `Mark ${product.name} as out of stock`}
                          title={product.is_out_of_stock ? 'Mark as in stock' : 'Mark as out of stock'}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 ${product.is_out_of_stock ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300' : 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-300'}`}
                          disabled={stockUpdatingIds.includes(product.id)}
                        >
                          {stockUpdatingIds.includes(product.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" aria-hidden="true"></div>
                          ) : product.is_out_of_stock ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                          title="Edit product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteModal(true);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-black mb-2">Delete Product</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete &ldquo;{productToDelete.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-black rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
