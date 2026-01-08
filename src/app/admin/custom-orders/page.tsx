'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface CustomOrder {
    id: number;
    front_image_url?: string | null;
    back_image_url?: string | null;
    instructions?: string | null;
    color: string;
    size: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    customer_name: string;
    customer_email?: string | null;
    customer_phone: string;
    shipping_address?: string | null;
    total_amount: number;
    coupon_code?: string | null;
    coupon_discount_percent?: number | null;
    created_at: string;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function AdminCustomOrdersPage() {
    const [orders, setOrders] = useState<CustomOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 20;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            const res = await fetch(`/api/admin/custom-orders?${params}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch custom orders:', error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateStatus = async (orderId: number, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch('/api/admin/custom-orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });

            if (res.ok) {
                setOrders(prev =>
                    prev.map(order =>
                        order.id === orderId ? { ...order, status: newStatus as CustomOrder['status'] } : order
                    )
                );
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteOrder = async (orderId: number) => {
        if (!confirm('Are you sure you want to delete this custom order? This will also delete the associated images.')) {
            return;
        }

        setDeletingId(orderId);
        try {
            const res = await fetch(`/api/admin/custom-orders?id=${orderId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setOrders(prev => prev.filter(order => order.id !== orderId));
            }
        } catch (error) {
            console.error('Failed to delete order:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-black">Custom Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage custom t-shirt design orders</p>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setStatusFilter(status);
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'All' : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <p className="text-gray-500 font-medium">No custom orders found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <div key={order.id} className="p-4 lg:p-6 hover:bg-gray-50/50 transition-colors">
                                {/* Order Header */}
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        {/* Image Thumbnails */}
                                        <div className="flex gap-2">
                                            {order.front_image_url && (
                                                <a href={order.front_image_url} target="_blank" rel="noopener noreferrer" className="block relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
                                                    <Image src={order.front_image_url} alt="Front design" fill className="object-cover" unoptimized />
                                                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-0.5">FRONT</span>
                                                </a>
                                            )}
                                            {order.back_image_url && (
                                                <a href={order.back_image_url} target="_blank" rel="noopener noreferrer" className="block relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
                                                    <Image src={order.back_image_url} alt="Back design" fill className="object-cover" unoptimized />
                                                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-0.5">BACK</span>
                                                </a>
                                            )}
                                        </div>

                                        {/* Order Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-black">#{order.id}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
                                            <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                                        </div>
                                    </div>

                                    {/* Right Side */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-black">{formatPrice(order.total_amount)}</p>
                                            <p className="text-xs text-gray-500">{order.size} / {order.color}</p>
                                        </div>

                                        {/* Expand/Collapse */}
                                        <button
                                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrder === order.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Customer Details */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase">Customer Details</h4>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="text-gray-500">Name:</span> <span className="text-black font-medium">{order.customer_name}</span></p>
                                                    <p><span className="text-gray-500">Phone:</span> <span className="text-black">{order.customer_phone}</span></p>
                                                    {order.customer_email && (
                                                        <p><span className="text-gray-500">Email:</span> <span className="text-black">{order.customer_email}</span></p>
                                                    )}
                                                    {order.shipping_address && (
                                                        <p><span className="text-gray-500">Address:</span> <span className="text-black">{order.shipping_address}</span></p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Instructions */}
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase">Design Instructions</h4>
                                                {order.instructions ? (
                                                    <p className="text-sm text-black bg-gray-50 p-3 rounded-lg leading-relaxed">{order.instructions}</p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">No instructions provided</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                                            {/* Status Update */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Update Status:</span>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    disabled={updatingId === order.id}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium bg-white focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                {updatingId === order.id && (
                                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                )}
                                            </div>

                                            <div className="flex-1"></div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => deleteOrder(order.id)}
                                                disabled={deletingId === order.id}
                                                className="px-4 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {deletingId === order.id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete Order
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
