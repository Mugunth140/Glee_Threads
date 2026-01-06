'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  total_amount: number;
  coupon_code?: string | null;
  coupon_discount_percent?: number | null;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  size: string;
  price: number;
  custom_color?: string;
  custom_image_url?: string;
  custom_text?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const router = useRouter();

  const fetchOrders = useCallback(async (requestedPage = 1) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/orders?page=${requestedPage}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.status === 401) {
         localStorage.removeItem('adminToken');
         localStorage.removeItem('adminUser');
         router.push('/admin/login');
         return;
      }

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalOrders(typeof data.total === 'number' ? data.total : 0);
        setPage(typeof data.page === 'number' ? data.page : requestedPage);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [router, pageSize]);

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to update order status:', errorData);
        alert(`Failed to update status: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400';
      case 'delivered':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-zinc-500/20 text-gray-500';
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === statusFilter);

  const totalPages = Math.max(1, Math.ceil((totalOrders || 0) / pageSize));
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    setLoading(true);
    fetchOrders(p);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* <h1 className="text-2xl font-bold text-black/80">Orders</h1> */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Pagination Top */}
      {totalOrders > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Showing page {page} of {totalPages} — {totalOrders} orders</div>
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className={`px-3 py-1 rounded-md border ${page <= 1 ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-black hover:bg-gray-100'}`}>Prev</button>
            <span className="text-sm">Page</span>
            <input type="number" min={1} max={totalPages} value={page} onChange={(e) => goToPage(Number(e.target.value) || 1)} className="w-16 text-center border rounded px-2 py-1" />
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className={`px-3 py-1 rounded-md border ${page >= totalPages ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-black hover:bg-gray-100'}`}>Next</button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Order ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Final Price</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {orders.length === 0 ? 'No orders yet' : 'No orders match the filter'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-black">#{order.id.toString().padStart(5, '0')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-black">{order.user_name}</p>
                        <p className="text-sm text-gray-500">{order.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-black font-medium">
                          ₹{order.total_amount.toLocaleString('en-IN')}
                        </span>
                        {order.coupon_code && (
                          <span className="mt-1 inline-flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                              <path d="M10 2a2 2 0 012 2v1h3a1 1 0 011 1v3h1a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-1H8a1 1 0 01-1-1V9H6a1 1 0 01-1-1V5a2 2 0 012-2h3V4a2 2 0 002-2z" />
                            </svg>
                            Coupon: {order.coupon_code}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200 transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

      {/* Pagination Bottom */}
      {totalOrders > pageSize && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">Showing page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className={`px-3 py-1 rounded-md border ${page <= 1 ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-black hover:bg-gray-100'}`}>Prev</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                const start = Math.max(1, page - 3);
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button key={p} onClick={() => goToPage(p)} className={`px-3 py-1 rounded-md ${p === page ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{p}</button>
                );
              })}
            </div>
            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className={`px-3 py-1 rounded-md border ${page >= totalPages ? 'border-gray-200 text-gray-400' : 'border-gray-300 text-black hover:bg-gray-100'}`}>Next</button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-100 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-black">
                Order #{selectedOrder.id.toString().padStart(5, '0')}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-white border border-gray-100 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Customer</h4>
              <p className="text-black font-medium">{selectedOrder.user_name}</p>
              <p className="text-gray-500">{selectedOrder.user_email}</p>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Date</h4>
                <p className="text-black">
                  {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-gray-100 rounded-lg overflow-hidden mb-4">
              <h4 className="text-sm font-medium text-gray-500 px-4 py-3 border-b border-gray-100">Items</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="divide-y divide-zinc-700">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 px-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-black font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">
                            Size: {item.size} × {item.quantity}
                          </p>
                          {item.custom_color && (
                             <p className="text-xs text-gray-500 mt-1">Color: {item.custom_color}</p>
                          )}
                          {item.custom_text && (
                             <p className="text-xs text-gray-500 mt-0.5 italic">&quot;{item.custom_text}&quot;</p>
                          )}
                        </div>
                        <p className="text-black font-medium">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                      
                      {item.custom_image_url && (
                        <div className="mt-2">
                           <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Custom Design</p>
                           <a href={item.custom_image_url} target="_blank" rel="noopener noreferrer" className="block relative w-32 h-32 bg-gray-50 rounded border border-gray-200 overflow-hidden hover:opacity-90 transition-opacity">
                              {/* Use standard img tag for external blob urls or Next Image if configured */}
                              <Image 
                                src={item.custom_image_url} 
                                alt="Custom Design" 
                                fill
                                className="object-contain w-full h-full"
                                unoptimized
                              />
                           </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-6 text-center text-gray-500">No items found</p>
              )}
            </div>

            {/* Coupon & Totals */}
            {selectedOrder && (
              (() => {
                const itemsTotal = (selectedOrder.items || []).reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
                const discountPercent = selectedOrder.coupon_discount_percent ? Number(selectedOrder.coupon_discount_percent) : 0;
                const discountAmount = discountPercent ? Math.round(itemsTotal * (discountPercent / 100)) : 0;
                return (
                  <div>
                    {selectedOrder.coupon_code && (
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-sm text-gray-600">Coupon</span>
                        <span className="text-sm text-green-600 font-medium">{selectedOrder.coupon_code} (-{discountPercent}%) • -₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-lg font-semibold text-black">Total</span>
                      <span className="text-xl font-bold text-black">
                        ₹{selectedOrder.total_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
